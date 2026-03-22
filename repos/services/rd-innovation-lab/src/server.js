const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const projects = new Map();
const experiments = new Map();
const patents = new Map();
const publications = new Map();
const collaborations = new Map();

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'rd-innovation-lab',
    uptime: process.uptime(),
    stats: {
      projects: projects.size,
      experiments: experiments.size,
      patents: patents.size
    }
  });
});

// Project Management
app.post('/api/v1/projects', async (req, res) => {
  const project = {
    id: uuidv4(),
    ...req.body,
    status: 'planning',
    stage: 'ideation',
    team: req.body.team || [],
    budget: req.body.budget || 0,
    createdAt: new Date().toISOString()
  };
  projects.set(project.id, project);
  res.json({ project });
});

app.get('/api/v1/projects', (req, res) => {
  const { status } = req.query;
  let filteredProjects = Array.from(projects.values());

  if (status) {
    filteredProjects = filteredProjects.filter(p => p.status === status);
  }

  res.json({ projects: filteredProjects });
});

app.post('/api/v1/projects/:id/advance', async (req, res) => {
  const project = projects.get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const stages = ['ideation', 'research', 'prototype', 'testing', 'production'];
  const currentIndex = stages.indexOf(project.stage);

  if (currentIndex < stages.length - 1) {
    project.stage = stages[currentIndex + 1];
    project.lastAdvanced = new Date().toISOString();
  }

  res.json({ project });
});

// Experiment Tracking
app.post('/api/v1/experiments', async (req, res) => {
  const experiment = {
    id: uuidv4(),
    ...req.body,
    status: 'setup',
    results: [],
    createdAt: new Date().toISOString()
  };
  experiments.set(experiment.id, experiment);
  res.json({ experiment });
});

app.post('/api/v1/experiments/:id/run', async (req, res) => {
  const experiment = experiments.get(req.params.id);
  if (!experiment) return res.status(404).json({ error: 'Experiment not found' });

  experiment.status = 'running';
  experiment.startedAt = new Date().toISOString();

  // Simulate experiment (replace with actual lab integration)
  setTimeout(() => {
    experiment.status = 'completed';
    experiment.completedAt = new Date().toISOString();
    experiment.results.push({
      timestamp: new Date().toISOString(),
      data: { success: Math.random() > 0.3 },
      notes: 'Experiment completed successfully'
    });
  }, 1000);

  res.json({ experiment });
});

app.post('/api/v1/experiments/:id/results', async (req, res) => {
  const experiment = experiments.get(req.params.id);
  if (!experiment) return res.status(404).json({ error: 'Experiment not found' });

  experiment.results.push({
    timestamp: new Date().toISOString(),
    data: req.body.data,
    notes: req.body.notes
  });

  // AI analysis of results
  const llmGateway = process.env.LLM_GATEWAY_URL || 'http://llm-gateway:4002';
  try {
    const response = await axios.post(`${llmGateway}/api/v1/complete`, {
      prompt: `Analyze these experiment results: ${JSON.stringify(experiment.results)}. Provide insights and next steps.`,
      maxTokens: 500
    });

    experiment.aiAnalysis = response.data.completion;
  } catch (error) {
    experiment.aiAnalysis = 'Analysis pending';
  }

  res.json({ experiment });
});

app.get('/api/v1/experiments', (req, res) => {
  res.json({ experiments: Array.from(experiments.values()) });
});

// Patent Management
app.post('/api/v1/patents', async (req, res) => {
  const patent = {
    id: uuidv4(),
    patentNumber: `PAT-${Date.now()}`,
    ...req.body,
    status: 'draft',
    filingDate: null,
    grantDate: null,
    createdAt: new Date().toISOString()
  };
  patents.set(patent.id, patent);
  res.json({ patent });
});

app.post('/api/v1/patents/:id/file', async (req, res) => {
  const patent = patents.get(req.params.id);
  if (!patent) return res.status(404).json({ error: 'Patent not found' });

  patent.status = 'filed';
  patent.filingDate = new Date().toISOString();
  patent.filingOffice = req.body.office || 'USPTO';

  res.json({ patent });
});

app.get('/api/v1/patents', (req, res) => {
  res.json({ patents: Array.from(patents.values()) });
});

// Research Publications
app.post('/api/v1/publications', async (req, res) => {
  const publication = {
    id: uuidv4(),
    ...req.body,
    status: 'draft',
    citations: 0,
    createdAt: new Date().toISOString()
  };
  publications.set(publication.id, publication);
  res.json({ publication });
});

app.post('/api/v1/publications/:id/publish', async (req, res) => {
  const publication = publications.get(req.params.id);
  if (!publication) return res.status(404).json({ error: 'Publication not found' });

  publication.status = 'published';
  publication.publishedAt = new Date().toISOString();
  publication.journal = req.body.journal;
  publication.doi = `10.1000/${publication.id}`;

  res.json({ publication });
});

app.get('/api/v1/publications', (req, res) => {
  res.json({ publications: Array.from(publications.values()) });
});

// Research Collaboration
app.post('/api/v1/collaborations', async (req, res) => {
  const collaboration = {
    id: uuidv4(),
    ...req.body,
    status: 'active',
    meetings: [],
    sharedResources: [],
    createdAt: new Date().toISOString()
  };
  collaborations.set(collaboration.id, collaboration);
  res.json({ collaboration });
});

app.post('/api/v1/collaborations/:id/meeting', async (req, res) => {
  const collaboration = collaborations.get(req.params.id);
  if (!collaboration) return res.status(404).json({ error: 'Collaboration not found' });

  collaboration.meetings.push({
    id: uuidv4(),
    date: req.body.date,
    attendees: req.body.attendees,
    notes: req.body.notes,
    createdAt: new Date().toISOString()
  });

  res.json({ collaboration });
});

// Innovation Pipeline
app.get('/api/v1/pipeline', (req, res) => {
  const pipeline = {
    ideation: Array.from(projects.values()).filter(p => p.stage === 'ideation').length,
    research: Array.from(projects.values()).filter(p => p.stage === 'research').length,
    prototype: Array.from(projects.values()).filter(p => p.stage === 'prototype').length,
    testing: Array.from(projects.values()).filter(p => p.stage === 'testing').length,
    production: Array.from(projects.values()).filter(p => p.stage === 'production').length
  };

  res.json({ pipeline });
});

// Idea Generation (AI-powered)
app.post('/api/v1/ideas/generate', async (req, res) => {
  const { domain, constraints } = req.body;

  const llmGateway = process.env.LLM_GATEWAY_URL || 'http://llm-gateway:4002';
  try {
    const response = await axios.post(`${llmGateway}/api/v1/complete`, {
      prompt: `Generate 5 innovative research ideas in the domain of ${domain}. Constraints: ${constraints || 'none'}. Format as numbered list with brief descriptions.`,
      maxTokens: 1000
    });

    res.json({
      ideas: response.data.completion,
      domain,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Idea generation failed' });
  }
});

// Analytics
app.get('/api/v1/analytics', (req, res) => {
  const activeProjects = Array.from(projects.values()).filter(p => p.status === 'active').length;
  const completedExperiments = Array.from(experiments.values()).filter(e => e.status === 'completed').length;
  const filedPatents = Array.from(patents.values()).filter(p => p.status === 'filed').length;

  res.json({
    projects: {
      total: projects.size,
      active: activeProjects
    },
    experiments: {
      total: experiments.size,
      completed: completedExperiments
    },
    patents: {
      total: patents.size,
      filed: filedPatents
    },
    publications: publications.size,
    collaborations: collaborations.size
  });
});

const PORT = process.env.PORT || 4305;
app.listen(PORT, () => {
  console.log(`R&D Innovation Lab service listening on port ${PORT}`);
});
