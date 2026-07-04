import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { blogPosts } from './blogData';
import { useBlogAnalytics } from '../context/BlogAnalyticsContext';

const { FiArrowLeft, FiCalendar, FiUser, FiClock, FiTag, FiChevronRight } = FiIcons;

const BlogPost = () => {
  const { slug } = useParams();
  const { trackBlogView } = useBlogAnalytics();
  const post = blogPosts.find(p => p.slug === slug);

  // Track blog view on mount
  useEffect(() => {
    if (post) {
      trackBlogView(post.id, post.slug, post.category, post.readTime);
    }
  }, [post, trackBlogView]);

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Article Not Found</h1>
          <p className="text-slate-400 mb-6">The article you're looking for doesn't exist.</p>
          <Link to="/blog" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors">
            <SafeIcon icon={FiArrowLeft} className="h-4 w-4" />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const relatedPosts = blogPosts
    .filter(p => p.tld === post.tld && p.id !== post.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-white/8 px-6 py-6 sticky top-0 z-40 bg-slate-950/95 backdrop-blur">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/blog" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-medium text-sm">
            <SafeIcon icon={FiArrowLeft} className="h-4 w-4" />
            Back to Blog
          </Link>
          <div className="flex items-center gap-2.5">
            <svg viewBox="0 0 36 36" width="24" height="24" fill="none">
              <circle cx="18" cy="18" r="16" stroke="#60a5fa" strokeWidth="1.8"/>
              <ellipse cx="18" cy="18" rx="7" ry="16" stroke="#60a5fa" strokeWidth="1.4"/>
              <line x1="2" y1="18" x2="34" y2="18" stroke="#60a5fa" strokeWidth="1.4"/>
            </svg>
            <span className="font-extrabold text-sm">Net<span className="text-blue-400">Zone</span></span>
          </div>
        </div>
      </header>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="text-xs bg-blue-500/20 text-blue-300 px-3 py-1.5 rounded-full font-semibold">{post.category}</span>
            <div className="flex flex-wrap gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <SafeIcon icon={FiCalendar} className="h-3.5 w-3.5" />
                {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <span className="flex items-center gap-1.5">
                <SafeIcon icon={FiClock} className="h-3.5 w-3.5" />
                {post.readTime}
              </span>
              <span className="flex items-center gap-1.5">
                <SafeIcon icon={FiUser} className="h-3.5 w-3.5" />
                {post.author}
              </span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl lg:text-5xl font-black mb-6 leading-tight">{post.title}</h1>

          {/* Featured Image */}
          <div className="aspect-video bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl overflow-hidden mb-12">
            <img src={post.image} alt={post.title} className="w-full h-full object-cover opacity-60 hover:opacity-80 transition-opacity" />
          </div>

          {/* Content */}
          <div className="prose prose-invert max-w-none mb-12 space-y-6">
            <div
              dangerouslySetInnerHTML={{ __html: post.content }}
              className="text-slate-300 leading-relaxed space-y-6"
              style={{
                '--tw-prose-body': '#cbd5e1',
                '--tw-prose-headings': '#f1f5f9',
                '--tw-prose-links': '#60a5fa',
              }}
            />
          </div>

          {/* Keywords */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-12">
            <h3 className="text-sm font-bold uppercase tracking-wide mb-3 text-slate-300">Key Takeaways</h3>
            <div className="flex flex-wrap gap-2">
              {post.keywords.map((keyword, i) => (
                <span key={i} className="text-xs bg-blue-500/20 text-blue-300 px-3 py-1.5 rounded-full">
                  <SafeIcon icon={FiTag} className="h-3 w-3 inline mr-1" />
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-8 text-center mb-12">
            <h3 className="text-xl font-bold mb-2">Ready to Own Your {post.tld.toUpperCase()} Domain?</h3>
            <p className="text-slate-400 mb-6">Find the perfect premium domain to build your brand.</p>
            <Link
              to="/browse"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Browse Domains <SafeIcon icon={FiChevronRight} className="h-4 w-4" />
            </Link>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div>
              <h3 className="text-2xl font-bold mb-6">Related Articles</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.map(related => (
                  <Link key={related.id}
                    to={`/blog/${related.slug}`}
                    className="group bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/8 hover:border-blue-500/30 transition-all">
                    <h4 className="font-bold text-sm mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">{related.title}</h4>
                    <p className="text-xs text-slate-500 mb-3">{related.readTime}</p>
                    <span className="text-xs text-blue-400 font-semibold">Read →</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </article>

      {/* Footer */}
      <footer className="border-t border-white/8 py-8 px-6 mt-16">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <svg viewBox="0 0 36 36" width="20" height="20" fill="none">
              <circle cx="18" cy="18" r="16" stroke="#60a5fa" strokeWidth="1.8"/>
              <ellipse cx="18" cy="18" rx="7" ry="16" stroke="#60a5fa" strokeWidth="1.4"/>
              <line x1="2" y1="18" x2="34" y2="18" stroke="#60a5fa" strokeWidth="1.4"/>
            </svg>
            <span className="font-extrabold text-sm text-white">Net<span className="text-blue-400">Zone</span></span>
          </div>
          <p className="text-slate-600 text-sm">
            Questions? <a href="mailto:ask@netzone.me" className="text-blue-400 hover:text-blue-300 font-medium">ask@netzone.me</a>
          </p>
          <p className="text-slate-700 text-xs">&copy; {new Date().getFullYear()} · Premium Domain Marketplace</p>
        </div>
      </footer>
    </div>
  );
};

export default BlogPost;
