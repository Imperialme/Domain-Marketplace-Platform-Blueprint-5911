# Procure.parts — B2B Spare Parts Procurement Platform

**Version:** 1.0.0  
**Built with:** React 19 + Tailwind 4 + Express 4 + tRPC 11 + MySQL  
**Operator:** Imperial MEA General Trading LLC

---

## Overview

Procure.parts is a controlled decision layer for professional spare parts procurement. It connects buyers seeking OEM and aftermarket parts with verified suppliers, enabling transparent quotation comparison and streamlined sourcing workflows.

**Core value proposition:**
- **24–48 hour response time** on all RFQs
- **6–12 hour priority processing** for expedited requests
- **100% RFQ closure rate** through verified supplier network
- **B2B verified members only** — no public marketplace chaos

---

## Architecture

```
procure-parts/
├── client/                 # React 19 frontend (Vite)
│   ├── src/
│   │   ├── pages/         # Page components (public, admin, buyer, vendor)
│   │   ├── components/    # Reusable UI (DashboardLayout, AIChatBox, Map, etc.)
│   │   ├── contexts/      # React contexts (auth, theme)
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/trpc.ts    # tRPC client binding
│   │   ├── App.tsx        # Routes and layout
│   │   ├── main.tsx       # Entry point with providers
│   │   └── index.css      # Global Tailwind + theme variables
│   └── public/            # Static assets (favicon, robots.txt only)
├── server/                # Express + tRPC backend
│   ├── _core/            # Framework plumbing (OAuth, context, LLM, email, etc.)
│   ├── routers/          # tRPC procedure definitions
│   │   ├── companies.ts  # Buyer applications & approvals
│   │   ├── rfqs.ts       # RFQ submission & management
│   │   ├── quotations.ts # Quotation builder & export
│   │   ├── vendors.ts    # Vendor invites & price submissions
│   │   ├── parts.ts      # Parts DNA database
│   │   ├── audit.ts      # Activity logs
│   │   ├── exports.ts    # Data export
│   │   ├── i18n.ts       # Multi-language content
│   │   ├── blog.ts       # Blog CMS
│   │   └── selfAudit.ts  # AI-powered audit
│   ├── db.ts             # Database query helpers
│   ├── email.ts          # Email templates & sending
│   ├── quotationExport.ts # PDF & Excel generation
│   ├── storage.ts        # S3 file upload helpers
│   └── _core/index.ts    # Server entry point
├── drizzle/              # Database schema & migrations
│   ├── schema.ts         # 19 table definitions
│   └── migrations/       # SQL migration files
├── storage/              # S3 client helpers
├── shared/               # Shared types & constants
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── vite.config.ts        # Vite config
└── vitest.config.ts      # Test config
```

---

## Database Schema

### Core Tables

| Table | Purpose | Rows |
|---|---|---|
| `users` | Manus OAuth user accounts | 1 (admin) |
| `companies` | Buyer organizations (approved only) | 1 (demo) |
| `vendors` | Supplier organizations | 1 (demo) |
| `rfqs` | Request for quotations | 5 (demo) |
| `quotations` | Admin-built quotations | 1 (demo) |
| `vendor_prices` | Supplier price submissions | 1 (demo) |
| `parts_master` | OEM & aftermarket parts database | 1 (demo) |
| `engagement_fees` | Fee requests & payments | 0 |
| `audit_log` | Activity log (all actions) | Multiple |
| `buyer_feedback` | Post-RFQ feedback ratings | 0 |

### Supporting Tables

`blog_posts` · `desk_messages` · `margin_rules` · `parts_intelligence` · `parts_quote_history` · `parts_supplier_links` · `ai_intelligence_log` · `cms_content` · `__drizzle_migrations`

---

## Key Features

### Public Portal

- **Homepage** (`/`) — Hero, value props, stats, CTA
- **How It Works** (`/how-it-works`) — 3-step process explanation
- **Industries** (`/industries`) — Sector coverage
- **Brands** (`/brands`) — 100+ brand pages for SEO
- **Blog** (`/blog`) — Content marketing
- **Apply as Buyer** (`/apply/buyer`) — Multi-step company application
- **Apply as Supplier** (`/apply/supplier`) — Vendor onboarding

### Admin Console (`/admin`)

- **Onboarding Gate** — Approve/reject buyer and vendor applications
- **RFQ Queue** — View all incoming RFQs, filter by status
- **Quotation Builder** — Line-item quotation with auto-margin calculation
- **Parts DNA** — Searchable parts database with supplier links
- **Directories** — Vendor management and invite generation
- **Fee Ledger** — Track engagement fees and payments
- **Desk Messages** — Contact form inbox
- **Margin Rules** — Configure OEM/aftermarket margin tiers
- **Self-Audit AI** — AI-powered platform audit dashboard
- **Blog CMS** — Write and publish blog posts
- **Data Export** — Export RFQs, quotations, and audit logs

### Buyer Portal (`/buyer`)

- **Dashboard** — RFQ pipeline stats, recent activity
- **Submit RFQ** (`/buyer/rfq/new`) — Upload parts list file, add description
- **My References** — View all submitted RFQs
- **Quotations** (`/buyer/quotations`) — Download quotations as PDF or Excel
- **Fees & Payments** — View engagement fees, PayPal payment button
- **Feedback** — Rate quotations and suppliers

### Vendor Portal (`/vendor`)

- **Dashboard** — Submission stats, recent activity
- **Submit Price** (`/vendor/submit`) — Quote RFQ-based price requests
- **My Submissions** — View submission history
- **Accept Invite** (`/vendor/accept-invite?token=...`) — Public token-based activation

---

## Setup & Deployment

### Prerequisites

- **Node.js** 22+
- **MySQL 8.0+** or **TiDB** (compatible)
- **Manus OAuth** credentials (provided by platform)
- **SMTP credentials** (for email notifications)
- **S3 bucket** (for file uploads)

### Local Development

```bash
# Install dependencies
pnpm install

# Run migrations (if needed)
pnpm drizzle-kit generate
# Then apply SQL via webdev_execute_sql or your DB client

# Start dev server
pnpm dev

# Run tests
pnpm test

# TypeScript check
pnpm tsc --noEmit
```

### Environment Variables

**Required (system-provided by Manus):**
```
DATABASE_URL=mysql://user:pass@host/procure_parts
JWT_SECRET=<signing key>
VITE_APP_ID=<Manus OAuth app ID>
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://login.manus.im
OWNER_OPEN_ID=<your Manus user ID>
OWNER_NAME=<your name>
BUILT_IN_FORGE_API_URL=<Manus API endpoint>
BUILT_IN_FORGE_API_KEY=<Manus API key>
VITE_FRONTEND_FORGE_API_KEY=<frontend API key>
VITE_FRONTEND_FORGE_API_URL=<Manus API endpoint>
```

**Required (you must provide):**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@procure.parts
PLATFORM_URL=https://procure.parts
```

**Optional (for PayPal payments):**
```
PAYPAL_CLIENT_ID=<your PayPal app ID>
PAYPAL_CLIENT_SECRET=<your PayPal secret>
```

### Deploy to Your VPS

**Option 1 — GitHub Export (Recommended)**

1. In the Manus Management UI → Settings → GitHub, export the code to a new repository
2. On your VPS, clone the repo:
   ```bash
   git clone https://github.com/your-username/procure-parts.git
   cd procure-parts
   ```
3. Install and run:
   ```bash
   pnpm install
   pnpm build
   NODE_ENV=production node dist/server.js
   ```

**Option 2 — Manual ZIP Upload**

1. Download the `procure-parts-complete.zip` file
2. Upload to your VPS and extract:
   ```bash
   unzip procure-parts-complete.zip
   cd procure-parts
   pnpm install
   pnpm build
   NODE_ENV=production node dist/server.js
   ```

### Plesk Deployment

1. Create a new Node.js application in Plesk
2. Set the document root to the project directory
3. Configure environment variables in Plesk → Node.js Settings
4. Set the startup file to `dist/server.js`
5. Restart the application

---

## API Routes

All backend logic is exposed via tRPC procedures under `/api/trpc`. Examples:

```typescript
// Public
trpc.auth.me.useQuery()                    // Current user
trpc.companies.submitApplication.useMutation()
trpc.vendors.getInviteByToken.useQuery()

// Protected (authenticated users)
trpc.rfqs.submit.useMutation()             // Submit RFQ
trpc.rfqs.myRfqs.useQuery()                // Buyer's RFQs
trpc.quotations.exportPDF.useMutation()    // Download PDF
trpc.vendors.acceptInvite.useMutation()    // Activate vendor account

// Admin only
trpc.companies.approve.useMutation()       // Approve buyer
trpc.quotations.create.useMutation()       // Create quotation
trpc.vendors.invite.useMutation()          // Send vendor invite
```

---

## Email Notifications

All emails are sent via SMTP (configured via environment variables). Email functions:

| Trigger | Email | Template |
|---|---|---|
| Buyer application submitted | `sendApplicationReceived` + `sendNewApplicationAlert` | Confirmation + admin alert |
| Application approved | `sendApplicationApproved` | Welcome email |
| Application rejected | `sendApplicationRejected` | Rejection notice |
| RFQ submitted | `sendRfqAcknowledgement` | Confirmation |
| Quotation issued | `sendQuotationIssued` | Quotation PDF attached |
| Vendor invited | `sendVendorInvite` | Invite link + 7-day expiry |

**Note:** Without SMTP credentials, emails fall back to console logging.

---

## File Upload & Storage

All files (RFQ item lists, quotation PDFs) are uploaded to S3 with non-enumerable keys:

```typescript
// Frontend
const file = await trpc.rfqs.uploadItemFile.mutateAsync({
  fileName: "parts-list.xlsx",
  fileBase64: base64String,
  mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
});
// Returns: { fileName, fileUrl }

// Backend
import { storagePut } from "./server/storage";
const { url } = await storagePut(
  `rfq-files/${userId}-${Date.now()}-${fileName}`,
  buffer,
  mimeType
);
```

---

## Multi-Language Support

The platform supports 8 languages via the `i18n` router:

- **English** (default)
- **Arabic** (العربية)
- **French** (Français)
- **Spanish** (Español)
- **German** (Deutsch)
- **Chinese Simplified** (简体中文)
- **Portuguese** (Português)
- **Russian** (Русский)

Language selection is stored in the browser and sent with each request.

---

## Testing

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test server/auth.logout.test.ts

# Watch mode
pnpm test --watch
```

Example test (reference: `server/auth.logout.test.ts`):

```typescript
import { describe, it, expect, vi } from "vitest";

describe("auth.logout", () => {
  it("should clear session cookie", async () => {
    // Test implementation
  });
});
```

---

## Known Limitations & Gaps

| Gap | Impact | Resolution |
|---|---|---|
| No online payment | Engagement fees are manual | Add PayPal or Stripe button |
| SMTP not configured | No email delivery | Provide SMTP credentials |
| Demo data has null subjects | Admin RFQ queue shows "—" | New RFQs will have data |
| Vendor quotes in audit log | Not queryable by admin | Migrate to `vendor_prices` table |
| No blog posts | No SEO content | Write 3–5 blog posts via CMS |

---

## Troubleshooting

### Server won't start
```bash
# Check database connection
mysql -u user -p -h host -D procure_parts -e "SELECT 1;"

# Check environment variables
env | grep -E "DATABASE_URL|JWT_SECRET|VITE_APP_ID"

# Check logs
tail -f .manus-logs/devserver.log
```

### OAuth login fails
- Verify `VITE_APP_ID` and `OAUTH_SERVER_URL` are correct
- Check that your domain is registered as a redirect URL in Manus OAuth settings
- Clear browser cookies and try again

### Emails not sending
- Verify `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` are set
- Check SMTP credentials by testing with a mail client
- Look for errors in server logs: `grep -i "email\|smtp" .manus-logs/devserver.log`

### Database migration errors
- Ensure all `.sql` files in `drizzle/migrations/` have been applied
- Check for schema drift: `pnpm drizzle-kit generate` and review the generated SQL
- If stuck, restore from a checkpoint or contact support

---

## Performance & Scaling

- **Database:** Indexed on `userId`, `companyId`, `vendorId`, `status` for fast queries
- **File uploads:** S3 with CDN for fast downloads
- **Frontend:** Vite for fast dev builds, React 19 for optimized rendering
- **Backend:** tRPC for type-safe RPC, Drizzle ORM for efficient queries
- **Caching:** Browser caching on static assets, tRPC query caching

---

## Security

- **Authentication:** Manus OAuth + JWT session cookies (`httpOnly`, `Secure`, `SameSite=Strict`)
- **Authorization:** Role-based access control (`admin`, `user`) on all procedures
- **Data isolation:** Users can only access their own data (buyers see their RFQs, vendors see their submissions)
- **File uploads:** Random S3 key prefixes prevent enumeration
- **SQL injection:** Drizzle ORM parameterized queries throughout
- **CSRF:** tRPC mutations require session cookie

---

## Support & Maintenance

For issues, feature requests, or deployment help, contact:
- **Email:** support@procure.parts
- **Manus Help:** https://help.manus.im

---

## License

Proprietary — Imperial MEA General Trading LLC

---

## Changelog

### v1.0.0 (Current)
- ✅ Core procurement platform
- ✅ Buyer application & approval flow
- ✅ RFQ submission with file upload
- ✅ Admin quotation builder with margin calculation
- ✅ Quotation PDF & Excel export
- ✅ Vendor invite flow with token-based activation
- ✅ Email notifications (SMTP-configurable)
- ✅ 8-language support including Arabic
- ✅ 100+ brand SEO pages
- ✅ Admin audit dashboard
- ✅ Blog CMS

### Planned (Phase 2)
- [ ] AI-powered RFQ parsing
- [ ] Parts DNA with OEM/aftermarket comparison
- [ ] Vendor performance scorecard
- [ ] In-app messaging on RFQs
- [ ] Multi-user buyer company portal
- [ ] API for ERP integration
- [ ] PayPal & Stripe payment integration
