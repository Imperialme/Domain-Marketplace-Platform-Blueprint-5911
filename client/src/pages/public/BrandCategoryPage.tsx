import { Link, useParams } from "wouter";
import PublicNav from "@/components/PublicNav";
import { getBrandsByCategory, getCategoryBySlug, brandCategories } from "@/data/brands";
import { ArrowRight, Package, Globe, CheckCircle, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import SeoHead from "@/components/SeoHead";

export default function BrandCategoryPage() {
  const { t } = useLanguage();
  const params = useParams<{ slug: string }>();
  const category = getCategoryBySlug(params.slug || "");
  const categoryBrands = getBrandsByCategory(params.slug || "");

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--navy-900)" }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">{t("Category Not Found")}</h1>
          <Link href="/brands" className="text-blue-400 hover:text-blue-300">← {t("Back to All Brands")}</Link>
        </div>
      </div>
    );
  }

  const otherCategories = brandCategories.filter(c => c.slug !== category.slug);

  return (
    <div className="min-h-screen" style={{ background: "var(--navy-900)" }}>
      <SeoHead
        title={category.seoTitle}
        description={category.seoDescription}
        canonical={`https://procure.parts/brands/category/${category.slug}`}
        keywords={`${category.name} spare parts wholesale UAE, bulk ${category.name} parts Dubai, ${category.targetBuyers}`}
      />
      <PublicNav />

      {/* Hero */}
      <section className="relative pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-1/3 w-96 h-96 rounded-full blur-3xl" style={{ background: "var(--electric-blue)" }} />
        </div>
        <div className="container relative z-10 max-w-5xl mx-auto px-4">
          <div className="flex items-center gap-2 text-xs text-slate-600 mb-6">
            <Link href="/" className="hover:text-slate-400">{t("Home")}</Link>
            <span>/</span>
            <Link href="/brands" className="hover:text-slate-400">{t("Brands")}</Link>
            <span>/</span>
            <span className="text-slate-400">{t(category.name)}</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4 border"
            style={{ background: "rgba(59,130,246,0.1)", borderColor: "rgba(59,130,246,0.3)", color: "var(--electric-blue)" }}>
            {category.icon} <bdi>{categoryBrands.length}</bdi> {t("Brands Available")}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t(category.name)}<br />
            <span style={{ color: "var(--gold)" }}>{t("Wholesale Parts Supplier")}</span>
          </h1>
          <p className="text-lg text-slate-400 mb-6 max-w-2xl">{t(category.description)}</p>
          <p className="text-sm text-slate-600 mb-8">
            <strong className="text-slate-500">{t("Target buyers")}:</strong> {t(category.targetBuyers)}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/apply" className="btn-primary inline-flex items-center gap-2">
              {t("Request Bulk Quote")} <ArrowRight size={16} />
            </Link>
            <Link href="/brands" className="btn-secondary inline-flex items-center gap-2">
              <ArrowLeft size={16} /> {t("All Brands")}
            </Link>
          </div>
        </div>
      </section>

      {/* Brand grid */}
      <section className="py-12 border-t border-white/5">
        <div className="container px-4 max-w-5xl mx-auto">
          <h2 className="text-xl font-bold text-white mb-6">
            {t("All")} {t(category.name)} {t("Brands We Supply")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryBrands.map(brand => (
              <Link
                key={brand.slug}
                href={`/brands/${brand.slug}`}
                className="group rounded-xl p-5 border border-white/8 hover:border-blue-500/40 transition-all duration-200"
                style={{ background: "var(--navy-800)" }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0"
                    style={{ background: "rgba(59,130,246,0.1)", color: "var(--electric-blue)" }}>
                    {brand.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors text-sm">{brand.name}</h3>
                      <ArrowRight size={14} className="text-slate-600 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-2">{brand.description.substring(0, 80)}...</p>
                    <div className="flex flex-wrap gap-1">
                      {brand.partTypes.slice(0, 3).map((pt, i) => (
                        <span key={i} className="text-xs px-1.5 py-0.5 rounded text-slate-600 border border-white/5">
                          {t(pt)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why us for this category */}
      <section className="py-12 border-t border-white/5">
        <div className="container px-4 max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8">
            {t("Why Procure.parts for")} {t(category.name)}?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <CheckCircle size={20} className="text-emerald-400" />,
                title: t("OEM + Aftermarket Options"),
                desc: t("Every quotation includes both genuine OEM and premium aftermarket options — you choose based on budget and application."),
              },
              {
                icon: <Globe size={20} className="text-blue-400" />,
                title: t("Bulk Wholesale Pricing"),
                desc: t("Our procurement desk sources directly from vetted distributors and suppliers, delivering bulk parts at wholesale prices from Dubai."),
              },
              {
                icon: <Package size={20} style={{ color: "var(--gold)" }} />,
                title: t("Vetted Vendor Network"),
                desc: t("All our parts suppliers are pre-approved and regularly audited — protecting you from counterfeit parts and unreliable sources."),
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

      {/* Other categories */}
      <section className="py-12 border-t border-white/5">
        <div className="container px-4 max-w-5xl mx-auto">
          <h2 className="text-xl font-bold text-white mb-6">{t("Other Categories")}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {otherCategories.map(cat => (
              <Link
                key={cat.slug}
                href={`/brands/category/${cat.slug}`}
                className="group rounded-xl p-4 border border-white/8 hover:border-blue-500/30 transition-all text-center"
                style={{ background: "var(--navy-800)" }}
              >
                <div className="text-2xl mb-2">{cat.icon}</div>
                <div className="text-xs font-medium text-slate-400 group-hover:text-white transition-colors leading-tight">{t(cat.name)}</div>
                <div className="text-xs text-slate-600 mt-1"><bdi>{getBrandsByCategory(cat.slug).length}</bdi> {t("brands")}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-white/5">
        <div className="container px-4 max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            {t("Need")} {t(category.name)} {t("Parts in Bulk?")}
          </h2>
          <p className="text-slate-400 mb-6">
            {t("Apply for buyer access and submit your RFQ. We respond within 24 hours with a full OEM vs aftermarket comparison.")}
          </p>
          <Link href="/apply" className="btn-primary inline-flex items-center gap-2">
            {t("Apply for Buyer Access")} <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/5 py-8">
        <div className="container px-4 max-w-6xl mx-auto text-center text-xs text-slate-600">
          <p>© {new Date().getFullYear()} Procure.parts · Operated by Imperial MEA General Trading LLC · Dubai, UAE</p>
        </div>
      </footer>
    </div>
  );
}
