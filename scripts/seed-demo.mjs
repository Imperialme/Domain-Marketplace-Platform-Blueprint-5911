/**
 * Demo seed script — inserts demo buyer company, vendor record, RFQs, quotations
 * for the admin user so both portals show populated data.
 *
 * Run: node scripts/seed-demo.mjs
 */
import mysql from "mysql2/promise";

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) throw new Error("DATABASE_URL not set");

const conn = await mysql.createConnection(DB_URL);

// ── 1. Get the admin user id ──────────────────────────────────────────────────
const [[adminUser]] = await conn.execute(
  "SELECT id, openId FROM users WHERE role = 'admin' LIMIT 1"
);
if (!adminUser) throw new Error("No admin user found — log in first");
const adminId = adminUser.id;
console.log(`Admin user id: ${adminId}`);

// ── 2. Upsert demo buyer company ──────────────────────────────────────────────
const [existingCompany] = await conn.execute(
  "SELECT id FROM companies WHERE companyId = 'CID-AE-DEMO' LIMIT 1"
);
if (existingCompany.length === 0) {
  await conn.execute(
    `INSERT INTO companies
      (companyId, userId, legalName, country, operatingRegions, industry,
       website, businessEmail, contactPhone, applicantRole, teamSize,
       avgOrderValue, annualVolume, procurementFrequency, reasonForApplying,
       status, riskFlag, adminNotes, approvedAt, approvedBy)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),?)`,
    [
      "CID-AE-DEMO",
      adminId,
      "Demo Buyer Co. LLC",
      "United Arab Emirates",
      "Middle East, Africa",
      "Construction & Mining",
      "https://demo.procure.parts",
      "buyer@demo.procure.parts",
      "+971 50 000 0000",
      "Procurement Manager",
      "11-50",
      "$50,000–$200,000",
      "$500,000+",
      "monthly",
      "Demo account for platform testing",
      "approved",
      "green",
      "Auto-seeded demo account",
      adminId,
    ]
  );
  console.log("✓ Demo buyer company created");
} else {
  // Make sure it's approved
  await conn.execute(
    "UPDATE companies SET status='approved', approvedAt=NOW(), approvedBy=? WHERE companyId='CID-AE-DEMO'",
    [adminId]
  );
  console.log("Demo buyer company already exists — ensured approved status");
}

const [[company]] = await conn.execute(
  "SELECT id FROM companies WHERE companyId = 'CID-AE-DEMO' LIMIT 1"
);
const companyId = company.id;

// ── 3. Upsert demo vendor record ──────────────────────────────────────────────
const [existingVendor] = await conn.execute(
  "SELECT id FROM vendors WHERE vendorId = 'SID-AE-DEMO' LIMIT 1"
);
if (existingVendor.length === 0) {
  await conn.execute(
    `INSERT INTO vendors
      (vendorId, userId, internalAlias, vendorType, industryFocus, region, status,
       accuracyScore, fulfilmentRate, leadTimeAccuracy, pricingStability)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [
      "SID-AE-DEMO",
      adminId,
      "Demo Supplier LLC",
      "distributor",
      "Construction & Mining, Oil & Gas",
      "Middle East",
      "active",
      94.5,
      97.2,
      91.0,
      88.5,
    ]
  );
  console.log("✓ Demo vendor record created");
} else {
  await conn.execute(
    "UPDATE vendors SET status='active' WHERE vendorId='SID-AE-DEMO'"
  );
  console.log("Demo vendor record already exists — ensured active status");
}

const [[vendor]] = await conn.execute(
  "SELECT id FROM vendors WHERE vendorId = 'SID-AE-DEMO' LIMIT 1"
);
const vendorId = vendor.id;

// ── 4. Seed demo RFQs (matching actual schema) ────────────────────────────────
// Schema: referenceNumber, companyId, estimatedValueTier, timelineTier, priority, status
const rfqSeeds = [
  { ref: "RFQ-DEMO-001", tier: "5k_20k",   timeline: "0_14_days",  priority: "priority", status: "quoted" },
  { ref: "RFQ-DEMO-002", tier: "20k_100k", timeline: "15_30_days", priority: "priority", status: "sourcing" },
  { ref: "RFQ-DEMO-003", tier: "20k_100k", timeline: "15_30_days", priority: "standard", status: "fee_requested" },
  { ref: "RFQ-DEMO-004", tier: "5k_20k",   timeline: "0_14_days",  priority: "standard", status: "closed" },
  { ref: "RFQ-DEMO-005", tier: "5k_20k",   timeline: "budgeting",  priority: "standard", status: "submitted" },
];

for (const rfq of rfqSeeds) {
  const [existing] = await conn.execute(
    "SELECT id FROM rfqs WHERE referenceNumber = ? LIMIT 1",
    [rfq.ref]
  );
  if (existing.length === 0) {
    await conn.execute(
      `INSERT INTO rfqs (referenceNumber, companyId, estimatedValueTier, timelineTier, priority, status, createdAt)
       VALUES (?,?,?,?,?,?,NOW())`,
      [rfq.ref, companyId, rfq.tier, rfq.timeline, rfq.priority, rfq.status]
    );
    console.log(`✓ RFQ ${rfq.ref} created`);
  } else {
    console.log(`RFQ ${rfq.ref} already exists`);
  }
}

// ── 5. Seed demo quotation for the "quoted" RFQ ───────────────────────────────
const [[rfqQuoted]] = await conn.execute(
  "SELECT id FROM rfqs WHERE referenceNumber = 'RFQ-DEMO-001' LIMIT 1"
);
if (rfqQuoted) {
  const [existingQuote] = await conn.execute(
    "SELECT id FROM quotations WHERE rfqId = ? LIMIT 1",
    [rfqQuoted.id]
  );
  if (existingQuote.length === 0) {
    const comparisonTable = JSON.stringify({
      oem: { partNumber: "CAT-320D-HP-OEM", description: "CAT 320D Hydraulic Pump (OEM)", unitPrice: 4800, qty: 2, total: 9600 },
      am:  { partNumber: "CAT-320D-HP-AM",  description: "CAT 320D Hydraulic Pump (Aftermarket)", unitPrice: 3200, qty: 2, total: 6400 },
    });
    const lineItems = JSON.stringify([
      { description: "CAT 320D Hydraulic Pump (OEM)", qty: 2, unitPrice: 4800, total: 9600 },
      { description: "Freight & Insurance", qty: 1, unitPrice: 350, total: 350 },
    ]);
    await conn.execute(
      `INSERT INTO quotations
        (rfqId, marginMode, supplierCostOem, logisticsCost, marginPctOem,
         finalBuyerPriceOem, currency, leadTimeDays, validityDays,
         comparisonTableJson, lineItemsJson, status, issuedAt, createdBy, createdAt)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,NOW(),?,NOW())`,
      [
        rfqQuoted.id,
        "fixed",
        9600,   // supplierCostOem
        350,    // logisticsCost
        12.5,   // marginPctOem
        11194,  // finalBuyerPriceOem (9950 * 1.125)
        "USD",
        14,
        30,
        comparisonTable,
        lineItems,
        "issued",
        adminId,
      ]
    );
    console.log("✓ Demo quotation created for RFQ-DEMO-001");
  } else {
    console.log("Demo quotation already exists");
  }
}

// ── 6. Seed demo parts + vendor price submissions ────────────────────────────
const [existingPart] = await conn.execute(
  "SELECT id FROM parts_master WHERE oemPartNumber = 'KOM-PC200-EOK-DEMO' LIMIT 1"
);
let partMasterId;
if (existingPart.length === 0) {
  // Check parts_master schema
  const [cols] = await conn.execute("DESCRIBE parts_master");
  const colNames = cols.map(c => c.Field);
  console.log("parts_master columns:", colNames.join(", "));

  if (colNames.includes("oemPartNumber")) {
    const [partResult] = await conn.execute(
      `INSERT INTO parts_master (partDnaId, oemPartNumber, description, brand, category, status, createdBy)
       VALUES (?,?,?,?,?,?,?)`,
      ["DNA-DEMO-001", "KOM-PC200-EOK-DEMO", "Komatsu PC200 Engine Overhaul Kit", "Komatsu", "Engine Parts", "active", adminId]
    );
    partMasterId = partResult.insertId;
    console.log("✓ Demo part created");
  } else {
    console.log("Skipping part seed — schema mismatch");
  }
} else {
  partMasterId = existingPart[0].id;
  console.log("Demo part already exists");
}

// Seed vendor price if we have a part
if (partMasterId) {
  const [[rfqSourcing]] = await conn.execute(
    "SELECT id FROM rfqs WHERE referenceNumber = 'RFQ-DEMO-002' LIMIT 1"
  );
  if (rfqSourcing) {
    const [existingSub] = await conn.execute(
      "SELECT id FROM vendor_prices WHERE partId = ? AND vendorId = ? LIMIT 1",
      [partMasterId, vendorId]
    );
    if (existingSub.length === 0) {
      await conn.execute(
        `INSERT INTO vendor_prices
          (partId, vendorId, unitPrice, currency, condition, leadTimeDays,
           stockStatus, region, approvalStatus)
         VALUES (?,?,?,?,?,?,?,?,?)`,
        [
          partMasterId,
          vendorId,
          18500,
          "USD",
          "oem",
          21,
          "in_stock",
          "Middle East",
          "pending",
        ]
      );
      console.log("✓ Demo vendor price submission created");
    } else {
      console.log("Demo vendor submission already exists");
    }
  }
}

// ── 7. Seed audit log entries for vendor submissions display ──────────────────
const [existingAuditLogs] = await conn.execute(
  "SELECT COUNT(*) as cnt FROM audit_log WHERE actorId = ? AND actionType = 'vendor.submitQuote'",
  [adminId]
);
if (existingAuditLogs[0].cnt === 0) {
  const submissions = [
    { rfqRef: "RFQ-DEMO-001", part: "CAT 320D Hydraulic Pump", price: 9600, status: "approved", currency: "USD" },
    { rfqRef: "RFQ-DEMO-002", part: "Komatsu PC200 Engine Overhaul Kit", price: 18500, status: "pending", currency: "USD" },
    { rfqRef: "RFQ-DEMO-003", part: "Volvo EC210 Undercarriage Set", price: 28000, status: "pending", currency: "USD" },
  ];
  for (const sub of submissions) {
    await conn.execute(
      `INSERT INTO audit_log (actorId, actorRole, actionType, entityType, entityId, notes, isError, timestamp)
       VALUES (?,?,?,?,?,?,?,NOW())`,
      [
        adminId,
        "vendor",
        "vendor.submitQuote",
        "vendor",
        vendorId.toString(),
        JSON.stringify({ rfqRef: sub.rfqRef, partDescription: sub.part, totalPrice: sub.price, currency: sub.currency, status: sub.status }),
        false,
      ]
    );
  }
  console.log("✓ Demo vendor audit log entries created (3 submissions)");
} else {
  console.log(`Vendor audit log entries already exist (${existingAuditLogs[0].cnt} found)`);
}

await conn.end();
console.log("\n✅ Demo seed complete!");
console.log("   Buyer portal:  Portal → Sign in as Buyer  → /buyer");
console.log("   Vendor portal: Portal → Sign in as Vendor → /vendor");
console.log("   Admin console: Portal → Admin Console     → /admin");
console.log("   All portals use your Manus account (same login).");
