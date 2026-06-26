import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { companiesRouter } from "./routers/companies";
import { rfqsRouter } from "./routers/rfqs";
import { vendorsRouter } from "./routers/vendors";
import { quotationsRouter } from "./routers/quotations";
import { partsRouter } from "./routers/parts";
import { auditRouter } from "./routers/audit";
import { selfAuditRouter } from "./routers/selfAudit";
import { exportsRouter } from "./routers/exports";
import { i18nRouter } from "./routers/i18n";
import { blogRouter } from "./routers/blog";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  companies: companiesRouter,
  rfqs: rfqsRouter,
  vendors: vendorsRouter,
  quotations: quotationsRouter,
  parts: partsRouter,
  audit: auditRouter,
  selfAudit: selfAuditRouter,
  exports: exportsRouter,
  i18n: i18nRouter,
  blog: blogRouter,
});

export type AppRouter = typeof appRouter;
