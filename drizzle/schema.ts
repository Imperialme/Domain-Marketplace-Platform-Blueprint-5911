import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  json,
  float,
} from "drizzle-orm/mysql-core";

// ─── USERS (core auth table) ─────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["super_admin", "admin", "buyer", "vendor", "user"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── COMPANIES (buyer onboarding) ────────────────────────────────────────────
export const companies = mysqlTable("companies", {
  id: int("id").autoincrement().primaryKey(),
  companyId: varchar("companyId", { length: 32 }).notNull().unique(), // CID-AE-001
  userId: int("userId").references(() => users.id),
  legalName: varchar("legalName", { length: 255 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  operatingRegions: text("operatingRegions"),
  industry: varchar("industry", { length: 255 }).notNull(),
  website: varchar("website", { length: 255 }),
  businessEmail: varchar("businessEmail", { length: 320 }).notNull(),
  contactPhone: varchar("contactPhone", { length: 50 }),
  applicantRole: varchar("applicantRole", { length: 100 }).notNull(),
  teamSize: varchar("teamSize", { length: 50 }),
  avgOrderValue: varchar("avgOrderValue", { length: 50 }),
  annualVolume: varchar("annualVolume", { length: 50 }),
  pastPurchaseExamples: text("pastPurchaseExamples"),
  sourcingRegions: text("sourcingRegions"),
  procurementFrequency: mysqlEnum("procurementFrequency", ["monthly", "quarterly", "project_based"]).notNull(),
  reasonForApplying: text("reasonForApplying"),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "suspended"]).default("pending").notNull(),
  riskFlag: mysqlEnum("riskFlag", ["green", "yellow", "red"]).default("yellow"),
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  approvedAt: timestamp("approvedAt"),
  approvedBy: int("approvedBy").references(() => users.id),
});

export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;

// ─── VENDORS (distributors / dealers / suppliers — invite only) ───────────────
export const vendors = mysqlTable("vendors", {
  id: int("id").autoincrement().primaryKey(),
  vendorId: varchar("vendorId", { length: 32 }).notNull().unique(), // SID-DE-450
  userId: int("userId").references(() => users.id),
  internalAlias: varchar("internalAlias", { length: 255 }).notNull(),
  vendorType: mysqlEnum("vendorType", ["distributor", "dealer", "supplier"]).notNull(),
  industryFocus: text("industryFocus"),
  region: varchar("region", { length: 100 }),
  status: mysqlEnum("status", ["active", "suspended", "pending"]).default("pending").notNull(),
  accuracyScore: float("accuracyScore").default(0),
  fulfilmentRate: float("fulfilmentRate").default(0),
  leadTimeAccuracy: float("leadTimeAccuracy").default(0),
  pricingStability: float("pricingStability").default(0),
  lastSuccessfulOrderDate: timestamp("lastSuccessfulOrderDate"),
  internalNotes: text("internalNotes"),
  inviteToken: varchar("inviteToken", { length: 128 }),
  inviteEmail: varchar("inviteEmail", { length: 255 }),
  inviteTokenExpiresAt: timestamp("inviteTokenExpiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  invitedBy: int("invitedBy").references(() => users.id),
});

export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = typeof vendors.$inferInsert;

// ─── PARTS MASTER ─────────────────────────────────────────────────────────────
export const partsMaster = mysqlTable("parts_master", {
  id: int("id").autoincrement().primaryKey(),
  partDnaId: varchar("partDnaId", { length: 32 }).notNull().unique(), // DNA-000001
  brand: varchar("brand", { length: 100 }),
  oemPartNumber: varchar("oemPartNumber", { length: 100 }).notNull(),
  alternateNumbers: text("alternateNumbers"),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  subcategory: varchar("subcategory", { length: 100 }),
  compatibility: text("compatibility"),
  countryOfOrigin: varchar("countryOfOrigin", { length: 100 }),
  hsCode: varchar("hsCode", { length: 20 }),
  uom: varchar("uom", { length: 20 }),
  weightDimensions: text("weightDimensions"),
  status: mysqlEnum("status", ["active", "dormant", "obsolete"]).default("active").notNull(),
  quoteFrequencyCount: int("quoteFrequencyCount").default(0),
  firstSeenDate: timestamp("firstSeenDate").defaultNow(),
  lastUpdatedDate: timestamp("lastUpdatedDate").defaultNow().onUpdateNow(),
  createdBy: int("createdBy").references(() => users.id),
  lastUpdatedBy: int("lastUpdatedBy").references(() => users.id),
});

export type PartsMaster = typeof partsMaster.$inferSelect;
export type InsertPartsMaster = typeof partsMaster.$inferInsert;

// ─── PARTS INTELLIGENCE ───────────────────────────────────────────────────────
export const partsIntelligence = mysqlTable("parts_intelligence", {
  id: int("id").autoincrement().primaryKey(),
  partId: int("partId").notNull().references(() => partsMaster.id),
  lowestAmPriceEver: decimal("lowestAmPriceEver", { precision: 12, scale: 2 }),
  highestAmPriceEver: decimal("highestAmPriceEver", { precision: 12, scale: 2 }),
  lowestOemPriceEver: decimal("lowestOemPriceEver", { precision: 12, scale: 2 }),
  highestOemPriceEver: decimal("highestOemPriceEver", { precision: 12, scale: 2 }),
  activeSupplierCount: int("activeSupplierCount").default(0),
  medianAmPrice: decimal("medianAmPrice", { precision: 12, scale: 2 }),
  medianOemPrice: decimal("medianOemPrice", { precision: 12, scale: 2 }),
  priceVolatilityIndex: float("priceVolatilityIndex").default(0),
  freshnessScore: float("freshnessScore").default(0),
  marketConfidenceLevel: mysqlEnum("marketConfidenceLevel", ["low", "medium", "high"]).default("low"),
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow(),
});

export type PartsIntelligence = typeof partsIntelligence.$inferSelect;

// ─── PARTS SUPPLIER LINKS ─────────────────────────────────────────────────────
export const partsSupplierLinks = mysqlTable("parts_supplier_links", {
  id: int("id").autoincrement().primaryKey(),
  partId: int("partId").notNull().references(() => partsMaster.id),
  vendorId: int("vendorId").notNull().references(() => vendors.id),
  priceValidityStart: timestamp("priceValidityStart"),
  priceValidityEnd: timestamp("priceValidityEnd"),
  isExpired: boolean("isExpired").default(false),
  lastQuotedPrice: decimal("lastQuotedPrice", { precision: 12, scale: 2 }),
  lastQuotedDate: timestamp("lastQuotedDate"),
});

// ─── PARTS QUOTE HISTORY ──────────────────────────────────────────────────────
export const partsQuoteHistory = mysqlTable("parts_quote_history", {
  id: int("id").autoincrement().primaryKey(),
  partId: int("partId").notNull().references(() => partsMaster.id),
  rfqId: int("rfqId"),
  quotedToCompanyId: int("quotedToCompanyId").references(() => companies.id),
  amSellPrice: decimal("amSellPrice", { precision: 12, scale: 2 }),
  oemSellPrice: decimal("oemSellPrice", { precision: 12, scale: 2 }),
  outcome: mysqlEnum("outcome", ["accepted", "declined", "no_response"]),
  buyerFeedbackSource: mysqlEnum("buyerFeedbackSource", ["system", "manual"]),
  buyerFeedbackText: text("buyerFeedbackText"),
  feedbackReceivedAt: timestamp("feedbackReceivedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── VENDOR PRICES ────────────────────────────────────────────────────────────
export const vendorPrices = mysqlTable("vendor_prices", {
  id: int("id").autoincrement().primaryKey(),
  partId: int("partId").notNull().references(() => partsMaster.id),
  vendorId: int("vendorId").notNull().references(() => vendors.id),
  currency: varchar("currency", { length: 10 }).default("USD"),
  unitPrice: decimal("unitPrice", { precision: 12, scale: 2 }).notNull(),
  condition: mysqlEnum("condition", ["oem", "aftermarket"]).notNull(),
  moq: int("moq").default(1),
  availableQty: int("availableQty"),
  leadTimeDays: int("leadTimeDays"),
  stockStatus: mysqlEnum("stockStatus", ["in_stock", "on_order", "unavailable"]).default("in_stock"),
  region: varchar("region", { length: 100 }),
  validityStart: timestamp("validityStart"),
  validityEnd: timestamp("validityEnd"),
  approvalStatus: mysqlEnum("approvalStatus", ["pending", "approved", "rejected"]).default("pending").notNull(),
  approvedBy: int("approvedBy").references(() => users.id),
  approvedAt: timestamp("approvedAt"),
});

export type VendorPrice = typeof vendorPrices.$inferSelect;
export type InsertVendorPrice = typeof vendorPrices.$inferInsert;

// ─── RFQs ─────────────────────────────────────────────────────────────────────
export const rfqs = mysqlTable("rfqs", {
  id: int("id").autoincrement().primaryKey(),
  referenceNumber: varchar("referenceNumber", { length: 20 }).notNull().unique(), // RFQ-26-0001
  companyId: int("companyId").notNull().references(() => companies.id),
  itemListFileUrl: text("itemListFileUrl"),
  itemListFileName: varchar("itemListFileName", { length: 255 }),
  subject: varchar("subject", { length: 255 }),
  description: text("description"),
  equipmentType: varchar("equipmentType", { length: 255 }),
  fleetSize: varchar("fleetSize", { length: 100 }),
  additionalNotes: text("additionalNotes"),
  estimatedValueTier: mysqlEnum("estimatedValueTier", ["5k_20k", "20k_100k", "100k_plus"]).notNull(),
  timelineTier: mysqlEnum("timelineTier", ["0_14_days", "15_30_days", "budgeting"]).notNull(),
  priority: mysqlEnum("priority", ["standard", "priority"]).default("standard").notNull(),
  status: mysqlEnum("status", [
    "submitted",
    "reviewing",
    "fee_requested",
    "fee_paid",
    "sourcing",
    "quoted",
    "closed",
  ]).default("submitted").notNull(),
  outcomeCode: mysqlEnum("outcomeCode", [
    "quotation_issued",
    "not_commercially_viable",
    "cannot_identify",
    "not_sourceable",
  ]),
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  closedAt: timestamp("closedAt"),
  closedBy: int("closedBy").references(() => users.id),
});

export type Rfq = typeof rfqs.$inferSelect;
export type InsertRfq = typeof rfqs.$inferInsert;

// ─── ENGAGEMENT FEES ──────────────────────────────────────────────────────────
export const engagementFees = mysqlTable("engagement_fees", {
  id: int("id").autoincrement().primaryKey(),
  rfqId: int("rfqId").notNull().references(() => rfqs.id),
  feeAmount: decimal("feeAmount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("USD"),
  status: mysqlEnum("status", ["requested", "paid", "adjusted", "waived"]).default("requested").notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["stripe", "paypal"]),
  paymentReference: varchar("paymentReference", { length: 255 }),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  paypalOrderId: varchar("paypalOrderId", { length: 255 }),
  adjustedAmount: decimal("adjustedAmount", { precision: 10, scale: 2 }),
  waivedBy: int("waivedBy").references(() => users.id),
  waivedReason: text("waivedReason"),
  paidAt: timestamp("paidAt"),
  adjustedAt: timestamp("adjustedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EngagementFee = typeof engagementFees.$inferSelect;
export type InsertEngagementFee = typeof engagementFees.$inferInsert;

// ─── QUOTATIONS ───────────────────────────────────────────────────────────────
export const quotations = mysqlTable("quotations", {
  id: int("id").autoincrement().primaryKey(),
  rfqId: int("rfqId").notNull().references(() => rfqs.id),
  marginMode: mysqlEnum("marginMode", ["fixed", "custom"]).default("fixed").notNull(),
  supplierCostAm: decimal("supplierCostAm", { precision: 12, scale: 2 }),
  supplierCostOem: decimal("supplierCostOem", { precision: 12, scale: 2 }),
  logisticsCost: decimal("logisticsCost", { precision: 12, scale: 2 }),
  marginPctAm: decimal("marginPctAm", { precision: 6, scale: 2 }),
  marginPctOem: decimal("marginPctOem", { precision: 6, scale: 2 }),
  finalBuyerPriceAm: decimal("finalBuyerPriceAm", { precision: 12, scale: 2 }),
  finalBuyerPriceOem: decimal("finalBuyerPriceOem", { precision: 12, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default("USD"),
  leadTimeDays: int("leadTimeDays"),
  validityDays: int("validityDays").default(30),
  comparisonTableJson: json("comparisonTableJson"), // mandatory OEM vs AM table
  lineItemsJson: json("lineItemsJson"), // per-line P&L data
  status: mysqlEnum("status", ["draft", "issued", "accepted", "declined"]).default("draft").notNull(),
  issuedAt: timestamp("issuedAt"),
  acceptedAt: timestamp("acceptedAt"),
  createdBy: int("createdBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Quotation = typeof quotations.$inferSelect;
export type InsertQuotation = typeof quotations.$inferInsert;

// ─── MARGIN RULES ─────────────────────────────────────────────────────────────
export const marginRules = mysqlTable("margin_rules", {
  id: int("id").autoincrement().primaryKey(),
  ruleName: varchar("ruleName", { length: 100 }).notNull(),
  conditionMinPct: decimal("conditionMinPct", { precision: 8, scale: 2 }),
  conditionMaxPct: decimal("conditionMaxPct", { precision: 8, scale: 2 }),
  marginPct: decimal("marginPct", { precision: 8, scale: 2 }).notNull(),
  ruleType: mysqlEnum("ruleType", ["oem", "am_tier", "am_cap"]).notNull(),
  isActive: boolean("isActive").default(true),
  lastUpdatedBy: int("lastUpdatedBy").references(() => users.id),
  lastUpdatedAt: timestamp("lastUpdatedAt").defaultNow().onUpdateNow(),
});

export type MarginRule = typeof marginRules.$inferSelect;

// ─── BUYER FEEDBACK ───────────────────────────────────────────────────────────
export const buyerFeedback = mysqlTable("buyer_feedback", {
  id: int("id").autoincrement().primaryKey(),
  rfqId: int("rfqId").notNull().references(() => rfqs.id),
  companyId: int("companyId").notNull().references(() => companies.id),
  quotationId: int("quotationId").references(() => quotations.id),
  source: mysqlEnum("source", ["system_triggered", "admin_manual"]).default("system_triggered"),
  priceFeedback: mysqlEnum("priceFeedback", ["too_high", "acceptable", "low"]),
  leadTimeFeedback: mysqlEnum("leadTimeFeedback", ["too_long", "acceptable", "fast"]),
  overallRating: int("overallRating"), // 1-5
  comments: text("comments"),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
});

// ─── AUDIT LOG ────────────────────────────────────────────────────────────────
export const auditLog = mysqlTable("audit_log", {
  id: int("id").autoincrement().primaryKey(),
  actorId: int("actorId").references(() => users.id),
  actorRole: varchar("actorRole", { length: 32 }),
  actionType: varchar("actionType", { length: 100 }).notNull(),
  entityType: mysqlEnum("entityType", [
    "rfq",
    "company",
    "vendor",
    "quotation",
    "fee",
    "part",
    "margin_rule",
    "user",
    "ai_query",
  ]).notNull(),
  entityId: varchar("entityId", { length: 64 }),
  beforeStateJson: json("beforeStateJson"),
  afterStateJson: json("afterStateJson"),
  notes: text("notes"),
  errorDetails: text("errorDetails"),
  isError: boolean("isError").default(false),
  patternTags: text("patternTags"), // comma-separated tags for self-improving system
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type AuditLog = typeof auditLog.$inferSelect;
export type InsertAuditLog = typeof auditLog.$inferInsert;

// ─── DESK MESSAGES ────────────────────────────────────────────────────────────
export const deskMessages = mysqlTable("desk_messages", {
  id: int("id").autoincrement().primaryKey(),
  entityType: mysqlEnum("entityType", ["rfq", "company", "vendor", "quotation", "fee", "general"]).notNull(),
  entityId: varchar("entityId", { length: 64 }),
  contextTag: mysqlEnum("contextTag", ["COMPLIANCE", "RFQ", "GENERAL", "PAYMENT", "QUOTATION"]).notNull(),
  fromUserId: int("fromUserId").references(() => users.id),
  toUserId: int("toUserId").references(() => users.id),
  subject: varchar("subject", { length: 255 }),
  body: text("body").notNull(),
  isRead: boolean("isRead").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── CMS CONTENT ──────────────────────────────────────────────────────────────
export const cmsContent = mysqlTable("cms_content", {
  id: int("id").autoincrement().primaryKey(),
  pageKey: varchar("pageKey", { length: 50 }).notNull(), // HOME, ABOUT, HOW_IT_WORKS, WHO_ITS_FOR
  sectionKey: varchar("sectionKey", { length: 100 }).notNull(),
  content: text("content").notNull(),
  lastUpdatedBy: int("lastUpdatedBy").references(() => users.id),
  lastUpdatedAt: timestamp("lastUpdatedAt").defaultNow().onUpdateNow(),
});

// ─── AI INTELLIGENCE LOG ──────────────────────────────────────────────────────
export const aiIntelligenceLog = mysqlTable("ai_intelligence_log", {
  id: int("id").autoincrement().primaryKey(),
  rfqId: int("rfqId").references(() => rfqs.id),
  requestedBy: int("requestedBy").references(() => users.id),
  prompt: text("prompt").notNull(),
  response: text("response"),
  model: varchar("model", { length: 100 }),
  tokensUsed: int("tokensUsed"),
  actionTaken: text("actionTaken"),
  status: mysqlEnum("status", ["pending", "completed", "failed"]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── BLOG POSTS ───────────────────────────────────────────────────────────────
export const blogPosts = mysqlTable("blog_posts", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 500 }).notNull(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  category: varchar("category", { length: 100 }),
  tags: text("tags"), // comma-separated
  brandSlug: varchar("brandSlug", { length: 100 }), // links to /brands/[slug]
  brandName: varchar("brandName", { length: 255 }),
  authorName: varchar("authorName", { length: 255 }).default("Procure.parts Editorial"),
  readTimeMinutes: int("readTimeMinutes").default(5),
  status: mysqlEnum("status", ["draft", "published"]).default("draft"),
  publishedAt: timestamp("publishedAt"),
  createdBy: int("createdBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});
