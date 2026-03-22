const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const leads = new Map();
const campaigns = new Map();
const customers = new Map();
const deals = new Map();
const emails = new Map();

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'marketing-sales-automation',
    uptime: process.uptime(),
    stats: {
      leads: leads.size,
      campaigns: campaigns.size,
      customers: customers.size,
      deals: deals.size
    }
  });
});

// Lead Management
app.post('/api/v1/leads', async (req, res) => {
  const lead = {
    id: uuidv4(),
    ...req.body,
    status: 'new',
    score: 0,
    createdAt: new Date().toISOString()
  };

  // AI lead scoring
  const llmGateway = process.env.LLM_GATEWAY_URL || 'http://llm-gateway:4002';
  try {
    const response = await axios.post(`${llmGateway}/api/v1/complete`, {
      prompt: `Score this lead from 0-100 based on fit: ${JSON.stringify(lead)}`,
      maxTokens: 50
    });
    lead.score = parseInt(response.data.completion) || Math.floor(Math.random() * 100);
  } catch (error) {
    lead.score = 50;
  }

  leads.set(lead.id, lead);
  res.json({ lead });
});

app.get('/api/v1/leads', (req, res) => {
  const { status, minScore } = req.query;
  let filteredLeads = Array.from(leads.values());

  if (status) filteredLeads = filteredLeads.filter(l => l.status === status);
  if (minScore) filteredLeads = filteredLeads.filter(l => l.score >= parseInt(minScore));

  res.json({ leads: filteredLeads });
});

app.post('/api/v1/leads/:id/convert', async (req, res) => {
  const lead = leads.get(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });

  const customer = {
    id: uuidv4(),
    ...lead,
    leadId: lead.id,
    convertedAt: new Date().toISOString()
  };

  customers.set(customer.id, customer);
  lead.status = 'converted';
  lead.customerId = customer.id;

  res.json({ customer });
});

// Campaign Management
app.post('/api/v1/campaigns', async (req, res) => {
  const campaign = {
    id: uuidv4(),
    ...req.body,
    status: 'draft',
    metrics: {
      sent: 0,
      opened: 0,
      clicked: 0,
      converted: 0
    },
    createdAt: new Date().toISOString()
  };
  campaigns.set(campaign.id, campaign);
  res.json({ campaign });
});

app.post('/api/v1/campaigns/:id/launch', async (req, res) => {
  const campaign = campaigns.get(req.params.id);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

  campaign.status = 'active';
  campaign.launchedAt = new Date().toISOString();

  // AI content generation
  const llmGateway = process.env.LLM_GATEWAY_URL || 'http://llm-gateway:4002';
  try {
    const response = await axios.post(`${llmGateway}/api/v1/complete`, {
      prompt: `Generate marketing email for campaign: ${campaign.name}. Topic: ${campaign.description}`,
      maxTokens: 500
    });
    campaign.generatedContent = response.data.completion;
  } catch (error) {
    console.error('Content generation failed');
  }

  res.json({ campaign });
});

app.get('/api/v1/campaigns', (req, res) => {
  res.json({ campaigns: Array.from(campaigns.values()) });
});

// Email Marketing
app.post('/api/v1/emails/send', async (req, res) => {
  const email = {
    id: uuidv4(),
    ...req.body,
    status: 'sent',
    sentAt: new Date().toISOString()
  };
  emails.set(email.id, email);

  // Update campaign metrics
  if (req.body.campaignId) {
    const campaign = campaigns.get(req.body.campaignId);
    if (campaign) campaign.metrics.sent++;
  }

  res.json({ email });
});

app.post('/api/v1/emails/:id/track', async (req, res) => {
  const email = emails.get(req.params.id);
  if (!email) return res.status(404).json({ error: 'Email not found' });

  const { event } = req.body; // 'opened', 'clicked'
  email.events = email.events || [];
  email.events.push({
    type: event,
    timestamp: new Date().toISOString()
  });

  // Update campaign metrics
  if (email.campaignId) {
    const campaign = campaigns.get(email.campaignId);
    if (campaign && event === 'opened') campaign.metrics.opened++;
    if (campaign && event === 'clicked') campaign.metrics.clicked++;
  }

  res.json({ email });
});

// Deal/Opportunity Management
app.post('/api/v1/deals', async (req, res) => {
  const deal = {
    id: uuidv4(),
    ...req.body,
    stage: 'prospecting',
    probability: 10,
    createdAt: new Date().toISOString()
  };
  deals.set(deal.id, deal);
  res.json({ deal });
});

app.put('/api/v1/deals/:id', async (req, res) => {
  const deal = deals.get(req.params.id);
  if (!deal) return res.status(404).json({ error: 'Deal not found' });

  Object.assign(deal, req.body);
  deal.updatedAt = new Date().toISOString();

  res.json({ deal });
});

app.post('/api/v1/deals/:id/close', async (req, res) => {
  const deal = deals.get(req.params.id);
  if (!deal) return res.status(404).json({ error: 'Deal not found' });

  deal.stage = req.body.won ? 'won' : 'lost';
  deal.closedAt = new Date().toISOString();

  res.json({ deal });
});

app.get('/api/v1/deals', (req, res) => {
  res.json({ deals: Array.from(deals.values()) });
});

// Analytics
app.get('/api/v1/analytics', (req, res) => {
  const totalLeads = leads.size;
  const convertedLeads = Array.from(leads.values()).filter(l => l.status === 'converted').length;
  const activeCampaigns = Array.from(campaigns.values()).filter(c => c.status === 'active').length;
  const totalRevenue = Array.from(deals.values())
    .filter(d => d.stage === 'won')
    .reduce((sum, d) => sum + (d.amount || 0), 0);

  res.json({
    leads: {
      total: totalLeads,
      converted: convertedLeads,
      conversionRate: totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0
    },
    campaigns: {
      active: activeCampaigns,
      total: campaigns.size
    },
    revenue: {
      total: totalRevenue,
      deals: deals.size
    }
  });
});

const PORT = process.env.PORT || 4302;
app.listen(PORT, () => {
  console.log(`Marketing Sales Automation service listening on port ${PORT}`);
});
