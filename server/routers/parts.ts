import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { partsMaster, partsIntelligence, auditLog } from "../../drizzle/schema";
import { eq, desc, like, or } from "drizzle-orm";

function generatePartDnaId(): string {
  const num = Math.floor(Math.random() * 900000) + 100000;
  return `DNA-${num}`;
}

async function writeAudit(db: any, actorId: number, actionType: string, entityId: string, notes: string) {
  try {
    await db.insert(auditLog).values({ actorId, actorRole: "admin", actionType, entityType: "part", entityId, notes, isError: false });
  } catch {}
}

export const partsRouter = router({
  // Admin: create part
  create: protectedProcedure
    .input(z.object({
      brand: z.string().optional(),
      oemPartNumber: z.string().min(1),
      alternateNumbers: z.string().optional(),
      description: z.string().optional(),
      category: z.string().optional(),
      subcategory: z.string().optional(),
      compatibility: z.string().optional(),
      countryOfOrigin: z.string().optional(),
      hsCode: z.string().optional(),
      uom: z.string().optional(),
      weightDimensions: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!["admin", "super_admin"].includes(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const partDnaId = generatePartDnaId();
      await db.insert(partsMaster).values({
        ...input,
        partDnaId,
        status: "active",
        createdBy: ctx.user.id,
        lastUpdatedBy: ctx.user.id,
      });

      await writeAudit(db, ctx.user.id, "part.create", partDnaId, `Part created: ${input.oemPartNumber}`);
      return { success: true, partDnaId };
    }),

  // Admin/Buyer: search parts
  search: protectedProcedure
    .input(z.object({
      query: z.string().min(1),
      limit: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const results = await db.select().from(partsMaster)
        .where(or(
          like(partsMaster.oemPartNumber, `%${input.query}%`),
          like(partsMaster.brand, `%${input.query}%`),
          like(partsMaster.description, `%${input.query}%`),
          like(partsMaster.partDnaId, `%${input.query}%`),
        ))
        .limit(input.limit);

      return results;
    }),

  // Admin: list all parts
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

      const results = await db.select().from(partsMaster)
        .orderBy(desc(partsMaster.lastUpdatedDate))
        .limit(input.limit)
        .offset(input.offset);

      if (input.status && input.status !== "all") {
        return results.filter(p => p.status === input.status);
      }
      return results;
    }),

  // Admin: get single part with intelligence
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!["admin", "super_admin"].includes(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [part] = await db.select().from(partsMaster).where(eq(partsMaster.id, input.id)).limit(1);
      if (!part) throw new TRPCError({ code: "NOT_FOUND" });

      const [intel] = await db.select().from(partsIntelligence).where(eq(partsIntelligence.partId, input.id)).limit(1);
      return { part, intelligence: intel || null };
    }),

  // Admin: update part
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      brand: z.string().optional(),
      description: z.string().optional(),
      category: z.string().optional(),
      subcategory: z.string().optional(),
      compatibility: z.string().optional(),
      status: z.enum(["active", "dormant", "obsolete"]).optional(),
      alternateNumbers: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!["admin", "super_admin"].includes(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const { id, ...updateData } = input;
      await db.update(partsMaster)
        .set({ ...updateData, lastUpdatedBy: ctx.user.id })
        .where(eq(partsMaster.id, id));

      await writeAudit(db, ctx.user.id, "part.update", String(id), "Part record updated");
      return { success: true };
    }),

  // Admin: bulk import parts from parsed file data
  bulkImport: protectedProcedure
    .input(z.object({
      parts: z.array(z.object({
        oemPartNumber: z.string(),
        brand: z.string().optional(),
        description: z.string().optional(),
        category: z.string().optional(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!["admin", "super_admin"].includes(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      let created = 0;
      for (const part of input.parts) {
        const partDnaId = generatePartDnaId();
        try {
          await db.insert(partsMaster).values({
            ...part,
            partDnaId,
            status: "active",
            createdBy: ctx.user.id,
            lastUpdatedBy: ctx.user.id,
          });
          created++;
        } catch {}
      }

      await writeAudit(db, ctx.user.id, "part.bulk_import", "bulk", `${created} parts imported`);
      return { success: true, created };
    }),

  marginRules: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const { marginRules } = await import("../../drizzle/schema");
    return db.select().from(marginRules).orderBy(marginRules.id);
  }),
});