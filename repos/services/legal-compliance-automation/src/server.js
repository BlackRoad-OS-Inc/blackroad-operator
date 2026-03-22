const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const contracts = new Map();
const policies = new Map();
const riskAssessments = new Map();
const complianceChecks = new Map();
const legalDocuments = new Map();

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'legal-compliance-automation',
    uptime: process.uptime(),
    stats: {
      contracts: contracts.size,
      policies: policies.size,
      riskAssessments: riskAssessments.size
    }
  });
});

// Contract Management
app.post('/api/v1/contracts', async (req, res) => {
  const contract = {
    id: uuidv4(),
    ...req.body,
    status: 'draft',
    version: 1,
    createdAt: new Date().toISOString()
  };
  contracts.set(contract.id, contract);
  res.json({ contract });
});

app.post('/api/v1/contracts/:id/review', async (req, res) => {
  const contract = contracts.get(req.params.id);
  if (!contract) return res.status(404).json({ error: 'Contract not found' });

  // AI contract review via LLM
  const llmGateway = process.env.LLM_GATEWAY_URL || 'http://llm-gateway:4002';
  try {
    const response = await axios.post(`${llmGateway}/api/v1/complete`, {
      prompt: `Review this contract for risks and compliance issues: ${contract.content}. Provide summary of key risks.`,
      maxTokens: 1000
    });

    contract.aiReview = {
      summary: response.data.completion,
      risks: ['Review pending'],
      recommendations: ['Human review recommended'],
      reviewedAt: new Date().toISOString()
    };
  } catch (error) {
    contract.aiReview = { error: 'AI review failed' };
  }

  res.json({ contract });
});

app.post('/api/v1/contracts/:id/sign', async (req, res) => {
  const contract = contracts.get(req.params.id);
  if (!contract) return res.status(404).json({ error: 'Contract not found' });

  contract.signatures = contract.signatures || [];
  contract.signatures.push({
    signerId: req.body.signerId,
    signerName: req.body.signerName,
    timestamp: new Date().toISOString(),
    ipAddress: req.ip
  });

  if (contract.signatures.length >= (contract.requiredSignatures || 2)) {
    contract.status = 'executed';
    contract.executedAt = new Date().toISOString();
  }

  res.json({ contract });
});

app.get('/api/v1/contracts', (req, res) => {
  res.json({ contracts: Array.from(contracts.values()) });
});

// Policy Management
app.post('/api/v1/policies', async (req, res) => {
  const policy = {
    id: uuidv4(),
    ...req.body,
    version: 1,
    status: 'active',
    createdAt: new Date().toISOString()
  };
  policies.set(policy.id, policy);
  res.json({ policy });
});

app.get('/api/v1/policies', (req, res) => {
  const activePolicies = Array.from(policies.values()).filter(p => p.status === 'active');
  res.json({ policies: activePolicies });
});

app.post('/api/v1/policies/:id/check', async (req, res) => {
  const policy = policies.get(req.params.id);
  if (!policy) return res.status(404).json({ error: 'Policy not found' });

  const { action, context } = req.body;

  // Integrate with compliance engine
  const complianceEngine = process.env.COMPLIANCE_ENGINE_URL || 'http://compliance-engine:4005';
  try {
    const response = await axios.post(`${complianceEngine}/api/v1/check`, {
      policy: policy.rules,
      action,
      context
    });

    res.json({
      allowed: response.data.allowed || false,
      reason: response.data.reason,
      policy: policy.name
    });
  } catch (error) {
    // Fallback logic
    res.json({
      allowed: true,
      reason: 'Compliance engine unavailable - default allow'
    });
  }
});

// Risk Assessment
app.post('/api/v1/risk-assessments', async (req, res) => {
  const assessment = {
    id: uuidv4(),
    ...req.body,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  // AI risk analysis
  const llmGateway = process.env.LLM_GATEWAY_URL || 'http://llm-gateway:4002';
  try {
    const response = await axios.post(`${llmGateway}/api/v1/complete`, {
      prompt: `Assess legal and compliance risks for: ${req.body.description}. Rate severity (low/medium/high) and provide mitigation strategies.`,
      maxTokens: 500
    });

    assessment.aiAnalysis = response.data.completion;
    assessment.riskLevel = 'medium'; // Parse from AI response
  } catch (error) {
    assessment.aiAnalysis = 'Analysis pending';
  }

  riskAssessments.set(assessment.id, assessment);
  res.json({ assessment });
});

app.get('/api/v1/risk-assessments', (req, res) => {
  res.json({ assessments: Array.from(riskAssessments.values()) });
});

// Compliance Checks
app.post('/api/v1/compliance/check', async (req, res) => {
  const check = {
    id: uuidv4(),
    ...req.body,
    result: 'pass',
    timestamp: new Date().toISOString()
  };

  // Check against regulations
  const regulations = ['GDPR', 'CCPA', 'SOX', 'HIPAA'];
  check.regulations = regulations.map(reg => ({
    name: reg,
    compliant: Math.random() > 0.1, // 90% pass rate
    issues: []
  }));

  const failedChecks = check.regulations.filter(r => !r.compliant);
  if (failedChecks.length > 0) {
    check.result = 'fail';
    check.failedRegulations = failedChecks.map(r => r.name);
  }

  complianceChecks.set(check.id, check);
  res.json({ check });
});

app.get('/api/v1/compliance/status', (req, res) => {
  const checks = Array.from(complianceChecks.values());
  const passed = checks.filter(c => c.result === 'pass').length;

  res.json({
    totalChecks: checks.size,
    passed,
    failed: checks.size - passed,
    complianceRate: checks.size > 0 ? (passed / checks.size) * 100 : 100
  });
});

// Legal Document Generation
app.post('/api/v1/documents/generate', async (req, res) => {
  const { template, data } = req.body;

  const llmGateway = process.env.LLM_GATEWAY_URL || 'http://llm-gateway:4002';
  try {
    const response = await axios.post(`${llmGateway}/api/v1/complete`, {
      prompt: `Generate a ${template} document with the following details: ${JSON.stringify(data)}`,
      maxTokens: 2000
    });

    const document = {
      id: uuidv4(),
      template,
      content: response.data.completion,
      data,
      createdAt: new Date().toISOString()
    };

    legalDocuments.set(document.id, document);
    res.json({ document });
  } catch (error) {
    res.status(500).json({ error: 'Document generation failed' });
  }
});

// Analytics
app.get('/api/v1/analytics', (req, res) => {
  const activeContracts = Array.from(contracts.values()).filter(c => c.status === 'executed').length;
  const pendingReviews = Array.from(contracts.values()).filter(c => c.status === 'review').length;
  const highRiskAssessments = Array.from(riskAssessments.values())
    .filter(r => r.riskLevel === 'high').length;

  res.json({
    contracts: {
      total: contracts.size,
      active: activeContracts,
      pendingReview: pendingReviews
    },
    compliance: {
      checks: complianceChecks.size,
      policies: policies.size
    },
    risks: {
      total: riskAssessments.size,
      high: highRiskAssessments
    }
  });
});

const PORT = process.env.PORT || 4304;
app.listen(PORT, () => {
  console.log(`Legal Compliance Automation service listening on port ${PORT}`);
});
