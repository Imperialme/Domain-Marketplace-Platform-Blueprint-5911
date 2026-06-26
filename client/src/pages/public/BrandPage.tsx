import { Link, useParams } from "wouter";
import PublicNav from "@/components/PublicNav";
import { getBrandBySlug, getBrandsByCategory, getCategoryBySlug } from "@/data/brands";
import { ArrowRight, Package, Globe, CheckCircle, ArrowLeft, Tag, MapPin, Zap, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getRelevantContinents } from "@/data/geoRegions";
import SeoHead from "@/components/SeoHead";

function partTypeToSlug(partType: string): string {
  return partType.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function BrandPage() {
  const { t } = useLanguage();
  const params = useParams<{ slug: string }>();
  const brand = getBrandBySlug(params.slug || "");

  if (!brand) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--navy-900)" }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">{t("Brand Not Found")}</h1>
          <Link href="/brands" className="text-blue-400 hover:text-blue-300">← {t("Back to All Brands")}</Link>
        </div>
      </div>
    );
  }

  const category = getCategoryBySlug(brand.categorySlug);
  const relatedBrands = getBrandsByCategory(brand.categorySlug).filter(b => b.slug !== brand.slug).slice(0, 6);

  const seoTitle = `${brand.name} Parts Wholesale Supplier UAE | Bulk ${brand.name} Spare Parts Dubai`;
  const seoDesc = `Buy ${brand.name} spare parts in bulk from Dubai. OEM and aftermarket ${brand.name} parts wholesale — fast supply to Middle East, Africa, and Southeast Asia. B2B buyers only.`;
  const canonicalUrl = `https://procure.parts/brands/${brand.slug}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${brand.name} Spare Parts`,
    description: brand.description,
    brand: { "@type": "Brand", name: brand.name },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: "Procure.parts", url: "https://procure.parts" },
    },
    keywords: brand.keywords.join(", "),
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--navy-900)" }}>
      <SeoHead
        title={seoTitle}
        description={seoDesc}
        canonical={canonicalUrl}
        keywords={brand.keywords.join(", ")}
        structuredData={structuredData}
      />
      <PublicNav />

      {/* Hero */}
      <section className="relative pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-1/3 w-96 h-96 rounded-full blur-3xl" style={{ background: "var(--electric-blue)" }} />
        </div>
        <div className="container relative z-10 max-w-5xl mx-auto px-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-600 mb-6">
            <Link href="/" className="hover:text-slate-400 transition-colors">{t("Home")}</Link>
            <span>/</span>
            <Link href="/brands" className="hover:text-slate-400 transition-colors">{t("Brands")}</Link>
            <span>/</span>
            <Link href={`/brands/category/${brand.categorySlug}`} className="hover:text-slate-400 transition-colors">{t(brand.category)}</Link>
            <span>/</span>
            <span className="text-slate-400">{brand.name}</span>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4 border"
                style={{ background: "rgba(59,130,246,0.1)", borderColor: "rgba(59,130,246,0.3)", color: "var(--electric-blue)" }}>
                {category?.icon} {t(brand.category)}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {brand.name} {t("Parts")}<br />
                <span style={{ color: "var(--gold)" }}>{t("Wholesale Supplier")}</span>
              </h1>
              <p className="text-lg text-slate-400 mb-6 leading-relaxed">{brand.description}</p>

              {/* Keywords as tags */}
              <div className="flex flex-wrap gap-2 mb-8">
                {brand.keywords.slice(0, 4).map((kw, i) => (
                  <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border"
                    style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
                    <Tag size={10} />
                    {kw}
                  </span>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/apply" className="btn-primary inline-flex items-center gap-2">
                  {t("Request Bulk Quote")} <ArrowRight size={16} />
                </Link>
                <Link href="/how-it-works" className="btn-secondary inline-flex items-center gap-2">
                  {t("How It Works")}
                </Link>
              </div>
            </div>

            {/* Info card */}
            <div className="w-full md:w-72 rounded-2xl p-6 border border-white/8 flex-shrink-0"
              style={{ background: "var(--navy-800)" }}>
              <div className="w-16 h-16 rounded-xl mb-4 flex items-center justify-center text-2xl font-bold"
                style={{ background: "rgba(59,130,246,0.15)", color: "var(--electric-blue)" }}>
                {brand.name[0]}
              </div>
              <h3 className="font-bold text-white mb-1">{brand.name}</h3>
              <p className="text-xs text-slate-500 mb-4">{t(brand.category)}</p>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-600 mb-1.5">{t("Part Categories")}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {brand.partTypes.map((pt, i) => (
                      <Link key={i} href={`/brands/${brand.slug}/${partTypeToSlug(pt)}`}
                        className="text-xs px-2 py-1 rounded-md text-blue-400 border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/15 transition-colors">
                        {t(pt)}
                      </Link>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-2">{t("Supply Regions")}</p>
                  <div className="space-y-2">
                    {getRelevantContinents(brand.regions).map((geo) => (
                      <div key={geo.continent}>
                        <p className="text-xs font-semibold text-slate-500 mb-1">{geo.emoji} {t(geo.continent)}</p>
                        <div className="flex flex-wrap gap-1">
                          {geo.countries.slice(0, 5).map((c, i) => (
                            <span key={i} className="text-xs px-1.5 py-0.5 rounded text-emerald-400 border border-emerald-500/20 bg-emerald-500/5">{c}</span>
                          ))}
                          <span className="text-xs px-1.5 py-0.5 rounded text-slate-500 border border-slate-700/40 bg-white/3">{t("& more")}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Procure.parts for this brand */}
      <section className="py-12 border-t border-white/5">
        <div className="container px-4 max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8">
            {t("Why Source")} {brand.name} {t("Parts Through Procure.parts?")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <CheckCircle size={20} className="text-emerald-400" />,
                title: t("Genuine OEM & Premium Aftermarket"),
                desc: t("We source both genuine OEM parts and premium aftermarket alternatives — giving you the choice between original quality and cost-effective options."),
              },
              {
                icon: <Globe size={20} className="text-blue-400" />,
                title: t("Bulk Wholesale from Dubai"),
                desc: t("Operating from Dubai, we supply parts in bulk to Africa, Middle East, Europe, and Southeast Asia with competitive pricing and fast turnaround."),
              },
              {
                icon: <Zap size={20} style={{ color: "var(--gold)" }} />,
                title: t("Protected Vendor Network"),
                desc: t("Our vetted distributor and supplier network ensures you get authentic parts at wholesale prices — not inflated retail quotes."),
              },
            ].map((item, i) => (
              <div key={i} className="rounded-xl p-5 border border-white/8" style={{ background: "var(--navy-800)" }}>
                <div className="mb-3">{item.icon}</div>
                <h3 className="font-semibold text-white mb-2 text-sm">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Part Type Sub-pages */}
      <section className="py-12 border-t border-white/5">
        <div className="container px-4 max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-2">
            {brand.name} {t("Parts by Category")}
          </h2>
          <p className="text-slate-500 text-sm mb-6">{t("Browse specific part categories — each with dedicated wholesale pricing and supply information.")}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {brand.partTypes.map((pt, i) => {
              const ptSlug = partTypeToSlug(pt);
              return (
                <Link key={i} href={`/brands/${brand.slug}/${ptSlug}`}
                  className="group flex items-center justify-between p-4 rounded-xl border border-white/8 hover:border-blue-500/30 transition-all"
                  style={{ background: "var(--navy-800)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(59,130,246,0.1)" }}>
                      <Package size={14} style={{ color: "var(--electric-blue)" }} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{brand.name} {t(pt)}</div>
                      <div className="text-xs text-slate-500">{t("Wholesale supply · All regions")}</div>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How to order */}
      <section className="py-12 border-t border-white/5">
        <div className="container px-4 max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8">{t("How to Order")} {brand.name} {t("Parts in Bulk")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { step: "01", title: t("Apply for Access"), desc: t("Submit your company details for approval. Takes 24–48 hours.") },
              { step: "02", title: t("Submit Your RFQ"), desc: `${t("Upload your")} ${brand.name} ${t("parts list with part numbers and quantities.")}` },
              { step: "03", title: t("Receive Quotation"), desc: t("We source from our vetted vendor network and send you a detailed OEM vs aftermarket comparison.") },
              { step: "04", title: t("Confirm & Ship"), desc: t("Approve the quotation and we arrange bulk shipment to your location.") },
            ].map((s, i) => (
              <div key={i} className="rounded-xl p-5 border border-white/8 relative overflow-hidden" style={{ background: "var(--navy-800)" }}>
                <div className="text-4xl font-black mb-3 opacity-10" style={{ color: "var(--electric-blue)" }}>{s.step}</div>
                <h3 className="font-semibold text-white mb-2 text-sm">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related brands */}
      {relatedBrands.length > 0 && (
        <section className="py-12 border-t border-white/5">
          <div className="container px-4 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">{t("Other")} {t(brand.category)} {t("Brands")}</h2>
              <Link href={`/brands/category/${brand.categorySlug}`} className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                {t("View all")} <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {relatedBrands.map(b => (
                <Link
                  key={b.slug}
                  href={`/brands/${b.slug}`}
                  className="group rounded-xl p-4 border border-white/8 hover:border-blue-500/30 transition-all text-center"
                  style={{ background: "var(--navy-800)" }}
                >
                  <div className="w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center text-sm font-bold"
                    style={{ background: "rgba(59,130,246,0.1)", color: "var(--electric-blue)" }}>
                    {b.name[0]}
                  </div>
                  <div className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">{b.name}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 border-t border-white/5">
        <div className="container px-4 max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            {t("Ready to Source")} {brand.name} {t("Parts?")}
          </h2>
          <p className="text-slate-400 mb-6">
            {t("Apply for buyer access and submit your first RFQ. Our procurement desk will respond within 24 hours.")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/apply" className="btn-primary inline-flex items-center gap-2">
              {t("Apply for Buyer Access")} <ArrowRight size={16} />
            </Link>
            <Link href="/brands" className="btn-secondary inline-flex items-center gap-2">
              <ArrowLeft size={16} />
              {t("Back to All Brands")}
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-8">
        <div className="container px-4 max-w-6xl mx-auto text-center text-xs text-slate-600">
          <p>© {new Date().getFullYear()} Procure.parts · Operated by Imperial MEA General Trading LLC · Dubai, UAE</p>
          <p className="mt-1">{brand.name} {t("parts wholesale supplier — Africa, Middle East, Europe & Southeast Asia")}</p>
        </div>
      </footer>
    </div>
  );
}
