import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { blogPosts } from './blogData';

const { FiArrowRight, FiCalendar, FiUser, FiTag, FiSearch, FiChevronRight } = FiIcons;

const BlogListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTld, setSelectedTld] = useState(null);

  const filtered = blogPosts.filter(post => {
    const matchSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchTld = !selectedTld || post.tld === selectedTld;
    return matchSearch && matchTld;
  });

  const meDomainCount = blogPosts.filter(p => p.tld === 'me').length;
  const africaCount = blogPosts.filter(p => p.tld === 'africa').length;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-white/8 px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2.5 mb-6">
            <svg viewBox="0 0 36 36" width="32" height="32" fill="none">
              <circle cx="18" cy="18" r="16" stroke="#60a5fa" strokeWidth="1.8"/>
              <ellipse cx="18" cy="18" rx="7" ry="16" stroke="#60a5fa" strokeWidth="1.4"/>
              <line x1="2" y1="18" x2="34" y2="18" stroke="#60a5fa" strokeWidth="1.4"/>
            </svg>
            <span className="font-extrabold text-lg">Net<span className="text-blue-400">Zone</span> Blog</span>
          </div>
          <h1 className="text-4xl font-black mb-2">Premium Domains Insights</h1>
          <p className="text-slate-400">Strategic guides for growing your business with .ME and .AFRICA domains</p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Search & Filter */}
        <div className="space-y-4 mb-10">
          <div className="relative">
            <SafeIcon icon={FiSearch} className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 outline-none focus:border-blue-500/50 focus:bg-white/8 transition-all"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTld(null)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                !selectedTld ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'
              }`}
            >
              All Articles
            </button>
            <button
              onClick={() => setSelectedTld('me')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                selectedTld === 'me' ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'
              }`}
            >
              .ME Domains ({meDomainCount})
            </button>
            <button
              onClick={() => setSelectedTld('africa')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                selectedTld === 'africa' ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'
              }`}
            >
              .AFRICA Domains ({africaCount})
            </button>
          </div>
        </div>

        {/* Blog Posts Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400">No articles match your search. Try different keywords.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {filtered.map((post, i) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/8 hover:border-blue-500/30 transition-all"
              >
                <div className="aspect-video bg-gradient-to-br from-blue-500/20 to-purple-500/20 overflow-hidden flex items-center justify-center">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded-full font-semibold">{post.category}</span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs text-slate-500">{post.readTime}</span>
                  </div>
                  <h2 className="text-lg font-bold mb-2 text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-sm text-slate-400 mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-white/8">
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <SafeIcon icon={FiCalendar} className="h-3.5 w-3.5" />
                        {new Date(post.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <SafeIcon icon={FiUser} className="h-3.5 w-3.5" />
                        {post.author}
                      </span>
                    </div>
                    <Link
                      to={`/blog/${post.slug}`}
                      className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors font-semibold text-xs"
                    >
                      Read <SafeIcon icon={FiArrowRight} className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="border-t border-white/8 mt-16 px-6 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to Find Your Perfect Domain?</h2>
          <p className="text-slate-400 mb-6">Explore premium .ME and .AFRICA domains to build your brand.</p>
          <Link
            to="/browse"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            Browse Domains <SafeIcon icon={FiChevronRight} className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/8 py-8 px-6 mt-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
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

export default BlogListPage;
