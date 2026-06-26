import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { auditLog, aiIntelligenceLog, rfqs } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

export const auditRouter = router({
  // Admin: list audit log
  list: protectedProcedure
    .input(z.object({
      entityType: z.string().optional(),
      limit: z.number().default(100),
      offset: z.number().default(0),
      isError: z.boolean().optional(),
    }))
    .query(async ({ ctx, input }) => {
      if (!["admin", "super_admin"].includes(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      let results = await db.select().from(auditLog)
        .orderBy(desc(auditLog.timestamp))
        .limit(input.limit)
        .offset(input.offset);

      if (input.entityType && input.entityType !== "all") {
        results = results.filter(r => r.entityType === input.entityType);
      }
      if (input.isError !== undefined) {
        results = results.filter(r => r.isError === input.isError);
      }
      return results;
    }),

  // Admin: get error patterns (self-improving audit)
  errorPatterns: protectedProcedure.query(async ({ ctx }) => {
    if (!["admin", "super_admin"].includes(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN" });
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const errors = await db.select().from(auditLog)
      .where(eq(auditLog.isError, true))
      .orderBy(desc(auditLog.timestamp))
      .limit(200);

    // Group by action type
    const patterns: Record<string, number> = {};
    for (const e of errors) {
      patterns[e.actionType] = (patterns[e.actionType] || 0) + 1;
    }

    return Object.entries(patterns)
      .sort((a, b) => b[1] - a[1])
      .map(([action, count]) => ({ action, count }));
  }),

  // Admin: trigger AI analysis of RFQ for sourcing intelligence
  analyzeRfq: protectedProcedure
    .input(z.object({
      rfqId: z.number(),
      additionalContext: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!["admin", "super_admin"].includes(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const rfqResult = await db.select().from(rfqs).where(eq(rfqs.id, input.rfqId)).limit(1);
      if (!rfqResult[0]) throw new TRPCError({ code: "NOT_FOUND" });

      const rfq = rfqResult[0];
      const prompt = `You are a procurement intelligence analyst for Procure.parts, a B2B spare parts sourcing platform operating in GCC/MENA/Africa.

Analyze this RFQ and provide sourcing intelligence:

RFQ Reference: ${rfq.referenceNumber}
Value Tier: ${rfq.estimatedValueTier}
Timeline: ${rfq.timelineTier}
Priority: ${rfq.priority}
Item File: ${rfq.itemListFileName || "Not specified"}
${input.additionalContext ? `Additional Context: ${input.additionalContext}` : ""}

Please provide:
1. SOURCING STRATEGY: Recommended approach for this RFQ
2. SUPPLIER PROFILE: What type of vendors to engage (distributor/dealer/supplier)
3. RISK ASSESSMENT: Any red flags or considerations
4. MARKET INTELLIGENCE: Typical lead times and pricing expectations for this category
5. RECOMMENDED ACTIONS: Specific next steps for the procurement desk

Be concise, professional, and actionable.`;

      // Log the AI request
      const [logEntry] = await db.insert(aiIntelligenceLog).values({
        rfqId: input.rfqId,
        requestedBy: ctx.user.id,
        prompt,
        status: "pending",
      });

      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are a senior procurement intelligence analyst. Provide structured, actionable analysis." },
            { role: "user", content: prompt },
          ],
        });

        const content = response.choices?.[0]?.message?.content || "No response generated";

        // Update log with response
        const responseText = typeof content === 'string' ? content : JSON.stringify(content);
        await db.update(aiIntelligenceLog).set({
          response: responseText,
          model: response.model || "unknown",
          tokensUsed: response.usage?.total_tokens,
          status: "completed",
        }).where(eq(aiIntelligenceLog.rfqId, input.rfqId));

        // Write to audit log
        await db.insert(auditLog).values({
          actorId: ctx.user.id,
          actorRole: "admin",
          actionType: "ai.rfq_analysis",
          entityType: "ai_query",
          entityId: rfq.referenceNumber,
          notes: `AI analysis completed for ${rfq.referenceNumber}`,
          isError: false,
        });

        return { success: true, analysis: content };
      } catch (err: any) {
        await db.update(aiIntelligenceLog).set({
          status: "failed",
          response: err.message,
        }).where(eq(aiIntelligenceLog.rfqId, input.rfqId));

        await db.insert(auditLog).values({
          actorId: ctx.user.id,
          actorRole: "admin",
          actionType: "ai.rfq_analysis",
          entityType: "ai_query",
          entityId: rfq.referenceNumber,
          notes: `AI analysis failed: ${err.message}`,
          isError: true,
          errorDetails: err.message,
        });

        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "AI analysis failed" });
      }
    }),

  // Admin: list AI intelligence log
  aiLog: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      if (!["admin", "super_admin"].includes(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      return db.select().from(aiIntelligenceLog)
        .orderBy(desc(aiIntelligenceLog.createdAt))
        .limit(input.limit);
    }),

  messages: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const { auditLog } = await import("../../drizzle/schema");
      const { desc } = await import("drizzle-orm");
      return db.select().from(auditLog)
        .where((await import("drizzle-orm")).eq(auditLog.actionType, "desk.message"))
        .orderBy(desc(auditLog.timestamp))
        .limit(input.limit);
    }),
  sendMessage: protectedProcedure
    .input(z.object({ entityType: z.string(), entityId: z.string(), contextTag: z.string().optional(), body: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const { auditLog } = await import("../../drizzle/schema");
      await db.insert(auditLog).values({
        actionType: "desk.message",
        entityType: input.entityType as any,
        entityId: input.entityId,
        actorId: ctx.user.id,
        actorRole: ctx.user.role as any,
        notes: input.body,
        isError: false,
      });
      return { success: true };
    }),
});