// ============================================================================
// BlackRoad Metaverse — World Builder SDK
// Create any game world with a few lines of code.
// Anyone can pave tomorrow.
// ============================================================================

class BlackRoadWorld {
  constructor(config = {}) {
    this.name = config.name || 'Untitled World';
    this.type = config.type || 'freeform'; // freeform, office, city, space, battle, colony, quest
    this.width = config.width || 40;
    this.height = config.height || 30;
    this.tileSize = config.tileSize || 16;
    this.background = config.background || '#000';
    this.tiles = new Uint8Array(this.width * this.height);
    this.entities = [];
    this.agents = [];
    this.canvas = null;
    this.ctx = null;
    this.camera = { x: 0, y: 0, zoom: 1 };
    this.running = false;
    this.onUpdate = config.onUpdate || null;
    this.onRender = config.onRender || null;
    this.onClick = config.onClick || null;

    // Design system
    this.colors = {
      gradient: ['#FF6B2B', '#FF2255', '#CC00AA', '#8844FF', '#4488FF', '#00D4FF'],
      bg: '#000',
      card: '#0a0a0a',
      border: '#1a1a1a',
      text: '#f5f5f5',
    };
  }

  // Mount to a DOM element
  mount(selector) {
    const container = typeof selector === 'string' ? document.querySelector(selector) : selector;
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width * this.tileSize;
    this.canvas.height = this.height * this.tileSize;
    this.canvas.style.imageRendering = 'pixelated';
    this.canvas.style.background = this.background;
    this.ctx = this.canvas.getContext('2d');
    container.appendChild(this.canvas);

    // Input
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / this.tileSize);
      const y = Math.floor((e.clientY - rect.top) / this.tileSize);
      if (this.onClick) this.onClick(x, y, this);
    });

    return this;
  }

  // Tile types
  setTile(x, y, type) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.tiles[y * this.width + x] = type;
    }
    return this;
  }

  getTile(x, y) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      return this.tiles[y * this.width + x];
    }
    return -1;
  }

  // Fill a rectangle with a tile type
  fill(x, y, w, h, type) {
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        this.setTile(x + dx, y + dy, type);
      }
    }
    return this;
  }

  // Add an entity (NPC, item, decoration)
  addEntity(config) {
    const entity = {
      id: this.entities.length,
      name: config.name || 'Entity',
      x: config.x || 0,
      y: config.y || 0,
      sprite: config.sprite || null,
      color: config.color || this.colors.gradient[this.entities.length % 6],
      size: config.size || 1,
      speed: config.speed || 1,
      state: 'idle',
      targetX: config.x || 0,
      targetY: config.y || 0,
      behavior: config.behavior || 'wander', // idle, wander, patrol, follow
      dialogue: config.dialogue || [],
      onInteract: config.onInteract || null,
      _frame: 0,
      _timer: Math.random() * 100,
      ...config,
    };
    this.entities.push(entity);
    return entity;
  }

  // Add a BlackRoad AI agent
  addAgent(config) {
    const agent = this.addEntity({
      ...config,
      isAgent: true,
      behavior: config.behavior || 'wander',
      dialogue: config.dialogue || ['Pave tomorrow.', 'Node hellas.', 'The road remembers.'],
    });
    this.agents.push(agent);
    return agent;
  }

  // Pathfinding (BFS)
  findPath(startX, startY, endX, endY) {
    const visited = new Set();
    const queue = [{ x: startX, y: startY, path: [] }];
    visited.add(`${startX},${startY}`);

    while (queue.length > 0) {
      const { x, y, path } = queue.shift();
      for (const [dx, dy] of [[0,-1],[0,1],[-1,0],[1,0]]) {
        const nx = x + dx, ny = y + dy;
        const key = `${nx},${ny}`;
        if (nx < 0 || nx >= this.width || ny < 0 || ny >= this.height) continue;
        if (visited.has(key)) continue;
        const tile = this.tiles[ny * this.width + nx];
        if (tile === 1) continue; // wall
        visited.add(key);
        const newPath = [...path, { x: nx, y: ny }];
        if (nx === endX && ny === endY) return newPath;
        if (newPath.length > 100) continue;
        queue.push({ x: nx, y: ny, path: newPath });
      }
    }
    return [];
  }

  // Start the game loop
  start() {
    this.running = true;
    let lastTime = performance.now();

    const loop = (now) => {
      if (!this.running) return;
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      this._update(dt);
      this._render();

      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    return this;
  }

  stop() {
    this.running = false;
    return this;
  }

  _update(dt) {
    // Update entities
    for (const e of this.entities) {
      e._timer -= dt;
      e._frame += dt;

      if (e.behavior === 'wander' && e._timer <= 0) {
        e.targetX = Math.floor(Math.random() * this.width);
        e.targetY = Math.floor(Math.random() * this.height);
        e._timer = 2 + Math.random() * 5;
      }

      // Move toward target
      const dx = e.targetX - e.x;
      const dy = e.targetY - e.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0.1) {
        e.x += (dx / dist) * e.speed * dt;
        e.y += (dy / dist) * e.speed * dt;
        e.state = 'walking';
      } else {
        e.state = 'idle';
      }
    }

    if (this.onUpdate) this.onUpdate(dt, this);
  }

  _render() {
    const ctx = this.ctx;
    const T = this.tileSize;
    ctx.fillStyle = this.background;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw tiles
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const tile = this.tiles[y * this.width + x];
        if (tile === 0) continue; // empty
        ctx.fillStyle = tile === 1 ? '#1a1a1a' : tile === 2 ? '#0a2a0a' : tile === 3 ? '#1a1a2e' : '#0a0a0a';
        ctx.fillRect(x * T, y * T, T, T);
      }
    }

    // Draw entities (sorted by y for depth)
    const sorted = [...this.entities].sort((a, b) => a.y - b.y);
    for (const e of sorted) {
      const px = e.x * T, py = e.y * T;

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.ellipse(px + T/2, py + T, T * 0.4, 2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Body
      ctx.fillStyle = e.color;
      ctx.fillRect(px + 2, py + T * 0.3, T - 4, T * 0.5);

      // Head
      ctx.fillStyle = '#E8C4A0';
      ctx.fillRect(px + 3, py, T - 6, T * 0.35);

      // Name
      if (e.name) {
        ctx.font = '8px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#f5f5f5';
        ctx.fillText(e.name, px + T/2, py - 4);
      }
    }

    if (this.onRender) this.onRender(ctx, this);
  }

  // Export world as JSON (shareable)
  export() {
    return JSON.stringify({
      name: this.name,
      type: this.type,
      width: this.width,
      height: this.height,
      tileSize: this.tileSize,
      tiles: Array.from(this.tiles),
      entities: this.entities.map(e => ({
        name: e.name, x: e.x, y: e.y, color: e.color,
        behavior: e.behavior, dialogue: e.dialogue,
      })),
    });
  }

  // Import world from JSON
  static import(json) {
    const data = typeof json === 'string' ? JSON.parse(json) : json;
    const world = new BlackRoadWorld(data);
    world.tiles = new Uint8Array(data.tiles);
    for (const e of data.entities || []) {
      world.addEntity(e);
    }
    return world;
  }

  // Prebuilt world templates
  static office(config = {}) {
    const w = new BlackRoadWorld({ name: 'Office', type: 'office', width: 20, height: 15, ...config });
    // Walls
    w.fill(0, 0, 20, 1, 1).fill(0, 14, 20, 1, 1).fill(0, 0, 1, 15, 1).fill(19, 0, 1, 15, 1);
    // Desks
    w.fill(3, 3, 3, 1, 3).fill(3, 6, 3, 1, 3).fill(3, 9, 3, 1, 3);
    w.fill(12, 3, 3, 1, 3).fill(12, 6, 3, 1, 3).fill(12, 9, 3, 1, 3);
    // Agents
    w.addAgent({ name: 'Lucidia', x: 4, y: 4, color: '#00D4FF', dialogue: ['Dreaming in code.', 'The mesh is holding.'] });
    w.addAgent({ name: 'Alice', x: 13, y: 4, color: '#FF6B2B', dialogue: ['Fleet health 100%.', 'All nodes online.'] });
    w.addAgent({ name: 'Octavia', x: 4, y: 7, color: '#CC00AA', dialogue: ['207 repos synced.', 'Architecture is clean.'] });
    w.addAgent({ name: 'Aria', x: 13, y: 7, color: '#4488FF', dialogue: ['Design system locked.', 'Every pixel matters.'] });
    return w;
  }

  static city(config = {}) {
    const w = new BlackRoadWorld({ name: 'City', type: 'city', width: 40, height: 30, ...config });
    // Roads
    for (let x = 0; x < 40; x++) { w.setTile(x, 10, 3); w.setTile(x, 20, 3); }
    for (let y = 0; y < 30; y++) { w.setTile(10, y, 3); w.setTile(20, y, 3); w.setTile(30, y, 3); }
    // Buildings
    w.fill(2, 2, 6, 6, 1).fill(12, 2, 6, 6, 1).fill(22, 2, 6, 6, 1);
    w.fill(2, 12, 6, 6, 1).fill(12, 12, 6, 6, 1).fill(22, 12, 6, 6, 1);
    w.fill(2, 22, 6, 6, 1).fill(12, 22, 6, 6, 1).fill(22, 22, 6, 6, 1);
    // NPCs
    for (let i = 0; i < 10; i++) {
      w.addEntity({ name: `Node-${i}`, x: Math.random() * 38 + 1, y: Math.random() * 28 + 1, behavior: 'wander' });
    }
    return w;
  }

  static space(config = {}) {
    const w = new BlackRoadWorld({ name: 'Space', type: 'space', width: 60, height: 40, background: '#02020a', ...config });
    // Stars
    for (let i = 0; i < 50; i++) {
      w.setTile(Math.floor(Math.random() * 60), Math.floor(Math.random() * 40), 2);
    }
    // Stations
    w.addEntity({ name: 'BlackRoad Station', x: 30, y: 20, color: '#FF2255', size: 3 });
    w.addEntity({ name: 'Lucidia Outpost', x: 10, y: 10, color: '#00D4FF' });
    w.addEntity({ name: 'Node Relay', x: 50, y: 30, color: '#FF6B2B' });
    return w;
  }
}

// Export for browser and Node
if (typeof module !== 'undefined') module.exports = { BlackRoadWorld };
if (typeof window !== 'undefined') window.BlackRoadWorld = BlackRoadWorld;
