import { Link, useParams } from "wouter";
import PublicNav from "@/components/PublicNav";
import { useLanguage } from "@/contexts/LanguageContext";
import { getBlogPost, blogPosts } from "@/data/blog";
import { ArrowLeft, ArrowRight, Clock, Tag, ExternalLink } from "lucide-react";

export default function BlogPostPage() {
  const { t } = useLanguage();
  const params = useParams<{ slug: string }>();
  const post = getBlogPost(params.slug || "");

  if (!post) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <PublicNav />
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">{t("Article Not Found")}</h1>
          <Link href="/blog" className="text-blue-400 hover:text-blue-300 text-sm">
            ← {t("Back to Blog")}
          </Link>
        </div>
      </div>
    );
  }

  const related = blogPosts
    .filter(p => p.slug !== post.slug && (p.category === post.category || p.brandSlug === post.brandSlug))
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-navy">
      <PublicNav />

      {/* Article */}
      <article className="pt-28 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-600 mb-8">
            <Link href="/" className="hover:text-slate-400 transition-colors">{t("Home")}</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-slate-400 transition-colors">{t("Blog")}</Link>
            <span>/</span>
            <span className="text-slate-500 truncate max-w-xs">{post.title}</span>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-600/20 text-blue-300 border border-blue-500/20">
              {t(post.category)}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              {post.readingMinutes} {t("min read")}
            </span>
            <span className="text-xs text-slate-500">
              {new Date(post.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </span>
            {post.brandName && (
              <Link href={`/brands/${post.brandSlug}`} className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                <Tag className="w-3 h-3" />
                {post.brandName} {t("Parts")} <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>

          {/* Title */}
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight">
            {post.title}
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed mb-8 border-l-2 border-blue-500/40 pl-4">
            {post.subtitle}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-10 pb-8 border-b border-slate-800">
            {post.tags.map(tag => (
              <span key={tag} className="px-2.5 py-1 rounded-full text-xs text-slate-500 border border-slate-700">
                {tag}
              </span>
            ))}
          </div>

          {/* Content */}
          <div
            className="prose-custom"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Brand CTA */}
          {post.brandSlug && post.brandName && (
            <div className="mt-12 p-6 rounded-2xl border border-blue-500/20 bg-blue-500/5">
              <h3 className="font-display font-bold text-white mb-2">
                {t("Source")} {post.brandName} {t("Parts Through Procure.parts")}
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                {t("View the full parts catalogue, submit an RFQ, and receive a formal quotation within 24–48 working hours.")}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href={`/brands/${post.brandSlug}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white border border-blue-500/30 hover:border-blue-400/50 bg-blue-600/10 hover:bg-blue-600/20 transition-all"
                >
                  {t("View")} {post.brandName} {t("Parts")} <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/apply"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all glow-blue"
                >
                  {t("REQUEST ACCESS")} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Generic CTA */}
          {!post.brandSlug && (
            <div className="mt-12 p-6 rounded-2xl border border-blue-500/20 bg-blue-500/5">
              <h3 className="font-display font-bold text-white mb-2">
                {t("Ready to source smarter?")}
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                {t("Apply for verified buyer access and submit your first RFQ within 24 hours of approval.")}
              </p>
              <Link
                href="/apply"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all glow-blue"
              >
                {t("REQUEST ACCESS")} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Copyright notice */}
          <div className="mt-10 pt-6 border-t border-slate-800">
            <p className="text-xs text-slate-600 leading-relaxed">
              © 2026 Imperial MEA General Trading LLC. {t("All rights reserved. This article is original content published on Procure.parts. Reproduction, distribution, or republication in any form without written permission is strictly prohibited.")}
            </p>
          </div>
        </div>
      </article>

      {/* Related articles */}
      {related.length > 0 && (
        <section className="py-12 border-t border-blue-900/20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-lg font-bold text-white mb-6">{t("Related Articles")}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map(p => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group card-premium border border-blue-900/20 hover:border-blue-500/30 p-4 transition-all"
                >
                  <p className="text-xs text-slate-500 mb-2">{t(p.category)}</p>
                  <h3 className="text-xs font-semibold text-white group-hover:text-blue-300 transition-colors leading-snug line-clamp-3">
                    {p.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Back nav */}
      <div className="py-8 border-t border-blue-900/20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> {t("Back to Blog")}
          </Link>
        </div>
      </div>

      <footer className="border-t border-blue-900/20 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-slate-600">
            © 2026 Imperial MEA General Trading LLC · procure.parts
          </p>
        </div>
      </footer>
    </div>
  );
}
