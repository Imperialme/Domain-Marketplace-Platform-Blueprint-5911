/**
 * Procure.parts — Quotation Export Service
 * Generates PDF and Excel (XLSX) exports of buyer-facing quotations.
 * Costs and margins are NEVER included in buyer exports.
 */
import PDFDocument from "pdfkit";
import * as XLSX from "xlsx";

const BRAND = "PROCURE.PARTS";
const BRAND_COLOR_HEX = "#2563eb";
const DARK_BG = "#0a121e";
const HEADER_COLOR = "#1e3a5f";
const TEXT_LIGHT = "#94a3b8";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface QuotationExportData {
  quotationId: number;
  rfqReference: string;
  companyName: string;
  companyId: string;
  currency: string;
  issuedAt: Date | null;
  validityDays: number;
  leadTimeDays: number | null;
  finalPriceOem: string | null;
  finalPriceAm: string | null;
  lineItems: Array<{
    lineNo: number;
    partNumber: string;
    description?: string;
    qty: number;
    oemSellUSD?: number;
    amSellUSD?: number;
    leadTimeDays?: number;
    condition?: string;
  }>;
}

// ─── PDF Export ───────────────────────────────────────────────────────────────

export async function generateQuotationPDF(data: QuotationExportData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageWidth = doc.page.width - 100; // margins

    // ── Header ──
    doc.rect(0, 0, doc.page.width, 80).fill("#0a121e");
    doc.fontSize(20).fillColor("#ffffff").font("Helvetica-Bold")
      .text("PROCURE", 50, 28, { continued: true })
      .fillColor("#2563eb").text(".PARTS");
    doc.fontSize(9).fillColor("#64748b").font("Helvetica")
      .text("Imperial MEA General Trading LLC", 50, 55);

    // ── Title block ──
    doc.moveDown(2);
    doc.fontSize(16).fillColor("#1e293b").font("Helvetica-Bold")
      .text("COMMERCIAL QUOTATION", 50, 100);
    doc.fontSize(9).fillColor("#64748b").font("Helvetica")
      .text(`Quotation #Q-${data.quotationId.toString().padStart(4, "0")}`, 50, 122);

    // ── Info table ──
    const infoY = 150;
    const col1 = 50, col2 = 200, col3 = 350, col4 = 500;

    doc.rect(50, infoY, pageWidth, 90).fill("#f8fafc").stroke("#e2e8f0");

    const drawInfoCell = (label: string, value: string, x: number, y: number) => {
      doc.fontSize(8).fillColor("#64748b").font("Helvetica").text(label, x + 8, y + 8);
      doc.fontSize(10).fillColor("#1e293b").font("Helvetica-Bold").text(value, x + 8, y + 22, { width: 140 });
    };

    drawInfoCell("BUYER COMPANY", data.companyName, col1, infoY);
    drawInfoCell("COMPANY ID", data.companyId, col2, infoY);
    drawInfoCell("RFQ REFERENCE", data.rfqReference, col3, infoY);
    drawInfoCell("CURRENCY", data.currency, col4, infoY);

    const row2Y = infoY + 45;
    drawInfoCell("ISSUE DATE", data.issuedAt ? data.issuedAt.toLocaleDateString("en-GB") : new Date().toLocaleDateString("en-GB"), col1, row2Y);
    drawInfoCell("VALID FOR", `${data.validityDays} days`, col2, row2Y);
    drawInfoCell("LEAD TIME", data.leadTimeDays ? `${data.leadTimeDays} days` : "TBC", col3, row2Y);
    drawInfoCell("INCOTERMS", "EXW / As Agreed", col4, row2Y);

    // ── Line Items Table ──
    const tableTop = infoY + 110;
    const colWidths = [30, 100, 200, 40, 80, 80];
    const colHeaders = ["#", "Part Number", "Description", "Qty", "OEM Price", "AM Price"];
    const colX = [50, 80, 180, 380, 420, 500];

    // Header row
    doc.rect(50, tableTop, pageWidth, 20).fill("#1e3a5f");
    colHeaders.forEach((h, i) => {
      doc.fontSize(8).fillColor("#ffffff").font("Helvetica-Bold")
        .text(h, colX[i], tableTop + 6, { width: colWidths[i] });
    });

    // Data rows
    let rowY = tableTop + 20;
    const items = data.lineItems.length > 0 ? data.lineItems : [
      { lineNo: 1, partNumber: "—", description: "As per RFQ", qty: 1, oemSellUSD: undefined, amSellUSD: undefined }
    ];

    items.forEach((item, idx) => {
      const bg = idx % 2 === 0 ? "#f8fafc" : "#ffffff";
      doc.rect(50, rowY, pageWidth, 18).fill(bg).stroke("#e2e8f0");

      const cells = [
        String(item.lineNo),
        item.partNumber,
        item.description || "—",
        String(item.qty),
        item.oemSellUSD ? `${data.currency} ${(item.oemSellUSD * item.qty).toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "—",
        item.amSellUSD ? `${data.currency} ${(item.amSellUSD * item.qty).toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "—",
      ];

      cells.forEach((cell, i) => {
        doc.fontSize(8).fillColor("#1e293b").font("Helvetica")
          .text(cell, colX[i] + 2, rowY + 5, { width: colWidths[i] - 4 });
      });

      rowY += 18;
    });

    // Totals row
    doc.rect(50, rowY, pageWidth, 22).fill("#0f172a");
    doc.fontSize(9).fillColor("#ffffff").font("Helvetica-Bold")
      .text("TOTAL", col1, rowY + 6);
    if (data.finalPriceOem) {
      doc.text(`OEM: ${data.currency} ${Number(data.finalPriceOem).toLocaleString("en-US", { minimumFractionDigits: 2 })}`, colX[4], rowY + 6, { width: 80 });
    }
    if (data.finalPriceAm) {
      doc.text(`AM: ${data.currency} ${Number(data.finalPriceAm).toLocaleString("en-US", { minimumFractionDigits: 2 })}`, colX[5], rowY + 6, { width: 80 });
    }

    rowY += 40;

    // ── Terms ──
    doc.fontSize(8).fillColor("#64748b").font("Helvetica")
      .text("TERMS & CONDITIONS", 50, rowY, { underline: true });
    rowY += 14;
    const terms = [
      "1. This quotation is valid for the period stated above from the date of issue.",
      "2. Prices are in the stated currency and exclude applicable taxes and duties.",
      "3. Lead times are estimates and subject to supplier availability at time of order.",
      "4. Aftermarket (AM) parts are quality-verified equivalents. OEM parts are genuine manufacturer parts.",
      "5. Payment terms and delivery conditions to be agreed upon order confirmation.",
    ];
    terms.forEach(t => {
      doc.fontSize(7.5).fillColor("#475569").text(t, 50, rowY, { width: pageWidth });
      rowY += 12;
    });

    // ── Footer ──
    doc.rect(0, doc.page.height - 40, doc.page.width, 40).fill("#0a121e");
    doc.fontSize(8).fillColor("#475569").font("Helvetica")
      .text("Procure.parts | Imperial MEA General Trading LLC | procurement@procure.parts", 50, doc.page.height - 26, {
        width: pageWidth,
        align: "center",
      });

    doc.end();
  });
}

// ─── Excel Export ─────────────────────────────────────────────────────────────

export function generateQuotationExcel(data: QuotationExportData): Buffer {
  const wb = XLSX.utils.book_new();

  // ── Summary sheet ──
  const summaryData = [
    ["PROCURE.PARTS — COMMERCIAL QUOTATION"],
    [],
    ["Quotation #", `Q-${data.quotationId.toString().padStart(4, "0")}`],
    ["Buyer Company", data.companyName],
    ["Company ID", data.companyId],
    ["RFQ Reference", data.rfqReference],
    ["Currency", data.currency],
    ["Issue Date", data.issuedAt ? data.issuedAt.toLocaleDateString("en-GB") : new Date().toLocaleDateString("en-GB")],
    ["Valid For (Days)", data.validityDays],
    ["Lead Time (Days)", data.leadTimeDays ?? "TBC"],
    ["Incoterms", "EXW / As Agreed"],
    [],
    ["OEM Total", data.finalPriceOem ? Number(data.finalPriceOem) : "—"],
    ["Aftermarket Total", data.finalPriceAm ? Number(data.finalPriceAm) : "—"],
  ];

  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  summaryWs["!cols"] = [{ wch: 22 }, { wch: 35 }];
  XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

  // ── Line Items sheet ──
  const lineHeaders = ["Line #", "Part Number", "Description", "Qty", "Condition", `OEM Unit Price (${data.currency})`, `OEM Total (${data.currency})`, `AM Unit Price (${data.currency})`, `AM Total (${data.currency})`, "Lead Time (Days)"];
  const lineRows = data.lineItems.map(item => [
    item.lineNo,
    item.partNumber,
    item.description || "",
    item.qty,
    item.condition || "both",
    item.oemSellUSD ?? "",
    item.oemSellUSD ? item.oemSellUSD * item.qty : "",
    item.amSellUSD ?? "",
    item.amSellUSD ? item.amSellUSD * item.qty : "",
    item.leadTimeDays ?? "",
  ]);

  const lineWs = XLSX.utils.aoa_to_sheet([lineHeaders, ...lineRows]);
  lineWs["!cols"] = [
    { wch: 8 }, { wch: 20 }, { wch: 30 }, { wch: 8 }, { wch: 14 },
    { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 16 },
  ];
  XLSX.utils.book_append_sheet(wb, lineWs, "Line Items");

  // ── Terms sheet ──
  const termsData = [
    ["TERMS & CONDITIONS"],
    [],
    ["1.", "This quotation is valid for the period stated in the Summary sheet from the date of issue."],
    ["2.", "Prices are in the stated currency and exclude applicable taxes and duties."],
    ["3.", "Lead times are estimates and subject to supplier availability at time of order."],
    ["4.", "Aftermarket (AM) parts are quality-verified equivalents. OEM parts are genuine manufacturer parts."],
    ["5.", "Payment terms and delivery conditions to be agreed upon order confirmation."],
    [],
    ["Issued by", "Procure.parts | Imperial MEA General Trading LLC"],
    ["Contact", "procurement@procure.parts"],
  ];
  const termsWs = XLSX.utils.aoa_to_sheet(termsData);
  termsWs["!cols"] = [{ wch: 5 }, { wch: 80 }];
  XLSX.utils.book_append_sheet(wb, termsWs, "Terms");

  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}
