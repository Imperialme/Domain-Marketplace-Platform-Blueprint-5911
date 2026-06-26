/**
 * Procure.parts — Transactional Email Service
 * Uses Nodemailer with configurable SMTP transport.
 * Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM in environment.
 * Falls back to console logging in dev if SMTP_HOST is not set.
 */
import nodemailer from "nodemailer";

const BRAND = "Procure.parts";
const BRAND_COLOR = "#2563eb";
const SUPPORT_EMAIL = process.env.SMTP_FROM || "noreply@procure.parts";
const PLATFORM_URL = process.env.PLATFORM_URL || "https://procure.parts";

function createTransport() {
  const host = process.env.SMTP_HOST;
  if (!host) {
    return nodemailer.createTransport({ jsonTransport: true });
  }
  return nodemailer.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function baseTemplate(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#0a121e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a121e;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#0f1a2e;border-radius:12px;border:1px solid #1e3a5f;overflow:hidden;max-width:600px;">
        <tr>
          <td style="background:#0a121e;padding:24px 32px;border-bottom:1px solid #1e3a5f;">
            <span style="font-size:18px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
              PROCURE<span style="color:${BRAND_COLOR};">.</span>PARTS
            </span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            ${body}
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #1e3a5f;background:#0a121e;">
            <p style="margin:0;font-size:11px;color:#475569;line-height:1.6;">
              This email was sent by ${BRAND}, operated by Imperial MEA General Trading LLC.<br/>
              If you did not request this, please ignore this email or contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color:${BRAND_COLOR};">${SUPPORT_EMAIL}</a>.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function heading(text: string): string {
  return `<h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#f1f5f9;">${text}</h1>`;
}

function para(text: string): string {
  return `<p style="margin:0 0 16px;font-size:14px;color:#94a3b8;line-height:1.7;">${text}</p>`;
}

function button(label: string, url: string): string {
  return `<a href="${url}" style="display:inline-block;margin:8px 0 20px;padding:12px 28px;background:${BRAND_COLOR};color:#ffffff;font-size:13px;font-weight:600;text-decoration:none;border-radius:8px;">${label}</a>`;
}

function infoRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 12px;font-size:12px;color:#64748b;width:140px;vertical-align:top;">${label}</td>
    <td style="padding:8px 12px;font-size:12px;color:#e2e8f0;font-weight:500;">${value}</td>
  </tr>`;
}

function infoTable(rows: Array<[string, string]>): string {
  return `<table cellpadding="0" cellspacing="0" style="width:100%;background:#0a121e;border-radius:8px;border:1px solid #1e3a5f;margin:16px 0;">
    ${rows.map(([l, v]) => infoRow(l, v)).join("")}
  </table>`;
}

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const transport = createTransport();
  try {
    const info = await transport.sendMail({
      from: `"${BRAND}" <${SUPPORT_EMAIL}>`,
      to,
      subject,
      html,
    });
    if (!process.env.SMTP_HOST) {
      console.log(`[Email DEV] To: ${to} | Subject: ${subject}`);
      console.log("[Email DEV] Body preview:", html.replace(/<[^>]+>/g, "").slice(0, 200));
    } else {
      console.log(`[Email] Sent to ${to}: ${subject} (messageId: ${(info as any).messageId})`);
    }
    return true;
  } catch (err) {
    console.error(`[Email] Failed to send to ${to}:`, err);
    return false;
  }
}

// ─── INTERFACES ───────────────────────────────────────────────────────────────

export interface ApplicationReceivedParams {
  applicantName: string;
  legalName: string;
  companyId: string;
  businessEmail: string;
  country: string;
  industry: string;
}

export interface ApplicationApprovedParams {
  applicantName: string;
  legalName: string;
  companyId: string;
  businessEmail: string;
  portalUrl?: string;
}

export interface ApplicationRejectedParams {
  applicantName: string;
  legalName: string;
  businessEmail: string;
  adminNotes?: string;
}

export interface RfqAcknowledgementParams {
  buyerName: string;
  legalName: string;
  businessEmail: string;
  rfqReference: string;
  partDescription: string;
  quantity: string;
}

export interface NewApplicationAlertParams {
  legalName: string;
  companyId: string;
  country: string;
  industry: string;
  businessEmail: string;
  adminUrl: string;
}

export interface QuotationIssuedParams {
  buyerName: string;
  legalName: string;
  businessEmail: string;
  rfqReference: string;
  quotationId: number;
  currency: string;
  finalPriceOem?: string | null;
  finalPriceAm?: string | null;
  leadTimeDays?: number | null;
  validityDays?: number;
  portalUrl?: string;
}

export interface VendorInviteParams {
  vendorEmail: string;
  internalAlias: string;
  vendorType: string;
  inviteUrl: string;
  expiresInDays?: number;
}

// ─── SEND FUNCTIONS ───────────────────────────────────────────────────────────

export async function sendApplicationReceived(params: ApplicationReceivedParams): Promise<boolean> {
  const body = `
    ${heading("Application Received")}
    ${para(`Dear ${params.applicantName},`)}
    ${para(`Thank you for applying for access to <strong style="color:#f1f5f9;">Procure.parts</strong>. We have received your application for <strong style="color:#f1f5f9;">${params.legalName}</strong> and it is currently under review.`)}
    ${infoTable([
      ["Reference ID", params.companyId],
      ["Company", params.legalName],
      ["Industry", params.industry],
      ["Country", params.country],
    ])}
    ${para("Our team reviews all applications within <strong style=\"color:#f1f5f9;\">1-3 business days</strong>. You will receive a separate email once a decision has been made.")}
    ${para("If you have any questions in the meantime, please reply to this email.")}
    ${para("Regards,<br/>The Procure.parts Team")}
  `;
  return sendEmail(
    params.businessEmail,
    `Application Received — ${params.legalName} [${params.companyId}]`,
    baseTemplate("Application Received", body)
  );
}

export async function sendApplicationApproved(params: ApplicationApprovedParams): Promise<boolean> {
  const portalUrl = params.portalUrl || `${PLATFORM_URL}/buyer`;
  const body = `
    ${heading("Your Application Has Been Approved")}
    ${para(`Dear ${params.applicantName},`)}
    ${para(`We are pleased to inform you that your application for <strong style="color:#f1f5f9;">${params.legalName}</strong> has been <strong style="color:#22c55e;">approved</strong>. You now have access to the Procure.parts Buyer Portal.`)}
    ${infoTable([
      ["Company ID", params.companyId],
      ["Company", params.legalName],
      ["Portal Access", "Buyer Portal"],
    ])}
    ${para("You can now log in and submit your first RFQ. Our team will respond within the agreed SLA.")}
    ${button("Access Buyer Portal", portalUrl)}
    ${para("<strong style=\"color:#f59e0b;\">Important:</strong> Please review the Engagement Fee structure before submitting your first RFQ. Fees are notified in advance and are case-by-case.")}
    ${para("Regards,<br/>The Procure.parts Team")}
  `;
  return sendEmail(
    params.businessEmail,
    `Access Approved — Welcome to Procure.parts [${params.companyId}]`,
    baseTemplate("Application Approved", body)
  );
}

export async function sendApplicationRejected(params: ApplicationRejectedParams): Promise<boolean> {
  const reasonSection = params.adminNotes
    ? infoTable([["Reason", params.adminNotes]])
    : "";
  const body = `
    ${heading("Application Update")}
    ${para(`Dear ${params.applicantName},`)}
    ${para(`Thank you for your interest in Procure.parts. After reviewing your application for <strong style="color:#f1f5f9;">${params.legalName}</strong>, we are unable to approve access at this time.`)}
    ${reasonSection}
    ${para("If you believe this decision was made in error, or if your circumstances have changed, you are welcome to reapply or contact us directly.")}
    ${button("Contact Us", `mailto:${SUPPORT_EMAIL}`)}
    ${para("Regards,<br/>The Procure.parts Team")}
  `;
  return sendEmail(
    params.businessEmail,
    `Application Update — Procure.parts`,
    baseTemplate("Application Update", body)
  );
}

export async function sendRfqAcknowledgement(params: RfqAcknowledgementParams): Promise<boolean> {
  const body = `
    ${heading("RFQ Received")}
    ${para(`Dear ${params.buyerName},`)}
    ${para("Your Request for Quotation has been received and is now being processed by our sourcing team.")}
    ${infoTable([
      ["RFQ Reference", params.rfqReference],
      ["Company", params.legalName],
      ["Part Description", params.partDescription],
      ["Quantity", params.quantity],
      ["Status", "Under Review"],
    ])}
    ${para("You will receive a formal quotation within the agreed SLA. You can track the status of your RFQ in the Buyer Portal.")}
    ${button("View in Portal", `${PLATFORM_URL}/buyer`)}
    ${para("Regards,<br/>The Procure.parts Team")}
  `;
  return sendEmail(
    params.businessEmail,
    `RFQ Received — ${params.rfqReference}`,
    baseTemplate("RFQ Received", body)
  );
}

export async function sendNewApplicationAlert(params: NewApplicationAlertParams): Promise<boolean> {
  const body = `
    ${heading("New Application Received")}
    ${para("A new company has submitted an access application and is awaiting review.")}
    ${infoTable([
      ["Company", params.legalName],
      ["Company ID", params.companyId],
      ["Country", params.country],
      ["Industry", params.industry],
      ["Email", params.businessEmail],
    ])}
    ${button("Review Application", params.adminUrl)}
  `;
  return sendEmail(
    SUPPORT_EMAIL,
    `New Application: ${params.legalName} [${params.companyId}]`,
    baseTemplate("New Application", body)
  );
}

export async function sendQuotationIssued(params: QuotationIssuedParams): Promise<boolean> {
  const portalUrl = params.portalUrl || `${PLATFORM_URL}/buyer/quotations`;
  const rows: [string, string][] = [
    ["RFQ Reference", params.rfqReference],
    ["Company", params.legalName],
    ["Currency", params.currency || "USD"],
  ];
  if (params.finalPriceOem) rows.push(["OEM Price", params.finalPriceOem]);
  if (params.finalPriceAm) rows.push(["Aftermarket Price", params.finalPriceAm]);
  if (params.leadTimeDays) rows.push(["Lead Time", `${params.leadTimeDays} days`]);
  if (params.validityDays) rows.push(["Valid For", `${params.validityDays} days`]);

  const body = `
    ${heading("Your Quotation Is Ready")}
    ${para(`Dear ${params.buyerName},`)}
    ${para(`We are pleased to inform you that a quotation has been prepared for your RFQ <strong style="color:#f1f5f9;">${params.rfqReference}</strong>. Please log in to the Buyer Portal to review the full quotation details.`)}
    ${infoTable(rows)}
    ${para("This quotation is valid for the period stated above. Please review and accept or decline within the validity window.")}
    ${button("View Quotation", portalUrl)}
    ${para("Regards,<br/>The Procure.parts Team")}
  `;
  return sendEmail(
    params.businessEmail,
    `Quotation Ready — ${params.rfqReference}`,
    baseTemplate("Quotation Ready", body)
  );
}

export async function sendVendorInvite(params: VendorInviteParams): Promise<boolean> {
  const body = `
    ${heading("You Have Been Invited to Procure.parts")}
    ${para(`You have been invited to join <strong style="color:#f1f5f9;">Procure.parts</strong> as a <strong style="color:#f1f5f9;">${params.vendorType}</strong> supplier.`)}
    ${infoTable([
      ["Supplier Alias", params.internalAlias],
      ["Supplier Type", params.vendorType],
      ["Invite Expires", `${params.expiresInDays || 7} days from receipt`],
    ])}
    ${para("Click the button below to complete your registration. You will need a Manus account to log in.")}
    ${button("Accept Invitation", params.inviteUrl)}
    ${para("<strong style=\"color:#f59e0b;\">Note:</strong> This invite link is single-use and expires after the period shown above.")}
    ${para("Regards,<br/>The Procure.parts Team")}
  `;
  return sendEmail(
    params.vendorEmail,
    `Supplier Invitation — Procure.parts`,
    baseTemplate("Supplier Invitation", body)
  );
}
