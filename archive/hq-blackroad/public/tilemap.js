// ══════════════════════════════════════════════════════════════
// BlackRoad HQ — Tile Engine (Pokemon/Stardew Valley style)
// Grid-based, pixel-perfect, proper top-down 3/4 view
// ══════════════════════════════════════════════════════════════

const TILE_SIZE = 16; // Base tile size (scales with zoom)
const MAP_W = 30; // Map width in tiles
const MAP_H = 20; // Map height in tiles

// ── Tile palette ──
// Each tile is a function that draws a 16x16 pixel tile
const TILES = {
  // 0 = empty/void
  0: (ctx, x, y, s) => { ctx.fillStyle = '#0a0a0a'; ctx.fillRect(x, y, s, s); },

  // Floors
  1: (ctx, x, y, s) => { // Wood floor
    ctx.fillStyle = '#B08050'; ctx.fillRect(x, y, s, s);
    ctx.fillStyle = '#A07040'; ctx.fillRect(x, y, s, 1);
    ctx.fillStyle = '#C09060'; ctx.fillRect(x+2, y+3, s-4, 2);
    ctx.fillStyle = '#A07848'; ctx.fillRect(x, y+s-1, s, 1);
  },
  2: (ctx, x, y, s) => { // Tile floor
    ctx.fillStyle = '#A0AAB4'; ctx.fillRect(x, y, s, s);
    ctx.fillStyle = '#90989E'; ctx.fillRect(x, y+s-1, s, 1);
    ctx.fillStyle = '#90989E'; ctx.fillRect(x+s-1, y, 1, s);
    ctx.fillStyle = '#B0B8C0'; ctx.fillRect(x, y, s, 1);
    ctx.fillStyle = '#B0B8C0'; ctx.fillRect(x, y, 1, s);
  },
  3: (ctx, x, y, s) => { // Carpet
    ctx.fillStyle = '#3A4868'; ctx.fillRect(x, y, s, s);
    ctx.fillStyle = '#344260'; ctx.fillRect(x+(x/s%2===0?0:s/2), y+(y/s%2===0?0:s/2), s/2, s/2);
  },
  4: (ctx, x, y, s) => { // Dark floor (server room)
    ctx.fillStyle = '#1A1A24'; ctx.fillRect(x, y, s, s);
    ctx.fillStyle = '#222230'; ctx.fillRect(x+1, y+1, s-2, s-2);
  },
  5: (ctx, x, y, s) => { // Marble
    ctx.fillStyle = '#D8D0C8'; ctx.fillRect(x, y, s, s);
    ctx.fillStyle = '#E0D8D0'; ctx.fillRect(x, y, s, 1);
    ctx.fillStyle = '#C8C0B8'; ctx.fillRect(x+s-1, y, 1, s);
    ctx.strokeStyle = 'rgba(200,190,175,0.2)'; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(x+Math.sin(x)*3, y); ctx.lineTo(x+s, y+Math.sin(y)*4+s/2); ctx.stroke();
  },
  6: (ctx, x, y, s) => { // Concrete
    ctx.fillStyle = '#808890'; ctx.fillRect(x, y, s, s);
    ctx.fillStyle = '#788088'; ctx.fillRect(x, y+s-1, s, 1);
  },
  7: (ctx, x, y, s) => { // Gym rubber
    ctx.fillStyle = '#2C2C34'; ctx.fillRect(x, y, s, s);
    ctx.fillStyle = '#34343C'; ctx.fillRect(x+1, y+1, s-2, s-2);
  },
  8: (ctx, x, y, s) => { // Grass
    ctx.fillStyle = '#5AA84A'; ctx.fillRect(x, y, s, s);
    ctx.fillStyle = '#50A040'; ctx.fillRect(x+Math.sin(x+y)*4, y+2, 2, 3);
    ctx.fillStyle = '#60B058'; ctx.fillRect(x+6, y+Math.sin(x)*3+5, 2, 2);
  },
  9: (ctx, x, y, s) => { // Stone path
    ctx.fillStyle = '#A8A098'; ctx.fillRect(x, y, s, s);
    ctx.fillStyle = '#B0A8A0'; ctx.fillRect(x+1, y+1, s-2, s-2);
    ctx.fillStyle = '#989088'; ctx.fillRect(x+s-1, y, 1, s);
  },

  // Walls
  10: (ctx, x, y, s) => { // Wall top
    ctx.fillStyle = '#D0D0D8'; ctx.fillRect(x, y, s, s);
    ctx.fillStyle = '#C0C0C8'; ctx.fillRect(x, y+s-2, s, 2);
    ctx.fillStyle = '#E0E0E8'; ctx.fillRect(x, y, s, 2);
  },
  11: (ctx, x, y, s) => { // Wall dark
    ctx.fillStyle = '#404050'; ctx.fillRect(x, y, s, s);
    ctx.fillStyle = '#383848'; ctx.fillRect(x, y+s-1, s, 1);
  },
  12: (ctx, x, y, s) => { // Window
    ctx.fillStyle = '#88BBDD'; ctx.fillRect(x, y, s, s);
    ctx.fillStyle = '#70A8CC'; ctx.fillRect(x+s/2-1, y, 2, s);
    ctx.fillStyle = '#70A8CC'; ctx.fillRect(x, y+s/2-1, s, 2);
    ctx.fillStyle = '#666'; ctx.fillRect(x, y, s, 1); ctx.fillRect(x, y+s-1, s, 1);
    ctx.fillRect(x, y, 1, s); ctx.fillRect(x+s-1, y, 1, s);
  },

  // Furniture (multi-tile drawn from top-left)
  20: (ctx, x, y, s) => { // Desk top
    ctx.fillStyle = '#B08050'; ctx.fillRect(x, y, s, s);
    ctx.fillStyle = '#C89868'; ctx.fillRect(x+1, y+1, s-2, s-2);
    ctx.fillStyle = '#A07040'; ctx.fillRect(x, y+s-1, s, 1);
  },
  21: (ctx, x, y, s) => { // Desk side
    ctx.fillStyle = '#8B6538'; ctx.fillRect(x, y, s, s);
    ctx.fillStyle = '#7A5528'; ctx.fillRect(x+s-2, y, 2, s);
  },
  22: (ctx, x, y, s) => { // Monitor
    ctx.fillStyle = '#1A1A28'; ctx.fillRect(x, y, s, s);
    ctx.fillStyle = '#304060'; ctx.fillRect(x+1, y+1, s-2, s-3);
    // Screen glow
    ctx.fillStyle = '#4080B0'; ctx.fillRect(x+2, y+2, s-4, s-5);
    // Stand
    ctx.fillStyle = '#333'; ctx.fillRect(x+s/2-2, y+s-2, 4, 2);
  },
  23: (ctx, x, y, s) => { // Chair (top view)
    ctx.fillStyle = '#2A3A5A'; ctx.fillRect(x+2, y+2, s-4, s-4);
    ctx.fillStyle = '#1E2E4A';
    ctx.fillRect(x+3, y+1, s-6, 3); // backrest
    // Wheels
    ctx.fillStyle = '#444';
    ctx.fillRect(x+1, y+s-3, 3, 2);
    ctx.fillRect(x+s-4, y+s-3, 3, 2);
  },
  24: (ctx, x, y, s) => { // Server rack
    ctx.fillStyle = '#1A1A28'; ctx.fillRect(x, y, s, s);
    ctx.fillStyle = '#2A2A38'; ctx.fillRect(x+1, y+1, s-2, s-2);
    // LEDs
    ctx.fillStyle = '#4CAF50'; ctx.fillRect(x+2, y+3, 2, 2);
    ctx.fillStyle = '#2979FF'; ctx.fillRect(x+5, y+3, 2, 2);
    ctx.fillStyle = '#4CAF50'; ctx.fillRect(x+2, y+7, 2, 2);
    ctx.fillStyle = '#F44336'; ctx.fillRect(x+5, y+7, 2, 2);
    // Drive bays
    ctx.fillStyle = '#333'; ctx.fillRect(x+8, y+2, s-10, 3);
    ctx.fillRect(x+8, y+6, s-10, 3);
    ctx.fillRect(x+8, y+10, s-10, 3);
  },
  25: (ctx, x, y, s) => { // Plant
    ctx.fillStyle = '#8B6538'; ctx.fillRect(x+3, y+s-5, s-6, 5); // pot
    ctx.fillStyle = '#6B4518'; ctx.fillRect(x+2, y+s-6, s-4, 2); // rim
    ctx.fillStyle = '#3A8A3A'; // leaves
    ctx.beginPath(); ctx.arc(x+s/2, y+s/2-2, s/3, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#4A9A4A';
    ctx.beginPath(); ctx.arc(x+s/2-3, y+s/2-4, s/4, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x+s/2+3, y+s/2-3, s/4, 0, Math.PI*2); ctx.fill();
  },
  26: (ctx, x, y, s) => { // Couch
    ctx.fillStyle = '#3A4A6A'; ctx.fillRect(x, y, s, s);
    ctx.fillStyle = '#4A5A7A'; ctx.fillRect(x+1, y+3, s-2, s-4);
    ctx.fillStyle = '#2A3A5A'; ctx.fillRect(x, y, s, 3); // backrest
  },
  27: (ctx, x, y, s) => { // Table (round, top view)
    ctx.fillStyle = '#B08858';
    ctx.beginPath(); ctx.arc(x+s/2, y+s/2, s/2-1, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#C09868';
    ctx.beginPath(); ctx.arc(x+s/2, y+s/2, s/2-3, 0, Math.PI*2); ctx.fill();
  },
  28: (ctx, x, y, s) => { // Kitchen counter
    ctx.fillStyle = '#888'; ctx.fillRect(x, y, s, s);
    ctx.fillStyle = '#999'; ctx.fillRect(x+1, y+1, s-2, s-2);
    ctx.fillStyle = '#777'; ctx.fillRect(x, y+s-2, s, 2);
  },
  29: (ctx, x, y, s) => { // Rug
    ctx.fillStyle = '#804040'; ctx.fillRect(x, y, s, s);
    ctx.fillStyle = '#905050'; ctx.fillRect(x+2, y+2, s-4, s-4);
  },
  30: (ctx, x, y, s) => { // Water (fountain)
    ctx.fillStyle = '#3080B0'; ctx.fillRect(x, y, s, s);
    ctx.fillStyle = `rgba(100,180,230,${0.3+Math.sin(Date.now()/500+x)*0.1})`;
    ctx.fillRect(x+1, y+1, s-2, s-2);
  },
  31: (ctx, x, y, s) => { // Treadmill
    ctx.fillStyle = '#444'; ctx.fillRect(x, y, s, s);
    ctx.fillStyle = '#333'; ctx.fillRect(x+2, y+3, s-4, s-6);
    ctx.fillStyle = '#555'; ctx.fillRect(x+1, y, 3, s); // handle
  },
  32: (ctx, x, y, s) => { // Pool table
    ctx.fillStyle = '#2A5018'; ctx.fillRect(x, y, s, s);
    ctx.fillStyle = '#3A7020'; ctx.fillRect(x+1, y+1, s-2, s-2);
  },
  33: (ctx, x, y, s) => { // Bookshelf
    ctx.fillStyle = '#6B4518'; ctx.fillRect(x, y, s, s);
    ctx.fillStyle = '#C94040'; ctx.fillRect(x+1, y+1, 3, s/2-1);
    ctx.fillStyle = '#4A80C0'; ctx.fillRect(x+5, y+1, 3, s/2-1);
    ctx.fillStyle = '#50A050'; ctx.fillRect(x+9, y+1, 3, s/2-1);
    ctx.fillStyle = '#C0A040'; ctx.fillRect(x+1, y+s/2+1, 3, s/2-2);
    ctx.fillStyle = '#8050A0'; ctx.fillRect(x+5, y+s/2+1, 3, s/2-2);
    ctx.fillStyle = '#A06030'; ctx.fillRect(x+9, y+s/2+1, 3, s/2-2);
    ctx.fillStyle = '#5a3a10'; ctx.fillRect(x, y+s/2, s, 1);
  },
  34: (ctx, x, y, s) => { // Whiteboard
    ctx.fillStyle = '#888'; ctx.fillRect(x, y, s, s);
    ctx.fillStyle = '#F0F0F0'; ctx.fillRect(x+1, y+1, s-2, s-2);
    ctx.strokeStyle = '#44a'; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(x+3, y+4); ctx.lineTo(x+s-3, y+s-4); ctx.stroke();
  },
  35: (ctx, x, y, s) => { // Vending machine
    ctx.fillStyle = '#2A3A5A'; ctx.fillRect(x, y, s, s);
    ctx.fillStyle = '#88BBCC'; ctx.fillRect(x+2, y+1, s-4, s/2);
    ctx.fillStyle = '#e44'; ctx.fillRect(x+3, y+2, 3, 3);
    ctx.fillStyle = '#4a4'; ctx.fillRect(x+7, y+2, 3, 3);
    ctx.fillStyle = '#44e'; ctx.fillRect(x+3, y+6, 3, 3);
  },
  36: (ctx, x, y, s) => { // Arcade machine
    ctx.fillStyle = '#2A2A4A'; ctx.fillRect(x, y, s, s);
    ctx.fillStyle = '#4488CC'; ctx.fillRect(x+2, y+1, s-4, s/2);
    ctx.fillStyle = '#c00'; ctx.beginPath(); ctx.arc(x+s/2, y+s-4, 2, 0, Math.PI*2); ctx.fill();
  },
  37: (ctx, x, y, s) => { // Weight rack
    ctx.fillStyle = '#444'; ctx.fillRect(x, y, s, s);
    for(let w2=0;w2<3;w2++) { ctx.fillStyle = `hsl(0,0%,${40+w2*8}%)`; ctx.fillRect(x+1+w2*4, y+2, 3, s-4); }
  },
  38: (ctx, x, y, s) => { // Reception desk
    ctx.fillStyle = '#444'; ctx.fillRect(x, y, s, s);
    ctx.fillStyle = '#555'; ctx.fillRect(x+1, y+1, s-2, s-4);
    ctx.fillStyle = '#FF1D6C'; ctx.fillRect(x+2, y+s-3, s-4, 2);
  },
};

// ── Floor tile maps ──
// Each floor is a 2D array of tile IDs
const MAPS = {
  'f10': { // Mission Control
    tiles: [
      [10,10,12,10,10,12,10,10,12,10,10,12,10,10,12,10,10,12,10,10,12,10,10,12,10,10,12,10,10,10],
      [10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10],
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
      [2,20,20,22,2,25,2,20,20,22,2,2,2,2,2,20,20,22,2,25,2,20,20,22,2,2,24,24,2,2],
      [2,20,22,23,2,2,2,20,22,23,2,2,2,2,2,20,22,23,2,2,2,20,22,23,2,2,24,24,2,2],
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
      [2,2,2,25,2,2,2,2,2,2,2,2,27,27,2,2,2,2,2,2,2,2,2,25,2,2,2,2,2,2],
      [2,2,2,2,2,2,2,2,2,23,2,23,27,27,23,2,23,2,2,2,2,2,2,2,2,2,2,2,2,2],
      [2,20,20,22,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,20,20,22,2,2,2,2,2,2],
      [2,20,22,23,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,20,22,23,2,2,2,2,2,2],
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,25,2,2,2,2],
    ],
    chairs: [ // Positions where agents can sit {tx, ty, dir}
      {tx:3, ty:4, dir:1}, {tx:9, ty:4, dir:1}, {tx:17, ty:4, dir:1}, {tx:23, ty:4, dir:1},
      {tx:9, ty:7, dir:1}, {tx:14, ty:7, dir:-1}, {tx:16, ty:7, dir:-1},
      {tx:3, ty:9, dir:1}, {tx:23, ty:9, dir:1},
    ],
  },
  'f4': { // Engineering
    tiles: [
      [10,10,12,12,10,10,12,12,10,10,12,12,10,10,12,12,10,10,12,12,10,10,12,12,10,10,12,12,10,10],
      [10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,20,20,22,1,25,1,20,20,22,1,1,1,1,1,20,20,22,1,25,1,20,20,22,1,1,33,33,1,1],
      [1,20,22,23,1,1,1,20,22,23,1,1,1,1,1,20,22,23,1,1,1,20,22,23,1,1,33,33,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,20,20,22,1,1,1,20,20,22,1,1,1,25,1,1,1,1,34,34,34,1,1,1,1,1,1,1,1,1],
      [1,20,22,23,1,1,1,20,22,23,1,1,1,1,1,1,1,1,34,1,34,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,26,26,26,26,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,25,1,1,1,26,26,26,26,1,25,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,29,29,1,1,1,1],
    ],
    chairs: [
      {tx:3, ty:4, dir:1}, {tx:9, ty:4, dir:1}, {tx:17, ty:4, dir:1}, {tx:23, ty:4, dir:1},
      {tx:3, ty:7, dir:1}, {tx:9, ty:7, dir:1},
    ],
  },
  'f7': { // Server Room
    tiles: (() => {
      const m = [];
      for(let y=0;y<12;y++) {
        const row = [];
        for(let x=0;x<30;x++) {
          if(y<1) row.push(11); // dark wall
          else if(y>=1&&y<=3 && x%4<2 && x>1 && x<28) row.push(24); // server racks row A
          else if(y===4) row.push(4);
          else if(y===5) row.push(x>10&&x<20 ? 20 : 4); // monitoring desk
          else if(y===6) row.push(x===14||x===16 ? 23 : 4); // chairs
          else if(y>=7&&y<=9 && x%4<2 && x>1 && x<28) row.push(24); // server racks row B
          else row.push(4);
        }
        m.push(row);
      }
      return m;
    })(),
    chairs: [{tx:14, ty:6, dir:1}, {tx:16, ty:6, dir:-1}],
  },
  'f1': { // Lobby
    tiles: (() => {
      const m = [];
      for(let y=0;y<12;y++) {
        const row = [];
        for(let x=0;x<30;x++) {
          if(y<2) row.push(10); // back wall
          else if(y>=5&&y<=7&&x>=12&&x<=17) row.push(30); // fountain water
          else if(x<6&&y>6) row.push(y>8?38:5); // reception area
          else if(x>22&&y>5&&y<10) row.push(26); // waiting couches
          else row.push(5); // marble
        }
        m.push(row);
      }
      return m;
    })(),
    chairs: [{tx:4, ty:9, dir:1}, {tx:24, ty:7, dir:-1}, {tx:24, ty:8, dir:-1}],
  },
};

// ── Render a tile map ──
function renderTileMap(ctx, floorId, canvasW, canvasH) {
  const map = MAPS[floorId];
  if (!map) return false;

  const tiles = map.tiles;
  const rows = tiles.length;
  const cols = tiles[0].length;

  // Calculate tile size to fill canvas
  const tileW = Math.floor(canvasW / cols);
  const tileH = Math.floor(canvasH / rows);
  const ts = Math.min(tileW, tileH);

  // Center the map
  const offsetX = Math.floor((canvasW - cols * ts) / 2);
  const offsetY = Math.floor((canvasH - rows * ts) / 2);

  // Draw tiles
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const tileId = tiles[r][c];
      const drawFn = TILES[tileId];
      if (drawFn) {
        drawFn(ctx, offsetX + c * ts, offsetY + r * ts, ts);
      }
    }
  }

  return { ts, offsetX, offsetY, cols, rows, chairs: map.chairs || [] };
}
