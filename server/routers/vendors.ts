import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { vendors, vendorPrices, partsMaster, auditLog } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { sendVendorInvite } from "../email";

function generateVendorId(region: string): string {
  const code = (region || "XX").substring(0, 2).toUpperCase();
  const num = Math.floor(Math.random() * 900) + 100;
  return `SID-${code}-${num}`;
}

async function writeAudit(db: any, actorId: number | null, actionType: string, entityId: string, notes: string) {
  try {
    await db.insert(auditLog).values({ actorId, actorRole: "admin", actionType, entityType: "vendor", entityId, notes, isError: false });
  } catch {}
}

export const vendorsRouter = router({
  // Admin: create vendor invite
  invite: protectedProcedure
    .input(z.object({
      internalAlias: z.string().min(2),
      vendorType: z.enum(["distributor", "dealer", "supplier"]),
      region: z.string().optional(),
      industryFocus: z.string().optional(),
      internalNotes: z.string().optional(),
      inviteEmail: z.string().email().optional(),
      origin: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!["admin", "super_admin"].includes(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const vendorId = generateVendorId(input.region || "XX");
      const inviteToken = nanoid(32);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      await db.insert(vendors).values({
        vendorId,
        internalAlias: input.internalAlias,
        vendorType: input.vendorType,
        region: input.region,
        industryFocus: input.industryFocus,
        internalNotes: input.internalNotes,
        status: "pending",
        inviteToken,
        inviteEmail: input.inviteEmail,
        inviteTokenExpiresAt: expiresAt,
        invitedBy: ctx.user.id,
      });

      await writeAudit(db, ctx.user.id, "vendor.invite", vendorId, `Invited ${input.internalAlias} as ${input.vendorType}`);

      // Build invite URL and send email if address provided
      const baseUrl = input.origin || process.env.PLATFORM_URL || "https://procure.parts";
      const inviteUrl = `${baseUrl}/vendor/accept-invite?token=${inviteToken}`;

      if (input.inviteEmail) {
        sendVendorInvite({
          vendorEmail: input.inviteEmail,
          internalAlias: input.internalAlias,
          vendorType: input.vendorType,
          inviteUrl,
          expiresInDays: 7,
        }).catch(e => console.error("[Email] Vendor invite failed:", e));
      }

      return { success: true, vendorId, inviteToken, inviteUrl };
    }),

  // Public: look up invite by token (for accept page)
  getInviteByToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const result = await db.select().from(vendors).where(eq(vendors.inviteToken, input.token)).limit(1);
      if (!result[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Invite not found or already used" });
      const vendor = result[0];
      if (vendor.inviteTokenExpiresAt && vendor.inviteTokenExpiresAt < new Date()) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invite link has expired" });
      }
      if (vendor.userId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "This invite has already been accepted" });
      }
      return {
        vendorId: vendor.vendorId,
        internalAlias: vendor.internalAlias,
        vendorType: vendor.vendorType,
        region: vendor.region,
        expiresAt: vendor.inviteTokenExpiresAt,
      };
    }),

  // Authenticated: accept vendor invite (links current user to vendor record)
  acceptInvite: protectedProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const result = await db.select().from(vendors).where(eq(vendors.inviteToken, input.token)).limit(1);
      if (!result[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Invite not found" });
      const vendor = result[0];
      if (vendor.inviteTokenExpiresAt && vendor.inviteTokenExpiresAt < new Date()) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invite link has expired" });
      }
      if (vendor.userId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "This invite has already been accepted" });
      }
      // Link user to vendor and activate
      await db.update(vendors).set({
        userId: ctx.user.id,
        status: "active",
        inviteToken: null,
      }).where(eq(vendors.id, vendor.id));
      await writeAudit(db, ctx.user.id, "vendor.acceptInvite", vendor.vendorId, `Vendor invite accepted by user ${ctx.user.id}`);
      return { success: true, vendorId: vendor.vendorId };
    }),

  // Admin: list all vendors
  list: protectedProcedure
    .input(z.object({
      status: z.string().optional(),
      vendorType: z.string().optional(),
      limit: z.number().default(50),
    }))
    .query(async ({ ctx, input }) => {
      if (!["admin", "super_admin"].includes(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const results = await db.select().from(vendors).orderBy(desc(vendors.createdAt)).limit(input.limit);
      return results.filter(v => {
        if (input.status && input.status !== "all" && v.status !== input.status) return false;
        if (input.vendorType && input.vendorType !== "all" && v.vendorType !== input.vendorType) return false;
        return true;
      });
    }),

  // Admin: update vendor status
  updateStatus: protectedProcedure
    .input(z.object({ id: z.number(), status: z.enum(["active", "suspended", "pending"]) }))
    .mutation(async ({ ctx, input }) => {
      if (!["admin", "super_admin"].includes(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(vendors).set({ status: input.status }).where(eq(vendors.id, input.id));
      await writeAudit(db, ctx.user.id, "vendor.status_update", String(input.id), `Status → ${input.status}`);
      return { success: true };
    }),

  // Vendor: get own profile
  myProfile: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const result = await db.select().from(vendors).where(eq(vendors.userId, ctx.user.id)).limit(1);
    return result[0] || null;
  }),

  // Vendor: submit price
  submitPrice: protectedProcedure
    .input(z.object({
      partId: z.number(),
      currency: z.string().default("USD"),
      unitPrice: z.number().positive(),
      condition: z.enum(["oem", "aftermarket"]),
      moq: z.number().default(1),
      availableQty: z.number().optional(),
      leadTimeDays: z.number().optional(),
      stockStatus: z.enum(["in_stock", "on_order", "unavailable"]).default("in_stock"),
      region: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const vendorResult = await db.select().from(vendors).where(eq(vendors.userId, ctx.user.id)).limit(1);
      if (!vendorResult[0] || vendorResult[0].status !== "active") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only active vendors can submit prices" });
      }

      await db.insert(vendorPrices).values({
        partId: input.partId,
        vendorId: vendorResult[0].id,
        currency: input.currency,
        unitPrice: String(input.unitPrice),
        condition: input.condition,
        moq: input.moq,
        availableQty: input.availableQty,
        leadTimeDays: input.leadTimeDays,
        stockStatus: input.stockStatus,
        region: input.region,
        approvalStatus: "pending",
      });

      return { success: true };
    }),

  // Vendor: list own price submissions
  myPrices: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const vendorResult = await db.select().from(vendors).where(eq(vendors.userId, ctx.user.id)).limit(1);
    if (!vendorResult[0]) return [];

    return db.select({
      price: vendorPrices,
      part: { oemPartNumber: partsMaster.oemPartNumber, brand: partsMaster.brand, description: partsMaster.description },
    })
      .from(vendorPrices)
      .leftJoin(partsMaster, eq(vendorPrices.partId, partsMaster.id))
      .where(eq(vendorPrices.vendorId, vendorResult[0].id))
      .orderBy(desc(vendorPrices.validityStart));
  }),

  // Admin: approve/reject vendor price
  approvePrice: protectedProcedure
    .input(z.object({ priceId: z.number(), approved: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      if (!["admin", "super_admin"].includes(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db.update(vendorPrices).set({
        approvalStatus: input.approved ? "approved" : "rejected",
        approvedBy: ctx.user.id,
        approvedAt: new Date(),
      }).where(eq(vendorPrices.id, input.priceId));

      return { success: true };
    }),

  // Vendor: submit RFQ-based price quote (flexible, no partId required)
  submitQuote: protectedProcedure
    .input(z.object({
      rfqReference: z.string().optional(),
      notes: z.string().optional(),
      lines: z.array(z.object({
        partNumber: z.string().optional(),
        description: z.string().optional(),
        qty: z.number().default(1),
        unitCostAED: z.number().optional(),
        unitCostUSD: z.number().optional(),
        condition: z.enum(["oem", "aftermarket", "remanufactured"]).default("oem"),
        leadTimeDays: z.number().optional(),
        notes: z.string().optional(),
      }))
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const vendorResult = await db.select().from(vendors).where(eq(vendors.userId, ctx.user.id)).limit(1);
      if (!vendorResult[0]) throw new TRPCError({ code: "FORBIDDEN", message: "Vendor profile not found" });
      await writeAudit(db, ctx.user.id, "vendor.submitQuote", vendorResult[0].id.toString(), JSON.stringify({
        rfqReference: input.rfqReference, notes: input.notes, lines: input.lines, status: "pending", createdAt: new Date().toISOString()
      }));
      return { success: true };
    }),

  // Vendor: list own submissions (from audit log)
  mySubmissions: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const vendorResult = await db.select().from(vendors).where(eq(vendors.userId, ctx.user.id)).limit(1);
      if (!vendorResult[0]) return [];
      const logs = await db.select().from(auditLog)
        .where(eq(auditLog.actorId, ctx.user.id))
        .orderBy(desc(auditLog.timestamp))
        .limit(input.limit);
      return logs
        .filter(l => l.actionType === "vendor.submitQuote")
        .map(l => {
          try {
            const data = JSON.parse(l.notes || "{}");
            return { ...data, id: l.id, createdAt: l.timestamp };
          } catch { return { id: l.id, createdAt: l.timestamp, status: "pending" }; }
        });
    }),

  // Admin: list all pending prices
  pendingPrices: protectedProcedure.query(async ({ ctx }) => {
    if (!["admin", "super_admin"].includes(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN" });
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    return db.select({
      price: vendorPrices,
      part: { oemPartNumber: partsMaster.oemPartNumber, brand: partsMaster.brand },
      vendor: { internalAlias: vendors.internalAlias, vendorType: vendors.vendorType },
    })
      .from(vendorPrices)
      .leftJoin(partsMaster, eq(vendorPrices.partId, partsMaster.id))
      .leftJoin(vendors, eq(vendorPrices.vendorId, vendors.id))
      .where(eq(vendorPrices.approvalStatus, "pending"))
      .orderBy(desc(vendorPrices.validityStart));
  }),
});
