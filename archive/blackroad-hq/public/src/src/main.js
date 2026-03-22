/**
 * BlackRoad HQ — Full Pixel World
 * Everything is pixels. Tileset-based. Real sprites. Our world.
 * BlackRoad OS, Inc. — Pave Tomorrow.
 */

const S = 3; // pixel scale
const T = 16; // tile size (source)
const TS = T * S; // tile size (screen)

// ── Assets ──
let tileset, meta, chars = [];
const imgs = {};

function loadImg(src) {
  return new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; });
}

async function load() {
  tileset = await loadImg('sprites/tileset.png');
  const res = await fetch('sprites/tileset-metadata.json');
  meta = await res.json();
  for (let i = 0; i < 6; i++) chars[i] = await loadImg(`sprites/characters/char_${i}.png`);
  imgs.logo = await loadImg('sprites/logo.png');
}

// ── Tileset Lookup ──
function tile(id) {
  const item = meta.items.find(i => i.id === id);
  return item ? item.bounds : null;
}

function drawTile(ctx, id, dx, dy) {
  const b = tile(id);
  if (!b || !tileset) return;
  ctx.drawImage(tileset, b.x, b.y, b.width, b.height, dx, dy, b.width * S, b.height * S);
}

// ── Map Definition ──
// Each room is a grid of tile IDs
// W = wall, F = floor, D = desk, C = chair, . = empty floor
const COLS = 30, ROWS = 20;

function buildMap() {
  const map = [];
  const floorId = 'floor_dark_slate';
  const floor2 = 'floor_dark_blue';
  const floor3 = 'floor_dark_grey';
  const wallId = 'wall_cool_grey';

  for (let y = 0; y < ROWS; y++) {
    const row = [];
    for (let x = 0; x < COLS; x++) {
      const cell = { floor: null, wall: null, furniture: null };

      // Outer walls
      if (y === 0 || y === ROWS - 1 || x === 0 || x === COLS - 1) {
        cell.wall = wallId;
        cell.floor = floorId;
      }
      // Room dividers
      else if (x === 15 && y > 0 && y < ROWS - 1 && y !== 5 && y !== 12) {
        cell.wall = wallId;
        cell.floor = floorId;
      }
      else if (y === 10 && x > 0 && x < 15 && x !== 7) {
        cell.wall = wallId;
        cell.floor = floorId;
      }
      // Left top room (main office) - dark blue floor
      else if (x > 0 && x < 15 && y > 0 && y < 10) {
        cell.floor = floor2;
        // Desk rows
        if (y === 3 && (x === 3 || x === 7 || x === 11)) cell.furniture = 'desk_work_monitor';
        if (y === 6 && (x === 3 || x === 7 || x === 11)) cell.furniture = 'desk_wide_monitor';
        // Chairs
        if (y === 4 && (x === 4 || x === 8 || x === 12)) cell.furniture = 'chair_desk_blue';
        if (y === 7 && (x === 4 || x === 8 || x === 12)) cell.furniture = 'chair_office_grey';
        // Plants
        if (x === 1 && y === 1) cell.furniture = 'plant_potted_tall';
        if (x === 13 && y === 1) cell.furniture = 'plant_bushy';
        // Clock
        if (x === 7 && y === 1) cell.furniture = 'clock_wall_round';
        // Bookshelf
        if (x === 1 && y === 8) cell.furniture = 'bookshelf_tall';
      }
      // Left bottom room (break room) - grey floor
      else if (x > 0 && x < 15 && y > 10 && y < ROWS - 1) {
        cell.floor = floor3;
        // Kitchen stuff
        if (x === 2 && y === 12) cell.furniture = 'coffee_maker_carafe';
        if (x === 4 && y === 12) cell.furniture = 'fridge_double_door';
        if (x === 6 && y === 12) cell.furniture = 'vending_machine_soda';
        if (x === 8 && y === 12) cell.furniture = 'water_cooler';
        // Table
        if (x === 5 && y === 15) cell.furniture = 'table_round_grey';
        // Sofa
        if (x === 10 && y === 17) cell.furniture = 'sofa_grey_wide';
        // Plant
        if (x === 13 && y === 18) cell.furniture = 'plant_fern';
        if (x === 1 && y === 18) cell.furniture = 'plant_potted_small';
      }
      // Right side (server/command) - dark slate floor
      else if (x > 15 && x < COLS - 1 && y > 0 && y < ROWS - 1) {
        cell.floor = floorId;
        // Server racks
        if (y === 2 && (x === 17 || x === 19 || x === 21 || x === 23 || x === 25 || x === 27)) cell.furniture = 'server_rack';
        // Desks bottom
        if (y === 7 && (x === 17 || x === 21 || x === 25)) cell.furniture = 'desk_dark_wood';
        if (y === 8 && (x === 18 || x === 22 || x === 26)) cell.furniture = 'chair_arm_brown';
        // Whiteboard
        if (x === 17 && y === 11) cell.furniture = 'whiteboard_charts';
        // More desks
        if (y === 14 && (x === 17 || x === 21 || x === 25)) cell.furniture = 'desk_metal_grey';
        if (y === 15 && (x === 18 || x === 22 || x === 26)) cell.furniture = 'chair_desk_blue';
        // Filing
        if (x === 28 && y === 5) cell.furniture = 'filing_cabinet_blue';
        if (x === 28 && y === 8) cell.furniture = 'filing_cabinet_wood';
        // Paintings
        if (x === 20 && y === 11) cell.furniture = 'painting_mountain';
        // Door markers
        if (x === 28 && y === 17) cell.furniture = 'plant_potted_tall';
        if (x === 16 && y === 18) cell.furniture = 'rug_welcome';
        // Window
        if (x === 24 && y === 11) cell.furniture = 'window_double';
      }
      else {
        cell.floor = floorId;
      }

      row.push(cell);
    }
    map.push(row);
  }
  return map;
}

// ── Agents ──
const FLEET = [
  { name: 'Alice',   color: '#00D4FF', palette: 0, role: 'Gateway' },
  { name: 'Cecilia', color: '#8844FF', palette: 1, role: 'AI Engine' },
  { name: 'Octavia', color: '#CC00AA', palette: 2, role: 'Gitea' },
  { name: 'Aria',    color: '#FF2255', palette: 3, role: 'Hailo' },
  { name: 'Lucidia', color: '#FF6B2B', palette: 4, role: 'Deploy' },
];

const TOOLS = ['Read', 'Bash', 'Grep', 'Edit', 'Write', 'Glob', 'Agent'];
const CHATTER = [
  'Deploying...', 'git push', 'npm build', 'docker pull',
  'Scanning...', 'Syncing', 'KPI collect', 'Indexing',
  'ollama run', 'rclone sync', 'Checking...', 'Testing',
];

let agents = [];

function spawnAgents() {
  agents = FLEET.map((f, i) => ({
    ...f,
    x: 3 + i * 2.5,
    y: 5 + (i % 2) * 3,
    tx: 3 + i * 2.5,
    ty: 5 + (i % 2) * 3,
    dir: 0, frame: 0, ft: 0,
    state: 'idle',
    timer: 1 + Math.random() * 3,
    tool: null,
    bubble: null,
    bt: 0,
  }));
}

function updateAgents(dt) {
  for (const a of agents) {
    a.ft += dt;
    if (a.bt > 0) { a.bt -= dt; if (a.bt <= 0) a.bubble = null; }

    if (a.state === 'idle') {
      a.timer -= dt;
      if (a.timer <= 0) {
        // Pick a walkable spot
        a.tx = 2 + Math.random() * (COLS - 4);
        a.ty = 2 + Math.random() * (ROWS - 4);
        a.state = 'walk';
        a.timer = 2 + Math.random() * 4;
      }
    }
    else if (a.state === 'walk') {
      const dx = a.tx - a.x, dy = a.ty - a.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 0.15) {
        a.x = a.tx; a.y = a.ty;
        a.state = 'work';
        a.timer = 2 + Math.random() * 5;
        a.tool = TOOLS[Math.floor(Math.random() * TOOLS.length)];
        a.bubble = CHATTER[Math.floor(Math.random() * CHATTER.length)];
        a.bt = 3.5;
      } else {
        const spd = 2.5 * dt;
        a.x += (dx / d) * spd;
        a.y += (dy / d) * spd;
        a.dir = Math.abs(dx) > Math.abs(dy) ? 2 : (dy > 0 ? 0 : 1);
        if (a.ft > 0.12) { a.frame = (a.frame + 1) % 3; a.ft = 0; }
      }
    }
    else if (a.state === 'work') {
      a.timer -= dt;
      if (a.ft > 0.3) { a.frame = 3 + (a.frame + 1) % 2; a.ft = 0; }
      if (a.timer <= 0) { a.state = 'idle'; a.tool = null; a.timer = 1 + Math.random() * 3; }
    }
  }
}

function drawAgent(ctx, a) {
  const sheet = chars[a.palette % chars.length];
  if (!sheet) return;

  const fw = sheet.width / 7;
  const fh = sheet.height / 3;
  const row = a.dir === 1 ? 1 : a.dir === 2 ? 2 : 0;
  const col = Math.min(a.frame, 6);

  const px = a.x * TS;
  const py = a.y * TS;
  const dw = fw * S;
  const dh = fh * S;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(px + TS / 2, py + dh - 4, dw / 3, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Sprite
  ctx.drawImage(sheet, col * fw, row * fh, fw, fh, px + TS / 2 - dw / 2, py + TS - dh, dw, dh);

  // Name
  ctx.font = '700 11px JetBrains Mono';
  ctx.textAlign = 'center';
  const nm = a.name;
  const nw = ctx.measureText(nm).width + 8;
  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  roundRect(ctx, px + TS / 2 - nw / 2, py + TS - dh - 16, nw, 14, 2);
  ctx.fill();
  ctx.fillStyle = a.color;
  ctx.fillText(nm, px + TS / 2, py + TS - dh - 5);

  // Tool badge
  if (a.tool) {
    ctx.font = '500 9px JetBrains Mono';
    const tw = ctx.measureText(a.tool).width + 6;
    ctx.fillStyle = a.color + '30';
    roundRect(ctx, px + TS / 2 - tw / 2, py + TS + 2, tw, 12, 2);
    ctx.fill();
    ctx.fillStyle = a.color;
    ctx.fillText(a.tool, px + TS / 2, py + TS + 11);
  }

  // Bubble
  if (a.bubble) {
    ctx.font = '11px JetBrains Mono';
    const bw = ctx.measureText(a.bubble).width + 14;
    const bx = px + TS / 2 - bw / 2;
    const by = py + TS - dh - 38;

    ctx.fillStyle = 'rgba(10,10,10,0.92)';
    roundRect(ctx, bx, by, bw, 18, 3);
    ctx.fill();
    ctx.strokeStyle = a.color + '50';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Tail
    ctx.fillStyle = 'rgba(10,10,10,0.92)';
    ctx.beginPath();
    ctx.moveTo(px + TS / 2 - 4, by + 18);
    ctx.lineTo(px + TS / 2, by + 24);
    ctx.lineTo(px + TS / 2 + 4, by + 18);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillText(a.bubble, px + TS / 2, by + 13);
  }
}

// ── Helpers ──
function roundRect(c, x, y, w, h, r) {
  c.beginPath();
  if (c.roundRect) {
    c.roundRect(x, y, w, h, r);
  } else {
    c.moveTo(x + r, y);
    c.lineTo(x + w - r, y);
    c.arcTo(x + w, y, x + w, y + r, r);
    c.lineTo(x + w, y + h - r);
    c.arcTo(x + w, y + h, x + w - r, y + h, r);
    c.lineTo(x + r, y + h);
    c.arcTo(x, y + h, x, y + h - r, r);
    c.lineTo(x, y + r);
    c.arcTo(x, y, x + r, y, r);
  }
  c.closePath();
}

// ── Render ──
function render(ctx, map, w, h, tick) {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);

  // Center the map
  const mapW = COLS * TS;
  const mapH = ROWS * TS;
  const ox = Math.floor((w - mapW) / 2);
  const oy = Math.floor((h - mapH) / 2);
  ctx.save();
  ctx.translate(ox, oy);

  // Floor pass
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const cell = map[y][x];
      if (cell.floor) drawTile(ctx, cell.floor, x * TS, y * TS);
    }
  }

  // Walls pass
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const cell = map[y][x];
      if (cell.wall) drawTile(ctx, cell.wall, x * TS, y * TS - TS); // walls are 16x32, draw up
    }
  }

  // Collect all Y-sorted drawables (furniture + agents)
  const drawables = [];

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const cell = map[y][x];
      if (cell.furniture) {
        drawables.push({ type: 'tile', id: cell.furniture, x, y, sortY: y });
      }
    }
  }

  for (const a of agents) {
    drawables.push({ type: 'agent', agent: a, sortY: a.y });
  }

  // Sort by Y
  drawables.sort((a, b) => a.sortY - b.sortY);

  // Draw sorted
  for (const d of drawables) {
    if (d.type === 'tile') {
      const b = tile(d.id);
      if (b) {
        // Center multi-tile items
        const dx = d.x * TS + (TS - b.width * S) / 2;
        const dy = d.y * TS + TS - b.height * S;
        drawTile(ctx, d.id, dx, dy);
      }
    } else {
      drawAgent(ctx, d.agent);
    }
  }

  // Logo watermark
  if (imgs.logo) {
    ctx.globalAlpha = 0.08;
    ctx.drawImage(imgs.logo, mapW - 56, mapH - 56, 48, 48);
    ctx.globalAlpha = 1;
  }

  // Spectrum bar top
  const spectrum = ['#FF6B2B', '#FF2255', '#CC00AA', '#8844FF', '#4488FF', '#00D4FF'];
  const segW = mapW / spectrum.length;
  for (let i = 0; i < spectrum.length; i++) {
    ctx.fillStyle = spectrum[i];
    ctx.globalAlpha = 0.6;
    ctx.fillRect(i * segW, -2, segW, 2);
    ctx.fillRect(i * segW, mapH, segW, 2);
  }
  ctx.globalAlpha = 1;

  ctx.restore();
}

// ── Main ──
async function main() {
  const c = document.getElementById('c');
  const ctx = c.getContext('2d');

  // Show loading
  c.width = innerWidth;
  c.height = innerHeight;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = '#CC00AA';
  ctx.font = '16px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('Loading BlackRoad HQ...', c.width / 2, c.height / 2);

  try {
    await load();
  } catch (e) {
    ctx.fillStyle = '#FF2255';
    ctx.fillText('Asset load error: ' + e.message, c.width / 2, c.height / 2 + 30);
    console.error('Load failed:', e);
    return;
  }

  const map = buildMap();
  spawnAgents();

  let last = 0, tick = 0;

  function resize() {
    const dpr = devicePixelRatio || 1;
    c.width = innerWidth * dpr;
    c.height = innerHeight * dpr;
    c.style.width = innerWidth + 'px';
    c.style.height = innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
  }

  resize();
  addEventListener('resize', resize);

  function loop(ts) {
    try {
      const dt = Math.min((ts - last) / 1000, 0.1);
      last = ts;
      tick++;
      updateAgents(dt);
      render(ctx, map, innerWidth, innerHeight, tick);
    } catch (e) {
      console.error('Render error:', e);
      ctx.fillStyle = '#FF2255';
      ctx.font = '14px monospace';
      ctx.fillText('Error: ' + e.message, 20, 30);
    }
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

main().catch(e => {
  console.error('Fatal:', e);
  document.body.style.background = '#000';
  document.body.style.color = '#FF2255';
  document.body.style.padding = '40px';
  document.body.style.fontFamily = 'monospace';
  document.body.innerText = 'BlackRoad HQ Error: ' + e.message;
});
