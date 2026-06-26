import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { blogPosts } from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";

export const blogRouter = router({
  // Public: list published posts
  list: publicProcedure
    .input(z.object({
      category: z.string().optional(),
      brandSlug: z.string().optional(),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const conditions = [eq(blogPosts.status, "published")];
      if (input.category) conditions.push(eq(blogPosts.category, input.category));
      if (input.brandSlug) conditions.push(eq(blogPosts.brandSlug, input.brandSlug));
      return db
        .select({
          id: blogPosts.id,
          slug: blogPosts.slug,
          title: blogPosts.title,
          excerpt: blogPosts.excerpt,
          category: blogPosts.category,
          tags: blogPosts.tags,
          brandSlug: blogPosts.brandSlug,
          brandName: blogPosts.brandName,
          authorName: blogPosts.authorName,
          readTimeMinutes: blogPosts.readTimeMinutes,
          publishedAt: blogPosts.publishedAt,
          createdAt: blogPosts.createdAt,
        })
        .from(blogPosts)
        .where(and(...conditions))
        .orderBy(desc(blogPosts.publishedAt))
        .limit(input.limit);
    }),

  // Public: get single post by slug
  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const rows = await db
        .select()
        .from(blogPosts)
        .where(and(eq(blogPosts.slug, input.slug), eq(blogPosts.status, "published")))
        .limit(1);
      return rows[0] ?? null;
    }),

  // Admin: list all posts (including drafts)
  adminList: protectedProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      return db
        .select()
        .from(blogPosts)
        .orderBy(desc(blogPosts.updatedAt));
    }),

  // Admin: get single post by id (for editing)
  adminGet: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const rows = await db.select().from(blogPosts).where(eq(blogPosts.id, input.id)).limit(1);
      return rows[0] ?? null;
    }),

  // Admin: create post
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(500),
      slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
      excerpt: z.string().optional(),
      content: z.string().min(1),
      category: z.string().optional(),
      tags: z.string().optional(),
      brandSlug: z.string().optional(),
      brandName: z.string().optional(),
      authorName: z.string().optional(),
      readTimeMinutes: z.number().min(1).max(60).optional(),
      status: z.enum(["draft", "published"]).default("draft"),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const publishedAt = input.status === "published" ? new Date() : null;
      await db.insert(blogPosts).values({
        ...input,
        publishedAt: publishedAt ?? undefined,
        createdBy: ctx.user.id,
      });
      return { success: true };
    }),

  // Admin: update post
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().min(1).max(500).optional(),
      slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/).optional(),
      excerpt: z.string().optional(),
      content: z.string().min(1).optional(),
      category: z.string().optional(),
      tags: z.string().optional(),
      brandSlug: z.string().optional(),
      brandName: z.string().optional(),
      authorName: z.string().optional(),
      readTimeMinutes: z.number().min(1).max(60).optional(),
      status: z.enum(["draft", "published"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const { id, status, ...rest } = input;
      const updateData: any = { ...rest };
      if (status) {
        updateData.status = status;
        if (status === "published") {
          const existing = await db.select({ publishedAt: blogPosts.publishedAt }).from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
          if (!existing[0]?.publishedAt) {
            updateData.publishedAt = new Date();
          }
        }
      }
      await db.update(blogPosts).set(updateData).where(eq(blogPosts.id, id));
      return { success: true };
    }),

  // Admin: delete post
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.delete(blogPosts).where(eq(blogPosts.id, input.id));
      return { success: true };
    }),
});
