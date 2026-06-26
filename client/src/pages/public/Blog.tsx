import { useState } from "react";
import { Link } from "wouter";
import PublicNav from "@/components/PublicNav";
import { useLanguage } from "@/contexts/LanguageContext";
import SeoHead from "@/components/SeoHead";
import { blogPosts, blogCategories } from "@/data/blog";
import { ArrowRight, Clock, Tag } from "lucide-react";

export default function Blog() {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = activeCategory === "All"
    ? blogPosts
    : blogPosts.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-navy">
      <SeoHead
        title="Blog | Procure.parts — Spare Parts Procurement Insights"
        description="Expert articles on spare parts procurement, OEM vs aftermarket decisions, fleet management, and industrial supply chain for buyers in Middle East, Africa, and Southeast Asia."
        canonical="https://procure.parts/blog"
        keywords="spare parts procurement blog, OEM aftermarket insights, fleet management spare parts, industrial supply chain Middle East"
      />
      <PublicNav />

      {/* Hero */}
      <section className="pt-28 pb-16 border-b border-blue-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-400 text-xs font-semibold tracking-wider uppercase mb-4">
              {t("Procurement Intelligence")}
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
              {t("The Procure.parts")}{" "}<span className="text-blue-400">{t("Blog")}</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed">
              {t("Expert analysis on industrial spare parts procurement, brand guides, market intelligence, and supply chain strategy for buyers in Africa, the Middle East, and beyond.")}
            </p>
          </div>
        </div>
      </section>

      {/* Category filter */}
      <section className="py-6 border-b border-blue-900/20 sticky top-16 z-30"
        style={{ background: "rgba(10, 18, 30, 0.97)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap gap-2">
          {["All", ...blogCategories].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                activeCategory === cat
                  ? "bg-blue-600/20 border-blue-500 text-blue-300"
                  : "border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300"
              }`}
            >
              {t(cat)} {cat !== "All" && `(${blogPosts.filter(p => p.category === cat).length})`}
            </button>
          ))}
        </div>
      </section>

      {/* Articles grid */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Featured article */}
          {filtered.length > 0 && (
            <div className="mb-10">
              <Link
                href={`/blog/${filtered[0].slug}`}
                className="group block card-premium border border-blue-900/20 hover:border-blue-500/30 p-8 transition-all duration-200"
              >
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-600/20 text-blue-300 border border-blue-500/20">
                        {t("Featured")}
                      </span>
                      <span className="text-xs text-slate-500">{t(filtered[0].category)}</span>
                    </div>
                    <h2 className="font-display text-2xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors leading-tight">
                      {filtered[0].title}
                    </h2>
                    <p className="text-slate-400 text-sm leading-relaxed mb-5">{filtered[0].excerpt}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {filtered[0].readingMinutes} {t("min read")}
                      </span>
                      <span>{new Date(filtered[0].publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
                      {filtered[0].brandName && (
                        <span className="flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5" />
                          {filtered[0].brandName}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center lg:flex-shrink-0">
                    <div className="flex items-center gap-2 text-blue-400 text-sm font-medium group-hover:gap-3 transition-all">
                      {t("Read article")} <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Remaining articles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.slice(1).map(post => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group card-premium border border-blue-900/20 hover:border-blue-500/30 p-6 transition-all duration-200 hover:scale-[1.01] flex flex-col"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-medium text-slate-500">{t(post.category)}</span>
                </div>
                <h3 className="font-display font-bold text-white text-sm leading-snug mb-3 group-hover:text-blue-300 transition-colors flex-1">
                  {post.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-slate-600 mt-auto pt-3 border-t border-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    {post.readingMinutes} {t("min")}
                  </span>
                  <span>{new Date(post.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                </div>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-slate-500 text-sm">{t("No articles in this category yet.")}</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-blue-900/20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-display text-2xl font-bold text-white mb-3">
            {t("Ready to source smarter?")}
          </h2>
          <p className="text-slate-400 mb-6 text-sm">
            {t("Apply for verified buyer access and submit your first RFQ within 24 hours of approval.")}
          </p>
          <Link href="/apply" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all duration-200 glow-blue text-sm">
            {t("REQUEST ACCESS")} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-blue-900/20 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-slate-600">
            © 2026 Imperial MEA General Trading LLC · {t("All content is original and protected by copyright.")}
          </p>
        </div>
      </footer>
    </div>
  );
}
