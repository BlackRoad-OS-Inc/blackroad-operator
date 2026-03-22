/**
 * BlackRoad HQ — Pixel World v8
 * Tile-built office. Real collision map. BFS pathfinding. Correct sprites.
 * BlackRoad OS, Inc. — Pave Tomorrow.
 */

const T = 16, S = 3, TS = T * S; // 48px tiles on screen

// ── Assets ──
let tileset, meta, chars = [];
function loadImg(s) { return new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = s }) }
async function load(fn) {
  fn('Tileset...'); tileset = await loadImg('sprites/tileset.png');
  const r = await fetch('sprites/tileset-metadata.json'); meta = await r.json();
  for (let i = 0; i < 6; i++) { fn(`Character ${i+1}/6...`); chars[i] = await loadImg(`sprites/characters/char_${i}.png`) }
}
function tileB(id) { const t = meta.items.find(i => i.id === id); return t ? t.bounds : null }
function drawT(ctx, id, px, py) { const b = tileB(id); if (!b || !tileset) return; ctx.drawImage(tileset, b.x, b.y, b.width, b.height, px, py, b.width * S, b.height * S) }

// ── Map ──
// Legend: 0=floor, 1=wall, 2+=furniture (walkable=false)
const COLS = 24, ROWS = 16;
const W = 1, F = 0;

// Collision grid (0=walkable, anything else=blocked)
const collision = [];
// Tile IDs grid for floor layer
const floorGrid = [];
// Furniture list: [{id, col, row}]
const furnitureList = [];

function placeFloor(col, row, id) {
  if (!floorGrid[row]) floorGrid[row] = [];
  floorGrid[row][col] = id;
}

function placeFurniture(col, row, id) {
  const b = tileB(id);
  if (!b) return;
  const tw = Math.ceil(b.width / T), th = Math.ceil(b.height / T);
  furnitureList.push({ id, col, row, tw, th });
  // Block tiles
  for (let dy = 0; dy < th; dy++)
    for (let dx = 0; dx < tw; dx++)
      if (collision[row + dy]) collision[row + dy][col + dx] = 2;
}

function buildMap() {
  // Init grids
  for (let y = 0; y < ROWS; y++) {
    collision[y] = [];
    floorGrid[y] = [];
    for (let x = 0; x < COLS; x++) {
      collision[y][x] = 0;
      floorGrid[y][x] = null;
    }
  }
  furnitureList.length = 0;

  // Floor tiles
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      // Walls on border
      if (y === 0 || y === ROWS-1 || x === 0 || x === COLS-1) {
        collision[y][x] = W;
      }
      // Divider wall
      else if (x === 12 && y > 0 && y < ROWS-1 && y !== 4 && y !== 10) {
        collision[y][x] = W;
      }
      // Horizontal wall
      else if (y === 8 && x > 0 && x < 12 && x !== 6) {
        collision[y][x] = W;
      }
      // Left rooms: dark blue
      if (x >= 1 && x <= 11 && y >= 1 && y < 8) placeFloor(x, y, 'floor_dark_blue');
      else if (x >= 1 && x <= 11 && y >= 9 && y <= ROWS-2) placeFloor(x, y, 'floor_dark_grey');
      else if (x >= 13 && x <= COLS-2 && y >= 1 && y <= ROWS-2) placeFloor(x, y, 'floor_dark_slate');
      else placeFloor(x, y, 'floor_dark_slate');
    }
  }

  // === LEFT TOP: Main Office ===
  // Desk row 1 (desks are 3 tiles wide, 2 tall — place anchor at top-left)
  placeFurniture(2, 2, 'desk_work_monitor');
  placeFurniture(6, 2, 'desk_wide_monitor');
  // Chairs below (1 tile each)
  placeFurniture(3, 4, 'chair_desk_blue');
  placeFurniture(7, 4, 'chair_desk_blue');
  // Second desk row
  placeFurniture(2, 5, 'desk_work_monitor');
  placeFurniture(6, 5, 'desk_wide_monitor');
  placeFurniture(3, 7, 'chair_office_grey');
  placeFurniture(7, 7, 'chair_office_grey');
  // Decor
  placeFurniture(10, 1, 'plant_potted_tall');
  placeFurniture(1, 1, 'clock_wall_round');
  placeFurniture(10, 4, 'filing_cabinet_blue');

  // === LEFT BOTTOM: Break Room ===
  placeFurniture(2, 9, 'fridge_double_door');
  placeFurniture(4, 9, 'vending_machine_soda');
  placeFurniture(6, 9, 'water_cooler');
  placeFurniture(8, 10, 'coffee_maker_carafe');
  placeFurniture(3, 12, 'table_round_grey');
  placeFurniture(3, 14, 'chair_arm_brown');
  placeFurniture(5, 14, 'chair_arm_brown');
  placeFurniture(8, 13, 'sofa_mauve_center');
  placeFurniture(1, 14, 'plant_fern');
  placeFurniture(10, 9, 'plant_potted_tall');

  // === RIGHT: Server/Command ===
  // Server racks along top
  placeFurniture(14, 1, 'server_rack');
  placeFurniture(16, 1, 'server_rack');
  placeFurniture(18, 1, 'server_rack');
  placeFurniture(20, 1, 'server_rack');
  placeFurniture(22, 1, 'server_rack');
  // Workstation row
  placeFurniture(14, 5, 'desk_dark_wood');
  placeFurniture(18, 5, 'desk_metal_grey');
  placeFurniture(15, 7, 'chair_desk_blue');
  placeFurniture(19, 7, 'chair_desk_blue');
  // Second row
  placeFurniture(14, 9, 'desk_dark_wood');
  placeFurniture(18, 9, 'desk_metal_grey');
  placeFurniture(15, 11, 'chair_arm_brown');
  placeFurniture(19, 11, 'chair_arm_brown');
  // Wall decor
  placeFurniture(22, 5, 'whiteboard_charts');
  placeFurniture(22, 9, 'window_double');
  // Meeting table
  placeFurniture(14, 13, 'table_conference');
  placeFurniture(14, 15, 'chair_office_grey');
  placeFurniture(16, 15, 'chair_office_grey');
  // More decor
  placeFurniture(22, 13, 'bookshelf_tall');
  placeFurniture(13, 14, 'plant_bushy');
  placeFurniture(22, 15, 'plant_potted_small');
  placeFurniture(21, 1, 'filing_cabinet_wood');
}

// ── BFS Pathfinding ──
function findPath(sx, sy, ex, ey) {
  sx = Math.round(sx); sy = Math.round(sy);
  ex = Math.round(ex); ey = Math.round(ey);
  if (ex < 0 || ex >= COLS || ey < 0 || ey >= ROWS) return [];
  if (collision[ey][ex] !== 0) return [];
  if (sx === ex && sy === ey) return [];

  const visited = {};
  const queue = [{ x: sx, y: sy, path: [] }];
  visited[`${sx},${sy}`] = true;
  const dirs = [[0,1],[0,-1],[1,0],[-1,0]];

  while (queue.length > 0) {
    const cur = queue.shift();
    for (const [dx, dy] of dirs) {
      const nx = cur.x + dx, ny = cur.y + dy;
      const key = `${nx},${ny}`;
      if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) continue;
      if (visited[key]) continue;
      if (collision[ny][nx] !== 0) continue;
      visited[key] = true;
      const newPath = [...cur.path, { x: nx, y: ny }];
      if (nx === ex && ny === ey) return newPath;
      queue.push({ x: nx, y: ny, path: newPath });
    }
  }
  return []; // no path
}

// ── Agents ──
const FLEET = [
  { name: 'Alice',   color: '#00D4FF', palette: 0 },
  { name: 'Cecilia', color: '#8844FF', palette: 1 },
  { name: 'Octavia', color: '#CC00AA', palette: 2 },
  { name: 'Aria',    color: '#FF2255', palette: 3 },
  { name: 'Lucidia', color: '#FF6B2B', palette: 4 },
];
const TOOLS = ['Read', 'Bash', 'Grep', 'Edit', 'Write', 'Glob', 'Agent'];
const CHAT = [
  'Deploying...', 'git push', 'npm build', 'docker pull', 'Scanning...',
  'Fleet sync', 'KPI collect', 'Indexing...', 'ollama run', 'rclone sync',
  'Testing...', 'Pi-hole refresh', 'Gitea mirror', 'wrangler deploy',
];

let agents = [];

function randomWalkable() {
  for (let tries = 0; tries < 200; tries++) {
    const x = 1 + Math.floor(Math.random() * (COLS - 2));
    const y = 1 + Math.floor(Math.random() * (ROWS - 2));
    if (collision[y][x] === 0) return { x, y };
  }
  return { x: 5, y: 5 };
}

function spawnAgents() {
  agents = FLEET.map((f, i) => {
    const pos = randomWalkable();
    return {
      ...f, col: pos.x, row: pos.y,
      x: pos.x, y: pos.y, // smooth position (fractional tiles)
      path: [], pathIdx: 0,
      dir: 0, // 0=down,1=up,2=right,3=left
      frame: 0, ft: 0,
      state: 'idle',
      timer: 1 + Math.random() * 3,
      tool: null, bubble: null, bt: 0,
    };
  });
}

function updateAgents(dt) {
  for (const a of agents) {
    a.ft += dt;
    if (a.bt > 0) { a.bt -= dt; if (a.bt <= 0) a.bubble = null; }

    if (a.state === 'idle') {
      a.timer -= dt;
      if (a.timer <= 0) {
        const target = randomWalkable();
        const path = findPath(Math.round(a.x), Math.round(a.y), target.x, target.y);
        if (path.length > 0) {
          a.path = path;
          a.pathIdx = 0;
          a.state = 'walk';
        }
        a.timer = 2 + Math.random() * 4;
      }
    }
    else if (a.state === 'walk') {
      if (a.pathIdx >= a.path.length) {
        a.x = Math.round(a.x); a.y = Math.round(a.y);
        a.state = 'work';
        a.timer = 2 + Math.random() * 5;
        a.tool = TOOLS[Math.floor(Math.random() * TOOLS.length)];
        a.bubble = CHAT[Math.floor(Math.random() * CHAT.length)];
        a.bt = 3.5;
        a.frame = 0;
      } else {
        const target = a.path[a.pathIdx];
        const dx = target.x - a.x, dy = target.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 0.05) {
          a.x = target.x; a.y = target.y;
          a.pathIdx++;
        } else {
          const spd = 3 * dt; // tiles per second
          a.x += (dx / dist) * spd;
          a.y += (dy / dist) * spd;
        }

        // Direction based on movement
        if (Math.abs(dx) > Math.abs(dy)) {
          a.dir = dx > 0 ? 2 : 3; // right : left
        } else {
          a.dir = dy > 0 ? 0 : 1; // down : up
        }

        if (a.ft > 0.15) { a.frame = (a.frame + 1) % 3; a.ft = 0; }
      }
    }
    else if (a.state === 'work') {
      a.timer -= dt;
      if (a.ft > 0.3) { a.frame = (a.frame + 1) % 2; a.ft = 0; }
      if (a.timer <= 0) { a.state = 'idle'; a.tool = null; a.timer = 1 + Math.random() * 3; }
    }
  }
}

// ── Drawing ──
function drawAgent(ctx, a, ox, oy) {
  const sheet = chars[a.palette % chars.length];
  if (!sheet) return;

  const fw = sheet.width / 7, fh = sheet.height / 3;
  // Sheet rows: 0=down, 1=up, 2=right
  let row, flipX = false;
  if (a.dir === 0) row = 0;      // down
  else if (a.dir === 1) row = 1;  // up
  else if (a.dir === 2) row = 2;  // right
  else { row = 2; flipX = true; } // left = flip right

  let col;
  if (a.state === 'walk') col = a.frame % 3;       // walk frames 0-2
  else if (a.state === 'work') col = 3 + (a.frame % 2); // work frames 3-4
  else col = 1; // idle = standing frame

  const px = ox + a.x * TS + TS / 2;
  const py = ox ? oy + a.y * TS + TS : oy + a.y * TS + TS;
  const dw = fw * S, dh = fh * S;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(px, py + 2, dw * 0.28, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Character (handle flip for left-facing)
  ctx.save();
  if (flipX) {
    ctx.translate(px, py - dh + 4);
    ctx.scale(-1, 1);
    ctx.drawImage(sheet, col * fw, row * fh, fw, fh, -dw / 2, 0, dw, dh);
  } else {
    ctx.drawImage(sheet, col * fw, row * fh, fw, fh, px - dw / 2, py - dh + 4, dw, dh);
  }
  ctx.restore();

  // Name tag
  ctx.font = '700 10px JetBrains Mono';
  ctx.textAlign = 'center';
  const nm = a.name;
  const nw = ctx.measureText(nm).width + 8;
  ctx.fillStyle = 'rgba(0,0,0,0.85)';
  ctx.fillRect(px - nw / 2, py - dh - 6, nw, 14);
  ctx.fillStyle = a.color;
  ctx.fillRect(px - nw / 2, py - dh - 6, 3, 14);
  ctx.fillStyle = '#fff';
  ctx.fillText(nm, px + 1, py - dh + 5);

  // Tool badge
  if (a.tool) {
    ctx.font = '500 8px JetBrains Mono';
    const tw = ctx.measureText(a.tool).width + 6;
    ctx.fillStyle = a.color + '40';
    ctx.fillRect(px - tw / 2, py + 5, tw, 12);
    ctx.fillStyle = a.color;
    ctx.fillText(a.tool, px, py + 14);
  }

  // Bubble
  if (a.bubble) {
    ctx.font = '9px JetBrains Mono';
    const bw = ctx.measureText(a.bubble).width + 12;
    const bx = px - bw / 2, by = py - dh - 28;
    ctx.fillStyle = 'rgba(10,10,10,0.92)';
    ctx.fillRect(bx, by, bw, 18);
    ctx.strokeStyle = a.color + '70';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, bw, 18);
    // Tail
    ctx.fillStyle = 'rgba(10,10,10,0.92)';
    ctx.beginPath();
    ctx.moveTo(px - 3, by + 18); ctx.lineTo(px, by + 23); ctx.lineTo(px + 3, by + 18);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.textAlign = 'center';
    ctx.fillText(a.bubble, px, by + 13);
  }
}

let tick = 0;

function render(ctx, w, h) {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);

  const mapW = COLS * TS, mapH = ROWS * TS;
  const ox = Math.floor((w - mapW) / 2);
  const oy = Math.floor((h - mapH) / 2);

  ctx.save();
  ctx.translate(ox, oy);

  // Floor
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const fid = floorGrid[y][x];
      if (fid) drawT(ctx, fid, x * TS, y * TS);
    }
  }

  // Walls
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (collision[y][x] === W) {
        drawT(ctx, 'wall_cool_grey', x * TS, (y - 1) * TS);
      }
    }
  }

  // Collect Y-sortable items
  const drawables = [];

  // Furniture
  for (const f of furnitureList) {
    const b = tileB(f.id);
    if (!b) continue;
    drawables.push({
      type: 'furn', id: f.id,
      px: f.col * TS,
      py: f.row * TS,
      sortY: f.row + Math.ceil(b.height / T),
    });
  }

  // Agents
  for (const a of agents) {
    drawables.push({ type: 'agent', agent: a, sortY: a.y + 1 });
  }

  drawables.sort((a, b) => a.sortY - b.sortY);

  for (const d of drawables) {
    if (d.type === 'furn') {
      drawT(ctx, d.id, d.px, d.py);
      // Animated LEDs for servers
      if (d.id === 'server_rack') {
        const bx = d.px, by = d.py;
        const on1 = (tick + d.px) % 40 < 20;
        const on2 = (tick + d.py) % 30 < 15;
        ctx.fillStyle = on1 ? '#00D4FF' : '#222';
        ctx.fillRect(bx + 36, by + 8, 6, 6);
        ctx.fillStyle = on2 ? '#FF6B2B' : '#222';
        ctx.fillRect(bx + 36, by + 20, 6, 6);
      }
      // Monitor glow
      if (d.id.includes('desk_') || d.id.includes('monitor')) {
        const spec = ['#FF6B2B','#FF2255','#CC00AA','#8844FF','#4488FF','#00D4FF'];
        ctx.fillStyle = spec[Math.floor(tick / 25 + d.px) % spec.length];
        ctx.globalAlpha = 0.05;
        ctx.fillRect(d.px + 6, d.py + 6, 36, 20);
        ctx.globalAlpha = 1;
      }
    } else {
      drawAgent(ctx, d.agent, 0, 0);
    }
  }

  // Spectrum bars
  const spec = ['#FF6B2B','#FF2255','#CC00AA','#8844FF','#4488FF','#00D4FF'];
  const sw = mapW / spec.length;
  ctx.globalAlpha = 0.5;
  for (let i = 0; i < spec.length; i++) {
    ctx.fillStyle = spec[i];
    ctx.fillRect(i * sw, -3, sw, 3);
    ctx.fillRect(i * sw, mapH, sw, 3);
  }
  ctx.globalAlpha = 1;

  ctx.restore();
}

// ── Main ──
async function main() {
  const c = document.getElementById('c');
  const ctx = c.getContext('2d');

  function resize() {
    const d = devicePixelRatio || 1;
    c.width = innerWidth * d; c.height = innerHeight * d;
    c.style.width = innerWidth + 'px'; c.style.height = innerHeight + 'px';
    ctx.setTransform(d, 0, 0, d, 0, 0);
    ctx.imageSmoothingEnabled = false;
  }
  resize();
  addEventListener('resize', resize);

  function status(m) {
    const d = devicePixelRatio || 1;
    ctx.setTransform(d, 0, 0, d, 0, 0);
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, innerWidth, innerHeight);
    ctx.fillStyle = '#CC00AA'; ctx.font = '700 20px JetBrains Mono'; ctx.textAlign = 'center';
    ctx.fillText('BlackRoad HQ', innerWidth / 2, innerHeight / 2 - 30);
    ctx.fillStyle = '#555'; ctx.font = '12px JetBrains Mono';
    ctx.fillText(m, innerWidth / 2, innerHeight / 2 + 10);
  }

  status('Loading...');
  await load(status);
  buildMap();
  spawnAgents();

  let last = 0;
  function loop(ts) {
    const dt = Math.min((ts - last) / 1000, 0.1);
    last = ts; tick++;
    const d = devicePixelRatio || 1;
    ctx.setTransform(d, 0, 0, d, 0, 0);
    ctx.imageSmoothingEnabled = false;
    updateAgents(dt);
    render(ctx, innerWidth, innerHeight);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

main().catch(e => {
  document.body.style.cssText = 'background:#000;color:#FF2255;padding:40px;font:16px monospace';
  document.body.innerText = 'Error: ' + e.message;
});
