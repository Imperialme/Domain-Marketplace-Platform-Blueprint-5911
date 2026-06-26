import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { companies, users, auditLog } from "../../drizzle/schema";
import { eq, desc, like, or } from "drizzle-orm";
import { nanoid } from "nanoid";
import {
  sendApplicationReceived,
  sendApplicationApproved,
  sendApplicationRejected,
  sendNewApplicationAlert,
} from "../email";

function generateCompanyId(country: string): string {
  const code = country.substring(0, 2).toUpperCase();
  const num = Math.floor(Math.random() * 900) + 100;
  return `CID-${code}-${num}`;
}

async function writeAudit(db: any, actorId: number | null, actionType: string, entityId: string, notes: string) {
  try {
    await db.insert(auditLog).values({
      actorId,
      actorRole: actorId ? "admin" : "system",
      actionType,
      entityType: "company",
      entityId,
      notes,
      isError: false,
    });
  } catch {}
}

export const companiesRouter = router({
  // Public: submit company application
  submitApplication: publicProcedure
    .input(z.object({
      legalName: z.string().min(2),
      country: z.string().min(2),
      operatingRegions: z.string().optional(),
      industry: z.string().min(2),
      website: z.string().optional(),
      businessEmail: z.string().email(),
      contactPhone: z.string().optional(),
      applicantRole: z.string().min(2),
      teamSize: z.string().optional(),
      avgOrderValue: z.string().optional(),
      annualVolume: z.string().optional(),
      pastPurchaseExamples: z.string().optional(),
      sourcingRegions: z.string().optional(),
      procurementFrequency: z.enum(["monthly", "quarterly", "project_based"]),
      reasonForApplying: z.string().min(20),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const companyId = generateCompanyId(input.country);

      await db.insert(companies).values({
        companyId,
        legalName: input.legalName,
        country: input.country,
        operatingRegions: input.operatingRegions,
        industry: input.industry,
        website: input.website,
        businessEmail: input.businessEmail,
        contactPhone: input.contactPhone,
        applicantRole: input.applicantRole,
        teamSize: input.teamSize,
        avgOrderValue: input.avgOrderValue,
        annualVolume: input.annualVolume,
        pastPurchaseExamples: input.pastPurchaseExamples,
        sourcingRegions: input.sourcingRegions,
        procurementFrequency: input.procurementFrequency,
        reasonForApplying: input.reasonForApplying,
        status: "pending",
        riskFlag: "yellow",
      });

      await writeAudit(db, null, "company.apply", companyId, `New application from ${input.legalName}`);

      // Send confirmation email to applicant (fire-and-forget)
      sendApplicationReceived({
        applicantName: input.legalName,
        legalName: input.legalName,
        companyId,
        businessEmail: input.businessEmail,
        country: input.country,
        industry: input.industry,
      }).catch(e => console.error("[Email] apply confirmation failed:", e));

      // Alert owner about new application (fire-and-forget)
      sendNewApplicationAlert({
        legalName: input.legalName,
        companyId,
        country: input.country,
        industry: input.industry,
        businessEmail: input.businessEmail,
        adminUrl: `${process.env.PLATFORM_URL || "https://procure.parts"}/admin/onboarding`,
      }).catch(e => console.error("[Email] admin alert failed:", e));

      return { success: true, companyId };
    }),

  // Admin: list all companies with optional filter
  list: protectedProcedure
    .input(z.object({
      status: z.enum(["pending", "approved", "rejected", "suspended", "all"]).default("all"),
      search: z.string().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      if (!["admin", "super_admin"].includes(ctx.user.role)) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      let query = db.select().from(companies).orderBy(desc(companies.createdAt)).limit(input.limit).offset(input.offset);
      const results = await query;

      return results.filter(c => {
        if (input.status !== "all" && c.status !== input.status) return false;
        if (input.search) {
          const s = input.search.toLowerCase();
          return c.legalName.toLowerCase().includes(s) || c.businessEmail.toLowerCase().includes(s) || c.companyId.toLowerCase().includes(s);
        }
        return true;
      });
    }),

  // Admin: get single company
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!["admin", "super_admin"].includes(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const result = await db.select().from(companies).where(eq(companies.id, input.id)).limit(1);
      if (!result[0]) throw new TRPCError({ code: "NOT_FOUND" });
      return result[0];
    }),

  // Admin: approve company
  approve: protectedProcedure
    .input(z.object({
      id: z.number(),
      riskFlag: z.enum(["green", "yellow", "red"]).default("green"),
      adminNotes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!["admin", "super_admin"].includes(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db.update(companies)
        .set({ status: "approved", riskFlag: input.riskFlag, adminNotes: input.adminNotes, approvedBy: ctx.user.id, approvedAt: new Date() })
        .where(eq(companies.id, input.id));

      await writeAudit(db, ctx.user.id, "company.approve", String(input.id), `Approved with risk flag: ${input.riskFlag}`);

      // Send approval email (fire-and-forget)
      const approvedRec = await db.select().from(companies).where(eq(companies.id, input.id)).limit(1);
      if (approvedRec[0]) {
        sendApplicationApproved({
          applicantName: approvedRec[0].legalName,
          legalName: approvedRec[0].legalName,
          companyId: approvedRec[0].companyId,
          businessEmail: approvedRec[0].businessEmail,
        }).catch(e => console.error("[Email] approval email failed:", e));
      }
      return { success: true };
    }),

  // Admin: reject company
  reject: protectedProcedure
    .input(z.object({ id: z.number(), adminNotes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      if (!["admin", "super_admin"].includes(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db.update(companies)
        .set({ status: "rejected", adminNotes: input.adminNotes, riskFlag: "red" })
        .where(eq(companies.id, input.id));

      await writeAudit(db, ctx.user.id, "company.reject", String(input.id), input.adminNotes || "Rejected");

      // Send rejection email (fire-and-forget)
      const rejectedRec = await db.select().from(companies).where(eq(companies.id, input.id)).limit(1);
      if (rejectedRec[0]) {
        sendApplicationRejected({
          applicantName: rejectedRec[0].legalName,
          legalName: rejectedRec[0].legalName,
          businessEmail: rejectedRec[0].businessEmail,
          adminNotes: input.adminNotes,
        }).catch(e => console.error("[Email] rejection email failed:", e));
      }
      return { success: true };
    }),

  // Admin: update risk flag
  updateRiskFlag: protectedProcedure
    .input(z.object({ id: z.number(), riskFlag: z.enum(["green", "yellow", "red"]), adminNotes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      if (!["admin", "super_admin"].includes(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db.update(companies)
        .set({ riskFlag: input.riskFlag, adminNotes: input.adminNotes })
        .where(eq(companies.id, input.id));

      await writeAudit(db, ctx.user.id, "company.risk_flag_update", String(input.id), `Risk flag set to ${input.riskFlag}`);
      return { success: true };
    }),

  // Buyer: get own company profile
  myProfile: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const result = await db.select().from(companies).where(eq(companies.userId, ctx.user.id)).limit(1);
    return result[0] || null;
  }),

  stats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const all = await db.select().from(companies);
    return {
      total: all.length,
      pending: all.filter(c => c.status === "pending").length,
      approved: all.filter(c => c.status === "approved").length,
      rejected: all.filter(c => c.status === "rejected").length,
    };
  }),
});