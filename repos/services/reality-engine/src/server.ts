/**
 * Reality Engine Server
 *
 * REST API + WebSocket server for photorealistic 3D creation platform
 * The Roblox killer with Cities Skylines realism and Sims depth!
 */

import express, { Request, Response } from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import { RealityEngine } from './engine/RealityEngine.js';
import { TerrainGenerator } from './creation/TerrainGenerator.js';
import { UserCreationStudio, BuildingTemplate, CharacterTemplate } from './creation/UserCreationStudio.js';
import { Scene, Mesh, Vector3 } from './types/index.js';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '50mb' }));

// Initialize engine
const engine = new RealityEngine();
const creationStudio = new UserCreationStudio();
const terrainGen = creationStudio.getTerrainGenerator();

// WebSocket connections
const clients = new Map<string, WebSocket>();

// Start engine
engine.start();

// ============================================================================
// REST API Endpoints
// ============================================================================

/**
 * Health check
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    engine: 'running',
    metrics: engine.getMetrics(),
    timestamp: new Date().toISOString()
  });
});

/**
 * Get current scene
 */
app.get('/api/scene', (req: Request, res: Response) => {
  const scene = engine.getScene();
  res.json(scene);
});

/**
 * Create new scene
 */
app.post('/api/scene', (req: Request, res: Response) => {
  const sceneData: Scene = req.body;
  engine.loadScene(sceneData);
  broadcastToAll({ type: 'scene-loaded', scene: sceneData });
  res.json({ success: true, scene: sceneData });
});

/**
 * Export scene
 */
app.get('/api/scene/export', (req: Request, res: Response) => {
  const sceneJson = engine.exportScene();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename=scene.json');
  res.send(sceneJson);
});

/**
 * Add mesh to scene
 */
app.post('/api/meshes', (req: Request, res: Response) => {
  const mesh: Mesh = req.body;
  engine.addMesh(mesh);
  broadcastToAll({ type: 'mesh-added', mesh });
  res.json({ success: true, mesh });
});

/**
 * Update mesh
 */
app.put('/api/meshes/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  engine.updateMesh(id, updates);
  broadcastToAll({ type: 'mesh-updated', meshId: id, updates });
  res.json({ success: true });
});

/**
 * Delete mesh
 */
app.delete('/api/meshes/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  engine.removeMesh(id);
  broadcastToAll({ type: 'mesh-removed', meshId: id });
  res.json({ success: true });
});

/**
 * Generate terrain
 */
app.post('/api/create/terrain', (req: Request, res: Response) => {
  const { biome } = req.body as { biome: 'grassland' | 'desert' | 'mountain' | 'forest' | 'snow' };

  const config = terrainGen.generateBiome(biome || 'grassland');
  const terrain = terrainGen.generateTerrain(config);

  engine.addMesh(terrain);
  broadcastToAll({ type: 'terrain-generated', terrain });

  res.json({
    success: true,
    terrain,
    message: `Generated ${biome} terrain with ${config.resolution}x${config.resolution} resolution`
  });
});

/**
 * Create building
 */
app.post('/api/create/building', (req: Request, res: Response) => {
  const { template, position } = req.body as {
    template: BuildingTemplate;
    position: Vector3;
  };

  const meshes = creationStudio.createBuilding(template, position);

  for (const mesh of meshes) {
    engine.addMesh(mesh);
  }

  broadcastToAll({ type: 'building-created', meshes });

  res.json({
    success: true,
    meshes,
    message: `Created ${template.name} with ${template.floors} floors`
  });
});

/**
 * Create character
 */
app.post('/api/create/character', (req: Request, res: Response) => {
  const { template, position } = req.body as {
    template: CharacterTemplate;
    position: Vector3;
  };

  const meshes = creationStudio.createCharacter(template, position);

  for (const mesh of meshes) {
    engine.addMesh(mesh);
  }

  broadcastToAll({ type: 'character-created', meshes });

  res.json({
    success: true,
    meshes,
    message: `Created character ${template.name}`
  });
});

/**
 * Create vehicle
 */
app.post('/api/create/vehicle', (req: Request, res: Response) => {
  const { type, position } = req.body as {
    type: 'car' | 'truck' | 'motorcycle' | 'bicycle';
    position: Vector3;
  };

  const meshes = creationStudio.createVehicle(type, position);

  for (const mesh of meshes) {
    engine.addMesh(mesh);
  }

  broadcastToAll({ type: 'vehicle-created', meshes });

  res.json({
    success: true,
    meshes,
    message: `Created ${type} vehicle`
  });
});

/**
 * Create city block
 */
app.post('/api/create/city-block', (req: Request, res: Response) => {
  const { gridSize, blockSize, position } = req.body as {
    gridSize: number;
    blockSize: number;
    position: Vector3;
  };

  const meshes = creationStudio.createCityBlock(gridSize, blockSize, position);

  for (const mesh of meshes) {
    engine.addMesh(mesh);
  }

  broadcastToAll({ type: 'city-block-created', meshCount: meshes.length });

  res.json({
    success: true,
    meshCount: meshes.length,
    message: `Created ${gridSize}x${gridSize} city block with ${meshes.length} components`
  });
});

/**
 * Get engine metrics
 */
app.get('/api/metrics', (req: Request, res: Response) => {
  res.json(engine.getMetrics());
});

/**
 * Get available materials
 */
app.get('/api/materials', (req: Request, res: Response) => {
  const scene = engine.getScene();
  res.json(scene.materials);
});

/**
 * Quick start templates
 */
app.get('/api/templates', (req: Request, res: Response) => {
  res.json({
    buildings: [
      {
        name: 'Modern Office',
        floors: 10,
        width: 30,
        depth: 30,
        height: 35,
        style: 'modern',
        materials: { walls: 'concrete', roof: 'chrome', windows: 'glass', doors: 'chrome' }
      },
      {
        name: 'Small House',
        floors: 2,
        width: 10,
        depth: 12,
        height: 7,
        style: 'residential',
        materials: { walls: 'concrete', roof: 'wood-oak', windows: 'glass', doors: 'wood-oak' }
      },
      {
        name: 'Skyscraper',
        floors: 50,
        width: 40,
        depth: 40,
        height: 175,
        style: 'modern',
        materials: { walls: 'chrome', roof: 'chrome', windows: 'glass', doors: 'chrome' }
      }
    ],
    characters: [
      {
        name: 'Default Male',
        bodyType: 'male',
        height: 1.8,
        proportions: { head: 1.0, torso: 1.0, arms: 1.0, legs: 1.0 },
        customization: {
          skinTone: 'light',
          hairStyle: 'short',
          clothing: ['shirt-blue', 'pants-jeans'],
          accessories: []
        }
      }
    ],
    vehicles: [
      { type: 'car', name: 'Sports Car' },
      { type: 'truck', name: 'Pickup Truck' },
      { type: 'bicycle', name: 'Mountain Bike' }
    ]
  });
});

// ============================================================================
// WebSocket Handling (Real-time multiplayer)
// ============================================================================

wss.on('connection', (ws: WebSocket, req) => {
  const clientId = Math.random().toString(36).substring(7);
  clients.set(clientId, ws);

  console.log(`Client ${clientId} connected`);

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'welcome',
    clientId,
    scene: engine.getScene(),
    message: 'Welcome to Reality Engine!'
  }));

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      handleWebSocketMessage(clientId, message);
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    clients.delete(clientId);
    console.log(`Client ${clientId} disconnected`);
  });
});

function handleWebSocketMessage(clientId: string, message: any) {
  switch (message.type) {
    case 'transform-update':
      // Real-time transform updates for multiplayer
      engine.updateMesh(message.meshId, {
        position: message.position,
        rotation: message.rotation
      });
      broadcastToOthers(clientId, message);
      break;

    case 'chat':
      broadcastToAll({
        type: 'chat',
        clientId,
        message: message.text,
        timestamp: Date.now()
      });
      break;

    default:
      console.log('Unknown message type:', message.type);
  }
}

function broadcastToAll(message: any) {
  const data = JSON.stringify(message);
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

function broadcastToOthers(senderId: string, message: any) {
  const data = JSON.stringify(message);
  clients.forEach((client, id) => {
    if (id !== senderId && client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

// ============================================================================
// Engine Event Handlers
// ============================================================================

engine.on('mesh-added', (mesh) => {
  console.log(`Mesh added: ${mesh.name}`);
});

engine.on('fps-update', (fps) => {
  if (fps < 30) {
    console.warn(`Low FPS: ${fps}`);
  }
});

engine.on('error', (error) => {
  console.error('Engine error:', error);
});

// ============================================================================
// Server Startup
// ============================================================================

const PORT = process.env.PORT || 4500;

server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║              🌟 REALITY ENGINE - ONLINE 🌟                   ║
║                                                               ║
║  The photorealistic creation platform that makes             ║
║  Roblox look like pixel art!                                 ║
║                                                               ║
║  🎨 Create: Buildings, Characters, Vehicles, Worlds          ║
║  🌍 Realism: PBR materials, HDR lighting, physics            ║
║  👥 Multiplayer: Real-time collaboration via WebSocket       ║
║  🎮 User Content: Like Roblox but PHOTOREALISTIC!            ║
║                                                               ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  Server: http://localhost:${PORT}                           ║
║  WebSocket: ws://localhost:${PORT}                          ║
║  Health: http://localhost:${PORT}/health                    ║
║  Docs: http://localhost:${PORT}/api/templates               ║
║                                                               ║
║  Quick Start:                                                 ║
║  • POST /api/create/terrain {"biome": "grassland"}           ║
║  • POST /api/create/building {template, position}            ║
║  • POST /api/create/city-block {gridSize: 5, blockSize: 50} ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  engine.stop();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
