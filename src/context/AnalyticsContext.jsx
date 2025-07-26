import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDomains } from './DomainContext';
import { useInquiries } from './InquiryContext';

const AnalyticsContext = createContext();

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

export const AnalyticsProvider = ({ children }) => {
  const { domains } = useDomains();
  const { inquiries } = useInquiries();
  const [events, setEvents] = useState([]);
  const [pageViews, setPageViews] = useState([]);
  const [conversionData, setConversionData] = useState([]);

  // Mock analytics data generation
  useEffect(() => {
    generateMockAnalytics();
  }, [domains, inquiries]);

  const generateMockAnalytics = () => {
    const now = new Date();
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      return date;
    }).reverse();

    // Generate page views
    const mockPageViews = last30Days.map(date => ({
      date: date.toISOString().split('T')[0],
      views: Math.floor(Math.random() * 200) + 50,
      uniqueVisitors: Math.floor(Math.random() * 150) + 30,
      bounceRate: (Math.random() * 0.4 + 0.3).toFixed(2),
      avgSessionDuration: Math.floor(Math.random() * 300) + 120
    }));

    // Generate events
    const mockEvents = [];
    domains.forEach(domain => {
      last30Days.forEach(date => {
        const eventCount = Math.floor(Math.random() * 10);
        for (let i = 0; i < eventCount; i++) {
          mockEvents.push({
            id: `${domain.id}-${date.getTime()}-${i}`,
            domain_id: domain.id,
            domain_name: domain.domain_name,
            event_type: ['page_view', 'inquiry_form_view', 'inquiry_submit'][Math.floor(Math.random() * 3)],
            timestamp: new Date(date.getTime() + Math.random() * 86400000).toISOString(),
            user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`,
            referrer: ['google.com', 'direct', 'facebook.com', 'twitter.com'][Math.floor(Math.random() * 4)],
            location: ['US', 'UK', 'CA', 'AU', 'DE'][Math.floor(Math.random() * 5)]
          });
        }
      });
    });

    // Generate conversion data
    const mockConversions = last30Days.map(date => ({
      date: date.toISOString().split('T')[0],
      pageViews: Math.floor(Math.random() * 200) + 50,
      inquiries: Math.floor(Math.random() * 10) + 1,
      conversionRate: ((Math.floor(Math.random() * 10) + 1) / (Math.floor(Math.random() * 200) + 50) * 100).toFixed(2)
    }));

    setPageViews(mockPageViews);
    setEvents(mockEvents);
    setConversionData(mockConversions);
  };

  const trackEvent = (eventType, domainId, metadata = {}) => {
    const newEvent = {
      id: Date.now(),
      domain_id: domainId,
      event_type: eventType,
      timestamp: new Date().toISOString(),
      metadata,
      user_agent: navigator.userAgent,
      referrer: document.referrer
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const getDomainAnalytics = (domainId, timeRange = 30) => {
    const domainEvents = events.filter(e => e.domain_id === domainId);
    const domainInquiries = inquiries.filter(i => i.domain_id === domainId);
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeRange);
    
    const recentEvents = domainEvents.filter(e => new Date(e.timestamp) > cutoffDate);
    const recentInquiries = domainInquiries.filter(i => new Date(i.created_at) > cutoffDate);
    
    return {
      totalViews: recentEvents.filter(e => e.event_type === 'page_view').length,
      uniqueVisitors: new Set(recentEvents.map(e => e.ip_address)).size,
      inquiries: recentInquiries.length,
      conversionRate: recentEvents.length > 0 ? (recentInquiries.length / recentEvents.length * 100).toFixed(2) : 0,
      topReferrers: getTopReferrers(recentEvents),
      viewsByDay: getViewsByDay(recentEvents, timeRange)
    };
  };

  const getTopReferrers = (events) => {
    const referrerCounts = {};
    events.forEach(event => {
      const referrer = event.referrer || 'direct';
      referrerCounts[referrer] = (referrerCounts[referrer] || 0) + 1;
    });
    
    return Object.entries(referrerCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([referrer, count]) => ({ referrer, count }));
  };

  const getViewsByDay = (events, days) => {
    const viewsByDay = {};
    const now = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      viewsByDay[dateStr] = 0;
    }
    
    events.forEach(event => {
      const dateStr = event.timestamp.split('T')[0];
      if (viewsByDay[dateStr] !== undefined) {
        viewsByDay[dateStr]++;
      }
    });
    
    return Object.entries(viewsByDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, views]) => ({ date, views }));
  };

  const getOverallMetrics = () => {
    const totalPageViews = pageViews.reduce((sum, day) => sum + day.views, 0);
    const totalUniqueVisitors = pageViews.reduce((sum, day) => sum + day.uniqueVisitors, 0);
    const avgBounceRate = (pageViews.reduce((sum, day) => sum + parseFloat(day.bounceRate), 0) / pageViews.length).toFixed(2);
    const avgSessionDuration = Math.floor(pageViews.reduce((sum, day) => sum + day.avgSessionDuration, 0) / pageViews.length);
    
    return {
      totalPageViews,
      totalUniqueVisitors,
      avgBounceRate,
      avgSessionDuration,
      totalInquiries: inquiries.length,
      conversionRate: totalPageViews > 0 ? (inquiries.length / totalPageViews * 100).toFixed(2) : 0
    };
  };

  const value = {
    events,
    pageViews,
    conversionData,
    trackEvent,
    getDomainAnalytics,
    getOverallMetrics
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};