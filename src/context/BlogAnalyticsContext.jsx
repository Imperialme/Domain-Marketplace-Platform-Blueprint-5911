import React, { createContext, useContext, useState, useEffect } from 'react';

const BlogAnalyticsContext = createContext();

export const useBlogAnalytics = () => {
  const context = useContext(BlogAnalyticsContext);
  if (!context) {
    throw new Error('useBlogAnalytics must be used within BlogAnalyticsProvider');
  }
  return context;
};

export const BlogAnalyticsProvider = ({ children }) => {
  const [blogViews, setBlogViews] = useState([]);
  const [blogMetrics, setBlogMetrics] = useState({});
  const BLOG_ANALYTICS_KEY = 'netzone_blog_analytics';

  // Load existing analytics on mount
  useEffect(() => {
    loadBlogAnalytics();
  }, []);

  const loadBlogAnalytics = async () => {
    try {
      const stored = localStorage.getItem(BLOG_ANALYTICS_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        setBlogViews(data.views || []);
        setBlogMetrics(data.metrics || {});
      }
    } catch (error) {
      console.error('Error loading blog analytics:', error);
    }
  };

  const saveBlogAnalytics = async (views, metrics) => {
    try {
      localStorage.setItem(BLOG_ANALYTICS_KEY, JSON.stringify({
        views,
        metrics,
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error saving blog analytics:', error);
    }
  };

  const trackBlogView = (articleId, articleSlug, articleCategory, readTime) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    // Create view record
    const viewRecord = {
      id: `${articleId}-${now.getTime()}`,
      article_id: articleId,
      article_slug: articleSlug,
      article_category: articleCategory,
      read_time: readTime,
      timestamp: now.toISOString(),
      referrer: document.referrer || 'direct',
      user_agent: navigator.userAgent,
      device: getDeviceType(),
      browser: getBrowserInfo()
    };

    const newViews = [...blogViews, viewRecord];

    // Update metrics
    const newMetrics = { ...blogMetrics };
    if (!newMetrics[articleId]) {
      newMetrics[articleId] = {
        article_id: articleId,
        article_slug: articleSlug,
        article_category: articleCategory,
        total_views: 0,
        unique_visitors: new Set(),
        average_read_time: 0,
        last_viewed: null
      };
    }

    newMetrics[articleId].total_views += 1;
    newMetrics[articleId].unique_visitors.add(viewRecord.user_agent + viewRecord.device);
    newMetrics[articleId].last_viewed = now.toISOString();

    setBlogViews(newViews);
    setBlogMetrics(newMetrics);
    saveBlogAnalytics(newViews, convertMetricsToJSON(newMetrics));
  };

  const getDeviceType = () => {
    const ua = navigator.userAgent;
    if (/mobile|android|iphone|ipad|phone/i.test(ua.toLowerCase())) return 'Mobile';
    if (/tablet|ipad/i.test(ua.toLowerCase())) return 'Tablet';
    return 'Desktop';
  };

  const getBrowserInfo = () => {
    const ua = navigator.userAgent;
    if (ua.indexOf('Firefox') > -1) return 'Firefox';
    if (ua.indexOf('Chrome') > -1) return 'Chrome';
    if (ua.indexOf('Safari') > -1) return 'Safari';
    if (ua.indexOf('Edge') > -1) return 'Edge';
    return 'Other';
  };

  const convertMetricsToJSON = (metrics) => {
    const result = {};
    Object.entries(metrics).forEach(([key, value]) => {
      result[key] = {
        ...value,
        unique_visitors: Array.from(value.unique_visitors || new Set()).length
      };
    });
    return result;
  };

  const getBlogMetrics = () => {
    const totalViews = blogViews.length;
    const uniqueArticles = new Set(blogViews.map(v => v.article_id)).size;
    const topArticles = Object.values(blogMetrics)
      .sort((a, b) => b.total_views - a.total_views)
      .slice(0, 10);

    const byCategory = {};
    blogViews.forEach(view => {
      const cat = view.article_category;
      byCategory[cat] = (byCategory[cat] || 0) + 1;
    });

    return {
      total_blog_views: totalViews,
      unique_articles: uniqueArticles,
      top_articles: topArticles,
      views_by_category: byCategory,
      average_views_per_article: totalViews > 0 ? (totalViews / uniqueArticles).toFixed(2) : 0
    };
  };

  const getBlogAnalyticsByDay = (days = 30) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const byDay = {};
    const now = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      byDay[dateStr] = 0;
    }

    blogViews
      .filter(v => new Date(v.timestamp) > cutoff)
      .forEach(view => {
        const dateStr = view.timestamp.split('T')[0];
        if (byDay[dateStr] !== undefined) {
          byDay[dateStr]++;
        }
      });

    return Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, views]) => ({ date, views }));
  };

  const getArticleMetrics = (articleId) => {
    return blogMetrics[articleId] || null;
  };

  return (
    <BlogAnalyticsContext.Provider value={{
      blogViews,
      blogMetrics,
      trackBlogView,
      getBlogMetrics,
      getBlogAnalyticsByDay,
      getArticleMetrics
    }}>
      {children}
    </BlogAnalyticsContext.Provider>
  );
};
