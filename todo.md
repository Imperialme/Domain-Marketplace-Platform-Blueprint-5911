# Procure.parts — Project TODO

## Phase 1: Foundation
- [x] Design system — CSS variables, navy/blue/gold theme
- [x] Database schema — all 13+ tables in drizzle/schema.ts
- [x] DB migration — generate and apply SQL
- [x] Role-based auth middleware (super_admin, admin, buyer, vendor)
- [x] tRPC router structure with role guards
- [x] Default margin rules seeded

## Phase 2: Public Website
- [x] Homepage — hero, 4 feature cards, REQUEST ACCESS CTA
- [x] How It Works — 7-step buyer journey
- [x] Industries Served — 5 industry cards
- [x] Why Procure.parts — engagement fee justification
- [x] Apply for Access — full company onboarding form (all mandatory fields)
- [x] Public navigation header

## Phase 3: Admin Console
- [x] Admin layout — dark sidebar with 10 sections
- [x] Overview — KPI cards (Pending RFQs, Priority RFQs, Fees MTD)
- [x] Onboarding Gate — buyer + vendor approval queue
- [x] Directories — Buyer Directory + Supplier Directory
- [x] Intelligence Desk — RFQ decision matrix
- [x] Parts DNA — master registry, search, export
- [x] Desk Messages — structured messaging by entity ID
- [ ] CMS Editor — edit public page copy
- [x] Margin Rules — view/edit tiers, toggle fixed/custom
- [x] Fee Ledger — engagement fee log
- [x] Quotation Builder — admin quotation tool

## Phase 4: Buyer Portal
- [x] Buyer dashboard — open RFQs, fee status, quotation history
- [x] Submit RFQ — multi-step form with file upload
- [x] My References — RFQ-YY-XXXX list with status
- [x] Fees & Payments — invoices, payment, adjusted credits
- [x] Quotations — received quotations
- [x] Feedback — star rating + comments form

## Phase 5: Vendor Portal
- [x] Vendor dashboard
- [x] Submit Price — linked to part number, validity dates
- [x] My Submissions — own submissions + approval status
- [x] Vendor type differentiation (Distributor/Dealer/Supplier)

## Phase 6: Parts Master
- [x] Parts Master CRUD (admin)
- [ ] File upload auto-population (Excel/PDF → parts_master)
- [x] Parts DNA intelligence display
- [x] Parts supplier links + history
- [ ] Market intelligence layer (lowest/highest/median prices)

## Phase 7: Quotation Builder
- [x] Margin engine — OEM 25% flat
- [x] AM tiered margin logic (30%/50%/150% + 401%+ cap rule)
- [ ] Mandatory OEM vs AM comparison table (full interactive builder)
- [ ] Fixed/Custom margin toggle
- [ ] Buyer-facing clean output (no cost/margin visible)
- [x] Margin Rules admin config (super admin only)

## Phase 8: Fee + Closure + Notifications
- [ ] Engagement fee tiers (50-75 / 100-150 / 250-500 USD)
- [ ] Stripe payment integration + webhook
- [ ] PayPal payment integration + webhook
- [ ] RFQ closure workflow with 4 outcome codes
- [ ] Mailgun email notifications (approval, fee request, quotation, closure)
- [x] Buyer feedback system (auto-triggered + manual)
- [x] Audit log — full before/after state capture

## Phase 9: AI + Self-Improving System
- [ ] Claude API integration for RFQ sourcing intelligence
- [ ] AI response logging to audit system
- [ ] Self-improving error/pattern detection layer
- [ ] Admin AI intelligence desk panel

## Phase 10: QA + Polish
- [x] Vitest unit tests for margin engine (11 tests passing)
- [x] Vitest tests for RFQ reference generation
- [ ] Vitest tests for fee tier logic
- [ ] UI polish and responsive design check
- [ ] Final checkpoint and delivery

## Phase 11: Mobile Responsiveness + UX Fixes (Priority)
- [x] Buyer Portal sidebar — collapsible hamburger menu on mobile (sidebar overlaps content)
- [x] Vendor Portal sidebar — same collapsible fix
- [x] Admin sidebar — same collapsible fix
- [x] Apply for Access — country field → searchable dropdown (ISO country list)
- [x] Apply for Access — industry field → multi-select (max 2, require reason for more)
- [x] Apply for Access — decision maker role → dropdown menu
- [x] Apply for Access — approval reason → dropdown menu
- [x] All portal layouts — mobile-first responsive grid (content must not be hidden behind sidebar)
- [x] Language selector placeholder (EN/AR/FR/DE/ES/ZH) in public nav

## Phase 12: Self-Audit + AI Fix Engine
- [ ] Error capture middleware — catch all server errors, log to audit_log table with full context
- [ ] Pattern detection — group recurring errors by type/route/frequency
- [ ] Admin Audit Dashboard — error log, pattern frequency, known issues panel
- [ ] In-app AI fix suggestions — Claude API analyses error context and suggests fix steps
- [ ] Owner notification — push notification when new error pattern detected
- [ ] Self-improving loop — resolved errors logged with fix, suggested automatically next time

## Phase 13: Brand SEO Pages
- [x] Brands directory page — all 6 categories, 100+ brands, search + filter
- [x] Individual brand pages — /brands/[slug] with SEO title, description, bulk keywords
- [x] Category pages — /brands/category/[slug] (trucks, construction, filtration, etc.)
- [x] SEO meta tags — title, description, keywords per brand page
- [x] "Request Parts" CTA on each brand page → links to Apply/RFQ form
- [x] Brand page nav link in PublicNav

## Phase 14: Google Sheets + CSV Export
- [ ] CSV export — buyer data (company, RFQs, status, risk flag)
- [ ] CSV export — vendor/supplier data (name, type, submissions, approval)
- [ ] Google Sheets live sync — buyer sheet via Google Sheets API
- [ ] Google Sheets live sync — vendor sheet via Google Sheets API
- [ ] Admin export panel — one-click export buttons for all data types

## Phase 15: SEO Brand Sub-pages & Content Cleanup

- [ ] Brand sub-pages: 57 brands × 7 part types (~400 SEO pages at /brands/[slug]/[part-type])
- [ ] Add Oil & Gas as industry category (public site + apply form + brand pages)
- [ ] Standardise regions on all brand pages (UAE, KSA, Kuwait, Qatar, Bahrain, Oman, Egypt, Kenya, Nigeria, South Africa, Tanzania, Ethiopia, Indonesia, Malaysia, Philippines)
- [ ] "Dealer" → "Trusted Supplier" / "Reputable Supplier" cleanup across all pages
- [ ] How It Works rewrite — outcome-focused, less copyable
- [ ] "Industrials and Complex Projects" replaces "Industrial & Manufacturing"
- [ ] Document upload requirement on buyer onboarding (Trade Licence, VAT, reference)
- [ ] Supplier interest form on public site (separate from buyer apply)

## Phase 16: User Feedback Fixes (Pre-Publish)

### Content Corrections
- [ ] Homepage "What you get" section — rewrite to be unique, not copyable
- [ ] Remove "3-6 hours" commitment — replace with realistic SLA language
- [ ] Why Us section — add strict "not a price-checking model" warning
- [ ] Fees & Payments — add demo data for buyer portal
- [ ] Fees — add explanation: fees are case-by-case, notified in advance, adjustable against final order
- [ ] RFQ feedback — add dropdown menu for structured buyer feedback
- [ ] Add demo/seed data for RFQs so buyer portal is not empty

### Login & Registration
- [ ] Apply for Access form — reorder: Person name → Company name → Business email → Country + Website
- [ ] Industry multi-select — increase limit from 2 to 3 categories
- [ ] Fix social login — currently shows "request access" instead of allowing sign-in

### Content Cleanup
- [ ] Remove "Government" and "Defense" from all industry lists
- [ ] Remove Iran, North Korea, Israel from all country/region lists
- [ ] Fix Oil & Gas duplication in industry lists
- [ ] Rename to "Industrial and Custom Projects"
- [ ] Rename to "Heavy Equipment and Construction" (no ampersand)

### Brand Page Corrections
- [ ] Replace specific country names with continent names on brand pages
- [ ] Remove Israel, Iran, sanctioned countries from all brand region mentions
- [ ] Fix brand origin country — show actual home country (Scania = Sweden, Toyota = Japan, etc.)
- [ ] Standardise supply regions: Africa, Middle East, Europe, Southeast Asia, Oceania

### Mobile & UI
- [ ] Reduce excessive spacing on mobile views
- [ ] Fix all client-side errors visible in browser

### Security
- [x] Implement anti-copy / IP protection strategy (robots.txt, meta noindex on internal pages, legal notice)

## Phase 17: Blog + Translation (Current)
- [x] Full-platform AI translation — 8 languages (EN, AR, FR, PT, DE, ES, ZH, JA)
- [x] Language dropdown in PublicNav (desktop + mobile)
- [x] Floating language switcher in all internal portals (Admin, Buyer, Vendor)
- [x] Blog section at /blog with 10 seed articles
- [x] Blog post detail pages at /blog/[slug] with brand links
- [x] Blog link in PublicNav
- [x] Content protection hook (right-click, copy, drag disabled on public pages)
- [x] robots.txt with scraper bot blocking
- [x] Prose CSS for article rendering
- [x] ApplyAccess form field reorder (Name → Company → Email → Country + Website)
- [ ] Connect Subbase (subscription/payment gateway)
- [ ] Help centre integration
- [ ] Stripe payment integration for engagement fees

## Phase 18: Error Fixes + Email + Tables + Blog CMS

### Error Fixes
- [ ] Fix Oil & Gas duplicate key error (root cause in Home.tsx or older component)
- [ ] Fix ApplyAccess.tsx HMR parse error permanently
- [ ] Fix all TypeScript/runtime errors found in error log audit

### Email Notifications (Nodemailer)
- [ ] Install nodemailer + @types/nodemailer
- [ ] Build email service (server/email.ts) with HTML templates
- [ ] Application received confirmation email → sent to applicant
- [ ] Application approved email → sent to applicant with portal login link
- [ ] Application rejected email → sent to applicant with reason
- [ ] RFQ submitted acknowledgement email → sent to buyer
- [ ] New application alert email → sent to admin/owner

### Data Tables
- [ ] Rows-per-page selector (20/50/100) on all Admin tables
- [ ] Excel/CSV download button on all Admin tables
- [ ] Copy-to-clipboard button on all Admin tables
- [ ] Rows-per-page + export on Buyer Portal tables
- [ ] Rows-per-page + export on Vendor Portal tables

### Blog CMS (Admin Console)
- [ ] Blog posts table in drizzle/schema.ts
- [ ] Blog CMS router (CRUD: create, update, publish, delete)
- [ ] Admin Blog CMS page with rich text editor
- [ ] Public /blog and /blog/[slug] reads from database (not static data file)
- [ ] Seed 10 existing blog articles into database

## Phase 19 Completed
- [x] Fix language translation re-render bug (cacheVersion counter forces re-render on cache update)
- [x] Split 'Request Access' into 'Buyer Access' and 'Supplier Access' dropdown in PublicNav
- [x] Split Sign In into 'Buyer Sign In' and 'Supplier Sign In' dropdown in PublicNav
- [x] Create /apply/buyer page with buyer-specific 4-step form
- [x] Create /apply/supplier page with supplier-specific 4-step form (amber/orange theme)
- [x] Add /apply/buyer and /apply/supplier routes to App.tsx

## Phase 20: Fast Static Translation
- [ ] Build complete static translation dictionary for all 8 languages
- [ ] Rewrite LanguageContext to use static dictionary (instant, no API calls)
- [ ] LLM fallback only for keys not in static dictionary

## Phase 21: Full Translation Fix + Nav Redesign
- [x] Audit all public pages for missing t() keys — found 0 missing after fix
- [x] Add 97+ new translation entries for Industries, BrandPage, BrandCategoryPage, BrandPartTypePage
- [x] Add useLanguage + t() to all 4 Brand pages (Brands, BrandPage, BrandCategoryPage, BrandPartTypePage)
- [x] Rewrite BrandCategoryPage.tsx with full translation support and PublicNav
- [x] Rewrite BrandPartTypePage.tsx with full translation support and PublicNav
- [x] Redesign PublicNav: single language dropdown (compact pills), combined Buyer/Vendor Portal dropdown
- [x] Mobile menu: horizontal scrollable language pills instead of 2-col grid
- [x] Fix Construction & Heavy Equipment missing translation key
- [x] Add Apply for Vendor Access translation key
- [x] All 11 tests pass, 0 TypeScript errors

## Phase 22: Geo Structure + SEO + Nav Fix
- [x] Add continent + anchor country structure to BrandPage, BrandCategoryPage, BrandPartTypePage (with "and more" note)
- [x] Add Ghana and other West/East African countries to the supply regions list (via geoRegions.ts)
- [x] Fix brand page mobile nav — PublicNav hamburger not visible on internal brand pages
- [x] Audit and fix SEO: meta tags, Open Graph, canonical URLs on all public pages (SeoHead component)
- [x] Add JSON-LD structured data (Product schema) to BrandPage
- [x] Verify quotation system (builder, margin engine, buyer-facing output) — intact, 11 tests pass
- [x] Verify slug structure is SEO-correct for all brand pages
- [x] Generate sitemap.xml with 345 indexable URLs
- [x] Fix robots.txt to allow /apply, add Sitemap directive

## Phase 23: Russian Language + Form Fixes + Auth Loop Fix

- [ ] Add Russian (RU) as 9th language to translation dictionary (all 300+ keys)
- [ ] Add Russian to language dropdown in PublicNav and mobile menu
- [ ] Fix vendor OAuth login loop — after login redirect to /vendor not homepage
- [ ] Add phone/contact number field to Apply Buyer form
- [ ] Add phone/contact number field to Apply Supplier/Vendor form
- [ ] Fix label: "Apply for Buyer Access" → clearly say "Sign up as a Buyer"
- [ ] Fix label: "Apply for Supplier Access" → "Sign up as a Vendor"
- [ ] Improve supplier type options (Distributor, Dealer, Manufacturer, Trading Company, Importer, Agent)
- [ ] Fix nav Portal dropdown: "Sign up as a Buyer", "Sign up as a Vendor", "Sign in as a Buyer", "Sign in as a Vendor"
- [ ] Add aftermarket note on brand pages (already embedded, clarify to users)

## Phase A — Launch Blockers (Current Sprint)

- [ ] DB migration: add subject, description, equipmentType, additionalNotes, fleetSize to rfqs table
- [ ] RFQ submit procedure: save subject, description, equipmentType, additionalNotes, fleetSize
- [ ] RFQ submit: send email acknowledgement to buyer after submission
- [ ] Admin RFQ detail: show subject, description, equipment type, item list file download link
- [ ] Buyer RFQ references: show subject in the list
- [ ] Email: send quotation-ready notification to buyer when admin issues quotation
- [ ] Email: send vendor invite email when admin creates vendor invite
- [ ] Quotation PDF export: server-side PDF generation, buyer can download
- [ ] Quotation Excel export: server-side Excel generation, buyer can download
- [ ] Admin quotation builder: add Download PDF and Download Excel buttons
- [ ] Vendor invite claim page: /vendor/join?token=XXX — vendor logs in and links account
- [ ] Admin vendor directory: show invite link with copy button after creating vendor

## Phase A — Launch Blockers (Session Apr 9 2026)
- [x] Admin Console login link in Portal dropdown
- [x] Demo seed data (buyer company, vendor, RFQs, quotations)
- [x] RFQ item list file upload — S3 storage, missing DB columns added (subject, description, equipmentType, etc.)
- [x] Email notifications — quotation-issued email wired into quotations router
- [x] Quotation PDF export — server-side pdfkit generation, buyer portal Download PDF button
- [x] Quotation Excel export — xlsx generation, buyer portal Download Excel button
- [x] Vendor invite flow — admin generates invite link, optional email send, inviteEmail column added to DB
- [x] Vendor accept-invite page — /vendor/accept-invite?token=... (public, links Manus account to vendor record)
- [x] Admin Directories — invite dialog updated with email field + invite URL display after generation

## Phase B — Next Steps
- [ ] SMTP credentials setup (required to activate email sending)
- [ ] PayPal payment integration for engagement fee
- [ ] Admin analytics dashboard (RFQ volume, revenue, conversion rates)
- [ ] In-app messaging on RFQs
