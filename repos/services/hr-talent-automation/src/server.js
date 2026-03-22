const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// In-memory storage
const employees = new Map();
const candidates = new Map();
const positions = new Map();
const performanceReviews = new Map();
const trainings = new Map();

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'hr-talent-automation',
    uptime: process.uptime(),
    stats: {
      employees: employees.size,
      candidates: candidates.size,
      openPositions: positions.size
    }
  });
});

// Employee Management
app.post('/api/v1/employees', async (req, res) => {
  const employee = {
    id: uuidv4(),
    ...req.body,
    status: 'active',
    hireDate: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };
  employees.set(employee.id, employee);
  res.json({ employee });
});

app.get('/api/v1/employees', (req, res) => {
  res.json({ employees: Array.from(employees.values()) });
});

app.get('/api/v1/employees/:id', (req, res) => {
  const employee = employees.get(req.params.id);
  if (!employee) return res.status(404).json({ error: 'Employee not found' });
  res.json({ employee });
});

// Recruiting
app.post('/api/v1/positions', async (req, res) => {
  const position = {
    id: uuidv4(),
    ...req.body,
    status: 'open',
    applicants: [],
    createdAt: new Date().toISOString()
  };
  positions.set(position.id, position);
  res.json({ position });
});

app.post('/api/v1/candidates', async (req, res) => {
  const candidate = {
    id: uuidv4(),
    ...req.body,
    status: 'applied',
    appliedAt: new Date().toISOString()
  };
  candidates.set(candidate.id, candidate);

  // Add to position applicants
  const position = positions.get(req.body.positionId);
  if (position) {
    position.applicants.push(candidate.id);
  }

  res.json({ candidate });
});

app.post('/api/v1/candidates/:id/screen', async (req, res) => {
  const candidate = candidates.get(req.params.id);
  if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

  // AI screening (integrate with LLM Gateway)
  const llmGateway = process.env.LLM_GATEWAY_URL || 'http://llm-gateway:4002';

  try {
    const response = await axios.post(`${llmGateway}/api/v1/complete`, {
      prompt: `Screen this candidate: ${JSON.stringify(candidate)}. Provide a hiring recommendation.`,
      maxTokens: 500
    });

    candidate.screening = {
      score: Math.floor(Math.random() * 100),
      recommendation: response.data.completion || 'Consider for interview',
      timestamp: new Date().toISOString()
    };

    res.json({ candidate });
  } catch (error) {
    res.status(500).json({ error: 'Screening failed' });
  }
});

// Performance Management
app.post('/api/v1/reviews', async (req, res) => {
  const review = {
    id: uuidv4(),
    ...req.body,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  performanceReviews.set(review.id, review);
  res.json({ review });
});

app.get('/api/v1/reviews/employee/:employeeId', (req, res) => {
  const reviews = Array.from(performanceReviews.values())
    .filter(r => r.employeeId === req.params.employeeId);
  res.json({ reviews });
});

// Training & Development
app.post('/api/v1/trainings', async (req, res) => {
  const training = {
    id: uuidv4(),
    ...req.body,
    participants: [],
    createdAt: new Date().toISOString()
  };
  trainings.set(training.id, training);
  res.json({ training });
});

app.post('/api/v1/trainings/:id/enroll', async (req, res) => {
  const training = trainings.get(req.params.id);
  if (!training) return res.status(404).json({ error: 'Training not found' });

  training.participants.push(req.body.employeeId);
  res.json({ training });
});

// Onboarding
app.post('/api/v1/onboarding', async (req, res) => {
  const { employeeId } = req.body;

  const onboarding = {
    id: uuidv4(),
    employeeId,
    tasks: [
      { name: 'Complete paperwork', status: 'pending' },
      { name: 'IT setup', status: 'pending' },
      { name: 'Security training', status: 'pending' },
      { name: 'Meet team', status: 'pending' },
      { name: '30-day check-in', status: 'pending' }
    ],
    startedAt: new Date().toISOString()
  };

  res.json({ onboarding });
});

const PORT = process.env.PORT || 4300;
app.listen(PORT, () => {
  console.log(`HR Talent Automation service listening on port ${PORT}`);
});
