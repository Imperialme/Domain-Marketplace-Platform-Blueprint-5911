import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { rfqs, companies, auditLog } from "../../drizzle/schema";
import { sendRfqAcknowledgement } from "../email";
import { eq, desc } from "drizzle-orm";

function generateRFQRef(): string {
  const year = new Date().getFullYear().toString().slice(-2);
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `RFQ-${year}-${num}`;
}

async function writeAudit(db: any, actorId: number | null, actionType: string, entityId: string, notes: string) {
  try {
    await db.insert(auditLog).values({
      actorId,
      actorRole: actorId ? "user" : "system",
      actionType,
      entityType: "rfq",
      entityId,
      notes,
      isError: false,
    });
  } catch {}
}

export const rfqsRouter = router({
  // Buyer: submit new RFQ
  submit: protectedProcedure
    .input(z.object({
      itemListFileUrl: z.string().optional(),
      itemListFileName: z.string().optional(),
      subject: z.string().optional(),
      description: z.string().optional(),
      equipmentType: z.string().optional(),
      fleetSize: z.string().optional(),
      additionalNotes: z.string().optional(),
      estimatedValueTier: z.enum(["5k_20k", "20k_100k", "100k_plus"]),
      timelineTier: z.enum(["0_14_days", "15_30_days", "budgeting"]),
      priority: z.enum(["standard", "priority"]).default("standard"),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Get buyer's company
      const companyResult = await db.select().from(companies).where(eq(companies.userId, ctx.user.id)).limit(1);
      if (!companyResult[0] || companyResult[0].status !== "approved") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only approved buyers can submit RFQs" });
      }

      const referenceNumber = generateRFQRef();

      await db.insert(rfqs).values({
        referenceNumber,
        companyId: companyResult[0].id,
        itemListFileUrl: input.itemListFileUrl,
        itemListFileName: input.itemListFileName,
        subject: input.subject,
        description: input.description,
        equipmentType: input.equipmentType,
        fleetSize: input.fleetSize,
        additionalNotes: input.additionalNotes,
        estimatedValueTier: input.estimatedValueTier,
        timelineTier: input.timelineTier,
        priority: input.priority,
        status: "submitted",
      });

      await writeAudit(db, ctx.user.id, "rfq.submit", referenceNumber, `RFQ submitted by ${companyResult[0].legalName}`);

      // Send acknowledgement email to buyer (fire-and-forget, activates once SMTP is configured)
      sendRfqAcknowledgement({
        buyerName: ctx.user.name || companyResult[0].legalName,
        legalName: companyResult[0].legalName,
        businessEmail: companyResult[0].businessEmail,
        rfqReference: referenceNumber,
        partDescription: input.subject || input.description || "Parts as per attached list",
        quantity: "As per item list",
      }).catch(e => console.error("[Email] RFQ ack failed:", e));

      return { success: true, referenceNumber };
    }),

  // Buyer: list own RFQs
  myRfqs: protectedProcedure
    .input(z.object({ limit: z.number().default(20), offset: z.number().default(0) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const companyResult = await db.select().from(companies).where(eq(companies.userId, ctx.user.id)).limit(1);
      if (!companyResult[0]) return [];
      return db.select().from(rfqs)
        .where(eq(rfqs.companyId, companyResult[0].id))
        .orderBy(desc(rfqs.createdAt))
        .limit(input.limit)
        .offset(input.offset);
    }),

  // Admin: list all RFQs
  list: protectedProcedure
    .input(z.object({
      status: z.string().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      if (!["admin", "super_admin"].includes(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const results = await db.select({
        rfq: rfqs,
        company: { legalName: companies.legalName, companyId: companies.companyId, riskFlag: companies.riskFlag },
      })
        .from(rfqs)
        .leftJoin(companies, eq(rfqs.companyId, companies.id))
        .orderBy(desc(rfqs.createdAt))
        .limit(input.limit)
        .offset(input.offset);
      if (input.status && input.status !== "all") {
        return results.filter(r => r.rfq.status === input.status);
      }
      return results;
    }),

  // Admin/Buyer: get single RFQ detail
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const result = await db.select({
        rfq: rfqs,
        company: { legalName: companies.legalName, companyId: companies.companyId, riskFlag: companies.riskFlag, userId: companies.userId },
      })
        .from(rfqs)
        .leftJoin(companies, eq(rfqs.companyId, companies.id))
        .where(eq(rfqs.id, input.id))
        .limit(1);
      if (!result[0]) throw new TRPCError({ code: "NOT_FOUND" });
      // Buyers can only see their own RFQs
      if (!["admin", "super_admin"].includes(ctx.user.role)) {
        if (result[0].company?.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });
      }
      return result[0];
    }),

  // Admin: update RFQ status and path
  updateStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["submitted", "reviewing", "fee_requested", "fee_paid", "sourcing", "quoted", "closed"]),
      priority: z.enum(["standard", "priority"]).optional(),
      adminNotes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!["admin", "super_admin"].includes(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const updateData: any = { status: input.status };
      if (input.priority) updateData.priority = input.priority;
      if (input.adminNotes !== undefined) updateData.adminNotes = input.adminNotes;
      await db.update(rfqs).set(updateData).where(eq(rfqs.id, input.id));
      await writeAudit(db, ctx.user.id, "rfq.status_update", String(input.id), `Status → ${input.status}`);
      return { success: true };
    }),

  // Admin: close RFQ with outcome code
  close: protectedProcedure
    .input(z.object({
      id: z.number(),
      outcomeCode: z.enum(["quotation_issued", "not_commercially_viable", "cannot_identify", "not_sourceable"]),
      adminNotes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!["admin", "super_admin"].includes(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(rfqs).set({
        status: "closed",
        outcomeCode: input.outcomeCode,
        adminNotes: input.adminNotes,
        closedAt: new Date(),
        closedBy: ctx.user.id,
      }).where(eq(rfqs.id, input.id));
      await writeAudit(db, ctx.user.id, "rfq.close", String(input.id), `Closed: ${input.outcomeCode}`);
      return { success: true };
    }),

  // Admin: KPI stats
  stats: protectedProcedure.query(async ({ ctx }) => {
    if (!["admin", "super_admin"].includes(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN" });
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const all = await db.select().from(rfqs);
    return {
      total: all.length,
      submitted: all.filter(r => r.status === "submitted").length,
      reviewing: all.filter(r => r.status === "reviewing").length,
      feeRequested: all.filter(r => r.status === "fee_requested").length,
      sourcing: all.filter(r => r.status === "sourcing").length,
      quoted: all.filter(r => r.status === "quoted").length,
      closed: all.filter(r => r.status === "closed").length,
      priority: all.filter(r => r.priority === "priority").length,
    };
  }),

  // File upload for RFQ item list
  uploadItemFile: protectedProcedure
    .input(z.object({ fileName: z.string(), fileBase64: z.string(), mimeType: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { storagePut } = await import("../storage");
      const buffer = Buffer.from(input.fileBase64, "base64");
      const key = `rfq-files/${ctx.user.id}-${Date.now()}-${input.fileName}`;
      const { url } = await storagePut(key, buffer, input.mimeType);
      return { fileName: input.fileName, fileUrl: url };
    }),

  submitFeedback: protectedProcedure
    .input(z.object({
      rfqReference: z.string(),
      overallRating: z.number().min(1).max(5),
      responseTime: z.number().min(1).max(5),
      quotationQuality: z.number().min(1).max(5),
      comments: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const { buyerFeedback } = await import("../../drizzle/schema");
      const { rfqs: rfqsTable } = await import("../../drizzle/schema");
      const rfqRows = await db.select().from(rfqsTable).where(eq(rfqsTable.referenceNumber, input.rfqReference)).limit(1);
      if (!rfqRows.length) throw new TRPCError({ code: "NOT_FOUND", message: "RFQ not found" });
      const rfq = rfqRows[0];
      await db.insert(buyerFeedback).values({
        rfqId: rfq.id,
        companyId: rfq.companyId || 0,
        overallRating: input.overallRating,
        comments: input.comments,
        source: "system_triggered",
      });
      return { success: true };
    }),
});
