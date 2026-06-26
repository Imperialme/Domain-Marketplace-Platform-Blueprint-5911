import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { companies, rfqs, vendors, vendorPrices, quotations, auditLog } from "../../drizzle/schema";
import { desc, eq } from "drizzle-orm";

// Helper: convert array of objects to CSV string
function toCSV(rows: Record<string, unknown>[], columns: string[]): string {
  const header = columns.join(",");
  const body = rows.map(row =>
    columns.map(col => {
      const val = row[col];
      if (val === null || val === undefined) return "";
      const str = String(val).replace(/"/g, '""');
      return str.includes(",") || str.includes('"') || str.includes("\n") ? `"${str}"` : str;
    }).join(",")
  ).join("\n");
  return `${header}\n${body}`;
}

export const exportsRouter = router({
  // Export buyers/companies as CSV
  exportBuyersCSV: protectedProcedure
    .mutation(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      const rows = await db.select().from(companies).orderBy(desc(companies.createdAt));
      const columns = ["id", "companyId", "legalName", "country", "industry", "businessEmail", "applicantRole", "status", "riskFlag", "createdAt"];
      const csv = toCSV(rows as Record<string, unknown>[], columns);

      // Log the export
      await db.insert(auditLog).values({
        entityType: "company",
        entityId: "export",
        actionType: "export_buyers_csv",
        actorId: ctx.user.id,
        notes: `Exported ${rows.length} buyer records to CSV`,
      });

      return { csv, filename: `procure-parts-buyers-${new Date().toISOString().split("T")[0]}.csv`, count: rows.length };
    }),

  // Export vendors as CSV
  exportVendorsCSV: protectedProcedure
    .mutation(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      const rows = await db.select().from(vendors).orderBy(desc(vendors.createdAt));
      const columns = ["id", "vendorId", "internalAlias", "vendorType", "industryFocus", "region", "status", "accuracyScore", "fulfilmentRate", "createdAt"];
      const csv = toCSV(rows as Record<string, unknown>[], columns);

      await db.insert(auditLog).values({
        entityType: "vendor",
        entityId: "export",
        actionType: "export_vendors_csv",
        actorId: ctx.user.id,
        notes: `Exported ${rows.length} vendor records to CSV`,
      });

      return { csv, filename: `procure-parts-vendors-${new Date().toISOString().split("T")[0]}.csv`, count: rows.length };
    }),

  // Export RFQs as CSV
  exportRFQsCSV: protectedProcedure
    .mutation(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      const rows = await db.select().from(rfqs).orderBy(desc(rfqs.createdAt));
      const columns = ["id", "referenceNumber", "status", "priority", "estimatedValueTier", "timelineTier", "outcomeCode", "createdAt", "closedAt"];
      const csv = toCSV(rows as Record<string, unknown>[], columns);

      return { csv, filename: `procure-parts-rfqs-${new Date().toISOString().split("T")[0]}.csv`, count: rows.length };
    }),

  // Google Sheets sync — returns structured data for Google Sheets API
  // The actual Google Sheets write requires a service account key (stored in secrets)
  getGoogleSheetsData: protectedProcedure
    .input(z.object({
      sheet: z.enum(["buyers", "vendors", "rfqs", "all"]),
    }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      const result: {
        buyers?: { headers: string[]; rows: (string | number | null)[][] };
        vendors?: { headers: string[]; rows: (string | number | null)[][] };
        rfqs?: { headers: string[]; rows: (string | number | null)[][] };
      } = {};

      if (input.sheet === "buyers" || input.sheet === "all") {
        const buyerRows = await db.select().from(companies).orderBy(desc(companies.createdAt));
        result.buyers = {
          headers: ["Company ID", "Legal Name", "Country", "Industry", "Business Email", "Applicant Role", "Status", "Risk Flag", "Created At"],
          rows: buyerRows.map(r => [
            r.companyId ?? null,
            r.legalName,
            r.country,
            r.industry,
            r.businessEmail,
            r.applicantRole,
            r.status,
            r.riskFlag ?? null,
            r.createdAt ? r.createdAt.toISOString() : null,
          ]),
        };
      }

      if (input.sheet === "vendors" || input.sheet === "all") {
        const vendorRows = await db.select().from(vendors).orderBy(desc(vendors.createdAt));
        result.vendors = {
          headers: ["Vendor ID", "Internal Alias", "Vendor Type", "Industry Focus", "Region", "Status", "Accuracy Score", "Fulfilment Rate", "Created At"],
          rows: vendorRows.map(r => [
            r.vendorId ?? null,
            r.internalAlias,
            r.vendorType,
            r.industryFocus ?? null,
            r.region ?? null,
            r.status,
            r.accuracyScore ?? null,
            r.fulfilmentRate ?? null,
            r.createdAt ? r.createdAt.toISOString() : null,
          ]),
        };
      }

      if (input.sheet === "rfqs" || input.sheet === "all") {
        const rfqRows = await db.select().from(rfqs).orderBy(desc(rfqs.createdAt));
        result.rfqs = {
          headers: ["Reference", "Status", "Priority", "Est. Value Tier", "Timeline", "Outcome Code", "Created At", "Closed At"],
          rows: rfqRows.map(r => [
            r.referenceNumber,
            r.status,
            r.priority,
            r.estimatedValueTier ?? null,
            r.timelineTier ?? null,
            r.outcomeCode ?? null,
            r.createdAt ? r.createdAt.toISOString() : null,
            r.closedAt ? r.closedAt.toISOString() : null,
          ]),
        };
      }

      return result;
    }),

  // Check if Google Sheets is configured
  checkGoogleSheetsConfig: protectedProcedure
    .query(({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const hasServiceAccount = !!process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
      const hasSpreadsheetId = !!process.env.GOOGLE_SPREADSHEET_ID;
      return {
        configured: hasServiceAccount && hasSpreadsheetId,
        hasServiceAccount,
        hasSpreadsheetId,
        setupInstructions: [
          "1. Create a Google Cloud project and enable the Google Sheets API",
          "2. Create a Service Account and download the JSON key",
          "3. Share your Google Spreadsheet with the service account email",
          "4. Add GOOGLE_SERVICE_ACCOUNT_JSON (the full JSON content) to your secrets",
          "5. Add GOOGLE_SPREADSHEET_ID (the spreadsheet ID from the URL) to your secrets",
        ],
      };
    }),
});
