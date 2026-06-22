import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { fetchGeoData } from '../utils/geo';

const VisitorContext = createContext();

export const useVisitor = () => {
  const context = useContext(VisitorContext);
  if (!context) throw new Error('useVisitor must be used within VisitorProvider');
  return context;
};

const generateSessionId = () =>
  'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

const getBrowserInfo = () => {
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  if (ua.includes('Chrome') && !ua.includes('Edg') && !ua.includes('OPR')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('OPR')) browser = 'Opera';

  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
  const isTablet = /iPad|Tablet/i.test(ua);
  const device = isTablet ? 'Tablet' : isMobile ? 'Mobile' : 'Desktop';

  return { browser, device };
};

const getUtmParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get('utm_source') || '',
    utmMedium: params.get('utm_medium') || '',
    utmCampaign: params.get('utm_campaign') || '',
    utmContent: params.get('utm_content') || '',
  };
};

const parseReferrerSource = (referrer) => {
  if (!referrer) return 'Direct';
  try {
    const hostname = new URL(referrer).hostname.replace('www.', '');
    const map = {
      'google.com': 'Google', 'google.co': 'Google',
      'bing.com': 'Bing', 'yahoo.com': 'Yahoo',
      'facebook.com': 'Facebook', 'fb.com': 'Facebook',
      'twitter.com': 'Twitter/X', 'x.com': 'Twitter/X',
      'linkedin.com': 'LinkedIn', 'instagram.com': 'Instagram',
      'reddit.com': 'Reddit', 'youtube.com': 'YouTube',
      'tiktok.com': 'TikTok', 'pinterest.com': 'Pinterest',
    };
    for (const [key, val] of Object.entries(map)) {
      if (hostname.includes(key)) return val;
    }
    return hostname;
  } catch {
    return 'Unknown';
  }
};

const SESSIONS_KEY = 'dm_visitor_sessions';

const loadSessions = () => {
  try {
    return JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]');
  } catch {
    return [];
  }
};

const persistSessions = (sessions) => {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.slice(-2000)));
  } catch {
    // storage full - trim older entries
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.slice(-500)));
  }
};

export const VisitorProvider = ({ children }) => {
  const [sessions, setSessions] = useState(loadSessions);
  const [currentSession, setCurrentSession] = useState(null);
  const sessionIdRef = useRef(null);

  const startSession = useCallback((domainName) => {
    const sessionId = generateSessionId();
    sessionIdRef.current = sessionId;

    const { browser, device } = getBrowserInfo();
    const utmParams = getUtmParams();
    const referrer = document.referrer;

    const session = {
      sessionId,
      domainName,
      startTime: new Date().toISOString(),
      endTime: null,
      referrer: referrer || null,
      referrerSource: parseReferrerSource(referrer),
      ...utmParams,
      browser,
      device,
      screenWidth: window.screen.width,
      language: navigator.language || 'en',
      // geo fields — filled in async after session is created
      ip: null,
      country: null,
      countryName: null,
      city: null,
      region: null,
      timezone: null,
      currency: null,
      isp: null,
      latitude: null,
      longitude: null,
      // prices the visitor typed in the offer field (even without submitting)
      pricesTyped: [],
      lastPriceTyped: null,
      // form interaction flags
      formStarted: false,
      formAbandoned: false,
      formSubmitted: false,
      inquiryId: null,
    };

    setCurrentSession(session);
    setSessions(prev => {
      const updated = [...prev, session];
      persistSessions(updated);
      return updated;
    });

    // Fetch geo data asynchronously — updates session once resolved
    fetchGeoData().then(geo => {
      if (!geo || !Object.keys(geo).length) return;
      setSessions(prev => {
        const updated = prev.map(s =>
          s.sessionId === sessionId ? { ...s, ...geo } : s
        );
        persistSessions(updated);
        return updated;
      });
      setCurrentSession(prev =>
        prev?.sessionId === sessionId ? { ...prev, ...geo } : prev
      );
    });

    return sessionId;
  }, []);

  const updateSession = useCallback((updates) => {
    const id = sessionIdRef.current;
    if (!id) return;

    setSessions(prev => {
      const updated = prev.map(s => s.sessionId === id ? { ...s, ...updates } : s);
      persistSessions(updated);
      return updated;
    });
    setCurrentSession(prev => (prev ? { ...prev, ...updates } : prev));
  }, []);

  const trackPriceTyped = useCallback((price) => {
    const numericPrice = parseFloat(price);
    if (!sessionIdRef.current || isNaN(numericPrice) || numericPrice <= 0) return;

    setSessions(prev => {
      const updated = prev.map(s => {
        if (s.sessionId !== sessionIdRef.current) return s;
        const pricesTyped = [...(s.pricesTyped || [])];
        if (!pricesTyped.includes(numericPrice)) pricesTyped.push(numericPrice);
        return { ...s, pricesTyped, lastPriceTyped: numericPrice };
      });
      persistSessions(updated);
      return updated;
    });
  }, []);

  const trackEmailEntered = useCallback((email) => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) return;
    updateSession({ emailCaptured: email });
  }, [updateSession]);

  const trackFormStarted = useCallback(() => updateSession({ formStarted: true }), [updateSession]);

  const trackFormAbandoned = useCallback(() => {
    updateSession({ formAbandoned: true, endTime: new Date().toISOString() });
  }, [updateSession]);

  const trackFormSubmitted = useCallback((inquiryId) => {
    updateSession({
      formSubmitted: true,
      formAbandoned: false,
      inquiryId,
      endTime: new Date().toISOString(),
    });
  }, [updateSession]);

  const getSessionsForDomain = useCallback((domainName) =>
    sessions.filter(s => s.domainName === domainName),
  [sessions]);

  const getAbandonedSessions = useCallback(() =>
    sessions.filter(s => s.formStarted && !s.formSubmitted),
  [sessions]);

  const getAllSessions = useCallback(() =>
    [...sessions].sort((a, b) => new Date(b.startTime) - new Date(a.startTime)),
  [sessions]);

  const clearSessions = useCallback(() => {
    setSessions([]);
    localStorage.removeItem(SESSIONS_KEY);
  }, []);

  // Detect form abandonment on page leave
  useEffect(() => {
    const handleUnload = () => {
      const id = sessionIdRef.current;
      if (!id) return;
      const raw = JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]');
      const updated = raw.map(s => {
        if (s.sessionId !== id) return s;
        if (s.formStarted && !s.formSubmitted) {
          return { ...s, formAbandoned: true, endTime: new Date().toISOString() };
        }
        return { ...s, endTime: new Date().toISOString() };
      });
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  const value = {
    currentSession,
    sessions,
    startSession,
    updateSession,
    trackEmailEntered,
    trackPriceTyped,
    trackFormStarted,
    trackFormAbandoned,
    trackFormSubmitted,
    getSessionsForDomain,
    getAbandonedSessions,
    getAllSessions,
    clearSessions,
  };

  return (
    <VisitorContext.Provider value={value}>
      {children}
    </VisitorContext.Provider>
  );
};
