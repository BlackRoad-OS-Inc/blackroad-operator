const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

// Campus data
const campuses = new Map();
const spaces = new Map();
const avatars = new Map();
const meetings = new Map();
const connectedUsers = new Map();

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'metaverse-campus',
    uptime: process.uptime(),
    stats: {
      campuses: campuses.size,
      spaces: spaces.size,
      connectedUsers: connectedUsers.size,
      activeMeetings: Array.from(meetings.values()).filter(m => m.status === 'active').length
    }
  });
});

// Campus Management
app.post('/api/v1/campuses', async (req, res) => {
  const campus = {
    id: uuidv4(),
    ...req.body,
    location: req.body.location || { city: 'Virtual', coordinates: [0, 0, 0] },
    capacity: req.body.capacity || 1000,
    currentOccupancy: 0,
    createdAt: new Date().toISOString()
  };

  // Generate Unity world for this campus
  try {
    const unityResponse = await axios.post('http://unity:4050/api/v1/generate', {
      projectName: `Campus_${campus.name}`,
      sceneName: 'MainCampus',
      worldConfig: {
        size: campus.size || 'large',
        buildings: campus.buildings || []
      }
    });
    campus.unityProject = unityResponse.data.projectPath;
  } catch (error) {
    console.error('Unity generation failed:', error.message);
  }

  campuses.set(campus.id, campus);
  res.json({ campus });
});

app.get('/api/v1/campuses', (req, res) => {
  const { city } = req.query;
  let filteredCampuses = Array.from(campuses.values());

  if (city) {
    filteredCampuses = filteredCampuses.filter(c => c.location.city === city);
  }

  res.json({ campuses: filteredCampuses });
});

app.get('/api/v1/campuses/:id', (req, res) => {
  const campus = campuses.get(req.params.id);
  if (!campus) return res.status(404).json({ error: 'Campus not found' });
  res.json({ campus });
});

// Virtual Spaces (offices, meeting rooms, etc)
app.post('/api/v1/spaces', async (req, res) => {
  const space = {
    id: uuidv4(),
    ...req.body,
    type: req.body.type || 'office', // office, meeting-room, auditorium, lounge
    capacity: req.body.capacity || 10,
    currentUsers: [],
    assets: req.body.assets || [],
    position: req.body.position || { x: 0, y: 0, z: 0 },
    createdAt: new Date().toISOString()
  };

  spaces.set(space.id, space);

  // Add to campus
  if (req.body.campusId) {
    const campus = campuses.get(req.body.campusId);
    if (campus) {
      campus.spaces = campus.spaces || [];
      campus.spaces.push(space.id);
    }
  }

  res.json({ space });
});

app.get('/api/v1/spaces', (req, res) => {
  const { campusId, type } = req.query;
  let filteredSpaces = Array.from(spaces.values());

  if (campusId) {
    const campus = campuses.get(campusId);
    if (campus && campus.spaces) {
      filteredSpaces = filteredSpaces.filter(s => campus.spaces.includes(s.id));
    }
  }

  if (type) {
    filteredSpaces = filteredSpaces.filter(s => s.type === type);
  }

  res.json({ spaces: filteredSpaces });
});

// Avatar Management
app.post('/api/v1/avatars', async (req, res) => {
  const avatar = {
    id: uuidv4(),
    userId: req.body.userId,
    name: req.body.name || 'Guest',
    model: req.body.model || 'default',
    appearance: req.body.appearance || {},
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    createdAt: new Date().toISOString()
  };

  avatars.set(avatar.id, avatar);
  res.json({ avatar });
});

app.get('/api/v1/avatars/:userId', (req, res) => {
  const avatar = Array.from(avatars.values()).find(a => a.userId === req.params.userId);
  if (!avatar) return res.status(404).json({ error: 'Avatar not found' });
  res.json({ avatar });
});

// Virtual Meetings
app.post('/api/v1/meetings', async (req, res) => {
  const meeting = {
    id: uuidv4(),
    ...req.body,
    status: 'scheduled',
    participants: [],
    spaceId: req.body.spaceId,
    startTime: req.body.startTime || new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  meetings.set(meeting.id, meeting);
  res.json({ meeting });
});

app.post('/api/v1/meetings/:id/join', async (req, res) => {
  const meeting = meetings.get(req.params.id);
  if (!meeting) return res.status(404).json({ error: 'Meeting not found' });

  const { userId, avatarId } = req.body;

  meeting.participants.push({
    userId,
    avatarId,
    joinedAt: new Date().toISOString()
  });

  if (meeting.status === 'scheduled') {
    meeting.status = 'active';
  }

  // Update space occupancy
  const space = spaces.get(meeting.spaceId);
  if (space) {
    space.currentUsers.push(userId);
  }

  res.json({ meeting });
});

app.post('/api/v1/meetings/:id/end', async (req, res) => {
  const meeting = meetings.get(req.params.id);
  if (!meeting) return res.status(404).json({ error: 'Meeting not found' });

  meeting.status = 'ended';
  meeting.endedAt = new Date().toISOString();

  // Clear space
  const space = spaces.get(meeting.spaceId);
  if (space) {
    space.currentUsers = [];
  }

  res.json({ meeting });
});

app.get('/api/v1/meetings', (req, res) => {
  const { status } = req.query;
  let filteredMeetings = Array.from(meetings.values());

  if (status) {
    filteredMeetings = filteredMeetings.filter(m => m.status === status);
  }

  res.json({ meetings: filteredMeetings });
});

// WebSocket for real-time sync
wss.on('connection', (ws, req) => {
  const userId = req.url.split('userId=')[1];
  console.log(`User connected to metaverse: ${userId}`);

  connectedUsers.set(userId, ws);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      handleMetaverseMessage(ws, userId, data);
    } catch (error) {
      console.error('WebSocket error:', error);
    }
  });

  ws.on('close', () => {
    connectedUsers.delete(userId);
    console.log(`User disconnected: ${userId}`);

    // Remove from all spaces
    spaces.forEach(space => {
      space.currentUsers = space.currentUsers.filter(u => u !== userId);
    });
  });
});

function handleMetaverseMessage(ws, userId, data) {
  switch (data.type) {
    case 'avatar-move':
      broadcastToSpace(data.spaceId, {
        type: 'avatar-moved',
        userId,
        position: data.position,
        rotation: data.rotation
      }, userId);
      break;

    case 'voice-data':
      broadcastToSpace(data.spaceId, {
        type: 'voice',
        userId,
        audioData: data.audioData
      }, userId);
      break;

    case 'interact':
      broadcastToSpace(data.spaceId, {
        type: 'interaction',
        userId,
        targetId: data.targetId,
        action: data.action
      }, userId);
      break;

    case 'chat':
      broadcastToSpace(data.spaceId, {
        type: 'chat-message',
        userId,
        message: data.message,
        timestamp: new Date().toISOString()
      });
      break;
  }
}

function broadcastToSpace(spaceId, message, excludeUserId = null) {
  const space = spaces.get(spaceId);
  if (!space) return;

  space.currentUsers.forEach(userId => {
    if (userId !== excludeUserId) {
      const userWs = connectedUsers.get(userId);
      if (userWs && userWs.readyState === WebSocket.OPEN) {
        userWs.send(JSON.stringify(message));
      }
    }
  });
}

// Asset Management (3D models, textures, etc)
app.post('/api/v1/assets/upload', async (req, res) => {
  const asset = {
    id: uuidv4(),
    ...req.body,
    type: req.body.type || '3d-model',
    url: req.body.url,
    metadata: req.body.metadata || {},
    uploadedAt: new Date().toISOString()
  };

  res.json({ asset });
});

// Teleportation
app.post('/api/v1/teleport', async (req, res) => {
  const { userId, targetSpaceId, targetPosition } = req.body;

  const avatar = Array.from(avatars.values()).find(a => a.userId === userId);
  if (!avatar) return res.status(404).json({ error: 'Avatar not found' });

  const targetSpace = spaces.get(targetSpaceId);
  if (!targetSpace) return res.status(404).json({ error: 'Target space not found' });

  // Update avatar position
  avatar.position = targetPosition || { x: 0, y: 0, z: 0 };
  avatar.currentSpace = targetSpaceId;

  // Add to target space
  if (!targetSpace.currentUsers.includes(userId)) {
    targetSpace.currentUsers.push(userId);
  }

  broadcastToSpace(targetSpaceId, {
    type: 'user-joined',
    userId,
    avatarId: avatar.id
  });

  res.json({ success: true, avatar });
});

// Analytics
app.get('/api/v1/analytics', (req, res) => {
  const totalCapacity = Array.from(campuses.values())
    .reduce((sum, c) => sum + c.capacity, 0);

  res.json({
    campuses: {
      total: campuses.size,
      capacity: totalCapacity,
      occupancy: connectedUsers.size
    },
    spaces: {
      total: spaces.size,
      occupied: Array.from(spaces.values()).filter(s => s.currentUsers.length > 0).length
    },
    users: {
      connected: connectedUsers.size
    },
    meetings: {
      total: meetings.size,
      active: Array.from(meetings.values()).filter(m => m.status === 'active').length
    }
  });
});

const PORT = process.env.PORT || 4400;
server.listen(PORT, () => {
  console.log(`Metaverse Campus service listening on port ${PORT}`);
});
