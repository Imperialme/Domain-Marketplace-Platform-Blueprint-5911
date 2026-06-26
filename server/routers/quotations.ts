import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { quotations, rfqs, companies, auditLog, partsQuoteHistory } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { sendQuotationIssued } from "../email";
import { generateQuotationPDF, generateQuotationExcel, QuotationExportData } from "../quotationExport";

// ─── MARGIN ENGINE ───────────────────────────────────────────────────────────
export function calculateOEMSell(oemCost: number): number {
  return oemCost / 0.75; // 25% margin
}

export function calculateAMSell(amCost: number, oemCost: number): number {
  const oemSell = calculateOEMSell(oemCost);
  const diffPct = ((oemCost - amCost) / amCost) * 100;

  if (diffPct <= 100) {
    return amCost * 1.30; // 30% margin
  } else if (diffPct <= 400) {
    return amCost * 1.50; // 50% margin
  } else {
    // 401%+ gap: MAX of 150% margin OR 40% of OEM sell
    const optionA = amCost * 2.50;
    const optionB = oemSell * 0.40;
    return Math.max(optionA, optionB);
  }
}

export function getAMMarginTier(amCost: number, oemCost: number): string {
  const diffPct = ((oemCost - amCost) / amCost) * 100;
  if (diffPct <= 100) return "Tier 1 (30%)";
  if (diffPct <= 400) return "Tier 2 (50%)";
  return "Tier 3 (150%/Cap)";
}

export function calculateMarginPct(cost: number, sell: number): number {
  return ((sell - cost) / sell) * 100;
}

const LineItemSchema = z.object({
  lineNo: z.number(),
  partNumber: z.string(),
  description: z.string().optional(),
  qty: z.number(),
  oemCostUSD: z.number().optional(),
  amCostUSD: z.number().optional(),
  oemSellUSD: z.number().optional(),
  amSellUSD: z.number().optional(),
  leadTimeDays: z.number().optional(),
  condition: z.enum(["oem", "aftermarket", "both"]).default("both"),
  notes: z.string().optional(),
});

async function writeAudit(db: any, actorId: number, actionType: string, entityId: string, notes: string) {
  try {
    await db.insert(auditLog).values({ actorId, actorRole: "admin", actionType, entityType: "quotation", entityId, notes, isError: false });
  } catch {}
}

export const quotationsRouter = router({
  // Admin: create quotation draft
  create: protectedProcedure
    .input(z.object({
      rfqId: z.number(),
      marginMode: z.enum(["fixed", "custom"]).default("fixed"),
      lineItems: z.array(LineItemSchema),
      currency: z.string().default("USD"),
      leadTimeDays: z.number().optional(),
      validityDays: z.number().default(30),
      logisticsCost: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!["admin", "super_admin"].includes(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Auto-calculate margins if fixed mode
      const processedLines = input.lineItems.map(line => {
        let oemSell = line.oemSellUSD;
        let amSell = line.amSellUSD;

        if (input.marginMode === "fixed") {
          if (line.oemCostUSD) oemSell = calculateOEMSell(line.oemCostUSD);
          if (line.amCostUSD && line.oemCostUSD) amSell = calculateAMSell(line.amCostUSD, line.oemCostUSD);
        }

        const oemMarginPct = oemSell && line.oemCostUSD ? calculateMarginPct(line.oemCostUSD, oemSell) : null;
        const amMarginPct = amSell && line.amCostUSD ? calculateMarginPct(line.amCostUSD, amSell) : null;

        return { ...line, oemSellUSD: oemSell, amSellUSD: amSell, oemMarginPct, amMarginPct };
      });

      // Build comparison table
      const comparisonTable = processedLines.map(line => ({
        lineNo: line.lineNo,
        partNumber: line.partNumber,
        qty: line.qty,
        oemSell: line.oemSellUSD ? line.oemSellUSD * line.qty : null,
        amSell: line.amSellUSD ? line.amSellUSD * line.qty : null,
        savings: (line.oemSellUSD && line.amSellUSD)
          ? ((line.oemSellUSD - line.amSellUSD) / line.oemSellUSD * 100).toFixed(1) + "%"
          : null,
        amMarginTier: (line.amCostUSD && line.oemCostUSD)
          ? getAMMarginTier(line.amCostUSD, line.oemCostUSD)
          : null,
      }));

      // Totals
      const totalOEM = processedLines.reduce((s, l) => s + (l.oemSellUSD ? l.oemSellUSD * l.qty : 0), 0);
      const totalAM = processedLines.reduce((s, l) => s + (l.amSellUSD ? l.amSellUSD * l.qty : 0), 0);
      const totalOEMCost = processedLines.reduce((s, l) => s + (l.oemCostUSD ? l.oemCostUSD * l.qty : 0), 0);
      const totalAMCost = processedLines.reduce((s, l) => s + (l.amCostUSD ? l.amCostUSD * l.qty : 0), 0);

      const [inserted] = await db.insert(quotations).values({
        rfqId: input.rfqId,
        marginMode: input.marginMode,
        supplierCostOem: String(totalOEMCost),
        supplierCostAm: String(totalAMCost),
        logisticsCost: input.logisticsCost ? String(input.logisticsCost) : null,
        finalBuyerPriceOem: String(totalOEM),
        finalBuyerPriceAm: String(totalAM),
        currency: input.currency,
        leadTimeDays: input.leadTimeDays,
        validityDays: input.validityDays,
        lineItemsJson: processedLines,
        comparisonTableJson: comparisonTable,
        status: "draft",
        createdBy: ctx.user.id,
      });

      await writeAudit(db, ctx.user.id, "quotation.create", String(input.rfqId), `Quotation draft created for RFQ ${input.rfqId}`);
      return { success: true };
    }),

  // Admin: issue quotation to buyer
  issue: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!["admin", "super_admin"].includes(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db.update(quotations).set({ status: "issued", issuedAt: new Date() }).where(eq(quotations.id, input.id));
      await writeAudit(db, ctx.user.id, "quotation.issue", String(input.id), "Quotation issued to buyer");

      // Send quotation-ready email to buyer (fire-and-forget)
      try {
        const quotationRow = await db.select().from(quotations).where(eq(quotations.id, input.id)).limit(1);
        const rfqRow = quotationRow[0] ? await db.select().from(rfqs).where(eq(rfqs.id, quotationRow[0].rfqId)).limit(1) : [];
        const companyRow = rfqRow[0] ? await db.select().from(companies).where(eq(companies.id, rfqRow[0].companyId)).limit(1) : [];
        if (companyRow[0] && rfqRow[0] && quotationRow[0]) {
          sendQuotationIssued({
            buyerName: companyRow[0].legalName,
            legalName: companyRow[0].legalName,
            businessEmail: companyRow[0].businessEmail,
            rfqReference: rfqRow[0].referenceNumber,
            quotationId: input.id,
            currency: quotationRow[0].currency || "USD",
            finalPriceOem: quotationRow[0].finalBuyerPriceOem ? `${quotationRow[0].currency || "USD"} ${Number(quotationRow[0].finalBuyerPriceOem).toLocaleString()}` : null,
            finalPriceAm: quotationRow[0].finalBuyerPriceAm ? `${quotationRow[0].currency || "USD"} ${Number(quotationRow[0].finalBuyerPriceAm).toLocaleString()}` : null,
            leadTimeDays: quotationRow[0].leadTimeDays,
            validityDays: quotationRow[0].validityDays || 30,
          }).catch(e => console.error("[Email] Quotation issued email failed:", e));
        }
      } catch (e) {
        console.error("[Email] Could not send quotation email:", e);
      }

      return { success: true };
    }),

  // Admin: list quotations
  list: protectedProcedure
    .input(z.object({ rfqId: z.number().optional(), status: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      if (!["admin", "super_admin"].includes(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      let results = await db.select().from(quotations).orderBy(desc(quotations.createdAt));
      if (input.rfqId) results = results.filter(q => q.rfqId === input.rfqId);
      if (input.status && input.status !== "all") results = results.filter(q => q.status === input.status);
      return results;
    }),

  // Buyer: get own quotations
  myQuotations: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const companyResult = await db.select().from(companies).where(eq(companies.userId, ctx.user.id)).limit(1);
    if (!companyResult[0]) return [];

    const myRfqs = await db.select().from(rfqs).where(eq(rfqs.companyId, companyResult[0].id));
    const rfqIds = myRfqs.map(r => r.id);

    const allQuotations = await db.select().from(quotations)
      .where(eq(quotations.status, "issued"))
      .orderBy(desc(quotations.createdAt));

    return allQuotations.filter(q => rfqIds.includes(q.rfqId));
  }),

  // Buyer: get single quotation (buyer-safe — no cost/margin data)
  getBuyerView: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const result = await db.select().from(quotations).where(eq(quotations.id, input.id)).limit(1);
      if (!result[0]) throw new TRPCError({ code: "NOT_FOUND" });

      // Strip cost/margin data for buyers
      const q = result[0];
      const buyerView = {
        id: q.id,
        rfqId: q.rfqId,
        currency: q.currency,
        finalBuyerPriceOem: q.finalBuyerPriceOem,
        finalBuyerPriceAm: q.finalBuyerPriceAm,
        leadTimeDays: q.leadTimeDays,
        validityDays: q.validityDays,
        status: q.status,
        issuedAt: q.issuedAt,
        comparisonTableJson: q.comparisonTableJson,
        // Buyer-safe line items — no cost fields
        lineItemsJson: Array.isArray(q.lineItemsJson)
          ? (q.lineItemsJson as any[]).map((l: any) => ({
              lineNo: l.lineNo,
              partNumber: l.partNumber,
              description: l.description,
              qty: l.qty,
              oemSellUSD: l.oemSellUSD,
              amSellUSD: l.amSellUSD,
              leadTimeDays: l.leadTimeDays,
              condition: l.condition,
            }))
          : [],
      };

      return buyerView;
    }),

  // Buyer: accept quotation
  accept: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(quotations).set({ status: "accepted", acceptedAt: new Date() }).where(eq(quotations.id, input.id));
      return { success: true };
    }),

  // Admin: get full quotation with costs
  getAdminView: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!["admin", "super_admin"].includes(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const result = await db.select().from(quotations).where(eq(quotations.id, input.id)).limit(1);
      if (!result[0]) throw new TRPCError({ code: "NOT_FOUND" });
      return result[0];
    }),

  // Export: generate PDF (returns base64)
  exportPDF: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const quotationRow = await db.select().from(quotations).where(eq(quotations.id, input.id)).limit(1);
      if (!quotationRow[0]) throw new TRPCError({ code: "NOT_FOUND" });

      // Buyers can only export their own quotations
      const rfqRow = await db.select().from(rfqs).where(eq(rfqs.id, quotationRow[0].rfqId)).limit(1);
      const companyRow = rfqRow[0] ? await db.select().from(companies).where(eq(companies.id, rfqRow[0].companyId)).limit(1) : [];

      if (!companyRow[0] || !rfqRow[0]) throw new TRPCError({ code: "NOT_FOUND" });
      if (!(["admin", "super_admin"].includes(ctx.user.role)) && companyRow[0].userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const q = quotationRow[0];
      const exportData: QuotationExportData = {
        quotationId: q.id,
        rfqReference: rfqRow[0].referenceNumber,
        companyName: companyRow[0].legalName,
        companyId: companyRow[0].companyId || "",
        currency: q.currency || "USD",
        issuedAt: q.issuedAt,
        validityDays: q.validityDays || 30,
        leadTimeDays: q.leadTimeDays,
        finalPriceOem: q.finalBuyerPriceOem,
        finalPriceAm: q.finalBuyerPriceAm,
        lineItems: Array.isArray(q.lineItemsJson) ? (q.lineItemsJson as any[]).map((l: any) => ({
          lineNo: l.lineNo,
          partNumber: l.partNumber,
          description: l.description,
          qty: l.qty,
          oemSellUSD: l.oemSellUSD,
          amSellUSD: l.amSellUSD,
          leadTimeDays: l.leadTimeDays,
          condition: l.condition,
        })) : [],
      };

      const pdfBuffer = await generateQuotationPDF(exportData);
      return {
        base64: pdfBuffer.toString("base64"),
        filename: `Quotation-${rfqRow[0].referenceNumber}-Q${input.id.toString().padStart(4, "0")}.pdf`,
        mimeType: "application/pdf",
      };
    }),

  // Export: generate Excel (returns base64)
  exportExcel: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const quotationRow = await db.select().from(quotations).where(eq(quotations.id, input.id)).limit(1);
      if (!quotationRow[0]) throw new TRPCError({ code: "NOT_FOUND" });

      const rfqRow = await db.select().from(rfqs).where(eq(rfqs.id, quotationRow[0].rfqId)).limit(1);
      const companyRow = rfqRow[0] ? await db.select().from(companies).where(eq(companies.id, rfqRow[0].companyId)).limit(1) : [];

      if (!companyRow[0] || !rfqRow[0]) throw new TRPCError({ code: "NOT_FOUND" });
      if (!(["admin", "super_admin"].includes(ctx.user.role)) && companyRow[0].userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const q = quotationRow[0];
      const exportData: QuotationExportData = {
        quotationId: q.id,
        rfqReference: rfqRow[0].referenceNumber,
        companyName: companyRow[0].legalName,
        companyId: companyRow[0].companyId || "",
        currency: q.currency || "USD",
        issuedAt: q.issuedAt,
        validityDays: q.validityDays || 30,
        leadTimeDays: q.leadTimeDays,
        finalPriceOem: q.finalBuyerPriceOem,
        finalPriceAm: q.finalBuyerPriceAm,
        lineItems: Array.isArray(q.lineItemsJson) ? (q.lineItemsJson as any[]).map((l: any) => ({
          lineNo: l.lineNo,
          partNumber: l.partNumber,
          description: l.description,
          qty: l.qty,
          oemSellUSD: l.oemSellUSD,
          amSellUSD: l.amSellUSD,
          leadTimeDays: l.leadTimeDays,
          condition: l.condition,
        })) : [],
      };

      const excelBuffer = generateQuotationExcel(exportData);
      return {
        base64: excelBuffer.toString("base64"),
        filename: `Quotation-${rfqRow[0].referenceNumber}-Q${input.id.toString().padStart(4, "0")}.xlsx`,
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      };
    }),

  // Utility: calculate margin preview (no DB write)
  calculatePreview: protectedProcedure
    .input(z.object({
      oemCost: z.number().optional(),
      amCost: z.number().optional(),
      qty: z.number().default(1),
    }))
    .query(({ input }) => {
      const { oemCost, amCost, qty } = input;
      const oemSell = oemCost ? calculateOEMSell(oemCost) : null;
      const amSell = (amCost && oemCost) ? calculateAMSell(amCost, oemCost) : null;
      const amTier = (amCost && oemCost) ? getAMMarginTier(amCost, oemCost) : null;

      return {
        oemCost,
        oemSell,
        oemMarginPct: oemSell && oemCost ? calculateMarginPct(oemCost, oemSell) : null,
        oemTotalSell: oemSell ? oemSell * qty : null,
        amCost,
        amSell,
        amMarginPct: amSell && amCost ? calculateMarginPct(amCost, amSell) : null,
        amTotalSell: amSell ? amSell * qty : null,
        amTier,
        savings: (oemSell && amSell) ? ((oemSell - amSell) / oemSell * 100).toFixed(1) + "%" : null,
      };
    }),
});
