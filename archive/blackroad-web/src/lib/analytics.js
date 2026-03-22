// BlackRoad Analytics — Consent-first, lightweight client tracker
// No cookies. No fingerprinting. No PII. Just page views + events.
//
// Usage:
//   import { trackPageView, trackEvent, usePageTracking } from './analytics';
//   trackEvent('checkout_click', { plan: 'pro' });
//   usePageTracking(); // in App.jsx — auto-tracks route changes

const ANALYTICS_URL = 'https://analytics-blackroad.amundsonalexa.workers.dev';

// Session ID: random per tab, no persistence across sessions
let sessionId = null;
function getSessionId() {
  if (!sessionId) {
    sessionId = crypto.randomUUID?.() ||
      Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  }
  return sessionId;
}

// Beacon: fire-and-forget, doesn't block navigation
function beacon(endpoint, data) {
  try {
    const body = JSON.stringify({ ...data, session_id: getSessionId() });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(`${ANALYTICS_URL}${endpoint}`, body);
    } else {
      fetch(`${ANALYTICS_URL}${endpoint}`, {
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      }).catch(() => {});
    }
  } catch {}
}

// ── Public API ──

export function trackPageView(path) {
  beacon('/pageview', {
    path: path || window.location.pathname + window.location.hash,
    hostname: window.location.hostname,
    referrer: document.referrer || '',
    screen_w: window.screen?.width || 0,
    screen_h: window.screen?.height || 0,
    lang: navigator.language?.slice(0, 10) || '',
  });
}

export function trackEvent(name, props = {}) {
  beacon('/event', {
    name,
    path: window.location.pathname + window.location.hash,
    hostname: window.location.hostname,
    props,
  });
}

// Session heartbeat — send duration on unload
let sessionStart = Date.now();
function sendHeartbeat() {
  beacon('/session', {
    duration_ms: Date.now() - sessionStart,
  });
}

// ── React hook: auto-track page views on route change ──
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export function usePageTracking() {
  const location = useLocation();
  const prevPath = useRef('');

  useEffect(() => {
    const currentPath = location.pathname + location.hash;
    if (currentPath !== prevPath.current) {
      trackPageView(currentPath);
      prevPath.current = currentPath;
    }
  }, [location]);

  // Send session duration on page unload
  useEffect(() => {
    window.addEventListener('beforeunload', sendHeartbeat);
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') sendHeartbeat();
    });
    return () => {
      window.removeEventListener('beforeunload', sendHeartbeat);
    };
  }, []);
}

// ── Fetch stats (for dashboard) ──
export async function fetchAnalyticsStats(range = '24h') {
  try {
    const res = await fetch(`${ANALYTICS_URL}/stats?range=${range}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchAnalyticsDashboard(key, range = '7d') {
  try {
    const res = await fetch(`${ANALYTICS_URL}/dashboard?range=${range}&key=${key}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
