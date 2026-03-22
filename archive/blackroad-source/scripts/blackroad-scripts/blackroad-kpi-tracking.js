// BlackRoad KPI Tracking System
// Real-time analytics integration for all 60 products

class BlackRoadKPITracker {
    constructor() {
        this.products = [
            // Wave 1
            'vllm', 'ollama', 'localai', 'headscale', 'minio', 'netbird',
            'restic', 'authelia', 'espocrm', 'focalboard', 'whisper',
            // Wave 2
            'clickhouse', 'synapse', 'taiga', 'dendrite', 'suitecrm',
            'arangodb', 'borg', 'innernet', 'tts', 'vosk',
            // Wave 3
            'mattermost', 'gitlab', 'nextcloud', 'keycloak', 'grafana',
            'prometheus', 'vault', 'rabbitmq', 'redis', 'postgresql',
            // Wave 4
            'ansible', 'jenkins', 'harbor', 'consul', 'etcd',
            'traefik', 'nginx', 'caddy', 'haproxy',
            // Wave 5
            'opensearch', 'loki', 'victoriametrics', 'cortex', 'thanos',
            'rook', 'longhorn', 'velero', 'argocd', 'flux',
            // Wave 6
            'temporal', 'prefect', 'airflow', 'backstage', 'jaeger',
            'zipkin', 'falco', 'cilium', 'linkerd', 'istio'
        ];

        this.kpis = {
            traffic: {},
            conversions: {},
            engagement: {},
            revenue: {}
        };
    }

    // Track page view
    trackPageView(product, page, userId = null) {
        const event = {
            type: 'pageview',
            product: product,
            page: page,
            userId: userId,
            timestamp: Date.now(),
            sessionId: this.getSessionId(),
            referrer: document.referrer,
            userAgent: navigator.userAgent
        };

        this.sendEvent(event);
        this.updateLocalKPIs('pageview', product);
    }

    // Track conversion event
    trackConversion(product, conversionType, value = 0) {
        const event = {
            type: 'conversion',
            product: product,
            conversionType: conversionType, // 'trial', 'demo', 'paid'
            value: value,
            timestamp: Date.now(),
            sessionId: this.getSessionId()
        };

        this.sendEvent(event);
        this.updateLocalKPIs('conversion', product, conversionType, value);
    }

    // Track user engagement
    trackEngagement(product, action, metadata = {}) {
        const event = {
            type: 'engagement',
            product: product,
            action: action, // 'scroll', 'click', 'video_play', 'download', etc.
            metadata: metadata,
            timestamp: Date.now(),
            sessionId: this.getSessionId()
        };

        this.sendEvent(event);
    }

    // Track time on page
    trackTimeOnPage(product, page, duration) {
        const event = {
            type: 'time_on_page',
            product: product,
            page: page,
            duration: duration, // in seconds
            timestamp: Date.now()
        };

        this.sendEvent(event);
    }

    // Track bounce
    trackBounce(product, page) {
        const event = {
            type: 'bounce',
            product: product,
            page: page,
            timestamp: Date.now()
        };

        this.sendEvent(event);
    }

    // Track search
    trackSearch(product, query, resultsCount) {
        const event = {
            type: 'search',
            product: product,
            query: query,
            resultsCount: resultsCount,
            timestamp: Date.now()
        };

        this.sendEvent(event);
    }

    // Track error
    trackError(product, errorType, errorMessage) {
        const event = {
            type: 'error',
            product: product,
            errorType: errorType,
            errorMessage: errorMessage,
            timestamp: Date.now(),
            url: window.location.href
        };

        this.sendEvent(event);
    }

    // Send event to analytics backend
    sendEvent(event) {
        // In production, send to analytics service
        // Examples: Google Analytics, Plausible, Mixpanel, PostHog

        // For now, send to our BlackRoad analytics endpoint
        fetch('https://analytics.blackroad.io/api/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': this.getApiKey()
            },
            body: JSON.stringify(event)
        }).catch(err => {
            console.error('Analytics error:', err);
            // Queue event for retry
            this.queueEvent(event);
        });

        // Also log to console in development
        if (this.isDevelopment()) {
            console.log('📊 BlackRoad Analytics Event:', event);
        }
    }

    // Update local KPI cache
    updateLocalKPIs(type, product, subtype = null, value = 0) {
        if (!this.kpis[type]) {
            this.kpis[type] = {};
        }

        if (!this.kpis[type][product]) {
            this.kpis[type][product] = {
                count: 0,
                value: 0,
                lastUpdated: Date.now()
            };
        }

        this.kpis[type][product].count++;
        this.kpis[type][product].value += value;
        this.kpis[type][product].lastUpdated = Date.now();

        // Save to localStorage
        localStorage.setItem('blackroad_kpis', JSON.stringify(this.kpis));
    }

    // Get session ID
    getSessionId() {
        let sessionId = sessionStorage.getItem('blackroad_session_id');
        if (!sessionId) {
            sessionId = this.generateSessionId();
            sessionStorage.setItem('blackroad_session_id', sessionId);
        }
        return sessionId;
    }

    // Generate session ID
    generateSessionId() {
        return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Get API key
    getApiKey() {
        return 'pk_blackroad_' + btoa(window.location.hostname);
    }

    // Check if development
    isDevelopment() {
        return window.location.hostname === 'localhost' ||
               window.location.hostname === '127.0.0.1';
    }

    // Queue event for retry
    queueEvent(event) {
        let queue = JSON.parse(localStorage.getItem('blackroad_event_queue') || '[]');
        queue.push(event);
        localStorage.setItem('blackroad_event_queue', JSON.stringify(queue));
    }

    // Retry queued events
    retryQueuedEvents() {
        let queue = JSON.parse(localStorage.getItem('blackroad_event_queue') || '[]');
        if (queue.length === 0) return;

        queue.forEach(event => {
            this.sendEvent(event);
        });

        localStorage.setItem('blackroad_event_queue', '[]');
    }

    // Get current KPIs
    getCurrentKPIs() {
        return this.kpis;
    }

    // Get KPIs for specific product
    getProductKPIs(product) {
        const productKPIs = {};
        Object.keys(this.kpis).forEach(type => {
            if (this.kpis[type][product]) {
                productKPIs[type] = this.kpis[type][product];
            }
        });
        return productKPIs;
    }
}

// Initialize tracker
const tracker = new BlackRoadKPITracker();

// Export for use in pages
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlackRoadKPITracker;
}

// Global access
window.BlackRoadKPI = tracker;

// Auto-track page views
window.addEventListener('load', () => {
    const product = window.location.pathname.split('/')[1] || 'homepage';
    const page = window.location.pathname;
    tracker.trackPageView(product, page);
});

// Auto-track time on page
let timeOnPageStart = Date.now();
window.addEventListener('beforeunload', () => {
    const product = window.location.pathname.split('/')[1] || 'homepage';
    const page = window.location.pathname;
    const duration = Math.floor((Date.now() - timeOnPageStart) / 1000);
    tracker.trackTimeOnPage(product, page, duration);
});

// Retry queued events on connection restore
window.addEventListener('online', () => {
    tracker.retryQueuedEvents();
});

console.log('🖤 BlackRoad KPI Tracker initialized 🛣️');
