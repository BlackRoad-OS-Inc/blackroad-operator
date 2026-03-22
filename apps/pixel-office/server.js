const express = require('express');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const resolveDataDir = (dir) => {
  if (!dir) {
    return path.join(__dirname, 'data');
  }
  return path.isAbsolute(dir) ? dir : path.join(__dirname, dir);
};

const DATA_DIR = resolveDataDir(process.env.PIXEL_DATA_DIR);
fs.mkdirSync(DATA_DIR, { recursive: true });

const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || 'pixeladmin';

const dataPath = (filename) => path.join(DATA_DIR, filename);
const CONFIG_PATH = dataPath('pixel-config.json');
const AGENTS_PATH = dataPath('agents.json');
const LOG_PATH = dataPath('pixel_actions.jsonl');
const MAP_PATH = dataPath('map.json');
const COLLISION_PATH = dataPath('pixel_collision.json');
const ROOMS_PATH = dataPath('pixel_rooms.json');
const agentMessagePath = (id) => dataPath(`agent_${id}_message.txt`);
const ARRIVED_OFFICE_PATH = dataPath('pep_arrived_office');
const ARRIVED_RECEPTION_PATH = dataPath('pep_arrived_reception');

const readJSONFile = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    return null;
  }
};

const writeJSONFile = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

const loadAgentsFromDisk = () => {
  const agentsData = readJSONFile(AGENTS_PATH);
  if (Array.isArray(agentsData) && agentsData.length) {
    return agentsData;
  }
  const legacyConfig = readJSONFile(CONFIG_PATH);
  if (legacyConfig && Array.isArray(legacyConfig.agents)) {
    return legacyConfig.agents;
  }
  return null;
};

const persistAgents = (agents) => {
  if (Array.isArray(agents)) {
    writeJSONFile(AGENTS_PATH, agents);
  }
};

const loadMapData = () => {
  const mapData = readJSONFile(MAP_PATH);
  if (mapData) {
    return mapData;
  }
  return {
    collision: readJSONFile(COLLISION_PATH),
    rooms: readJSONFile(ROOMS_PATH)
  };
};

const persistMapData = (updates = {}) => {
  const current = loadMapData() || {};
  const merged = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  writeJSONFile(MAP_PATH, merged);
  if (merged.rooms) {
    writeJSONFile(ROOMS_PATH, merged.rooms);
  }
  if (merged.collision) {
    writeJSONFile(COLLISION_PATH, merged.collision);
  }
  return merged;
};

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 19000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Configuración inicial: todos los agentes disponibles, activados según checks
let config = {
  agents: [
    { id: 0, name: "Dustin", role: "Agente Principal", color: 0, x: 320, y: 400, state: "idle", active: true },
    { id: 1, name: "Pep", role: "Gestor de Correo", color: 1, x: 200, y: 300, state: "idle", active: true },
    { id: 2, name: "Agente 3", role: "Sin rol", color: 2, x: 400, y: 500, state: "idle", active: false },
    { id: 3, name: "Agente 4", role: "Sin rol", color: 3, x: 500, y: 400, state: "idle", active: false },
    { id: 4, name: "Agente 5", role: "Sin rol", color: 4, x: 150, y: 600, state: "idle", active: false },
    { id: 5, name: "Agente 6", role: "Sin rol", color: 5, x: 450, y: 200, state: "idle", active: false }
  ],
  rooms: [
    { name: "Recepción", x: 320, y: 700 },
    { name: "Sala Principal", x: 320, y: 400 },
    { name: "Sala Reuniones", x: 320, y: 100 },
    { name: "Despacho", x: 550, y: 200 },
    { name: "Cafetería", x: 100, y: 600 }
  ]
};

const defaultAgents = JSON.parse(JSON.stringify(config.agents));
const defaultRooms = JSON.parse(JSON.stringify(config.rooms));

// Cargar configuración guardada
try {
  const storedAgents = loadAgentsFromDisk();
  if (storedAgents) {
    config.agents = storedAgents;
    console.log('Agentes cargados desde disco');
  } else if (fs.existsSync(CONFIG_PATH)) {
    const savedConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    if (Array.isArray(savedConfig.agents)) {
      config.agents = savedConfig.agents;
    }
    if (Array.isArray(savedConfig.rooms)) {
      config.rooms = savedConfig.rooms;
    }
    persistAgents(config.agents);
    console.log('Configuración cargada (legacy)');
  } else {
    console.log('Usando configuración inicial');
  }
} catch (e) {
  console.log('Usando configuración inicial');
}

const initialMapData = loadMapData() || {};
if (Array.isArray(initialMapData.rooms) && initialMapData.rooms.length) {
  config.rooms = initialMapData.rooms;
} else if (!Array.isArray(initialMapData.rooms)) {
  initialMapData.rooms = defaultRooms;
}
if (!fs.existsSync(MAP_PATH)) {
  persistMapData({
    rooms: initialMapData.rooms,
    collision: initialMapData.collision || null
  });
}

if (!fs.existsSync(AGENTS_PATH)) {
  persistAgents(config.agents);
}

app.get('/api/config', (req, res) => {
  res.json({
    agents: config.agents,
    rooms: config.rooms
  });
});

console.log('Dashboard auth route ready');
app.post('/api/auth/login', (req, res) => {
  const { password } = req.body || {};
  if (!DASHBOARD_PASSWORD) {
    return res.json({ success: true });
  }
  if (password && password === DASHBOARD_PASSWORD) {
    return res.json({ success: true });
  }
  return res.status(401).json({ success: false });
});

app.post('/api/config', (req, res) => {
  config = req.body || {};
  if (!Array.isArray(config.agents)) {
    config.agents = defaultAgents;
  }
  if (!Array.isArray(config.rooms)) {
    config.rooms = defaultRooms;
  }
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
  persistAgents(config.agents);
  persistMapData({ rooms: config.rooms });
  console.log('Configuración guardada');
  res.json({ success: true, config });
});

app.post('/api/agent/:id/move', (req, res) => {
  const id = parseInt(req.params.id);
  const { x, y, state } = req.body;
  const agent = config.agents.find(a => a.id === id);
  if (agent) {
    if (x !== undefined) agent.x = x;
    if (y !== undefined) agent.y = y;
    if (state) agent.state = state;
    console.log(`[${agent.name}] Mover a (${x}, ${y})`);
    res.json({ success: true, agent });
  } else {
    res.status(404).json({ error: 'Agente no encontrado' });
  }
});

// API para obtener log de acciones
app.get('/api/log', (req, res) => {
  try {
    const logData = fs.readFileSync(LOG_PATH, 'utf8')
      .split('\n')
      .filter(line => line.trim())
      .map(line => JSON.parse(line))
      .slice(-50);
    res.json(logData);
  } catch (e) {
    res.json([]);
  }
});

// API para limpiar log
app.post('/api/log/clear', (req, res) => {
  try {
    fs.writeFileSync(LOG_PATH, '');
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// API para obtener comandos de agentes (movimientos)
const agentCommands = {};
const commandTimestamps = {};

app.get('/api/agent/:id/command', (req, res) => {
  const id = parseInt(req.params.id);
  const cmd = agentCommands[id];
  
  // Si hay comando y tiene menos de 30 segundos, devolverlo y consumirlo inmediatamente
  if (cmd && commandTimestamps[id]) {
    const age = Date.now() - commandTimestamps[id];
    if (age < 30000) { // Comando válido por 30 segundos
      // Consumir inmediatamente para evitar que otros navegadores lo lean
      agentCommands[id] = null;
      commandTimestamps[id] = null;
      return res.json(cmd);
    } else {
      // Comando expirado, limpiar
      agentCommands[id] = null;
      commandTimestamps[id] = null;
    }
  }
  res.json(null);
});

// Endpoint para confirmar que el agente llegó físicamente al destino
app.post('/api/agent/:id/arrived', (req, res) => {
  const id = parseInt(req.params.id);
  const { location } = req.body;
  
  // Crear archivo de señalización para el controller
  if (location === 'office') {
    fs.writeFileSync(ARRIVED_OFFICE_PATH, '1');
  } else if (location === 'reception') {
    fs.writeFileSync(ARRIVED_RECEPTION_PATH, '1');
  }
  
  console.log(`[Llegada] Agente ${id} llegó a: ${location}`);
  res.json({ success: true });
});
app.post('/api/agent/:id/command/ack', (req, res) => {
  const id = parseInt(req.params.id);
  agentCommands[id] = null;
  commandTimestamps[id] = null;
  res.json({ success: true });
});

app.post('/api/agent/:id/command', (req, res) => {
  const id = parseInt(req.params.id);
  agentCommands[id] = req.body;
  commandTimestamps[id] = Date.now();
  console.log(`[Comando] Agente ${id}:`, req.body);
  res.json({ success: true });
});
app.get('/api/messages', (req, res) => {
  const messages = {};
  for (let i = 0; i < 6; i++) {
    try {
      messages[i] = fs.readFileSync(agentMessagePath(i), 'utf8');
    } catch (e) {
      messages[i] = "";
    }
  }
  res.json(messages);
});

// API para guardar mapa de colisiones
app.post('/api/collision', (req, res) => {
  try {
    persistMapData({ collision: req.body });
    console.log('Collision map saved');
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// API para guardar salas
app.post('/api/rooms', (req, res) => {
  try {
    const updated = persistMapData({ rooms: req.body });
    if (Array.isArray(updated.rooms)) {
      config.rooms = updated.rooms;
    }
    console.log('Rooms saved');
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.get('/api/collision', (req, res) => {
  try {
    const mapData = loadMapData();
    if (!mapData || !mapData.collision) {
      throw new Error('Mapa no disponible');
    }
    res.json(mapData.collision);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Mapa no disponible' });
  }
});

// API para obtener salas
app.get('/api/rooms', (req, res) => {
  try {
    const mapData = loadMapData();
    if (mapData && Array.isArray(mapData.rooms)) {
      return res.json(mapData.rooms);
    }
  } catch (e) {
    // ignore and fallback below
  }
  res.json(config.rooms.map(r => ({ name: r.name, x: r.x, y: r.y, tiles: [] })));
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Pixel Office v3 en http://0.0.0.0:${PORT}`);
  console.log('Agentes activos:', config.agents.filter(a => a.active).map(a => a.name).join(', '));
});
