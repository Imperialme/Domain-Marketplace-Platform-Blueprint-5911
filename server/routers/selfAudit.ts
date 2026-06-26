import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { auditLog } from "../../drizzle/schema";
import { desc, eq, and, gte, sql } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";
import { notifyOwner } from "../_core/notification";

// ─── Self-Audit Router ────────────────────────────────────────────────────────
// Captures errors, detects patterns, surfaces AI fix suggestions, notifies owner

export const selfAuditRouter = router({

  // Log a client-side or server-side error
  logError: publicProcedure
    .input(z.object({
      errorType: z.string(),           // e.g. "form_submit_failure", "payment_webhook_error"
      errorMessage: z.string(),
      stackTrace: z.string().optional(),
      route: z.string().optional(),    // which page/route triggered it
      userId: z.number().optional(),
      context: z.string().optional(),  // JSON string of relevant context
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { logged: false };

      await db.insert(auditLog).values({
        actorId: input.userId || null,
        actorRole: input.userId ? "user" : "system",
        actionType: `error:${input.errorType}`,
        entityType: "user",
        entityId: input.route || "unknown",
        notes: input.errorMessage,
        errorDetails: input.stackTrace || null,
        patternTags: input.context || null,
        isError: true,
      });

      // Check if this error type has occurred 3+ times in last 24h → notify owner
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentErrors = await db
        .select({ count: sql<number>`count(*)` })
        .from(auditLog)
        .where(
          and(
            eq(auditLog.actionType, `error:${input.errorType}`),
            gte(auditLog.timestamp, oneDayAgo)
          )
        );

      const count = Number(recentErrors[0]?.count || 0);
      if (count === 3 || count === 10 || count === 50) {
        // Notify owner at thresholds: 3, 10, 50 occurrences
        await notifyOwner({
          title: `⚠️ Error Pattern Detected: ${input.errorType}`,
          content: `The error "${input.errorType}" has occurred ${count} times in the last 24 hours.\n\nLatest message: ${input.errorMessage}\n\nRoute: ${input.route || "unknown"}\n\nLogin to the Admin Console → Audit Dashboard to view details and get AI fix suggestions.`,
        });
      }

      return { logged: true, occurrenceCount: count };
    }),

  // Get error log with filters
  getErrorLog: protectedProcedure
    .input(z.object({
      limit: z.number().default(50),
      errorOnly: z.boolean().default(true),
      errorType: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const db = await getDb();
      if (!db) return [];

      const conditions = [eq(auditLog.isError, input.errorOnly)];
      if (input.errorType) {
        conditions.push(eq(auditLog.actionType, `error:${input.errorType}`));
      }

      return db
        .select()
        .from(auditLog)
        .where(and(...conditions))
        .orderBy(desc(auditLog.timestamp))
        .limit(input.limit);
    }),

  // Get error pattern summary — grouped by error type with counts
  getErrorPatterns: protectedProcedure
    .query(async ({ ctx }) => {
      if (ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const db = await getDb();
      if (!db) return [];

      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const patterns = await db
        .select({
          errorType: auditLog.actionType,
          count: sql<number>`count(*)`,
          lastSeen: sql<Date>`max(${auditLog.timestamp})`,
          lastMessage: sql<string>`max(${auditLog.notes})`,
          lastRoute: sql<string>`max(${auditLog.entityId})`,
        })
        .from(auditLog)
        .where(
          and(
            eq(auditLog.isError, true),
            gte(auditLog.timestamp, sevenDaysAgo)
          )
        )
        .groupBy(auditLog.actionType)
        .orderBy(desc(sql`count(*)`));

      return patterns.map(p => ({
        errorType: p.errorType?.replace("error:", "") || "unknown",
        count: Number(p.count),
        lastSeen: p.lastSeen,
        lastMessage: p.lastMessage,
        lastRoute: p.lastRoute,
        severity: Number(p.count) >= 10 ? "critical" : Number(p.count) >= 3 ? "warning" : "info",
      }));
    }),

  // AI-powered fix suggestion for a specific error
  getAIFixSuggestion: protectedProcedure
    .input(z.object({
      errorType: z.string(),
      errorMessage: z.string(),
      stackTrace: z.string().optional(),
      route: z.string().optional(),
      occurrenceCount: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const prompt = `You are a senior full-stack developer analysing a production error in Procure.parts, a B2B procurement platform built with React 19, tRPC, Drizzle ORM, and MySQL.

Error Type: ${input.errorType}
Error Message: ${input.errorMessage}
Route/Location: ${input.route || "unknown"}
Occurrence Count (last 7 days): ${input.occurrenceCount || 1}
${input.stackTrace ? `Stack Trace:\n${input.stackTrace}` : ""}

Please provide:
1. **Root Cause** — what is most likely causing this error (2-3 sentences)
2. **Immediate Fix** — the exact code change or configuration fix needed
3. **Prevention** — how to prevent this error recurring
4. **Severity Assessment** — is this critical, moderate, or minor?

Be specific and actionable. Format your response in clear sections.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are a senior full-stack developer specialising in React, tRPC, and MySQL production debugging. Provide concise, actionable fix suggestions." },
          { role: "user", content: prompt },
        ],
      });

      const rawContent = response.choices?.[0]?.message?.content;
      const suggestion = typeof rawContent === "string" ? rawContent : "Unable to generate suggestion at this time.";

      // Log the AI analysis to audit trail
      const db = await getDb();
      if (db) {
        await db.insert(auditLog).values({
          actorId: ctx.user.id,
          actorRole: ctx.user.role,
          actionType: "ai_fix_analysis",
          entityType: "ai_query",
          entityId: input.errorType.substring(0, 64),
          notes: `AI fix suggestion requested for: ${input.errorType}`,
          afterStateJson: { suggestion: suggestion.substring(0, 1000) },
          isError: false,
        });
      }

      return { suggestion, errorType: input.errorType };
    }),

  // Mark an error pattern as resolved with fix notes
  markResolved: protectedProcedure
    .input(z.object({
      errorType: z.string(),
      fixNotes: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Log the resolution — this feeds the self-improving loop
      await db.insert(auditLog).values({
        actorId: ctx.user.id,
        actorRole: ctx.user.role,
        actionType: "error_resolved",
        entityType: "user",
        entityId: input.errorType.substring(0, 64),
        notes: `Error pattern resolved: ${input.errorType}`,
        afterStateJson: { fixNotes: input.fixNotes },
        isError: false,
      });

      return { success: true };
    }),

  // Get resolution history — the "self-improving" knowledge base
  getResolutionHistory: protectedProcedure
    .query(async ({ ctx }) => {
      if (ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const db = await getDb();
      if (!db) return [];

      return db
        .select()
        .from(auditLog)
        .where(eq(auditLog.actionType, "error_resolved"))
        .orderBy(desc(auditLog.timestamp))
        .limit(100);
    }),

  // Export audit log as CSV data
  exportAuditCSV: protectedProcedure
    .input(z.object({
      errorsOnly: z.boolean().default(false),
      days: z.number().default(30),
    }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const db = await getDb();
      if (!db) return { csv: "" };

      const since = new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);
      const conditions = [gte(auditLog.timestamp, since)];
      if (input.errorsOnly) conditions.push(eq(auditLog.isError, true));

      const rows = await db
        .select()
        .from(auditLog)
        .where(and(...conditions))
        .orderBy(desc(auditLog.timestamp))
        .limit(5000);

      const headers = ["ID", "Timestamp", "Actor ID", "Actor Role", "Action Type", "Entity Type", "Entity ID", "Notes", "Is Error"];
      const csvRows = rows.map(r => [
        r.id,
        r.timestamp?.toISOString() || "",
        r.actorId || "",
        r.actorRole || "",
        r.actionType || "",
        r.entityType || "",
        r.entityId || "",
        `"${(r.notes || "").replace(/"/g, '""')}"`,
        r.isError ? "YES" : "NO",
      ].join(","));

      return { csv: [headers.join(","), ...csvRows].join("\n") };
    }),
});
