// BlackRoad KPI Analytics API
// Backend service for collecting and aggregating website KPIs

import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// In-memory store (use Redis/PostgreSQL in production)
const kpiStore = {
    events: [],
    aggregated: {
        daily: {},
        weekly: {},
        monthly: {}
    }
};

// KPI Categories
const KPI_CATEGORIES = {
    TRAFFIC: 'traffic',
    CONVERSION: 'conversion',
    ENGAGEMENT: 'engagement',
    REVENUE: 'revenue',
    RETENTION: 'retention'
};

// Event endpoint
app.post('/api/events', async (req, res) => {
    try {
        const event = {
            ...req.body,
            receivedAt: Date.now(),
            ip: req.ip,
            userAgent: req.headers['user-agent']
        };

        // Validate event
        if (!event.type || !event.product || !event.timestamp) {
            return res.status(400).json({ error: 'Invalid event data' });
        }

        // Store event
        kpiStore.events.push(event);

        // Aggregate in real-time
        aggregateEvent(event);

        res.status(200).json({ success: true, eventId: event.timestamp });
    } catch (error) {
        console.error('Event processing error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get KPIs endpoint
app.get('/api/kpis', async (req, res) => {
    const { product, timeRange = '7d', category } = req.query;

    try {
        const kpis = getKPIs(product, timeRange, category);
        res.status(200).json(kpis);
    } catch (error) {
        console.error('KPI fetch error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all products KPIs
app.get('/api/kpis/all', async (req, res) => {
    const { timeRange = '7d' } = req.query;

    try {
        const allKPIs = getAllProductsKPIs(timeRange);
        res.status(200).json(allKPIs);
    } catch (error) {
        console.error('All KPIs fetch error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get funnel data
app.get('/api/funnel', async (req, res) => {
    const { product, timeRange = '7d' } = req.query;

    try {
        const funnelData = getFunnelData(product, timeRange);
        res.status(200).json(funnelData);
    } catch (error) {
        console.error('Funnel data error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Aggregate event
function aggregateEvent(event) {
    const date = new Date(event.timestamp);
    const day = date.toISOString().split('T')[0];

    if (!kpiStore.aggregated.daily[day]) {
        kpiStore.aggregated.daily[day] = {
            pageviews: 0,
            uniqueVisitors: new Set(),
            conversions: 0,
            revenue: 0,
            byProduct: {}
        };
    }

    const dayData = kpiStore.aggregated.daily[day];

    // Update based on event type
    switch (event.type) {
        case 'pageview':
            dayData.pageviews++;
            dayData.uniqueVisitors.add(event.sessionId);

            if (!dayData.byProduct[event.product]) {
                dayData.byProduct[event.product] = {
                    pageviews: 0,
                    conversions: 0,
                    revenue: 0
                };
            }
            dayData.byProduct[event.product].pageviews++;
            break;

        case 'conversion':
            dayData.conversions++;
            if (event.value) {
                dayData.revenue += event.value;
            }

            if (dayData.byProduct[event.product]) {
                dayData.byProduct[event.product].conversions++;
                dayData.byProduct[event.product].revenue += event.value || 0;
            }
            break;
    }
}

// Get KPIs
function getKPIs(product, timeRange, category) {
    const now = new Date();
    const days = parseInt(timeRange);

    let totalPageviews = 0;
    let totalConversions = 0;
    let totalRevenue = 0;
    let uniqueVisitors = new Set();

    // Aggregate over time range
    for (let i = 0; i < days; i++) {
        const date = new Date(now - i * 24 * 60 * 60 * 1000);
        const day = date.toISOString().split('T')[0];
        const dayData = kpiStore.aggregated.daily[day];

        if (dayData) {
            if (product) {
                const productData = dayData.byProduct[product];
                if (productData) {
                    totalPageviews += productData.pageviews;
                    totalConversions += productData.conversions;
                    totalRevenue += productData.revenue;
                }
            } else {
                totalPageviews += dayData.pageviews;
                totalConversions += dayData.conversions;
                totalRevenue += dayData.revenue;
                dayData.uniqueVisitors.forEach(v => uniqueVisitors.add(v));
            }
        }
    }

    return {
        timeRange,
        product: product || 'all',
        pageviews: totalPageviews,
        uniqueVisitors: uniqueVisitors.size,
        conversions: totalConversions,
        revenue: totalRevenue,
        conversionRate: totalPageviews > 0 ? (totalConversions / totalPageviews * 100).toFixed(2) : 0,
        avgRevenuePerConversion: totalConversions > 0 ? (totalRevenue / totalConversions).toFixed(2) : 0
    };
}

// Get all products KPIs
function getAllProductsKPIs(timeRange) {
    const products = [
        'vllm', 'ollama', 'localai', 'headscale', 'minio', 'netbird',
        'restic', 'authelia', 'espocrm', 'focalboard', 'whisper',
        'clickhouse', 'synapse', 'taiga', 'dendrite', 'suitecrm',
        'arangodb', 'borg', 'innernet', 'tts', 'vosk',
        'mattermost', 'gitlab', 'nextcloud', 'keycloak', 'grafana',
        'prometheus', 'vault', 'rabbitmq', 'redis', 'postgresql',
        'ansible', 'jenkins', 'harbor', 'consul', 'etcd',
        'traefik', 'nginx', 'caddy', 'haproxy',
        'opensearch', 'loki', 'victoriametrics', 'cortex', 'thanos',
        'rook', 'longhorn', 'velero', 'argocd', 'flux',
        'temporal', 'prefect', 'airflow', 'backstage', 'jaeger',
        'zipkin', 'falco', 'cilium', 'linkerd', 'istio'
    ];

    const allKPIs = {};
    products.forEach(product => {
        allKPIs[product] = getKPIs(product, timeRange);
    });

    return allKPIs;
}

// Get funnel data
function getFunnelData(product, timeRange) {
    // Simplified funnel calculation
    const kpis = getKPIs(product, timeRange);

    return {
        landingPageViews: kpis.pageviews,
        productPageViews: Math.floor(kpis.pageviews * 0.618), // Golden Ratio
        pricingPageViews: Math.floor(kpis.pageviews * 0.382), // Golden Ratio
        trialSignups: Math.floor(kpis.pageviews * 0.095),
        paidConversions: kpis.conversions
    };
}

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        uptime: process.uptime(),
        eventsProcessed: kpiStore.events.length
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🖤 BlackRoad KPI API running on port ${PORT} 🛣️`);
});

export default app;
