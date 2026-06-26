import { useState } from "react";
import { Link } from "wouter";
import PublicNav from "@/components/PublicNav";
import { brands, brandCategories } from "@/data/brands";
import { Search, ArrowRight, Package, Globe, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import SeoHead from "@/components/SeoHead";

export default function Brands() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = brands.filter(b => {
    const matchesSearch = !search || 
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.category.toLowerCase().includes(search.toLowerCase()) ||
      b.keywords.some(k => k.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = !activeCategory || b.categorySlug === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen" style={{ background: "var(--navy-900)" }}>
      <SeoHead
        title="Spare Parts Brands Wholesale Supplier UAE | Bulk OEM & Aftermarket Parts Dubai"
        description="Browse 54 spare parts brands available for bulk wholesale supply from Dubai. OEM and aftermarket parts for trucks, construction equipment, passenger vehicles, and more. B2B buyers only."
        canonical="https://procure.parts/brands"
        keywords="spare parts wholesale UAE, bulk spare parts Dubai, OEM parts supplier Middle East, aftermarket parts Africa, B2B parts procurement"
      />
      <PublicNav />

      {/* Hero */}
      <section className="relative pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full blur-3xl" style={{ background: "var(--electric-blue)" }} />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full blur-3xl" style={{ background: "var(--gold)" }} />
        </div>
        <div className="container relative z-10 text-center max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-6 border"
            style={{ background: "rgba(59,130,246,0.1)", borderColor: "rgba(59,130,246,0.3)", color: "var(--electric-blue)" }}>
            <Package size={12} />
            57 {t("brands")} · 6 {t("categories")} · {t("Global Wholesale Supply from Dubai")}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            {t("Bulk Parts Supply for the")}<br />
            <span style={{ color: "var(--gold)" }}>{t("World's Leading Brands")}</span>
          </h1>
          <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
            {t("From Scania trucks to Caterpillar excavators, Toyota fleets to BYD electric vehicles — we source genuine OEM and premium aftermarket parts in bulk from Dubai to your door.")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/apply" className="btn-primary inline-flex items-center gap-2">
              {t("Request Bulk Quote")} <ArrowRight size={16} />
            </Link>
            <Link href="/how-it-works" className="btn-secondary inline-flex items-center gap-2">
              {t("How It Works")}
            </Link>
          </div>
        </div>
      </section>

      {/* Search + Filter */}
      <section className="sticky top-16 z-20 border-b border-white/5 py-4" style={{ background: "var(--navy-900)" }}>
        <div className="container px-4 max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder={t("Search brands, categories, or part types...")}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-600 border border-white/10 focus:border-blue-500/50 focus:outline-none transition-colors"
                style={{ background: "var(--navy-800)" }}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  !activeCategory ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white border border-white/10"
                }`}
              >
                {t("All Brands")} ({brands.length})
              </button>
              {brandCategories.map(cat => (
                <button
                  key={cat.slug}
                  onClick={() => setActiveCategory(activeCategory === cat.slug ? null : cat.slug)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    activeCategory === cat.slug ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white border border-white/10"
                  }`}
                >
                  {cat.icon} {cat.name.split(" ")[0]} ({brands.filter(b => b.categorySlug === cat.slug).length})
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Category sections */}
      <section className="py-12">
        <div className="container px-4 max-w-6xl mx-auto">
          {(activeCategory ? brandCategories.filter(c => c.slug === activeCategory) : brandCategories).map(category => {
            const categoryBrands = filtered.filter(b => b.categorySlug === category.slug);
            if (categoryBrands.length === 0) return null;
            return (
              <div key={category.slug} className="mb-14">
                {/* Category header */}
                <div className="flex items-start justify-between mb-6 gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{category.icon}</span>
                      <h2 className="text-xl font-bold text-white">{t(category.name)}</h2>
                      <span className="text-xs px-2 py-1 rounded-full text-slate-400 border border-white/10">
                        {categoryBrands.length} {t("brands")}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 max-w-2xl">{t(category.description)}</p>
                  </div>
                  <Link
                    href={`/brands/category/${category.slug}`}
                    className="flex-shrink-0 flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {t("View category")} <ArrowRight size={12} />
                  </Link>
                </div>

                {/* Brand cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {categoryBrands.map(brand => (
                    <Link
                      key={brand.slug}
                      href={`/brands/${brand.slug}`}
                      className="group relative rounded-xl p-4 border border-white/8 hover:border-blue-500/40 transition-all duration-200 hover:-translate-y-0.5"
                      style={{ background: "var(--navy-800)" }}
                    >
                      <div className="w-10 h-10 rounded-lg mb-3 flex items-center justify-center text-lg font-bold"
                        style={{ background: "rgba(59,130,246,0.1)", color: "var(--electric-blue)" }}>
                        {brand.name[0]}
                      </div>
                      <div className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors leading-tight mb-1">
                        {brand.name}
                      </div>
                      <div className="text-xs text-slate-600 line-clamp-2">{brand.partTypes.slice(0, 2).join(", ")}</div>
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight size={12} className="text-blue-400" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Search size={40} className="text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No brands found for "{search}"</p>
              <button onClick={() => setSearch("")} className="mt-3 text-sm text-blue-400 hover:text-blue-300">
                {t("Clear search")}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-white/5">
        <div className="container px-4 max-w-4xl mx-auto text-center">
          <div className="rounded-2xl p-8 border border-white/8" style={{ background: "var(--navy-800)" }}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Globe size={20} className="text-blue-400" />
              <span className="text-sm font-semibold text-blue-400">{t("Global Wholesale Supply from Dubai")}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              {t("Need Parts for Any of These Brands?")}
            </h2>
            <p className="text-slate-400 mb-6 max-w-xl mx-auto">
              {t("Submit an RFQ and our procurement desk will source genuine OEM and premium aftermarket parts at wholesale prices — shipped to Africa, Middle East, Europe, and Southeast Asia.")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/apply" className="btn-primary inline-flex items-center gap-2">
                {t("Apply for Buyer Access")} <ArrowRight size={16} />
              </Link>
              <Link href="/how-it-works" className="btn-secondary inline-flex items-center gap-2">
                <Zap size={16} />
                {t("See How It Works")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="container px-4 max-w-6xl mx-auto text-center text-xs text-slate-600">
          <p>© {new Date().getFullYear()} Procure.parts · Operated by Imperial MEA General Trading LLC · Dubai, UAE</p>
          <p className="mt-1">{t("Bulk spare parts procurement for Africa, Middle East, Europe & Southeast Asia")}</p>
        </div>
      </footer>
    </div>
  );
}
