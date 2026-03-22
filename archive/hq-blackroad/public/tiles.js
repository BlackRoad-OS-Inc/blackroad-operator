// BlackRoad HQ Tile Engine — draws every pixel of every floor
// Furniture, walls, floors, equipment — all code, no images needed

const TILE = 16; // Base tile size, scales with canvas

// ── Color palette ──
const C = {
  // Floors
  wood:     '#C4915E', woodDark: '#A67744', woodLight: '#D4A46E',
  tile:     '#B8C4D0', tileDark: '#9AAAB8', tileLight: '#D0D8E0',
  carpet:   '#3A4A6A', carpetDark: '#2E3E5A', carpetLight: '#4A5A7A',
  concrete: '#808890', concreteDark: '#687078',
  grass:    '#5AA84A', grassDark: '#4A9040',
  // Walls
  wall:     '#D8D8E0', wallDark: '#B8B8C0', wallAccent: '#E8E8F0',
  // Furniture
  deskTop:  '#C4915E', deskLeg:  '#8B6538',
  chairSeat:'#2A3A5A', chairBack:'#1E2E4A',
  monitor:  '#1A1A2E', monGlow:  '#4488CC',
  server:   '#1E1E2E', serverLed:'#4CAF50', serverLedB: '#2979FF',
  bookshelf:'#8B6538', book1: '#C94040', book2: '#4A80C0', book3: '#50A050', book4: '#C0A040',
  plant:    '#3A8A3A', pot:      '#8B6538', potDark: '#6B4518',
  couch:    '#3A4A6A', cushion:  '#4A5A7A',
  table:    '#C4915E', tableRound: '#B8A070',
  whiteboard: '#F0F0F0', wbBorder: '#888',
  window:   '#88BBEE', windowFrame: '#888',
  coffee:   '#333', coffeeAccent: '#555',
  vending:  '#2A3A5A', vendingGlass: '#88BBCC',
  // Server room
  rack:     '#1A1A2A', rackFront: '#2A2A3A',
  cable:    '#FF6B2B',
  // Gym
  mat:      '#4488CC', matDark: '#3366AA',
  treadmill:'#444', treadBelt: '#333',
  weights:  '#666', weightPlate: '#555',
};

// ── Drawing primitives ──
function drawRect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawRoundRect(ctx, x, y, w, h, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

// ── Furniture drawing functions ──
const Furniture = {
  desk(ctx, x, y, s, facing) {
    // Desktop surface
    drawRoundRect(ctx, x, y, s * 3.5, s * 1.8, 3, C.deskTop);
    drawRect(ctx, x + 2, y + 2, s * 3.5 - 4, s * 1.8 - 4, C.woodLight);
    // Legs
    drawRect(ctx, x + 4, y + s * 1.8, s * 0.4, s * 1.2, C.deskLeg);
    drawRect(ctx, x + s * 3 - 2, y + s * 1.8, s * 0.4, s * 1.2, C.deskLeg);
    // Monitor
    drawRect(ctx, x + s * 0.8, y - s * 1.5, s * 2, s * 1.4, C.monitor);
    drawRect(ctx, x + s * 0.9, y - s * 1.4, s * 1.8, s * 1.1, C.monGlow);
    // Monitor stand
    drawRect(ctx, x + s * 1.5, y - 2, s * 0.6, s * 0.3, C.monitor);
    // Keyboard
    drawRect(ctx, x + s * 0.6, y + s * 0.3, s * 1.8, s * 0.5, '#444');
    drawRect(ctx, x + s * 0.7, y + s * 0.35, s * 1.6, s * 0.3, '#555');
  },

  chair(ctx, x, y, s, color) {
    color = color || C.chairSeat;
    // Seat
    drawRoundRect(ctx, x, y, s * 1.6, s * 1.2, 3, color);
    // Back
    drawRoundRect(ctx, x + s * 0.1, y - s * 1.4, s * 1.4, s * 1.5, 4, color === C.chairSeat ? C.chairBack : color);
    // Base
    drawRect(ctx, x + s * 0.6, y + s * 1.2, s * 0.4, s * 0.6, '#444');
    // Wheels
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(x + s * 0.3, y + s * 1.9, 3, 0, Math.PI * 2);
    ctx.arc(x + s * 1.3, y + s * 1.9, 3, 0, Math.PI * 2);
    ctx.fill();
  },

  serverRack(ctx, x, y, s, t) {
    // Rack body
    drawRoundRect(ctx, x, y, s * 2, s * 4, 2, C.rack);
    drawRect(ctx, x + 2, y + 2, s * 2 - 4, s * 4 - 4, C.rackFront);
    // Server units (4)
    for (let i = 0; i < 4; i++) {
      const uy = y + 6 + i * (s * 0.9);
      drawRect(ctx, x + 4, uy, s * 2 - 8, s * 0.7, '#333');
      // LEDs
      ctx.fillStyle = Math.sin(t * 6 + i * 2) > 0 ? C.serverLed : '#1a3a1a';
      ctx.fillRect(x + 6, uy + 3, 4, 4);
      ctx.fillStyle = Math.sin(t * 8 + i * 3) > 0.5 ? C.serverLedB : '#1a1a3a';
      ctx.fillRect(x + 12, uy + 3, 4, 4);
      // Drive slots
      ctx.fillStyle = '#2a2a3a';
      for (let d = 0; d < 3; d++) ctx.fillRect(x + 20 + d * 6, uy + 2, 4, s * 0.5);
    }
    // Cables
    ctx.strokeStyle = C.cable;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + s, y + s * 4);
    ctx.bezierCurveTo(x + s, y + s * 4.5, x + s + 10, y + s * 4.8, x + s - 5, y + s * 5);
    ctx.stroke();
  },

  plant(ctx, x, y, s) {
    // Pot
    drawRect(ctx, x, y + s * 1.5, s * 1.2, s * 1, C.pot);
    drawRect(ctx, x - 2, y + s * 1.4, s * 1.4, s * 0.3, C.potDark);
    // Leaves
    ctx.fillStyle = C.plant;
    const leaves = [[0, 0], [-8, -5], [8, -5], [-5, -12], [5, -12], [0, -16]];
    leaves.forEach(([lx, ly]) => {
      ctx.beginPath();
      ctx.ellipse(x + s * 0.6 + lx, y + s * 1.2 + ly, 8, 6, lx * 0.05, 0, Math.PI * 2);
      ctx.fill();
    });
  },

  roundTable(ctx, x, y, s) {
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(x + s * 1.5, y + s * 2.2, s * 1.6, s * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Pedestal
    drawRect(ctx, x + s * 1.2, y + s * 1.5, s * 0.6, s * 0.8, C.deskLeg);
    // Table top (ellipse)
    ctx.fillStyle = C.tableRound;
    ctx.beginPath();
    ctx.ellipse(x + s * 1.5, y + s * 1.3, s * 1.6, s * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = C.woodLight;
    ctx.beginPath();
    ctx.ellipse(x + s * 1.5, y + s * 1.2, s * 1.4, s * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
  },

  couch(ctx, x, y, s) {
    // Base
    drawRoundRect(ctx, x, y + s * 0.5, s * 4, s * 1.5, 6, C.couch);
    // Back
    drawRoundRect(ctx, x + 2, y, s * 4 - 4, s * 0.8, 6, C.chairBack);
    // Cushions
    drawRoundRect(ctx, x + 4, y + s * 0.6, s * 1.8, s * 1.2, 4, C.cushion);
    drawRoundRect(ctx, x + s * 2 + 2, y + s * 0.6, s * 1.8, s * 1.2, 4, C.cushion);
    // Armrests
    drawRoundRect(ctx, x - 2, y + s * 0.3, s * 0.5, s * 1.5, 4, C.couch);
    drawRoundRect(ctx, x + s * 3.7, y + s * 0.3, s * 0.5, s * 1.5, 4, C.couch);
  },

  coffeeMachine(ctx, x, y, s) {
    drawRoundRect(ctx, x, y, s * 1.5, s * 2.5, 3, C.coffee);
    drawRect(ctx, x + 3, y + 3, s * 1.5 - 6, s * 1, C.coffeeAccent);
    // Dispenser
    drawRect(ctx, x + s * 0.4, y + s * 1.5, s * 0.7, s * 0.4, '#222');
    // Cup
    drawRect(ctx, x + s * 0.5, y + s * 2, s * 0.5, s * 0.4, '#fff');
    // Steam
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + s * 0.75, y + s * 1.9);
    ctx.quadraticCurveTo(x + s * 0.8 + Math.sin(time * 3) * 3, y + s * 1.5, x + s * 0.7, y + s * 1.2);
    ctx.stroke();
  },

  vendingMachine(ctx, x, y, s) {
    drawRoundRect(ctx, x, y, s * 2, s * 3.5, 3, C.vending);
    drawRect(ctx, x + 3, y + 3, s * 2 - 6, s * 2, C.vendingGlass);
    // Items inside
    const colors = ['#e44', '#4a4', '#44e', '#ea4', '#e4a', '#4ae'];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        ctx.fillStyle = colors[(r * 3 + c) % colors.length];
        ctx.fillRect(x + 6 + c * (s * 0.55), y + 8 + r * (s * 0.6), s * 0.4, s * 0.45);
      }
    }
    // Slot
    drawRect(ctx, x + s * 0.5, y + s * 2.5, s * 1, s * 0.6, '#222');
  },

  whiteboard(ctx, x, y, s) {
    // Frame
    drawRect(ctx, x, y, s * 4, s * 2.5, C.wbBorder);
    drawRect(ctx, x + 3, y + 3, s * 4 - 6, s * 2.5 - 6, C.whiteboard);
    // Scribbles
    ctx.strokeStyle = '#44a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 10, y + 15);
    ctx.lineTo(x + s * 2, y + 20);
    ctx.lineTo(x + s * 1.5, y + s * 1.5);
    ctx.stroke();
    ctx.strokeStyle = '#a44';
    ctx.beginPath();
    ctx.moveTo(x + s * 2.5, y + 12);
    ctx.lineTo(x + s * 3, y + s * 1);
    ctx.stroke();
    // Marker tray
    drawRect(ctx, x + s * 0.5, y + s * 2.5, s * 3, s * 0.3, '#aaa');
  },

  windowWall(ctx, x, y, w, h, windowCount) {
    // Wall
    drawRect(ctx, x, y, w, h, C.wall);
    drawRect(ctx, x, y + h - 3, w, 3, C.wallDark);
    // Windows
    const spacing = w / (windowCount + 1);
    const winW = spacing * 0.6;
    const winH = h * 0.6;
    for (let i = 0; i < windowCount; i++) {
      const wx = x + spacing * (i + 1) - winW / 2;
      const wy = y + (h - winH) / 2;
      drawRect(ctx, wx - 2, wy - 2, winW + 4, winH + 4, C.windowFrame);
      drawRect(ctx, wx, wy, winW, winH, C.window);
      // Cross frame
      drawRect(ctx, wx + winW / 2 - 1, wy, 2, winH, C.windowFrame);
      drawRect(ctx, wx, wy + winH / 2 - 1, winW, 2, C.windowFrame);
      // Sky gradient in window
      const grad = ctx.createLinearGradient(wx, wy, wx, wy + winH);
      grad.addColorStop(0, 'rgba(135,200,235,0.3)');
      grad.addColorStop(1, 'rgba(200,220,240,0.1)');
      ctx.fillStyle = grad;
      ctx.fillRect(wx, wy, winW, winH);
    }
  },

  poolTable(ctx, x, y, s) {
    drawRoundRect(ctx, x, y, s * 4, s * 2.5, 4, '#2d5016');
    drawRect(ctx, x + 4, y + 4, s * 4 - 8, s * 2.5 - 8, '#3a7020');
    // Pockets
    ctx.fillStyle = '#111';
    [[4,4],[s*2,3],[s*4-8,4],[4,s*2.5-8],[s*2,s*2.5-7],[s*4-8,s*2.5-8]].forEach(([px,py]) => {
      ctx.beginPath(); ctx.arc(x+px, y+py, 4, 0, Math.PI*2); ctx.fill();
    });
    // Balls
    const ballColors = ['#fff','#e33','#33e','#333','#e90','#3a3','#a3a'];
    ballColors.forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(x + s + i * 6, y + s * 1.2 + Math.sin(i) * 8, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  },

  treadmill(ctx, x, y, s) {
    // Base
    drawRect(ctx, x, y + s * 1.5, s * 3, s * 1, C.treadmill);
    // Belt
    drawRect(ctx, x + 4, y + s * 1.6, s * 3 - 8, s * 0.7, C.treadBelt);
    // Handles
    drawRect(ctx, x + s * 0.3, y, s * 0.2, s * 1.5, '#555');
    drawRect(ctx, x + s * 2.5, y, s * 0.2, s * 1.5, '#555');
    // Console
    drawRect(ctx, x + s * 0.6, y - s * 0.3, s * 1.8, s * 0.5, '#333');
    drawRect(ctx, x + s * 0.7, y - s * 0.2, s * 1.6, s * 0.3, '#4488CC');
  },
};

// ── Floor layouts — what furniture goes where ──
const FLOOR_LAYOUTS = {
  'f10': (ctx, w, h, t) => {
    // Mission Control — PACKED
    Furniture.windowWall(ctx, 0, 0, w, h * 0.12, 6);
    for (let tx = 0; tx < w; tx += 24) for (let ty = h*0.12; ty < h; ty += 24) {
      drawRect(ctx, tx, ty, 23, 23, (tx+ty)%48===0 ? C.tileDark : C.tile);
    }
    const s = Math.min(w, h) * 0.03;
    // Ceiling lights
    Furniture.ceilingLights(ctx, w, h, 5);
    // Big screens on wall
    drawRect(ctx, w*0.25, h*0.13, w*0.2, h*0.12, '#111');
    drawRect(ctx, w*0.26, h*0.14, w*0.18, h*0.1, '#0a1a2a');
    ctx.fillStyle = '#2979FF'; ctx.font = '10px "JetBrains Mono"'; ctx.textAlign = 'center';
    ctx.fillText('FLEET: 5/5 ONLINE', w*0.35, h*0.2);
    drawRect(ctx, w*0.5, h*0.13, w*0.2, h*0.12, '#111');
    drawRect(ctx, w*0.51, h*0.14, w*0.18, h*0.1, '#0a1a2a');
    ctx.fillStyle = '#4CAF50'; ctx.fillText('ALL SYSTEMS GREEN', w*0.6, h*0.2);
    drawRect(ctx, w*0.75, h*0.13, w*0.15, h*0.12, '#111');
    drawRect(ctx, w*0.76, h*0.14, w*0.13, h*0.1, '#0a1a2a');
    ctx.fillStyle = '#F5A623'; ctx.fillText('52 TOPS', w*0.825, h*0.2);
    // Rows of desks with stuff
    Furniture.deskWithStuff(ctx, w*0.04, h*0.32, s); Furniture.chair(ctx, w*0.08, h*0.48, s);
    Furniture.deskWithStuff(ctx, w*0.22, h*0.32, s); Furniture.chair(ctx, w*0.26, h*0.48, s);
    Furniture.deskWithStuff(ctx, w*0.4, h*0.32, s); Furniture.chair(ctx, w*0.44, h*0.48, s);
    Furniture.deskWithStuff(ctx, w*0.6, h*0.32, s); Furniture.chair(ctx, w*0.64, h*0.48, s);
    Furniture.deskWithStuff(ctx, w*0.78, h*0.32, s); Furniture.chair(ctx, w*0.82, h*0.48, s);
    // Round planning table
    Furniture.roundTable(ctx, w*0.35, h*0.62, s*1.1);
    // Partitions
    Furniture.partition(ctx, w*0.19, h*0.3, s, s*3.5);
    Furniture.partition(ctx, w*0.57, h*0.3, s, s*3.5);
    // Side equipment
    Furniture.printer(ctx, w*0.9, h*0.35, s);
    Furniture.waterCooler(ctx, w*0.92, h*0.55, s);
    Furniture.filingCabinet(ctx, w*0.02, h*0.55, s);
    // Decor
    Furniture.plant(ctx, w*0.02, h*0.28, s);
    Furniture.plant(ctx, w*0.95, h*0.28, s);
    Furniture.plant(ctx, w*0.48, h*0.58, s*0.8);
    Furniture.clock(ctx, w*0.15, h*0.06, s, t);
    Furniture.exitSign(ctx, w*0.88, h*0.02, s);
    Furniture.trashCan(ctx, w*0.17, h*0.52, s);
    Furniture.trashCan(ctx, w*0.55, h*0.52, s);
    Furniture.fireExtinguisher(ctx, w*0.97, h*0.7, s);
    // Rug under planning table
    Furniture.rug(ctx, w*0.3, h*0.58, w*0.15, h*0.15, 'rgba(40,60,100,0.2)');
    // Sticky notes on partition
    Furniture.stickyNotes(ctx, w*0.2, h*0.32, s);
    // Coat rack
    Furniture.coatRack(ctx, w*0.01, h*0.7, s);
  },

  'f7': (ctx, w, h, t) => {
    // Server Room — PACKED datacenter
    for (let tx = 0; tx < w; tx += 20) for (let ty = 0; ty < h; ty += 20) {
      drawRect(ctx, tx, ty, 19, 19, (tx+ty)%40===0 ? '#1a1a22' : '#222230');
    }
    const s = Math.min(w, h) * 0.03;
    // Raised floor grate pattern
    ctx.strokeStyle = 'rgba(255,255,255,0.03)'; ctx.lineWidth = 1;
    for (let gx = 0; gx < w; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke(); }
    for (let gy = 0; gy < h; gy += 40) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke(); }
    // Row labels
    ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.font = '9px "JetBrains Mono"'; ctx.textAlign = 'left';
    ctx.fillText('ROW A — COMPUTE', w*0.02, h*0.12);
    ctx.fillText('ROW B — STORAGE', w*0.02, h*0.52);
    // Server racks Row A (7 racks)
    for (let i = 0; i < 7; i++) Furniture.serverRack(ctx, w*0.05 + i*w*0.13, h*0.14, s, t);
    // Server racks Row B (7 racks)
    for (let i = 0; i < 7; i++) Furniture.serverRack(ctx, w*0.05 + i*w*0.13, h*0.54, s, t);
    // Hot aisle / cold aisle markers
    ctx.fillStyle = 'rgba(41,121,255,0.04)'; ctx.fillRect(0, h*0.38, w, h*0.14);
    ctx.fillStyle = 'rgba(255,69,0,0.03)'; ctx.fillRect(0, h*0.0, w, h*0.12);
    ctx.fillStyle = 'rgba(255,69,0,0.03)'; ctx.fillRect(0, h*0.78, w, h*0.12);
    ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.font = '7px "JetBrains Mono"';
    ctx.fillText('COLD AISLE', w*0.45, h*0.46);
    // Monitoring station (center of cold aisle)
    Furniture.deskWithStuff(ctx, w*0.3, h*0.39, s*0.9);
    Furniture.chair(ctx, w*0.34, h*0.47, s*0.8, '#2979FF');
    Furniture.deskWithStuff(ctx, w*0.55, h*0.39, s*0.9);
    Furniture.chair(ctx, w*0.59, h*0.47, s*0.8, '#2979FF');
    // Cable trays (orange) running between rows
    ctx.strokeStyle = C.cable; ctx.lineWidth = 2;
    for (let i = 0; i < 7; i++) {
      const cx = w*0.08 + i*w*0.13;
      ctx.beginPath(); ctx.moveTo(cx, h*0.35); ctx.lineTo(cx, h*0.52); ctx.stroke();
      // Horizontal cable runs along ceiling
      ctx.strokeStyle = 'rgba(255,107,43,0.15)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(cx-5, h*0.01); ctx.lineTo(cx+5, h*0.01); ctx.stroke();
      ctx.strokeStyle = C.cable; ctx.lineWidth = 2;
    }
    // Horizontal cable tray
    ctx.strokeStyle = 'rgba(255,107,43,0.2)'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(w*0.03, h*0.01); ctx.lineTo(w*0.97, h*0.01); ctx.stroke();
    // UPS units on sides
    drawRoundRect(ctx, w*0.01, h*0.15, s*1.5, s*3, 2, '#2a2a3a');
    ctx.fillStyle = '#4CAF50'; ctx.beginPath(); ctx.arc(w*0.02+s*0.3, h*0.18, 4, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.font='7px "JetBrains Mono"'; ctx.fillText('UPS', w*0.02, h*0.32);
    drawRoundRect(ctx, w*0.95, h*0.15, s*1.5, s*3, 2, '#2a2a3a');
    ctx.fillStyle = '#4CAF50'; ctx.beginPath(); ctx.arc(w*0.96+s*0.3, h*0.18, 4, 0, Math.PI*2); ctx.fill();
    // Pi cluster display
    Furniture.raspberryPi(ctx, w*0.01, h*0.6, s);
    Furniture.raspberryPi(ctx, w*0.01, h*0.72, s);
    Furniture.hailo(ctx, w*0.01, h*0.84, s);
    // Temperature display panel
    drawRect(ctx, w*0.92, h*0.55, s*2.5, s*3.5, '#111');
    drawRect(ctx, w*0.93, h*0.56, s*2.3, s*3.3, '#0a1a0a');
    ctx.fillStyle = '#4CAF50'; ctx.font='8px "JetBrains Mono"'; ctx.textAlign='left';
    ctx.fillText('TEMP: 34C', w*0.935, h*0.62);
    ctx.fillText('HUM:  45%', w*0.935, h*0.68);
    ctx.fillText('PWR:  OK', w*0.935, h*0.74);
    ctx.fillText('UPS:  99%', w*0.935, h*0.80);
    // Fire suppression
    Furniture.fireExtinguisher(ctx, w*0.97, h*0.92, s);
    ctx.fillStyle='rgba(255,0,0,0.08)'; ctx.font='7px sans-serif'; ctx.textAlign='center';
    ctx.fillText('FM-200', w*0.5, h*0.95);
  },

  'f4': (ctx, w, h, t) => {
    // Engineering — PACKED dev floor
    Furniture.windowWall(ctx, 0, 0, w, h * 0.1, 8);
    for (let tx = 0; tx < w; tx += 20) for (let ty = h*0.1; ty < h; ty += 20) {
      drawRect(ctx, tx, ty, 19, 19, tx%40===0 ? C.woodDark : C.wood);
    }
    const s = Math.min(w, h) * 0.025;
    Furniture.ceilingLights(ctx, w, h, 6);
    // Dev pod 1 (left)
    Furniture.deskWithStuff(ctx, w*0.03, h*0.2, s); Furniture.chair(ctx, w*0.07, h*0.35, s);
    Furniture.deskWithStuff(ctx, w*0.18, h*0.2, s); Furniture.chair(ctx, w*0.22, h*0.35, s);
    Furniture.partition(ctx, w*0.35, h*0.15, s, s*4);
    // Dev pod 2
    Furniture.deskWithStuff(ctx, w*0.03, h*0.48, s); Furniture.chair(ctx, w*0.07, h*0.63, s);
    Furniture.deskWithStuff(ctx, w*0.18, h*0.48, s); Furniture.chair(ctx, w*0.22, h*0.63, s);
    // Standing desks (right side)
    Furniture.deskWithStuff(ctx, w*0.42, h*0.18, s); Furniture.chair(ctx, w*0.46, h*0.33, s);
    Furniture.deskWithStuff(ctx, w*0.58, h*0.18, s); Furniture.chair(ctx, w*0.62, h*0.33, s);
    Furniture.deskWithStuff(ctx, w*0.42, h*0.48, s); Furniture.chair(ctx, w*0.46, h*0.63, s);
    // Whiteboard with sticky notes
    Furniture.whiteboard(ctx, w*0.6, h*0.48, s);
    Furniture.stickyNotes(ctx, w*0.62, h*0.5, s*0.8);
    // Couch lounge
    Furniture.rug(ctx, w*0.73, h*0.5, w*0.22, h*0.35, 'rgba(60,40,40,0.2)');
    Furniture.couch(ctx, w*0.75, h*0.55, s);
    drawRoundRect(ctx, w*0.82, h*0.63, s*2, s, 3, '#6B4518'); // coffee table
    // Equipment
    Furniture.printer(ctx, w*0.35, h*0.75, s);
    Furniture.waterCooler(ctx, w*0.42, h*0.75, s);
    Furniture.filingCabinet(ctx, w*0.9, h*0.15, s);
    // Decor
    Furniture.plant(ctx, w*0.37, h*0.14, s);
    Furniture.plant(ctx, w*0.7, h*0.14, s);
    Furniture.plant(ctx, w*0.95, h*0.14, s);
    Furniture.plant(ctx, w*0.73, h*0.45, s*0.7);
    Furniture.trashCan(ctx, w*0.15, h*0.42, s);
    Furniture.trashCan(ctx, w*0.55, h*0.42, s);
    Furniture.clock(ctx, w*0.5, h*0.05, s, t);
    Furniture.exitSign(ctx, w*0.92, h*0.02, s);
    // Picture frames
    Furniture.pictureFrame(ctx, w*0.78, h*0.02, s, '#1a2a1a');
    Furniture.pictureFrame(ctx, w*0.84, h*0.02, s, '#2a1a2a');
    Furniture.coatRack(ctx, w*0.01, h*0.78, s);
    Furniture.fireExtinguisher(ctx, w*0.97, h*0.8, s);
  },

  'f3': (ctx, w, h, t) => {
    // Open Floor — PACKED collaboration space
    for (let tx = 0; tx < w; tx += 20) for (let ty = 0; ty < h; ty += 20) {
      drawRect(ctx, tx, ty, 19, 19, (tx+ty)%40===0 ? C.carpetDark : C.carpet);
    }
    const s = Math.min(w, h) * 0.03;
    Furniture.ceilingLights(ctx, w, h, 5);
    // Three roundtables with chairs around each
    const tables = [[0.12, 0.2], [0.42, 0.15], [0.72, 0.2]];
    tables.forEach(([tx, ty]) => {
      Furniture.roundTable(ctx, w*tx, h*ty, s*1.1);
      for(let c=0;c<5;c++) { const a=c*Math.PI*2/5; Furniture.chair(ctx, w*(tx+0.04)+Math.cos(a)*28, h*(ty+0.08)+Math.sin(a)*18, s*0.7); }
    });
    // Laptop on each table
    tables.forEach(([tx,ty]) => { drawRect(ctx, w*(tx+0.03), h*(ty+0.04), 10, 7, '#333'); drawRect(ctx, w*(tx+0.035), h*(ty+0.045), 8, 5, '#4488CC'); });
    // Whiteboard wall
    Furniture.whiteboard(ctx, w*0.02, h*0.5, s*1.2);
    Furniture.stickyNotes(ctx, w*0.04, h*0.52, s);
    Furniture.whiteboard(ctx, w*0.22, h*0.5, s*1.2);
    // Presentation area
    Furniture.rug(ctx, w*0.42, h*0.45, w*0.25, h*0.2, 'rgba(100,50,80,0.15)');
    drawRect(ctx, w*0.45, h*0.46, w*0.18, h*0.1, '#111');
    drawRect(ctx, w*0.46, h*0.47, w*0.16, h*0.08, '#1a1a2e');
    ctx.fillStyle = '#FF1D6C'; ctx.font='11px "Space Grotesk"'; ctx.textAlign='center';
    ctx.fillText('PAVE TOMORROW', w*0.54, h*0.53);
    // Chairs facing presentation
    for(let c=0;c<6;c++) Furniture.chair(ctx, w*0.44+c*w*0.03, h*0.58, s*0.7);
    // Lounge area
    Furniture.rug(ctx, w*0.02, h*0.7, w*0.35, h*0.22, 'rgba(60,40,60,0.15)');
    Furniture.couch(ctx, w*0.04, h*0.73, s);
    Furniture.couch(ctx, w*0.22, h*0.73, s);
    drawRoundRect(ctx, w*0.12, h*0.82, s*3, s*1.2, 4, '#6B4518');
    // Standing desk area
    Furniture.deskWithStuff(ctx, w*0.72, h*0.48, s*0.9);
    Furniture.deskWithStuff(ctx, w*0.86, h*0.48, s*0.9);
    // Bean bags
    drawRoundRect(ctx, w*0.72, h*0.72, s*2, s*1.8, 12, '#c44');
    drawRoundRect(ctx, w*0.82, h*0.75, s*2, s*1.8, 12, '#44c');
    drawRoundRect(ctx, w*0.77, h*0.8, s*2, s*1.8, 12, '#4a4');
    // Equipment
    Furniture.waterCooler(ctx, w*0.4, h*0.72, s);
    Furniture.printer(ctx, w*0.4, h*0.82, s);
    // Decor
    Furniture.plant(ctx, w*0.01, h*0.08, s); Furniture.plant(ctx, w*0.95, h*0.08, s);
    Furniture.plant(ctx, w*0.38, h*0.12, s*0.7); Furniture.plant(ctx, w*0.68, h*0.12, s*0.7);
    Furniture.plant(ctx, w*0.65, h*0.7, s);
    Furniture.trashCan(ctx, w*0.38, h*0.68, s);
    Furniture.clock(ctx, w*0.5, h*0.04, s, t);
    Furniture.exitSign(ctx, w*0.01, h*0.02, s);
    Furniture.exitSign(ctx, w*0.92, h*0.02, s);
    Furniture.fireExtinguisher(ctx, w*0.97, h*0.9, s);
    // Bulletin board
    drawRect(ctx, w*0.5, h*0.01, s*3, s*2, '#8B6538');
    drawRect(ctx, w*0.51, h*0.02, s*2.8, s*1.8, '#c9a96e');
    Furniture.stickyNotes(ctx, w*0.52, h*0.03, s*0.7);
  },

  'b1': (ctx, w, h, t) => {
    // Break Room — PACKED kitchen and lounge
    for (let tx = 0; tx < w; tx += 20) for (let ty = 0; ty < h; ty += 20) {
      drawRect(ctx, tx, ty, 19, 19, tx%40===0 ? C.woodDark : C.wood);
    }
    const s = Math.min(w, h) * 0.025;
    Furniture.ceilingLights(ctx, w, h, 4);
    // Kitchen counter with cabinets above
    drawRect(ctx, w*0.02, h*0.08, w*0.45, h*0.08, '#666');
    drawRect(ctx, w*0.03, h*0.09, w*0.43, h*0.06, '#888');
    // Upper cabinets
    for(let c=0;c<5;c++) drawRoundRect(ctx, w*0.04+c*w*0.08, h*0.01, w*0.07, h*0.06, 2, '#8B6538');
    // Sink
    drawRect(ctx, w*0.25, h*0.1, s*1.5, s*0.8, '#aaa');
    ctx.fillStyle = '#88BBEE'; ctx.fillRect(w*0.26, h*0.11, s*1.2, s*0.5);
    // Coffee machine
    Furniture.coffeeMachine(ctx, w*0.06, h*0.04, s);
    // Microwave
    drawRoundRect(ctx, w*0.35, h*0.09, s*1.5, s*1, 2, '#444');
    drawRect(ctx, w*0.36, h*0.1, s*1, s*0.7, '#333');
    // Fridge
    drawRoundRect(ctx, w*0.44, h*0.02, s*1.2, s*3, 3, '#ccc');
    drawRect(ctx, w*0.45, h*0.03, s*1, s*1.3, '#ddd');
    drawRect(ctx, w*0.45, h*0.06+s*1.3, s*1, s*1.4, '#d8d8d8');
    ctx.fillStyle='#888'; ctx.fillRect(w*0.455+s*0.8, h*0.05+s*0.5, 3, 8);
    // Vending machines
    Furniture.vendingMachine(ctx, w*0.72, h*0.02, s);
    Furniture.vendingMachine(ctx, w*0.85, h*0.02, s);
    // Lunch tables with chairs
    Furniture.roundTable(ctx, w*0.15, h*0.35, s*1.2);
    for(let c=0;c<4;c++) { const a=c*Math.PI/2; Furniture.chair(ctx, w*0.2+Math.cos(a)*25, h*0.42+Math.sin(a)*15, s*0.7); }
    Furniture.roundTable(ctx, w*0.45, h*0.35, s*1.2);
    for(let c=0;c<4;c++) { const a=c*Math.PI/2; Furniture.chair(ctx, w*0.5+Math.cos(a)*25, h*0.42+Math.sin(a)*15, s*0.7); }
    // Couch lounge area
    Furniture.rug(ctx, w*0.05, h*0.6, w*0.4, h*0.3, 'rgba(80,50,30,0.15)');
    Furniture.couch(ctx, w*0.08, h*0.68, s);
    Furniture.couch(ctx, w*0.28, h*0.68, s);
    // TV on wall
    drawRect(ctx, w*0.15, h*0.55, s*4, s*2.5, '#111');
    drawRect(ctx, w*0.16, h*0.56, s*3.8, s*2.3, '#2a3a4a');
    // Coffee table
    drawRoundRect(ctx, w*0.18, h*0.78, s*3, s*1, 4, '#6B4518');
    // Foosball table
    drawRect(ctx, w*0.6, h*0.55, s*3.5, s*2, '#5a3a1a');
    drawRect(ctx, w*0.61, h*0.56, s*3.3, s*1.8, '#3a7020');
    // Handles
    ctx.strokeStyle='#888'; ctx.lineWidth=2;
    for(let fh=0;fh<4;fh++) ctx.beginPath(), ctx.moveTo(w*0.6, h*0.58+fh*s*0.45), ctx.lineTo(w*0.6+s*3.5, h*0.58+fh*s*0.45), ctx.stroke();
    // Bulletin board
    drawRect(ctx, w*0.6, h*0.02, s*4, s*2.5, '#8B6538');
    drawRect(ctx, w*0.61, h*0.03, s*3.8, s*2.3, '#c9a96e');
    Furniture.stickyNotes(ctx, w*0.62, h*0.05, s);
    // Decor
    Furniture.plant(ctx, w*0.55, h*0.3, s);
    Furniture.plant(ctx, w*0.95, h*0.6, s);
    Furniture.waterCooler(ctx, w*0.55, h*0.55, s);
    Furniture.trashCan(ctx, w*0.5, h*0.55, s);
    Furniture.clock(ctx, w*0.55, h*0.06, s, t);
    Furniture.fireExtinguisher(ctx, w*0.97, h*0.85, s);
  },

  'b2': (ctx, w, h, t) => {
    // Rec Room — PACKED game room
    for (let tx = 0; tx < w; tx += 20) for (let ty = 0; ty < h; ty += 20) {
      drawRect(ctx, tx, ty, 19, 19, (tx+ty)%40===0 ? C.carpetDark : C.carpet);
    }
    const s = Math.min(w, h) * 0.025;
    Furniture.ceilingLights(ctx, w, h, 4);
    // Pool table
    Furniture.poolTable(ctx, w*0.03, h*0.12, s);
    // Cue rack on wall
    drawRect(ctx, w*0.03, h*0.02, s*3, s*0.5, '#6B4518');
    for(let c=0;c<5;c++) drawRect(ctx, w*0.04+c*s*0.55, h*0.01, 2, s*0.6, '#8B6538');
    // Ping pong
    drawRect(ctx, w*0.35, h*0.08, s*4, s*2.5, '#1a5a2a');
    drawRect(ctx, w*0.35+s*2-1, h*0.08, 2, s*2.5, '#fff');
    // Net posts
    drawRect(ctx, w*0.35+s*2-2, h*0.08, 4, 5, '#888');
    drawRect(ctx, w*0.35+s*2-2, h*0.08+s*2.4, 4, 5, '#888');
    // Paddles on table
    ctx.fillStyle='#c44'; ctx.beginPath(); ctx.arc(w*0.37, h*0.12, 5, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle='#44c'; ctx.beginPath(); ctx.arc(w*0.35+s*3.5, h*0.15, 5, 0, Math.PI*2); ctx.fill();
    // 3 Arcade machines
    const arcadeColors = ['#2a2a5a','#5a2a2a','#2a5a2a'];
    const screenColors = ['#4488CC','#CC4488','#44CC88'];
    for(let a=0;a<3;a++) {
      const ax = w*0.68 + a*w*0.1;
      drawRoundRect(ctx, ax, h*0.05, s*2, s*3, 3, arcadeColors[a]);
      drawRect(ctx, ax+3, h*0.07, s*2-6, s*1.5, screenColors[a]);
      // Joystick
      drawRect(ctx, ax+s*0.5, h*0.05+s*2, s*1, s*0.4, '#333');
      ctx.fillStyle='#c00'; ctx.beginPath(); ctx.arc(ax+s, h*0.05+s*2.2, 4, 0, Math.PI*2); ctx.fill();
      // Coin slot
      drawRect(ctx, ax+s*0.7, h*0.05+s*2.6, s*0.6, 3, '#888');
    }
    // Dart board
    ctx.fillStyle='#333'; ctx.beginPath(); ctx.arc(w*0.62, h*0.12, s*1, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle='#c44'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(w*0.62, h*0.12, s*0.7, 0, Math.PI*2); ctx.stroke();
    ctx.strokeStyle='#4a4';
    ctx.beginPath(); ctx.arc(w*0.62, h*0.12, s*0.4, 0, Math.PI*2); ctx.stroke();
    ctx.fillStyle='#c44'; ctx.beginPath(); ctx.arc(w*0.62, h*0.12, 3, 0, Math.PI*2); ctx.fill();
    // Air hockey table
    drawRoundRect(ctx, w*0.03, h*0.48, s*4, s*2.5, 6, '#1a3a5a');
    drawRect(ctx, w*0.04, h*0.49, s*3.8, s*2.3, '#2a4a6a');
    // Center line
    drawRect(ctx, w*0.03+s*2-1, h*0.49, 2, s*2.3, 'rgba(255,255,255,0.3)');
    // Goals
    drawRect(ctx, w*0.03+s*1.2, h*0.485, s*1.6, 3, '#222');
    drawRect(ctx, w*0.03+s*1.2, h*0.49+s*2.25, s*1.6, 3, '#222');
    // Puck
    ctx.fillStyle='#eee'; ctx.beginPath(); ctx.arc(w*0.03+s*2, h*0.49+s*1.15, 5, 0, Math.PI*2); ctx.fill();
    // TV lounge area
    Furniture.rug(ctx, w*0.35, h*0.48, w*0.25, h*0.4, 'rgba(60,30,60,0.15)');
    Furniture.couch(ctx, w*0.37, h*0.58, s);
    Furniture.couch(ctx, w*0.37, h*0.72, s);
    // TV
    drawRect(ctx, w*0.37, h*0.48, s*4, s*2.5, '#111');
    drawRect(ctx, w*0.38, h*0.49, s*3.8, s*2.3, '#2a3a4a');
    // Coffee table
    drawRoundRect(ctx, w*0.42, h*0.65, s*2.5, s*1, 4, '#6B4518');
    // Bean bags
    drawRoundRect(ctx, w*0.67, h*0.55, s*2.2, s*2, 14, '#c44');
    drawRoundRect(ctx, w*0.78, h*0.52, s*2.2, s*2, 14, '#44c');
    drawRoundRect(ctx, w*0.73, h*0.68, s*2.2, s*2, 14, '#4a4');
    drawRoundRect(ctx, w*0.84, h*0.65, s*2.2, s*2, 14, '#ca4');
    // Board games shelf
    drawRect(ctx, w*0.9, h*0.4, s*2, s*4, '#6B4518');
    for(let sh=0;sh<4;sh++) { drawRect(ctx, w*0.905, h*0.42+sh*s, s*1.8, 2, '#8B6538');
      const gc=['#e44','#44e','#4a4','#ea4'][sh]; drawRect(ctx, w*0.91, h*0.43+sh*s, s*0.8, s*0.7, gc); }
    // Decor
    Furniture.vendingMachine(ctx, w*0.62, h*0.48, s);
    Furniture.plant(ctx, w*0.32, h*0.05, s);
    Furniture.plant(ctx, w*0.65, h*0.4, s);
    Furniture.trashCan(ctx, w*0.6, h*0.4, s);
    Furniture.clock(ctx, w*0.5, h*0.03, s, t);
    // Neon sign
    ctx.fillStyle=`rgba(255,29,108,${0.3+Math.sin(t*2)*0.1})`; ctx.font='14px "Space Grotesk"'; ctx.textAlign='center';
    ctx.fillText('GAME ON', w*0.5, h*0.97);
  },

  'b3': (ctx, w, h, t) => {
    // Gym — PACKED fitness center
    for (let tx = 0; tx < w; tx += 20) for (let ty = 0; ty < h; ty += 20) {
      drawRect(ctx, tx, ty, 19, 19, (tx+ty)%40===0 ? '#2a2a30' : '#333340');
    }
    const s = Math.min(w, h) * 0.025;
    Furniture.ceilingLights(ctx, w, h, 5);
    // Zone labels
    ctx.fillStyle='rgba(255,255,255,0.06)'; ctx.font='9px "JetBrains Mono"'; ctx.textAlign='left';
    ctx.fillText('CARDIO ZONE', w*0.03, h*0.08);
    ctx.fillText('FREE WEIGHTS', w*0.03, h*0.52);
    ctx.fillText('STRETCH & YOGA', w*0.6, h*0.08);
    ctx.fillText('MACHINES', w*0.45, h*0.52);
    // 4 Treadmills
    for(let tm=0;tm<4;tm++) Furniture.treadmill(ctx, w*0.03+tm*w*0.1, h*0.1, s);
    // 2 Exercise bikes
    for(let b=0;b<2;b++) {
      const bx = w*0.03 + b*w*0.1;
      drawRect(ctx, bx, h*0.35, s*2, s*0.3, '#444');
      drawRect(ctx, bx+s*0.5, h*0.2, s*0.3, s*1.5, '#555');
      drawRect(ctx, bx+s*0.3, h*0.18, s*0.8, s*0.4, '#333');
      drawRect(ctx, bx+s*0.35, h*0.19, s*0.6, s*0.25, '#4488CC');
      // Pedals
      ctx.fillStyle='#666'; ctx.beginPath(); ctx.arc(bx+s*0.8, h*0.35+s*0.15, 6, 0, Math.PI*2); ctx.fill();
    }
    // Rowing machine
    drawRect(ctx, w*0.25, h*0.35, s*3.5, s*0.8, '#444');
    drawRect(ctx, w*0.26, h*0.33, s*0.8, s*0.3, '#555');
    // Weight rack (big)
    drawRect(ctx, w*0.03, h*0.55, s*5, s*1.8, '#3a3a3a');
    for(let wr=0;wr<8;wr++) {
      const ww = 3+wr; const wh = s*0.3+wr*2;
      ctx.fillStyle = `hsl(0,0%,${35+wr*3}%)`;
      drawRect(ctx, w*0.04+wr*s*0.6, h*0.57, s*0.45, wh);
      ctx.fillStyle='rgba(255,255,255,0.1)'; ctx.font='6px sans-serif'; ctx.textAlign='center';
      ctx.fillText(`${5+wr*5}`, w*0.04+wr*s*0.6+s*0.22, h*0.57+wh-3);
    }
    // Bench press
    drawRect(ctx, w*0.03, h*0.78, s*3, s*1.5, '#444');
    drawRect(ctx, w*0.04, h*0.8, s*2.5, s*0.5, '#555'); // bench
    drawRect(ctx, w*0.03, h*0.76, s*0.3, s*1.7, '#666'); // uprights
    drawRect(ctx, w*0.03+s*2.7, h*0.76, s*0.3, s*1.7, '#666');
    drawRect(ctx, w*0.03-s*0.2, h*0.76, s*3.4, s*0.2, '#888'); // bar
    // Cable machine
    drawRect(ctx, w*0.35, h*0.55, s*2.5, s*4, '#3a3a3a');
    drawRect(ctx, w*0.36, h*0.56, s*2.3, s*3.8, '#444');
    ctx.strokeStyle='#888'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(w*0.36+s*1.15, h*0.58); ctx.lineTo(w*0.36+s*1.15, h*0.56+s*3.5); ctx.stroke();
    // Weight stack
    for(let ws=0;ws<6;ws++) drawRect(ctx, w*0.37, h*0.6+ws*s*0.5, s*1.5, s*0.4, ws<3?'#555':'#666');
    // Yoga/stretch area
    Furniture.rug(ctx, w*0.58, h*0.1, w*0.38, h*0.38, 'rgba(40,60,80,0.15)');
    const matColors = ['#4488CC','#CC4444','#44CC44','#CC8844'];
    for(let ym=0;ym<4;ym++) {
      drawRoundRect(ctx, w*0.6+ym*w*0.09, h*0.15, s*2, s*4, 4, matColors[ym]);
      ctx.fillStyle='rgba(0,0,0,0.1)'; ctx.fillRect(w*0.6+ym*w*0.09+2, h*0.15+s*2-1, s*2-4, 2);
    }
    // Stability balls
    ctx.fillStyle='#e44'; ctx.beginPath(); ctx.arc(w*0.62, h*0.46, s*0.8, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle='#44e'; ctx.beginPath(); ctx.arc(w*0.72, h*0.47, s*0.8, 0, Math.PI*2); ctx.fill();
    // Kettlebells
    for(let kb=0;kb<4;kb++) {
      ctx.fillStyle='#555'; ctx.beginPath(); ctx.arc(w*0.85+kb*s*0.6, h*0.9, 5+kb, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle='#444'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(w*0.85+kb*s*0.6, h*0.87, 4, Math.PI, 0); ctx.stroke();
    }
    // Mirror wall (full width bottom)
    drawRect(ctx, w*0.45, h*0.55, w*0.52, h*0.04, '#bbb');
    ctx.fillStyle='rgba(135,200,235,0.06)'; ctx.fillRect(w*0.45, h*0.55, w*0.52, h*0.4);
    // Towel rack
    drawRect(ctx, w*0.93, h*0.1, s*0.4, s*3, '#888');
    for(let tw=0;tw<3;tw++) { ctx.fillStyle=['#fff','#aaf','#faa'][tw]; ctx.fillRect(w*0.935, h*0.12+tw*s, s*0.8, s*0.6); }
    // Water station
    Furniture.waterCooler(ctx, w*0.93, h*0.35, s);
    // Decor
    Furniture.clock(ctx, w*0.5, h*0.03, s, t);
    Furniture.fireExtinguisher(ctx, w*0.97, h*0.9, s);
    // Motivational text
    ctx.fillStyle='rgba(255,255,255,0.04)'; ctx.font='18px "Space Grotesk"'; ctx.textAlign='center';
    ctx.fillText('PROTECT EVERY LAYER', w*0.5, h*0.97);
  },
};

// Additional Furniture methods
Furniture.fountain = function(ctx, x, y, s, t) {
    // Base pool
    ctx.fillStyle = 'rgba(100,180,235,0.3)';
    ctx.beginPath();
    ctx.ellipse(x + s*2, y + s*2.5, s*2.2, s*1.2, 0, 0, Math.PI*2);
    ctx.fill();
    // Stone rim
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(x + s*2, y + s*2.5, s*2.2, s*1.2, 0, 0, Math.PI*2);
    ctx.stroke();
    // Water shimmer
    ctx.fillStyle = `rgba(150,210,255,${0.2 + Math.sin(t*3)*0.1})`;
    ctx.beginPath();
    ctx.ellipse(x + s*2, y + s*2.5, s*1.8, s*0.9, 0, 0, Math.PI*2);
    ctx.fill();
    // Center pillar
    drawRect(ctx, x + s*1.7, y + s*0.5, s*0.6, s*2, '#aaa');
    // Water spray
    ctx.strokeStyle = `rgba(180,220,255,${0.4 + Math.sin(t*5)*0.2})`;
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const angle = t*2 + i * 1.2;
      ctx.beginPath();
      ctx.moveTo(x + s*2, y + s*0.5);
      ctx.quadraticCurveTo(x + s*2 + Math.sin(angle)*15, y + s*0.1 - Math.abs(Math.cos(angle))*10, x + s*2 + Math.sin(angle)*25, y + s*1.5);
      ctx.stroke();
    }
    // Infinity symbol above (BlackRoad logo)
    ctx.strokeStyle = `rgba(255,29,108,${0.5 + Math.sin(t*2)*0.2})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + s*2, y - s*0.5);
    ctx.bezierCurveTo(x + s*3, y - s*1.5, x + s*3, y + s*0.3, x + s*2, y - s*0.5);
    ctx.bezierCurveTo(x + s*1, y - s*1.5, x + s*1, y + s*0.3, x + s*2, y - s*0.5);
    ctx.stroke();
  },

Furniture.receptionDesk = function(ctx, x, y, s) {
    // Curved front desk
    ctx.fillStyle = '#444';
    ctx.beginPath();
    ctx.ellipse(x + s*3, y + s*1.5, s*3, s*1.5, 0, Math.PI, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#555';
    ctx.beginPath();
    ctx.ellipse(x + s*3, y + s*1.5, s*2.5, s*1.2, 0, Math.PI, Math.PI*2);
    ctx.fill();
    // BLACKROAD sign
    ctx.fillStyle = '#FF1D6C';
    ctx.font = `${s*0.7}px "Space Grotesk"`;
    ctx.textAlign = 'center';
    ctx.fillText('BLACKROAD', x + s*3, y + s*0.8);
    // Monitors
    drawRect(ctx, x + s*1.5, y + s*0.2, s*1.2, s*0.8, '#111');
    drawRect(ctx, x + s*1.6, y + s*0.25, s*1, s*0.6, '#2a3a4a');
    drawRect(ctx, x + s*3.5, y + s*0.2, s*1.2, s*0.8, '#111');
    drawRect(ctx, x + s*3.6, y + s*0.25, s*1, s*0.6, '#2a3a4a');
  },

Furniture.satellite = function(ctx, x, y, s) {
    // Dish
    ctx.fillStyle = '#888';
    ctx.beginPath();
    ctx.ellipse(x + s, y + s*0.5, s*1.2, s*0.6, -0.3, 0, Math.PI);
    ctx.fill();
    // Arm
    drawRect(ctx, x + s*0.8, y + s*0.5, s*0.4, s*2, '#666');
    // Base
    drawRect(ctx, x + s*0.3, y + s*2.3, s*1.4, s*0.4, '#555');
    // Signal waves
    ctx.strokeStyle = `rgba(41,121,255,${0.3 + Math.sin(t*4)*0.15})`;
    ctx.lineWidth = 1;
    for (let r = 1; r < 4; r++) {
      ctx.beginPath();
      ctx.arc(x + s, y + s*0.3, r * 10 + Math.sin(t*2)*3, -0.8, 0.3);
      ctx.stroke();
    }
  },

Furniture.microscope = function(ctx, x, y, s) {
    // Base
    drawRect(ctx, x, y + s*2, s*2, s*0.4, '#555');
    // Stand
    drawRect(ctx, x + s*0.3, y + s*0.5, s*0.4, s*1.5, '#666');
    // Eyepiece
    drawRect(ctx, x + s*0.1, y, s*0.8, s*0.5, '#444');
    // Lens
    ctx.fillStyle = '#88BBEE';
    ctx.beginPath();
    ctx.arc(x + s*0.5, y + s*1.8, 4, 0, Math.PI*2);
    ctx.fill();
  },

Furniture.boardTable = function(ctx, x, y, s) {
    // Long oval table
    ctx.fillStyle = '#6B4518';
    ctx.beginPath();
    ctx.ellipse(x + s*4, y + s*1.5, s*4, s*1.3, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#7B5528';
    ctx.beginPath();
    ctx.ellipse(x + s*4, y + s*1.4, s*3.6, s*1.1, 0, 0, Math.PI*2);
    ctx.fill();
    // Chairs around it
    for (let i = 0; i < 8; i++) {
      const angle = i * Math.PI / 4;
      const cx = x + s*4 + Math.cos(angle) * s * 4.5;
      const cy = y + s*1.5 + Math.sin(angle) * s * 1.8;
      ctx.fillStyle = '#1E2E4A';
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI*2);
      ctx.fill();
    }
    // Papers/laptops on table
    for (let i = 0; i < 5; i++) {
      const angle = i * Math.PI / 3 + 0.3;
      const px = x + s*4 + Math.cos(angle) * s * 2.5;
      const py = y + s*1.4 + Math.sin(angle) * s * 0.8;
      drawRect(ctx, px-4, py-3, 8, 6, i%2===0 ? '#ddd' : '#1a1a2e');
    }
  },

Furniture.globe = function(ctx, x, y, s, t) {
    // Holographic globe
    ctx.strokeStyle = `rgba(41,121,255,${0.3 + Math.sin(t*2)*0.1})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x + s, y + s, s*1.2, 0, Math.PI*2);
    ctx.stroke();
    // Meridians
    for (let m = 0; m < 4; m++) {
      ctx.beginPath();
      ctx.ellipse(x + s, y + s, s*1.2, s*0.3, t*0.5 + m*0.8, 0, Math.PI*2);
      ctx.stroke();
    }
    // Dots for cities
    ctx.fillStyle = '#4CAF50';
    for (let d = 0; d < 6; d++) {
      const da = t + d * 1.05;
      ctx.beginPath();
      ctx.arc(x + s + Math.cos(da)*s, y + s + Math.sin(da)*s*0.4, 2, 0, Math.PI*2);
      ctx.fill();
    }
    // Base
    drawRect(ctx, x + s*0.6, y + s*2.2, s*0.8, s*0.3, '#444');
  },

Furniture.hailo = function(ctx, x, y, s) {
    // Hailo-8 accelerator chip
    drawRect(ctx, x, y, s*2, s*1.5, '#1a1a1a');
    drawRect(ctx, x+2, y+2, s*2-4, s*1.5-4, '#2a2a2a');
    // Die
    ctx.fillStyle = '#0a5a0a';
    ctx.fillRect(x + s*0.4, y + s*0.3, s*1.2, s*0.9);
    // Text
    ctx.fillStyle = '#4CAF50';
    ctx.font = '7px "JetBrains Mono"';
    ctx.textAlign = 'center';
    ctx.fillText('HAILO-8', x + s, y + s*0.85);
    ctx.fillText('26 TOPS', x + s, y + s*1.1);
    // Pins
    ctx.fillStyle = '#888';
    for (let p = 0; p < 8; p++) {
      ctx.fillRect(x + s*0.2 + p * s*0.2, y - 3, 2, 4);
      ctx.fillRect(x + s*0.2 + p * s*0.2, y + s*1.5 - 1, 2, 4);
    }
  },

// ── More small furniture/decor ──
Furniture.waterCooler = function(ctx, x, y, s) {
  drawRoundRect(ctx, x, y, s*1, s*2.5, 3, '#aab');
  drawRect(ctx, x+2, y+2, s-4, s*0.8, '#88BBEE');
  drawRect(ctx, x+s*0.2, y+s*1.5, s*0.6, s*0.3, '#666');
  ctx.fillStyle = '#4ae'; ctx.beginPath(); ctx.arc(x+s*0.5, y+s*2.2, 4, 0, Math.PI*2); ctx.fill();
};

Furniture.printer = function(ctx, x, y, s) {
  drawRoundRect(ctx, x, y+s*0.3, s*2, s*1.2, 3, '#ddd');
  drawRect(ctx, x+3, y+s*0.4, s*2-6, s*0.4, '#bbb');
  drawRect(ctx, x+s*0.3, y, s*1.4, s*0.4, '#ccc');
  // Paper tray
  drawRect(ctx, x+s*0.4, y+s*1.4, s*1.2, s*0.2, '#eee');
  // Status light
  ctx.fillStyle = '#4CAF50'; ctx.beginPath(); ctx.arc(x+s*1.7, y+s*0.5, 3, 0, Math.PI*2); ctx.fill();
};

Furniture.trashCan = function(ctx, x, y, s) {
  ctx.fillStyle = '#666';
  ctx.beginPath();
  ctx.moveTo(x, y); ctx.lineTo(x+s*0.8, y); ctx.lineTo(x+s*0.7, y+s); ctx.lineTo(x+s*0.1, y+s);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#555'; ctx.fillRect(x-1, y-2, s*0.82, 3);
};

Furniture.clock = function(ctx, x, y, s, t) {
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(x, y, s*0.7, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#333'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, y, s*0.7, 0, Math.PI*2); ctx.stroke();
  // Hour hand
  ctx.strokeStyle = '#222'; ctx.lineWidth = 2;
  const ha = (t * 0.1) % (Math.PI*2);
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x+Math.cos(ha)*s*0.35, y+Math.sin(ha)*s*0.35); ctx.stroke();
  // Minute hand
  ctx.lineWidth = 1;
  const ma = (t * 0.5) % (Math.PI*2);
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x+Math.cos(ma)*s*0.5, y+Math.sin(ma)*s*0.5); ctx.stroke();
  // Numbers
  ctx.fillStyle = '#333'; ctx.font = `${s*0.25}px sans-serif`; ctx.textAlign = 'center';
  ctx.fillText('12', x, y-s*0.45); ctx.fillText('3', x+s*0.48, y+3); ctx.fillText('6', x, y+s*0.55); ctx.fillText('9', x-s*0.48, y+3);
};

Furniture.filingCabinet = function(ctx, x, y, s) {
  drawRect(ctx, x, y, s*1.2, s*2.5, '#888');
  for(let d=0;d<3;d++) {
    drawRect(ctx, x+2, y+3+d*s*0.8, s*1.2-4, s*0.7, '#999');
    drawRect(ctx, x+s*0.4, y+s*0.3+d*s*0.8, s*0.4, 3, '#666');
  }
};

Furniture.pictureFrame = function(ctx, x, y, s, color) {
  drawRect(ctx, x, y, s*1.5, s*1.2, '#6B4518');
  drawRect(ctx, x+3, y+3, s*1.5-6, s*1.2-6, color||'#4a6a8a');
};

Furniture.ceilingLights = function(ctx, w, h, count) {
  ctx.fillStyle = 'rgba(255,255,200,0.06)';
  for(let i=0;i<count;i++) {
    const lx = w/(count+1)*(i+1);
    ctx.beginPath(); ctx.ellipse(lx, 15, 30, 5, 0, 0, Math.PI*2); ctx.fill();
    // Light cone
    ctx.fillStyle = 'rgba(255,255,200,0.015)';
    ctx.beginPath(); ctx.moveTo(lx-30, 15); ctx.lineTo(lx-60, h*0.4); ctx.lineTo(lx+60, h*0.4); ctx.lineTo(lx+30, 15); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,200,0.06)';
  }
};

Furniture.partition = function(ctx, x, y, s, len) {
  drawRect(ctx, x, y, len, s*0.15, '#bbb');
  drawRect(ctx, x, y+s*0.15, len, s*2, '#d0d0d8');
  drawRect(ctx, x, y+s*2.15, len, s*0.1, '#aaa');
};

Furniture.rug = function(ctx, x, y, w, h, color) {
  ctx.fillStyle = color || 'rgba(100,50,50,0.3)';
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 6); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(x+4, y+4, w-8, h-8, 4); ctx.stroke();
};

Furniture.stickyNotes = function(ctx, x, y, s) {
  const colors = ['#ffeb3b','#ff9800','#4caf50','#2196f3','#e91e63'];
  for(let n=0;n<5;n++) {
    ctx.fillStyle = colors[n];
    const nx = x + (n%3)*s*0.6;
    const ny = y + Math.floor(n/3)*s*0.6;
    ctx.fillRect(nx, ny, s*0.5, s*0.5);
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(nx+2, ny+s*0.15, s*0.3, 1);
    ctx.fillRect(nx+2, ny+s*0.25, s*0.2, 1);
  }
};

Furniture.fireExtinguisher = function(ctx, x, y, s) {
  drawRoundRect(ctx, x, y, s*0.6, s*1.5, 3, '#c33');
  drawRect(ctx, x+s*0.15, y-s*0.2, s*0.3, s*0.3, '#333');
  ctx.fillStyle = '#888'; ctx.fillRect(x+s*0.4, y-s*0.1, s*0.3, 2);
};

Furniture.coatRack = function(ctx, x, y, s) {
  drawRect(ctx, x+s*0.35, y+s*0.3, s*0.3, s*2.5, '#8B6538');
  drawRect(ctx, x, y+s*2.7, s*1, s*0.2, '#8B6538');
  // Hooks
  ctx.strokeStyle = '#666'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x+s*0.2, y+s*0.4); ctx.lineTo(x, y+s*0.6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x+s*0.8, y+s*0.4); ctx.lineTo(x+s, y+s*0.6); ctx.stroke();
  // Coat
  ctx.fillStyle = '#2a3a5a'; ctx.fillRect(x-2, y+s*0.5, s*0.35, s*0.8);
};

Furniture.exitSign = function(ctx, x, y, s) {
  drawRect(ctx, x, y, s*1.5, s*0.6, '#2E7D32');
  ctx.fillStyle = '#fff'; ctx.font = `${s*0.35}px sans-serif`; ctx.textAlign='center';
  ctx.fillText('EXIT', x+s*0.75, y+s*0.42);
};

Furniture.deskWithStuff = function(ctx, x, y, s) {
  // Full desk with monitor, keyboard, mouse, coffee mug, papers
  Furniture.desk(ctx, x, y, s);
  // Mouse
  ctx.fillStyle = '#444';
  ctx.beginPath(); ctx.ellipse(x+s*2.8, y+s*0.5, 4, 6, 0, 0, Math.PI*2); ctx.fill();
  // Coffee mug
  ctx.fillStyle = '#8B4513'; ctx.fillRect(x+s*3, y+s*0.2, 5, 6);
  // Paper stack
  ctx.fillStyle = '#eee'; ctx.fillRect(x+s*0.2, y+s*0.4, s*0.5, s*0.3);
  ctx.fillStyle = '#ddd'; ctx.fillRect(x+s*0.22, y+s*0.38, s*0.5, s*0.3);
  // Pencil holder
  ctx.fillStyle = '#666'; ctx.fillRect(x+s*2.5, y+s*0.15, 6, 8);
  ctx.fillStyle = '#ff0'; ctx.fillRect(x+s*2.52, y+s*0.05, 2, 12);
  ctx.fillStyle = '#f00'; ctx.fillRect(x+s*2.56, y+s*0.08, 2, 10);
};

Furniture.raspberryPi = function(ctx, x, y, s) {
    // PCB
    drawRoundRect(ctx, x, y, s*2.5, s*1.8, 3, '#2E7D32');
    // Components
    drawRect(ctx, x + s*0.3, y + s*0.3, s*1, s*0.8, '#333'); // SoC
    drawRect(ctx, x + s*1.6, y + s*0.2, s*0.7, s*0.4, '#1a1a1a'); // USB
    drawRect(ctx, x + s*1.6, y + s*0.8, s*0.7, s*0.4, '#1a1a1a'); // USB
    // GPIO header
    ctx.fillStyle = '#FFD700';
    for (let p = 0; p < 10; p++) {
      ctx.fillRect(x + s*0.2 + p * 4, y + 2, 2, 4);
      ctx.fillRect(x + s*0.2 + p * 4, y + 7, 2, 4);
    }
    // Ethernet
    drawRect(ctx, x + s*2.1, y + s*0.5, s*0.4, s*0.8, '#888');
    // LED
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath(); ctx.arc(x + s*0.15, y + s*1.5, 3, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#F44336';
    ctx.beginPath(); ctx.arc(x + s*0.35, y + s*1.5, 3, 0, Math.PI*2); ctx.fill();
};

// Remaining floor layouts
Object.assign(FLOOR_LAYOUTS, {
  'rooftop': (ctx, w, h, t) => {
    // PACKED rooftop garden
    // Sky gradient with time-of-day feel
    const sky = ctx.createLinearGradient(0, 0, 0, h*0.42);
    sky.addColorStop(0, '#3377BB');
    sky.addColorStop(0.5, '#6699CC');
    sky.addColorStop(1, '#99BBDD');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h*0.42);
    // Clouds (layered, different speeds)
    for(let layer=0;layer<3;layer++) {
      ctx.fillStyle = `rgba(255,255,255,${0.3+layer*0.15})`;
      for(let i=0;i<4;i++) {
        const cx = ((t*(8+layer*5) + i*250 + layer*100) % (w+300)) - 150;
        const cy = h*0.08 + layer*h*0.08 + i*15;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 50+i*15, 12+layer*3, 0, 0, Math.PI*2);
        ctx.ellipse(cx+30, cy-5, 35, 10, 0, 0, Math.PI*2);
        ctx.ellipse(cx-25, cy-3, 30, 8, 0, 0, Math.PI*2);
        ctx.fill();
      }
    }
    // Minneapolis skyline (detailed)
    const buildings = [
      [0,50,25],[25,70,30],[55,45,28],[83,90,35],[118,60,25],[143,100,40],
      [183,55,22],[205,80,35],[240,65,28],[268,95,38],[306,50,25],[331,75,30],
      [361,85,32],[393,45,20],[413,70,28],[441,55,25],[466,90,35],[501,60,22]
    ];
    buildings.forEach(([bx,bh,bw]) => {
      const sx = bx/520*w;
      const sw = bw/520*w;
      ctx.fillStyle = '#556677';
      drawRect(ctx, sx, h*0.42-bh*h/500, sw, bh*h/500);
      // Windows
      ctx.fillStyle = 'rgba(255,230,150,0.3)';
      for(let wy=3;wy<bh*h/500-5;wy+=8) for(let wx=3;wx<sw-3;wx+=6) {
        if(Math.random()>0.3) ctx.fillRect(sx+wx, h*0.42-bh*h/500+wy, 3, 4);
      }
    });
    // IDS Tower (tallest — Minneapolis)
    drawRect(ctx, w*0.48, h*0.15, w*0.04, h*0.27, '#778899');
    ctx.fillStyle='rgba(200,220,240,0.2)';
    for(let wy=0;wy<h*0.27;wy+=6) ctx.fillRect(w*0.48, h*0.15+wy, w*0.04, 3);
    // Rooftop floor — stone tiles
    for (let tx = 0; tx < w; tx += 24) for (let ty = h*0.42; ty < h; ty += 24) {
      drawRect(ctx, tx, ty, 23, 23, (tx+ty)%48===0 ? '#b8b0a8' : '#c8c0b8');
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      ctx.fillRect(tx, ty, 23, 1);
    }
    const s = Math.min(w,h)*0.025;
    // Glass railing
    ctx.strokeStyle = '#aaa'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, h*0.43); ctx.lineTo(w, h*0.43); ctx.stroke();
    ctx.fillStyle = 'rgba(135,200,235,0.15)';
    ctx.fillRect(0, h*0.42, w, h*0.05);
    for(let rx=20;rx<w;rx+=50) drawRect(ctx, rx, h*0.42, 3, h*0.05, '#bbb');
    // Garden beds (5, with varied plants)
    const beds = [[0.05,0.5],[0.22,0.48],[0.42,0.5],[0.62,0.48],[0.82,0.5]];
    beds.forEach(([bx,by],bi) => {
      drawRoundRect(ctx, w*bx, h*by, w*0.12, h*0.08, 4, '#5a3a1a');
      drawRoundRect(ctx, w*bx+2, h*by+2, w*0.12-4, h*0.04, 3, '#3a2a0a');
      // Soil
      ctx.fillStyle = '#4a3a2a'; ctx.fillRect(w*bx+3, h*by+h*0.04, w*0.12-6, h*0.035);
      // Flowers (more types)
      const colors = ['#e44','#ee4','#e4e','#4ae','#fa4','#f84','#84f','#4ea'];
      for(let f=0;f<8;f++) {
        const fx = w*bx + 8 + f*w*0.013;
        const fy = h*by - 3 + Math.sin(t*1.5+f+bi)*4;
        // Stem
        ctx.fillStyle = '#3a7a2a'; drawRect(ctx, fx, fy+5, 2, 10);
        // Flower
        ctx.fillStyle = colors[(f+bi*3)%colors.length];
        ctx.beginPath(); ctx.arc(fx+1, fy+3, 4+Math.sin(f)*1.5, 0, Math.PI*2); ctx.fill();
        // Petal highlights
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath(); ctx.arc(fx, fy+2, 2, 0, Math.PI*2); ctx.fill();
      }
    });
    // Trees in large pots
    const trees = [[0.15,0.42],[0.5,0.42],[0.85,0.42]];
    trees.forEach(([tx2,ty2]) => {
      // Pot
      drawRoundRect(ctx, w*tx2-s*0.8, h*ty2+s*2, s*1.6, s*1.2, 4, '#6B4518');
      drawRect(ctx, w*tx2-s, h*ty2+s*1.8, s*2, s*0.3, '#5a3a10');
      // Trunk
      drawRect(ctx, w*tx2-2, h*ty2-s*1, 5, s*3, '#7a5a30');
      // Canopy (layered circles)
      ctx.fillStyle = '#3a8a3a';
      ctx.beginPath(); ctx.arc(w*tx2, h*ty2-s*1.5, s*1.2, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#4a9a4a';
      ctx.beginPath(); ctx.arc(w*tx2-8, h*ty2-s*1.8, s*0.8, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(w*tx2+10, h*ty2-s*1.3, s*0.9, 0, Math.PI*2); ctx.fill();
    });
    // Seating area
    Furniture.rug(ctx, w*0.02, h*0.65, w*0.3, h*0.25, 'rgba(80,60,40,0.1)');
    // Wooden benches
    drawRoundRect(ctx, w*0.04, h*0.68, s*4, s*0.8, 3, '#8B6538');
    drawRect(ctx, w*0.04, h*0.65, s*4, s*0.4, '#7a5528');
    drawRoundRect(ctx, w*0.04, h*0.8, s*4, s*0.8, 3, '#8B6538');
    drawRect(ctx, w*0.04, h*0.77, s*4, s*0.4, '#7a5528');
    // Small table between benches
    drawRoundRect(ctx, w*0.1, h*0.73, s*2, s*1, 4, '#6B4518');
    // Outdoor lounge (right side)
    drawRoundRect(ctx, w*0.65, h*0.65, s*3.5, s*1.5, 6, '#555');
    drawRoundRect(ctx, w*0.66, h*0.66, s*3.3, s*1.3, 5, '#666');
    drawRoundRect(ctx, w*0.78, h*0.65, s*3.5, s*1.5, 6, '#555');
    drawRoundRect(ctx, w*0.79, h*0.66, s*3.3, s*1.3, 5, '#666');
    // Fire pit
    ctx.fillStyle = '#444';
    ctx.beginPath(); ctx.arc(w*0.75, h*0.83, s*1.2, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#333';
    ctx.beginPath(); ctx.arc(w*0.75, h*0.83, s*0.9, 0, Math.PI*2); ctx.fill();
    // Flames
    for(let fl=0;fl<5;fl++) {
      const fh = Math.sin(t*8+fl*1.3)*5+10;
      ctx.fillStyle = `rgba(255,${120+fl*20},0,${0.4+Math.sin(t*6+fl)*0.2})`;
      ctx.beginPath();
      ctx.ellipse(w*0.75+Math.sin(fl*2)*6, h*0.83-fh*0.5, 3+fl, fh*0.7, 0, 0, Math.PI*2);
      ctx.fill();
    }
    // String lights
    ctx.strokeStyle = 'rgba(255,200,100,0.15)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(w*0.05, h*0.42);
    for(let sl=0;sl<10;sl++) {
      const sx2 = w*0.05 + sl*w*0.1;
      const sag = Math.sin(sl*0.5)*8+5;
      ctx.quadraticCurveTo(sx2+w*0.05, h*0.42+sag, sx2+w*0.1, h*0.42);
    }
    ctx.stroke();
    // Light bulbs on string
    for(let lb=0;lb<20;lb++) {
      const lx = w*0.05 + lb*w*0.048;
      const sag = Math.sin(lb*0.25)*5+4;
      ctx.fillStyle = `rgba(255,220,100,${0.3+Math.sin(t*2+lb)*0.15})`;
      ctx.beginPath(); ctx.arc(lx, h*0.42+sag, 3, 0, Math.PI*2); ctx.fill();
    }
    // Telescope
    drawRect(ctx, w*0.92, h*0.5, s*0.3, s*2, '#555');
    drawRect(ctx, w*0.9, h*0.48, s*1.2, s*0.5, '#444');
    drawRect(ctx, w*0.895, h*0.5+s*2, s*0.4, 3, '#666');
    drawRect(ctx, w*0.93+s*0.5, h*0.5+s*2, s*0.4, 3, '#666');
    // Helipad (corner)
    ctx.strokeStyle = '#888'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(w*0.92, h*0.92, s*2, 0, Math.PI*2); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.beginPath(); ctx.arc(w*0.92, h*0.92, s*2, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#888'; ctx.font = `${s*1.2}px "Space Grotesk"`; ctx.textAlign = 'center';
    ctx.fillText('H', w*0.92, h*0.92+s*0.4);
    // Water cooler
    Furniture.waterCooler(ctx, w*0.35, h*0.65, s);
  },

  'f9': (ctx, w, h, t) => {
    // Command Center — PACKED AI ops center
    // Dark floor with subtle circuit pattern
    for (let tx = 0; tx < w; tx += 20) for (let ty = 0; ty < h; ty += 20) {
      drawRect(ctx, tx, ty, 19, 19, (tx+ty)%40===0 ? '#0a0a14' : '#10101a');
    }
    // Circuit board traces
    ctx.strokeStyle = 'rgba(156,39,176,0.03)'; ctx.lineWidth = 1;
    for(let cx=0;cx<w;cx+=60) { ctx.beginPath(); ctx.moveTo(cx,0); ctx.lineTo(cx,h); ctx.stroke(); }
    for(let cy=0;cy<h;cy+=60) { ctx.beginPath(); ctx.moveTo(0,cy); ctx.lineTo(w,cy); ctx.stroke(); }
    const s = Math.min(w,h)*0.025;
    // Massive screen wall (6 screens)
    for(let ws=0;ws<6;ws++) {
      const sx = w*0.04+ws*w*0.155;
      drawRect(ctx, sx, h*0.02, w*0.14, h*0.12, '#111');
      drawRect(ctx, sx+2, h*0.03, w*0.14-4, h*0.1, '#0a0a1a');
      // Screen content
      const screenData = ['MODEL STATUS','INFERENCE','TOKENS/SEC','EMBEDDINGS','FLEET MAP','HAILO TEMPS'][ws];
      ctx.fillStyle = ['#9C27B0','#2979FF','#4CAF50','#00BCD4','#F5A623','#FF1D6C'][ws];
      ctx.font = '7px "JetBrains Mono"'; ctx.textAlign = 'center';
      ctx.fillText(screenData, sx+w*0.07, h*0.06);
      // Animated bars on each screen
      for(let bar=0;bar<5;bar++) {
        const bh = Math.abs(Math.sin(t*3+bar+ws))*h*0.04+h*0.01;
        ctx.fillStyle = `rgba(${ws<3?156:ws<5?100:255},${ws<2?39:ws<4?180:29},${ws<1?176:ws<3?255:108},0.3)`;
        ctx.fillRect(sx+8+bar*w*0.025, h*0.11-bh, w*0.02, bh);
      }
    }
    // Central hologram table (bigger)
    ctx.fillStyle = '#12121e';
    ctx.beginPath(); ctx.ellipse(w*0.5, h*0.48, s*6, s*3.5, 0, 0, Math.PI*2); ctx.fill();
    // Table rim glow
    ctx.strokeStyle = `rgba(156,39,176,${0.2+Math.sin(t)*0.1})`; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(w*0.5, h*0.48, s*6, s*3.5, 0, 0, Math.PI*2); ctx.stroke();
    // Hologram glow
    ctx.fillStyle = `rgba(156,39,176,${0.06+Math.sin(t*2)*0.03})`;
    ctx.beginPath(); ctx.ellipse(w*0.5, h*0.48, s*5, s*3, 0, 0, Math.PI*2); ctx.fill();
    // Neural network hologram (more nodes)
    for(let n=0;n<15;n++) {
      const nx = w*0.5 + Math.cos(t*0.5+n*0.42)*s*4;
      const ny = h*0.38 + Math.sin(t*0.7+n*0.6)*s*1.5 - Math.abs(Math.sin(t*0.8+n))*25;
      // Node
      ctx.fillStyle = `rgba(156,39,176,${0.3+Math.sin(t+n)*0.2})`;
      ctx.beginPath(); ctx.arc(nx, ny, 3+Math.sin(t*2+n)*1.5, 0, Math.PI*2); ctx.fill();
      // Connections
      for(let c=1;c<3;c++) {
        const cn = (n+c)%15;
        const nx2 = w*0.5 + Math.cos(t*0.5+cn*0.42)*s*4;
        const ny2 = h*0.38 + Math.sin(t*0.7+cn*0.6)*s*1.5 - Math.abs(Math.sin(t*0.8+cn))*25;
        ctx.strokeStyle = `rgba(156,39,176,${0.08+Math.sin(t+n+cn)*0.05})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(nx, ny); ctx.lineTo(nx2, ny2); ctx.stroke();
      }
    }
    // "CECE" label in hologram center
    ctx.fillStyle = `rgba(156,39,176,${0.4+Math.sin(t*1.5)*0.2})`; ctx.font = `${s}px "Space Grotesk"`; ctx.textAlign='center';
    ctx.fillText('CECE', w*0.5, h*0.5);
    ctx.font = `${s*0.5}px "JetBrains Mono"`;
    ctx.fillText('16 MODELS | 52 TOPS', w*0.5, h*0.5+s*0.8);
    // Workstations around the table (8 seats)
    for(let ws=0;ws<8;ws++) {
      const angle = ws * Math.PI/4 + 0.2;
      const wx = w*0.5 + Math.cos(angle)*w*0.38 - s*1.5;
      const wy = h*0.48 + Math.sin(angle)*h*0.32 - s*1;
      if(wy > h*0.15 && wy < h*0.85) {
        Furniture.deskWithStuff(ctx, wx, wy, s*0.7);
        Furniture.chair(ctx, wx+s*1, wy+s*1.2, s*0.6, '#9C27B0');
      }
    }
    // Hailo-8 display cases (both sides)
    drawRect(ctx, w*0.02, h*0.18, s*3, s*4, '#111');
    drawRect(ctx, w*0.025, h*0.19, s*2.9, s*3.8, '#0a0a1a');
    Furniture.hailo(ctx, w*0.04, h*0.22, s);
    Furniture.hailo(ctx, w*0.04, h*0.38, s);
    ctx.fillStyle='rgba(156,39,176,0.15)'; ctx.font='7px "JetBrains Mono"'; ctx.textAlign='left';
    ctx.fillText('HAILO-8 #1', w*0.04, h*0.2);
    ctx.fillText('HAILO-8 #2', w*0.04, h*0.36);
    // Right side - model list
    drawRect(ctx, w*0.88, h*0.18, s*3.5, s*6, '#111');
    drawRect(ctx, w*0.885, h*0.19, s*3.4, s*5.8, '#0a0a1a');
    ctx.fillStyle='#9C27B0'; ctx.font='8px "JetBrains Mono"'; ctx.textAlign='left';
    const models = ['qwen2.5:7b','deepseek-r1','llama3.2:3b','mistral:7b','cece:7b','nomic-embed','gemma2:2b','phi3:mini'];
    models.forEach((m,i) => {
      ctx.fillStyle = Math.sin(t*2+i)>0 ? '#4CAF50' : '#9C27B0';
      ctx.fillText((Math.sin(t*2+i)>0?'o ':'_ ')+m, w*0.89, h*0.23+i*s*0.7);
    });
    // Server rack in corner
    Furniture.serverRack(ctx, w*0.88, h*0.7, s, t);
    // Ambient lighting
    ctx.fillStyle = `rgba(156,39,176,${0.02+Math.sin(t)*0.01})`;
    ctx.fillRect(0, h*0.15, w, h*0.7);
    // Floor LEDs along edges
    for(let fl=0;fl<20;fl++) {
      ctx.fillStyle = `rgba(156,39,176,${Math.sin(t*3+fl*0.5)>0.5?0.2:0.05})`;
      ctx.beginPath(); ctx.arc(fl*w/20+w/40, h*0.97, 2, 0, Math.PI*2); ctx.fill();
    }
  },

  'f8': (ctx, w, h, t) => {
    // Strategy Room — executive finance/ops center, Bloomberg vibes
    Furniture.windowWall(ctx, 0, 0, w, h*0.12, 5);
    for (let tx = 0; tx < w; tx += 20) for (let ty = h*0.12; ty < h; ty += 20) {
      drawRect(ctx, tx, ty, 19, 19, tx%40===0 ? '#3a2818' : '#4a3828');
    }
    const s = Math.min(w,h)*0.025;
    Furniture.ceilingLights(ctx, w, h, 4);
    // 3 Bloomberg-style dashboard screens
    drawRect(ctx, w*0.03, h*0.13, w*0.28, h*0.2, '#111');
    drawRect(ctx, w*0.04, h*0.14, w*0.26, h*0.18, '#0a0a12');
    ctx.fillStyle='#4CAF50'; ctx.font='9px "JetBrains Mono"'; ctx.textAlign='left';
    ctx.fillText('RESERVE STRUCTURE', w*0.05, h*0.17);
    ctx.fillStyle='#888'; ctx.font='8px "JetBrains Mono"';
    ctx.fillText('Revenue retained:   90%', w*0.05, h*0.2);
    ctx.fillText('Operating:          10%', w*0.05, h*0.225);
    ctx.fillText('Entity: Delaware C Corp', w*0.05, h*0.25);
    ctx.fillStyle='#4CAF50'; ctx.fillRect(w*0.22, h*0.195, w*0.055, 8);
    ctx.fillStyle='#F5A623'; ctx.fillRect(w*0.275, h*0.195, w*0.006, 8);

    drawRect(ctx, w*0.35, h*0.13, w*0.28, h*0.2, '#111');
    drawRect(ctx, w*0.36, h*0.14, w*0.26, h*0.18, '#0a0a12');
    ctx.fillStyle='#2979FF'; ctx.font='9px "JetBrains Mono"'; ctx.textAlign='left';
    ctx.fillText('ASSET INVENTORY', w*0.37, h*0.17);
    ctx.fillStyle='#888'; ctx.font='8px "JetBrains Mono"';
    ctx.fillText('Domains:    20', w*0.37, h*0.2);
    ctx.fillText('Workers:    75+', w*0.37, h*0.225);
    ctx.fillText('Compute:    52 TOPS', w*0.37, h*0.25);
    ctx.fillText('Repos:      275+', w*0.37, h*0.275);

    drawRect(ctx, w*0.67, h*0.13, w*0.28, h*0.2, '#111');
    drawRect(ctx, w*0.68, h*0.14, w*0.26, h*0.18, '#0a0a12');
    ctx.fillStyle='#FF1D6C'; ctx.font='9px "JetBrains Mono"'; ctx.textAlign='left';
    ctx.fillText('PRODUCT PIPELINE', w*0.69, h*0.17);
    ctx.fillStyle='#888'; ctx.font='8px "JetBrains Mono"';
    ctx.fillText('API:  OpenAI-compat', w*0.69, h*0.2);
    ctx.fillText('Mesh: Browser compute', w*0.69, h*0.225);
    ctx.fillText('SaaS: 3 tiers', w*0.69, h*0.25);

    // Scrolling ticker
    drawRect(ctx, w*0.03, h*0.34, w*0.93, h*0.025, '#0a0a12');
    ctx.fillStyle='#4CAF50'; ctx.font='8px "JetBrains Mono"'; ctx.textAlign='left';
    const tickerX = ((t*25)%(w*2))-w*0.3;
    ctx.fillText('STRIPE acct_1SUDM8 LIVE | Starter $9 | Pro $29 | Enterprise $99 | 90% RESERVED | 52 TOPS EDGE COMPUTE', w*0.05-tickerX%w, h*0.355);

    // Executive table with rug
    Furniture.rug(ctx, w*0.12, h*0.42, w*0.52, h*0.28, 'rgba(60,30,20,0.12)');
    ctx.fillStyle='#4a2a15';
    ctx.beginPath(); ctx.ellipse(w*0.38, h*0.57, w*0.22, h*0.11, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle='#5a3a25';
    ctx.beginPath(); ctx.ellipse(w*0.38, h*0.56, w*0.2, h*0.09, 0, 0, Math.PI*2); ctx.fill();
    for(let c=0;c<8;c++) { const a=c*Math.PI/4; ctx.fillStyle='#1a1a2a'; ctx.beginPath(); ctx.arc(w*0.38+Math.cos(a)*w*0.24, h*0.57+Math.sin(a)*h*0.14, 7, 0, Math.PI*2); ctx.fill(); }
    // Laptops and papers
    for(let l=0;l<4;l++) { const a=l*Math.PI/2.5+0.3; const lx=w*0.38+Math.cos(a)*w*0.12; const ly=h*0.56+Math.sin(a)*h*0.05;
      drawRect(ctx, lx-5, ly-3, 10, 7, '#222'); drawRect(ctx, lx-4, ly-2, 8, 5, '#4488CC'); }

    // CEO desk with dual monitors
    Furniture.deskWithStuff(ctx, w*0.72, h*0.45, s);
    Furniture.chair(ctx, w*0.76, h*0.6, s, '#FF1D6C');
    drawRect(ctx, w*0.72+s*2.5, h*0.45-s*1.5, s*2, s*1.4, '#111');
    drawRect(ctx, w*0.72+s*2.6, h*0.45-s*1.4, s*1.8, s*1.1, '#0a1a2a');

    // Bookshelf
    drawRect(ctx, w*0.72, h*0.72, s*6, s*3, '#4a3520');
    for(let sh=0;sh<3;sh++) { drawRect(ctx, w*0.725, h*0.74+sh*s*0.95, s*5.8, 2, '#5a4530');
      for(let b=0;b<8;b++) { ctx.fillStyle=[C.book1,C.book2,C.book3,C.book4,'#2a5a8a','#8a5a2a','#5a2a5a','#2a8a5a'][b]; drawRect(ctx, w*0.73+b*s*0.7, h*0.73+sh*s*0.95, s*0.55, s*0.8, ctx.fillStyle); }}

    // Globe
    Furniture.globe(ctx, w*0.05, h*0.5, s*1.5, t);
    // Credenza with awards
    drawRect(ctx, w*0.03, h*0.75, s*5, s*1.5, '#4a3520');
    ctx.fillStyle='#DAA520'; drawRect(ctx, w*0.06, h*0.71, 4, s*0.5); ctx.beginPath(); ctx.arc(w*0.062, h*0.71, 5, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle='#C0C0C0'; drawRect(ctx, w*0.1, h*0.72, 4, s*0.4); ctx.beginPath(); ctx.arc(w*0.102, h*0.72, 4, 0, Math.PI*2); ctx.fill();
    // Framed certs
    Furniture.pictureFrame(ctx, w*0.04, h*0.02, s*1.2, '#f5f0e0');
    Furniture.pictureFrame(ctx, w*0.12, h*0.02, s*1.2, '#f0e8d8');
    Furniture.pictureFrame(ctx, w*0.2, h*0.02, s*1.2, '#e8e0d0');
    // Decor
    Furniture.plant(ctx, w*0.02, h*0.38, s*1.2);
    Furniture.plant(ctx, w*0.68, h*0.38, s);
    Furniture.plant(ctx, w*0.95, h*0.72, s);
    Furniture.clock(ctx, w*0.55, h*0.06, s*1.2, t);
    Furniture.coatRack(ctx, w*0.95, h*0.38, s);
    Furniture.fireExtinguisher(ctx, w*0.97, h*0.9, s);
    ctx.fillStyle='rgba(255,255,255,0.03)'; ctx.font='14px "Space Grotesk"'; ctx.textAlign='center';
    ctx.fillText('THE STRUCTURE IS THE PROTECTION', w*0.4, h*0.95);
  },

  'f6': (ctx, w, h, t) => {
    // Hardware Lab — PACKED maker space
    for (let tx = 0; tx < w; tx += 20) for (let ty = 0; ty < h; ty += 20) {
      drawRect(ctx, tx, ty, 19, 19, (tx+ty)%40===0 ? C.concreteDark : C.concrete);
    }
    const s = Math.min(w,h)*0.025;
    Furniture.ceilingLights(ctx, w, h, 5);
    // Zone labels
    ctx.fillStyle='rgba(255,255,255,0.06)'; ctx.font='9px "JetBrains Mono"'; ctx.textAlign='left';
    ctx.fillText('PI ASSEMBLY', w*0.03, h*0.05);
    ctx.fillText('TESTING', w*0.5, h*0.05);
    ctx.fillText('STORAGE', w*0.78, h*0.05);
    // Long workbench 1 — Pi assembly
    drawRect(ctx, w*0.03, h*0.08, w*0.42, h*0.06, '#8B6538');
    drawRect(ctx, w*0.03, h*0.06, w*0.42, h*0.03, '#7a5528');
    // Pis on bench (5!)
    for(let p=0;p<5;p++) Furniture.raspberryPi(ctx, w*0.05+p*w*0.08, h*0.01, s);
    // SD cards, cables, GPIO wires scattered
    for(let sc=0;sc<6;sc++) { ctx.fillStyle='#222'; drawRect(ctx, w*0.04+sc*w*0.07, h*0.09, 6, 4); ctx.fillStyle='#888'; drawRect(ctx, w*0.04+sc*w*0.07, h*0.09, 3, 4); }
    // Jumper wires
    const wireColors = ['#e44','#44e','#4a4','#ea4','#fff'];
    wireColors.forEach((c,i) => { ctx.strokeStyle=c; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(w*0.06+i*12, h*0.1); ctx.quadraticCurveTo(w*0.06+i*12+5, h*0.12, w*0.06+i*12+10, h*0.1+Math.sin(i)*3); ctx.stroke(); });
    // Hailo display
    drawRect(ctx, w*0.03, h*0.18, s*4, s*2.5, '#1a1a1a');
    ctx.fillStyle='rgba(76,175,80,0.1)'; ctx.fillRect(w*0.04, h*0.19, s*3.8, s*2.3);
    Furniture.hailo(ctx, w*0.05, h*0.2, s*1.2);
    Furniture.hailo(ctx, w*0.05+s*2, h*0.2, s*1.2);
    ctx.fillStyle='#4CAF50'; ctx.font='8px "JetBrains Mono"'; ctx.textAlign='center';
    ctx.fillText('52 TOPS COMBINED', w*0.03+s*2, h*0.18+s*2.2);
    // Workbench 2 — soldering
    drawRect(ctx, w*0.03, h*0.42, w*0.3, h*0.06, '#8B6538');
    // Soldering iron
    drawRect(ctx, w*0.05, h*0.44, s*0.3, s*1.5, '#666');
    ctx.fillStyle='#ff8800'; ctx.beginPath(); ctx.arc(w*0.05+s*0.15, h*0.44, 3, 0, Math.PI*2); ctx.fill();
    // Solder roll
    ctx.fillStyle='#888'; ctx.beginPath(); ctx.arc(w*0.12, h*0.45, 6, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle='#666'; ctx.beginPath(); ctx.arc(w*0.12, h*0.45, 3, 0, Math.PI*2); ctx.fill();
    // Multimeter
    drawRect(ctx, w*0.18, h*0.43, s*1.2, s*1.5, '#333');
    drawRect(ctx, w*0.185, h*0.435, s*1.1, s*0.8, '#0a2a0a');
    ctx.fillStyle='#0f0'; ctx.font='8px "JetBrains Mono"'; ctx.textAlign='center'; ctx.fillText('3.3V', w*0.185+s*0.55, h*0.46);
    // Magnifying lamp
    drawRect(ctx, w*0.28, h*0.35, 3, h*0.12, '#888');
    ctx.strokeStyle='#aaa'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(w*0.282, h*0.35, 10, 0, Math.PI*2); ctx.stroke();
    ctx.fillStyle='rgba(255,255,200,0.1)'; ctx.beginPath(); ctx.arc(w*0.282, h*0.35, 9, 0, Math.PI*2); ctx.fill();
    // Oscilloscope (bigger)
    drawRect(ctx, w*0.5, h*0.08, s*4, s*3, '#333');
    drawRect(ctx, w*0.51, h*0.09, s*3.8, s*2.3, '#0a2a0a');
    ctx.strokeStyle='#0f0'; ctx.lineWidth=1.5; ctx.beginPath();
    for(let sx=0;sx<50;sx++) { const sv=Math.sin(t*5+sx*0.3)*s*0.6; const px=w*0.52+sx*s*0.075; const py=h*0.15+sv; if(sx===0)ctx.moveTo(px,py);else ctx.lineTo(px,py); }
    ctx.stroke();
    // Grid lines on scope
    ctx.strokeStyle='rgba(0,255,0,0.1)'; ctx.lineWidth=0.5;
    for(let g=0;g<5;g++) { ctx.beginPath(); ctx.moveTo(w*0.52, h*0.1+g*s*0.45); ctx.lineTo(w*0.51+s*3.7, h*0.1+g*s*0.45); ctx.stroke(); }
    // Logic analyzer
    drawRect(ctx, w*0.5, h*0.32, s*3, s*2, '#444');
    drawRect(ctx, w*0.51, h*0.33, s*2.8, s*1.5, '#0a0a1a');
    for(let ch=0;ch<4;ch++) {
      ctx.strokeStyle=['#0f0','#ff0','#0ff','#f0f'][ch]; ctx.lineWidth=1; ctx.beginPath();
      for(let px=0;px<30;px++) { const v=(Math.sin(t*8+px*0.5+ch*1.5)>0?1:0)*s*0.25; if(px===0)ctx.moveTo(w*0.52+px*s*0.09,h*0.35+ch*s*0.35+v);else ctx.lineTo(w*0.52+px*s*0.09,h*0.35+ch*s*0.35+v); }
      ctx.stroke();
    }
    // 3D printer
    drawRoundRect(ctx, w*0.5, h*0.58, s*3.5, s*3.5, 4, '#444');
    drawRect(ctx, w*0.51, h*0.59, s*3.3, s*2.5, '#333');
    // Print bed
    drawRect(ctx, w*0.55, h*0.65, s*2.5, s*1.5, '#555');
    // Nozzle (animated)
    const nz = Math.sin(t*2)*s; ctx.fillStyle='#888';
    drawRect(ctx, w*0.55+s*1.25+nz, h*0.62, 4, s*0.3);
    ctx.fillStyle='#FF6B2B'; ctx.beginPath(); ctx.arc(w*0.55+s*1.27+nz, h*0.62+s*0.3, 2, 0, Math.PI*2); ctx.fill();
    // Parts shelf (big)
    drawRect(ctx, w*0.78, h*0.05, w*0.19, h*0.88, '#5a4a3a');
    for(let sh=0;sh<6;sh++) drawRect(ctx, w*0.785, h*0.08+sh*h*0.145, w*0.18, 3, '#8B6538');
    // Parts on shelves
    const partColors = ['#e44','#44e','#4a4','#ea4','#888','#444'];
    for(let sh=0;sh<6;sh++) for(let p=0;p<4;p++) {
      ctx.fillStyle=partColors[(sh+p)%6];
      drawRoundRect(ctx, w*0.79+p*w*0.04, h*0.09+sh*h*0.145, w*0.03, h*0.1, 2, ctx.fillStyle);
    }
    // Workbench with arm
    drawRect(ctx, w*0.03, h*0.58, w*0.3, h*0.06, '#8B6538');
    // Robot arm
    ctx.strokeStyle='#888'; ctx.lineWidth=3;
    const armAngle = Math.sin(t*0.5)*0.5;
    ctx.beginPath(); ctx.moveTo(w*0.2, h*0.58);
    ctx.lineTo(w*0.2+Math.cos(armAngle)*30, h*0.58-Math.sin(armAngle)*30-20);
    ctx.lineTo(w*0.2+Math.cos(armAngle)*50, h*0.58-Math.sin(armAngle)*20-35);
    ctx.stroke();
    // Gripper
    ctx.fillStyle='#666'; ctx.beginPath(); ctx.arc(w*0.2+Math.cos(armAngle)*50, h*0.58-Math.sin(armAngle)*20-35, 4, 0, Math.PI*2); ctx.fill();
    // ESD mat
    Furniture.rug(ctx, w*0.03, h*0.7, w*0.4, h*0.2, 'rgba(0,100,100,0.08)');
    ctx.fillStyle='rgba(0,200,200,0.05)'; ctx.font='7px "JetBrains Mono"'; ctx.textAlign='center';
    ctx.fillText('ESD SAFE ZONE', w*0.23, h*0.82);
    // Chair
    Furniture.chair(ctx, w*0.15, h*0.7, s);
    Furniture.chair(ctx, w*0.55, h*0.5, s);
    // Decor
    Furniture.plant(ctx, w*0.45, h*0.8, s);
    Furniture.trashCan(ctx, w*0.45, h*0.58, s);
    Furniture.fireExtinguisher(ctx, w*0.75, h*0.85, s);
    Furniture.clock(ctx, w*0.5, h*0.03, s, t);
    Furniture.exitSign(ctx, w*0.92, h*0.02, s);
    // Safety poster
    drawRect(ctx, w*0.38, h*0.02, s*2.5, s*3, '#eee');
    ctx.fillStyle='#c00'; ctx.font='7px sans-serif'; ctx.textAlign='center';
    ctx.fillText('SAFETY', w*0.38+s*1.25, h*0.04);
    ctx.fillText('FIRST', w*0.38+s*1.25, h*0.06);
  },

  'f5': (ctx, w, h, t) => {
    // NOC — PACKED network operations center
    for (let tx = 0; tx < w; tx += 20) for (let ty = 0; ty < h; ty += 20) {
      drawRect(ctx, tx, ty, 19, 19, (tx+ty)%40===0 ? '#0a0a18' : '#0e0e1e');
    }
    const s = Math.min(w,h)*0.025;
    // ── Massive screen wall (8 monitors) ──
    for(let sw=0;sw<8;sw++) {
      const sx = w*0.02+sw*w*0.12;
      drawRect(ctx, sx, h*0.02, w*0.11, h*0.15, '#111');
      drawRect(ctx, sx+2, h*0.03, w*0.11-4, h*0.13, '#0a0a1a');
      const labels = ['TUNNELS','PORTS','DNS','TRAFFIC','NODES','ALERTS','UPTIME','THREATS'];
      ctx.fillStyle = ['#2979FF','#4CAF50','#00BCD4','#F5A623','#9C27B0','#F44336','#4CAF50','#FF1D6C'][sw];
      ctx.font = '7px "JetBrains Mono"'; ctx.textAlign = 'center';
      ctx.fillText(labels[sw], sx+w*0.055, h*0.05);
      // Mini bar charts
      for(let b=0;b<5;b++) {
        const bh = Math.abs(Math.sin(t*2+b+sw*1.3))*h*0.06+h*0.01;
        ctx.fillRect(sx+6+b*w*0.018, h*0.14-bh, w*0.014, bh);
      }
    }
    // ── Central command area ──
    // Network globe (big)
    Furniture.globe(ctx, w*0.35, h*0.22, s*2.5, t);
    // World map next to globe
    drawRect(ctx, w*0.55, h*0.2, w*0.25, h*0.15, '#0a0a1a');
    ctx.strokeStyle = 'rgba(41,121,255,0.15)'; ctx.lineWidth = 0.5;
    // Simple continent outlines
    const continents = [[0.15,0.3],[0.25,0.5],[0.3,0.7],[0.5,0.3],[0.55,0.5],[0.7,0.4],[0.8,0.6],[0.85,0.3]];
    continents.forEach(([cx,cy]) => {
      ctx.fillStyle = 'rgba(41,121,255,0.1)';
      ctx.beginPath(); ctx.ellipse(w*0.55+w*0.25*cx, h*0.2+h*0.15*cy, 12, 8, cx, 0, Math.PI*2); ctx.fill();
    });
    // Fleet node dots on map
    ctx.fillStyle = '#4CAF50';
    [[0.3,0.4],[0.32,0.42],[0.31,0.41],[0.29,0.43],[0.33,0.39]].forEach(([mx,my],i) => {
      ctx.beginPath(); ctx.arc(w*0.55+w*0.25*mx, h*0.2+h*0.15*my, 3, 0, Math.PI*2); ctx.fill();
      if(Math.sin(t*3+i)>0.5) { ctx.strokeStyle='rgba(76,175,80,0.3)'; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(w*0.55+w*0.25*mx, h*0.2+h*0.15*my, 6+Math.sin(t*2)*2, 0, Math.PI*2); ctx.stroke(); }
    });
    ctx.fillStyle='rgba(255,255,255,0.06)'; ctx.font='7px "JetBrains Mono"'; ctx.textAlign='left';
    ctx.fillText('MINNEAPOLIS, MN', w*0.57, h*0.33);
    // ── Operator desks (6 in 2 rows) ──
    for(let row=0;row<2;row++) for(let d=0;d<3;d++) {
      const dx = w*0.08 + d*w*0.28;
      const dy = h*0.45 + row*h*0.2;
      Furniture.deskWithStuff(ctx, dx, dy, s*0.8);
      Furniture.chair(ctx, dx+s*1, dy+s*1.5, s*0.7, '#2979FF');
    }
    // ── Right side equipment ──
    // Satellite dish
    Furniture.satellite(ctx, w*0.88, h*0.2, s*1.5);
    // Server rack
    Furniture.serverRack(ctx, w*0.88, h*0.5, s, t);
    // Patch panel
    drawRect(ctx, w*0.88, h*0.72, s*3, s*2, '#222');
    for(let pp=0;pp<12;pp++) {
      ctx.fillStyle = Math.random()>0.3 ? '#4CAF50' : '#2979FF';
      ctx.beginPath(); ctx.arc(w*0.89+pp%4*s*0.7, h*0.74+Math.floor(pp/4)*s*0.6, 3, 0, Math.PI*2); ctx.fill();
    }
    // ── Left side ──
    // Alert status panel
    drawRect(ctx, w*0.01, h*0.22, s*2, s*8, '#111');
    drawRect(ctx, w*0.015, h*0.23, s*1.9, s*7.8, '#0a0a1a');
    const alertLabels = ['CRITICAL','HIGH','MEDIUM','LOW','INFO'];
    const alertColors = ['#F44336','#FF9800','#F5A623','#4CAF50','#2979FF'];
    const alertCounts = [0,0,1,3,12];
    alertLabels.forEach((al,i) => {
      ctx.fillStyle = alertColors[i]; ctx.font='7px "JetBrains Mono"'; ctx.textAlign='left';
      ctx.fillText(al, w*0.02, h*0.27+i*s*1.4);
      ctx.fillStyle='#888'; ctx.fillText(alertCounts[i].toString(), w*0.02+s*1.2, h*0.27+i*s*1.4);
      // Status dot
      ctx.fillStyle = alertCounts[i]>0 ? alertColors[i] : '#333';
      ctx.beginPath(); ctx.arc(w*0.015+3, h*0.265+i*s*1.4, 3, 0, Math.PI*2); ctx.fill();
    });
    // Incident log
    drawRect(ctx, w*0.01, h*0.78, s*5, s*3, '#111');
    drawRect(ctx, w*0.015, h*0.79, s*4.9, s*2.8, '#0a0a1a');
    ctx.fillStyle='#888'; ctx.font='7px "JetBrains Mono"'; ctx.textAlign='left';
    ctx.fillText('INCIDENT LOG', w*0.02, h*0.82);
    ctx.fillStyle='#4CAF50'; ctx.fillText('14:03 All nodes online', w*0.02, h*0.86);
    ctx.fillStyle='#F5A623'; ctx.fillText('13:58 Alice disk 88%', w*0.02, h*0.89);
    ctx.fillStyle='#4CAF50'; ctx.fillText('13:45 Heal cycle OK', w*0.02, h*0.92);
    // Equipment
    Furniture.printer(ctx, w*0.82, h*0.85, s);
    Furniture.waterCooler(ctx, w*0.78, h*0.85, s);
    // Decor
    Furniture.plant(ctx, w*0.04, h*0.42, s);
    Furniture.plant(ctx, w*0.84, h*0.42, s);
    Furniture.trashCan(ctx, w*0.82, h*0.75, s);
    Furniture.fireExtinguisher(ctx, w*0.97, h*0.9, s);
    Furniture.clock(ctx, w*0.5, h*0.19, s, t);
    // Floor LED strip
    for(let fl=0;fl<30;fl++) {
      ctx.fillStyle=`rgba(41,121,255,${Math.sin(t*3+fl*0.3)>0.7?0.15:0.03})`;
      ctx.beginPath(); ctx.arc(fl*w/30+w/60, h*0.97, 2, 0, Math.PI*2); ctx.fill();
    }
    ctx.fillStyle='rgba(41,121,255,0.04)'; ctx.font='12px "Space Grotesk"'; ctx.textAlign='center';
    ctx.fillText('NETWORK OPERATIONS CENTER', w*0.5, h*0.42);
  },

  'f2': (ctx, w, h, t) => {
    // Boardroom — PACKED executive suite
    Furniture.windowWall(ctx, 0, 0, w, h*0.12, 6);
    for (let tx = 0; tx < w; tx += 20) for (let ty = h*0.12; ty < h; ty += 20) {
      drawRect(ctx, tx, ty, 19, 19, tx%40===0 ? '#4a3520' : '#5a4530');
    }
    const s = Math.min(w,h)*0.025;
    Furniture.ceilingLights(ctx, w, h, 4);
    // ── Presentation wall (2 big screens) ──
    drawRect(ctx, w*0.03, h*0.13, w*0.3, h*0.2, '#111');
    drawRect(ctx, w*0.04, h*0.14, w*0.28, h*0.18, '#1a1a2e');
    ctx.fillStyle='#FF1D6C'; ctx.font='16px "Space Grotesk"'; ctx.textAlign='center';
    ctx.fillText('BlackRoad OS, Inc.', w*0.18, h*0.22);
    ctx.fillStyle='#888'; ctx.font='10px "JetBrains Mono"';
    ctx.fillText('Delaware C Corporation', w*0.18, h*0.26);
    ctx.fillText('90% Reserved', w*0.18, h*0.29);
    drawRect(ctx, w*0.37, h*0.13, w*0.28, h*0.2, '#111');
    drawRect(ctx, w*0.38, h*0.14, w*0.26, h*0.18, '#1a1a2e');
    // Org chart on second screen
    ctx.fillStyle='#888'; ctx.font='9px "JetBrains Mono"'; ctx.textAlign='center';
    ctx.fillText('ORGANIZATIONAL STRUCTURE', w*0.51, h*0.17);
    ctx.fillStyle='#FF1D6C'; ctx.fillText('Alexa Amundson — CEO', w*0.51, h*0.21);
    ctx.fillStyle='#9C27B0'; ctx.fillText('Cecilia — AI', w*0.46, h*0.25);
    ctx.fillStyle='#4CAF50'; ctx.fillText('Alice — Ops', w*0.56, h*0.25);
    ctx.fillStyle='#7B1FA2'; ctx.fillText('Octavia — Arch', w*0.46, h*0.29);
    ctx.fillStyle='#2979FF'; ctx.fillText('Aria — UX', w*0.56, h*0.29);
    // Lines
    ctx.strokeStyle='rgba(255,255,255,0.1)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(w*0.51,h*0.215); ctx.lineTo(w*0.46,h*0.24); ctx.moveTo(w*0.51,h*0.215); ctx.lineTo(w*0.56,h*0.24); ctx.stroke();
    // ── Grand boardroom table ──
    Furniture.rug(ctx, w*0.1, h*0.38, w*0.55, h*0.35, 'rgba(80,30,20,0.12)');
    // Long oval mahogany table
    ctx.fillStyle='#3a1a0a';
    ctx.beginPath(); ctx.ellipse(w*0.38, h*0.56, w*0.25, h*0.12, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle='#4a2a1a';
    ctx.beginPath(); ctx.ellipse(w*0.38, h*0.55, w*0.23, h*0.1, 0, 0, Math.PI*2); ctx.fill();
    // Wood grain effect
    ctx.strokeStyle='rgba(90,50,25,0.3)'; ctx.lineWidth=0.5;
    for(let g=-5;g<6;g++) { ctx.beginPath(); ctx.ellipse(w*0.38, h*0.55+g*2, w*0.2-Math.abs(g)*8, h*0.08-Math.abs(g)*3, 0, 0, Math.PI*2); ctx.stroke(); }
    // 12 executive chairs
    for(let c=0;c<12;c++) {
      const a=c*Math.PI/6; const cx2=w*0.38+Math.cos(a)*w*0.27; const cy2=h*0.56+Math.sin(a)*h*0.15;
      ctx.fillStyle='#1a1a2a';
      ctx.beginPath(); ctx.arc(cx2, cy2, 7, 0, Math.PI*2); ctx.fill();
      // Chair back
      ctx.fillStyle='#151525';
      ctx.beginPath(); ctx.arc(cx2+Math.cos(a)*4, cy2+Math.sin(a)*4, 5, 0, Math.PI*2); ctx.fill();
    }
    // Items on table: laptops, water bottles, notepads
    for(let i=0;i<6;i++) {
      const a=i*Math.PI/3+0.3; const ix=w*0.38+Math.cos(a)*w*0.14; const iy=h*0.55+Math.sin(a)*h*0.06;
      if(i%3===0) { drawRect(ctx, ix-5, iy-3, 10, 7, '#222'); drawRect(ctx, ix-4, iy-2, 8, 5, '#4488CC'); }
      else if(i%3===1) { drawRect(ctx, ix-2, iy-4, 4, 8, '#eee'); ctx.fillStyle='#bbb'; ctx.fillRect(ix-1, iy-1, 2, 4); }
      else { ctx.fillStyle='rgba(135,200,235,0.5)'; ctx.beginPath(); ctx.ellipse(ix, iy, 3, 4, 0, 0, Math.PI*2); ctx.fill(); }
    }
    // Name placard at head
    drawRect(ctx, w*0.33, h*0.42, s*3, s*0.7, '#DAA520');
    ctx.fillStyle='#1a1a1a'; ctx.font='7px "Space Grotesk"'; ctx.textAlign='center';
    ctx.fillText('ALEXA AMUNDSON', w*0.33+s*1.5, h*0.42+s*0.5);
    // ── Side credenza ──
    drawRect(ctx, w*0.72, h*0.4, s*6, s*1.5, '#4a3520');
    // Coffee service
    ctx.fillStyle='#C0C0C0'; drawRoundRect(ctx, w*0.73, h*0.38, s*1.5, s*1, 2, '#C0C0C0');
    ctx.fillStyle='#fff';
    for(let cup=0;cup<4;cup++) { ctx.beginPath(); ctx.arc(w*0.74+cup*s*0.35, h*0.39, 3, 0, Math.PI*2); ctx.fill(); }
    // Water pitcher
    ctx.fillStyle='rgba(135,200,235,0.4)'; drawRoundRect(ctx, w*0.82, h*0.38, s*0.8, s*1.2, 3, ctx.fillStyle);
    // ── Bookshelf wall ──
    drawRect(ctx, w*0.72, h*0.58, s*7, s*4, '#4a3520');
    for(let sh=0;sh<3;sh++) {
      drawRect(ctx, w*0.725, h*0.62+sh*s*1.2, s*6.8, 2, '#5a4530');
      for(let b=0;b<9;b++) {
        const bookH = s*0.7+Math.sin(b*3)*s*0.2;
        ctx.fillStyle=[C.book1,C.book2,C.book3,C.book4,'#2a5a8a','#8a5a2a','#5a2a5a','#2a8a5a','#8a2a2a'][b];
        drawRect(ctx, w*0.73+b*s*0.75, h*0.6+sh*s*1.2+(s*1-bookH), s*0.6, bookH, ctx.fillStyle);
      }
    }
    // ── Wall art ──
    Furniture.pictureFrame(ctx, w*0.7, h*0.02, s*1.5, '#1a2a3a');
    Furniture.pictureFrame(ctx, w*0.82, h*0.02, s*1.5, '#2a1a2a');
    // Company seal/logo
    ctx.strokeStyle='#DAA520'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(w*0.76, h*0.06+s*0.7, s*0.8, 0, Math.PI*2); ctx.stroke();
    ctx.fillStyle='#DAA520'; ctx.font=`${s*0.5}px "Space Grotesk"`; ctx.textAlign='center';
    ctx.fillText('BR', w*0.76, h*0.06+s*0.85);
    // Decor
    Furniture.plant(ctx, w*0.02, h*0.2, s*1.3);
    Furniture.plant(ctx, w*0.02, h*0.65, s);
    Furniture.plant(ctx, w*0.67, h*0.35, s);
    Furniture.plant(ctx, w*0.93, h*0.85, s);
    Furniture.clock(ctx, w*0.5, h*0.06, s*1.3, t);
    Furniture.coatRack(ctx, w*0.01, h*0.82, s);
    Furniture.fireExtinguisher(ctx, w*0.97, h*0.9, s);
    Furniture.exitSign(ctx, w*0.92, h*0.02, s);
    // Floor detail
    ctx.fillStyle='rgba(255,255,255,0.02)'; ctx.font='12px "Space Grotesk"'; ctx.textAlign='center';
    ctx.fillText('WE CARE. WE GIVE A SHIT.', w*0.38, h*0.95);
  },

  'f1': (ctx, w, h, t) => {
    // Lobby — PACKED grand entrance
    // Marble floor with veining
    for (let tx = 0; tx < w; tx += 30) for (let ty = 0; ty < h; ty += 30) {
      ctx.fillStyle = (tx+ty)%60===0 ? '#e8e0d8' : '#ddd8d0';
      ctx.fillRect(tx, ty, 29, 29);
      // Marble veining
      ctx.strokeStyle = 'rgba(200,190,180,0.3)'; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(tx+Math.sin(tx)*10, ty); ctx.quadraticCurveTo(tx+15, ty+15+Math.sin(ty)*5, tx+29, ty+Math.cos(tx)*10); ctx.stroke();
      // Tile gap
      ctx.fillStyle = 'rgba(180,170,160,0.3)'; ctx.fillRect(tx+29, ty, 1, 30); ctx.fillRect(tx, ty+29, 30, 1);
    }
    const s = Math.min(w,h)*0.025;
    // ── Grand back wall ──
    drawRect(ctx, 0, 0, w, h*0.12, '#e0dcd4');
    // Accent wall strip
    drawRect(ctx, 0, h*0.1, w, h*0.02, '#333');
    // BLACKROAD OS sign (illuminated)
    ctx.fillStyle = `rgba(0,0,0,${0.9+Math.sin(t)*0.05})`;
    ctx.font = `${Math.min(s*2.5, 36)}px "Space Grotesk"`;
    ctx.textAlign = 'center';
    ctx.fillText('BLACKROAD OS', w*0.5, h*0.07);
    // Subtle glow behind text
    ctx.fillStyle = `rgba(255,29,108,${0.03+Math.sin(t*2)*0.01})`;
    ctx.beginPath(); ctx.ellipse(w*0.5, h*0.05, w*0.15, h*0.04, 0, 0, Math.PI*2); ctx.fill();
    // Tagline
    ctx.fillStyle='#888'; ctx.font=`${s*0.7}px "JetBrains Mono"`; ctx.fillText('Pave Tomorrow.', w*0.5, h*0.1);
    // ── Central fountain ──
    Furniture.fountain(ctx, w*0.33, h*0.2, s*2, t);
    // Decorative floor pattern around fountain
    ctx.strokeStyle='rgba(180,170,160,0.2)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.arc(w*0.33+s*4, h*0.2+s*5, s*6, 0, Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.arc(w*0.33+s*4, h*0.2+s*5, s*7, 0, Math.PI*2); ctx.stroke();
    // ── Reception desk (grand, curved) ──
    // Main desk body
    ctx.fillStyle='#333';
    ctx.beginPath(); ctx.ellipse(w*0.18, h*0.62, w*0.14, h*0.08, 0, Math.PI*0.8, Math.PI*2.2); ctx.fill();
    ctx.fillStyle='#444';
    ctx.beginPath(); ctx.ellipse(w*0.18, h*0.62, w*0.12, h*0.06, 0, Math.PI*0.8, Math.PI*2.2); ctx.fill();
    // BLACKROAD on desk
    ctx.fillStyle='#FF1D6C'; ctx.font=`${s*0.8}px "Space Grotesk"`; ctx.textAlign='center';
    ctx.fillText('BLACKROAD', w*0.18, h*0.63);
    // Monitors on reception desk
    drawRect(ctx, w*0.1, h*0.53, s*1.5, s*1.1, '#111'); drawRect(ctx, w*0.105, h*0.535, s*1.4, s*0.9, '#2a3a4a');
    drawRect(ctx, w*0.22, h*0.53, s*1.5, s*1.1, '#111'); drawRect(ctx, w*0.225, h*0.535, s*1.4, s*0.9, '#2a3a4a');
    // Flower vase on desk
    ctx.fillStyle='#8B6538'; drawRoundRect(ctx, w*0.17, h*0.54, s*0.5, s*0.8, 2, '#8B6538');
    ctx.fillStyle='#e44'; ctx.beginPath(); ctx.arc(w*0.17+s*0.25, h*0.52, 5, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle='#ea4'; ctx.beginPath(); ctx.arc(w*0.17+s*0.1, h*0.53, 4, 0, Math.PI*2); ctx.fill();
    // Receptionist chair
    Furniture.chair(ctx, w*0.16, h*0.66, s*0.8, '#FF1D6C');
    // ── Waiting area (right side) ──
    Furniture.rug(ctx, w*0.6, h*0.45, w*0.35, h*0.38, 'rgba(60,40,30,0.08)');
    // L-shaped couch arrangement
    Furniture.couch(ctx, w*0.62, h*0.5, s);
    Furniture.couch(ctx, w*0.62, h*0.65, s);
    Furniture.couch(ctx, w*0.82, h*0.5, s);
    // Coffee tables
    drawRoundRect(ctx, w*0.7, h*0.58, s*2.5, s*1.2, 4, '#6B4518');
    // Magazines on table
    for(let m=0;m<3;m++) { ctx.fillStyle=['#e44','#44e','#ea4'][m]; drawRect(ctx, w*0.71+m*s*0.7, h*0.59, s*0.5, s*0.7, ctx.fillStyle); }
    drawRoundRect(ctx, w*0.85, h*0.58, s*2, s*1, 4, '#6B4518');
    // ── Elevator doors (back wall) ──
    drawRect(ctx, w*0.72, h*0.02, s*2.5, h*0.1, '#888');
    drawRect(ctx, w*0.725, h*0.025, s*1.15, h*0.09, '#aaa');
    drawRect(ctx, w*0.725+s*1.25, h*0.025, s*1.15, h*0.09, '#aaa');
    // Up/down buttons
    ctx.fillStyle='#333'; ctx.beginPath(); ctx.arc(w*0.72-5, h*0.07, 4, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle='#4CAF50'; ctx.beginPath(); ctx.arc(w*0.72-5, h*0.07, 2, 0, Math.PI*2); ctx.fill();
    // ── Stairs ──
    drawRect(ctx, w*0.85, h*0.02, w*0.12, h*0.1, '#bbb');
    for(let st=0;st<5;st++) drawRect(ctx, w*0.86, h*0.03+st*h*0.015, w*0.1, h*0.012, st%2===0?'#ccc':'#c4c4c4');
    ctx.fillStyle='#888'; ctx.font='8px sans-serif'; ctx.textAlign='center'; ctx.fillText('STAIRS', w*0.91, h*0.1);
    // ── Directory board ──
    drawRect(ctx, w*0.03, h*0.15, s*4, s*5, '#333');
    drawRect(ctx, w*0.035, h*0.155, s*3.9, s*4.9, '#222');
    ctx.fillStyle='#FF1D6C'; ctx.font='8px "Space Grotesk"'; ctx.textAlign='left';
    ctx.fillText('DIRECTORY', w*0.04, h*0.18);
    ctx.fillStyle='#888'; ctx.font='7px "JetBrains Mono"';
    const directory = ['F10 Mission Control','F9  Command Center','F8  Strategy Room','F7  Server Room','F6  Hardware Lab','F5  Network Ops','F4  Engineering','F3  Open Floor','F2  Boardroom','F1  Lobby','B1  Break Room','B2  Rec Room','B3  Gym'];
    directory.forEach((d,i) => ctx.fillText(d, w*0.04, h*0.2+i*s*0.35));
    // ── Grand plants ──
    Furniture.plant(ctx, w*0.02, h*0.35, s*2);
    Furniture.plant(ctx, w*0.55, h*0.15, s*1.5);
    Furniture.plant(ctx, w*0.93, h*0.15, s*2);
    Furniture.plant(ctx, w*0.57, h*0.45, s);
    Furniture.plant(ctx, w*0.93, h*0.8, s);
    // ── Welcome mat ──
    drawRoundRect(ctx, w*0.38, h*0.88, w*0.24, h*0.08, 6, '#2a3a4a');
    drawRoundRect(ctx, w*0.39, h*0.89, w*0.22, h*0.06, 4, '#1a2a3a');
    ctx.fillStyle='#aaa'; ctx.font='13px "Space Grotesk"'; ctx.textAlign='center';
    ctx.fillText('WELCOME', w*0.5, h*0.94);
    // ── Door frame at bottom ──
    drawRect(ctx, w*0.4, h*0.96, w*0.2, h*0.04, '#888');
    drawRect(ctx, w*0.41, h*0.965, w*0.09, h*0.035, 'rgba(135,200,235,0.2)');
    drawRect(ctx, w*0.51, h*0.965, w*0.09, h*0.035, 'rgba(135,200,235,0.2)');
    // Decor
    Furniture.clock(ctx, w*0.5, h*0.035, s*1.5, t);
    Furniture.fireExtinguisher(ctx, w*0.97, h*0.3, s);
    Furniture.exitSign(ctx, w*0.43, h*0.96, s);
    // Security camera
    drawRect(ctx, w*0.95, h*0.01, 3, s*0.5, '#444');
    ctx.fillStyle='#333'; ctx.beginPath(); ctx.arc(w*0.95, h*0.01+s*0.5, 4, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle=Math.sin(t*2)>0?'#F44336':'#333'; ctx.beginPath(); ctx.arc(w*0.951, h*0.01+s*0.5, 2, 0, Math.PI*2); ctx.fill();
  },
});

// ── Micro detail system — small items scattered everywhere ──
const MicroDetails = {
  // Pens/pencils scattered
  pen(ctx, x, y, color, angle) {
    ctx.save(); ctx.translate(x,y); ctx.rotate(angle||0);
    ctx.fillStyle = color||'#333'; ctx.fillRect(-12, -1, 24, 3);
    ctx.fillStyle = '#DAA520'; ctx.fillRect(-12, -1, 4, 3);
    ctx.restore();
  },
  // Paper sheet
  paper(ctx, x, y, angle) {
    ctx.save(); ctx.translate(x,y); ctx.rotate(angle||0);
    ctx.fillStyle = '#f5f5f0'; ctx.fillRect(-8, -11, 16, 22);
    ctx.fillStyle = '#ddd';
    for(let l=0;l<5;l++) ctx.fillRect(-6, -8+l*4, 12, 1);
    ctx.restore();
  },
  // Coffee ring stain
  coffeeRing(ctx, x, y) {
    ctx.strokeStyle = 'rgba(139,69,19,0.08)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI*2); ctx.stroke();
  },
  // USB cable
  usbCable(ctx, x, y, len, color) {
    ctx.strokeStyle = color||'#333'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, y);
    ctx.bezierCurveTo(x+len*0.3, y+8, x+len*0.6, y-5, x+len, y+3);
    ctx.stroke();
    // USB connector
    ctx.fillStyle = '#888'; ctx.fillRect(x-3, y-2, 6, 5);
  },
  // Phone on desk
  phone(ctx, x, y) {
    drawRoundRect(ctx, x, y, 8, 14, 2, '#222');
    ctx.fillStyle = '#334'; ctx.fillRect(x+1, y+2, 6, 9);
  },
  // Headphones
  headphones(ctx, x, y) {
    ctx.strokeStyle = '#444'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x+6, y+5, 8, Math.PI, Math.PI*2); ctx.stroke();
    ctx.fillStyle = '#333';
    ctx.beginPath(); ctx.arc(x, y+5, 4, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x+12, y+5, 4, 0, Math.PI*2); ctx.fill();
  },
  // Tape dispenser
  tape(ctx, x, y) {
    ctx.fillStyle = '#555'; drawRoundRect(ctx, x, y, 10, 7, 2, '#555');
    ctx.fillStyle = '#888'; ctx.beginPath(); ctx.arc(x+5, y+3, 3, 0, Math.PI*2); ctx.fill();
  },
  // Stapler
  stapler(ctx, x, y) {
    ctx.fillStyle = '#c33'; drawRoundRect(ctx, x, y, 14, 5, 1, '#c33');
    ctx.fillStyle = '#a22'; ctx.fillRect(x+1, y+3, 12, 2);
  },
  // Post-it note (single)
  postit(ctx, x, y, color, text) {
    ctx.fillStyle = color||'#ffeb3b';
    ctx.fillRect(x, y, 14, 14);
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(x+2, y+5, 10, 1); ctx.fillRect(x+2, y+8, 8, 1);
    // Slight curl
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    ctx.beginPath(); ctx.moveTo(x+14, y+14); ctx.lineTo(x+11, y+14); ctx.lineTo(x+14, y+11); ctx.fill();
  },
  // Water bottle
  bottle(ctx, x, y) {
    ctx.fillStyle = 'rgba(135,200,235,0.4)';
    drawRoundRect(ctx, x, y, 5, 14, 2, ctx.fillStyle);
    ctx.fillStyle = '#aaa'; ctx.fillRect(x+1, y-2, 3, 3);
  },
  // Glasses/spectacles
  glasses(ctx, x, y) {
    ctx.strokeStyle = '#555'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.arc(x+10, y, 4, 0, Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x+4, y); ctx.lineTo(x+6, y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x-4, y); ctx.lineTo(x-7, y-2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x+14, y); ctx.lineTo(x+17, y-2); ctx.stroke();
  },
  // Keys
  keys(ctx, x, y) {
    ctx.fillStyle = '#DAA520';
    ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#888'; ctx.fillRect(x+3, y-1, 8, 2);
    ctx.fillRect(x+9, y-3, 2, 4);
  },
  // Rubber duck (for engineers)
  duck(ctx, x, y) {
    ctx.fillStyle = '#FFD700';
    ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x+4, y-3, 3, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#FF8C00'; ctx.fillRect(x+5, y-4, 3, 2);
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(x+5, y-4, 1, 0, Math.PI*2); ctx.fill();
  },
  // Server status LED strip
  ledStrip(ctx, x, y, count, t) {
    for(let i=0;i<count;i++) {
      ctx.fillStyle = Math.sin(t*4+i*0.7)>0.3 ? '#4CAF50' : '#1a3a1a';
      ctx.beginPath(); ctx.arc(x+i*6, y, 2, 0, Math.PI*2); ctx.fill();
    }
  },
  // Whiteboard marker
  marker(ctx, x, y, color) {
    ctx.fillStyle = color||'#333';
    drawRoundRect(ctx, x, y, 20, 4, 1, color||'#333');
    ctx.fillStyle = '#eee'; ctx.fillRect(x, y+1, 3, 2);
  },
  // Wall outlet
  outlet(ctx, x, y) {
    ctx.fillStyle = '#ddd'; drawRoundRect(ctx, x, y, 10, 12, 2, '#ddd');
    ctx.fillStyle = '#aaa';
    ctx.fillRect(x+2, y+3, 2, 3); ctx.fillRect(x+6, y+3, 2, 3);
    ctx.fillRect(x+4, y+7, 2, 2);
  },
  // Air vent
  vent(ctx, x, y, w) {
    drawRect(ctx, x, y, w, 8, '#ccc');
    for(let v=0;v<Math.floor(w/4);v++) drawRect(ctx, x+2+v*4, y+2, 2, 4, '#bbb');
  },
};

// Scatter micro details across floors
function scatterDetails(ctx, floorId, w, h, t) {
  // Seed random based on floor to keep consistent
  const seed = floorId.charCodeAt(0)*100+floorId.charCodeAt(1);
  const rng = (i) => Math.abs(Math.sin(seed*100+i*7.3))*0.8+0.1;

  // Wall outlets (every floor)
  MicroDetails.outlet(ctx, w*0.15, h*0.11);
  MicroDetails.outlet(ctx, w*0.45, h*0.11);
  MicroDetails.outlet(ctx, w*0.75, h*0.11);

  // Air vents (every floor)
  MicroDetails.vent(ctx, w*0.2, 3, w*0.08);
  MicroDetails.vent(ctx, w*0.5, 3, w*0.08);
  MicroDetails.vent(ctx, w*0.8, 3, w*0.08);

  // Floor-specific scattered items
  if(['f10','f4','f3','f8','f2'].includes(floorId)) {
    // Office floors — pens, papers, coffee rings, phones
    for(let i=0;i<8;i++) {
      const dx = rng(i)*w*0.8+w*0.1;
      const dy = rng(i+50)*h*0.5+h*0.25;
      if(i<2) MicroDetails.pen(ctx, dx, dy, ['#333','#00c','#c00'][i%3], rng(i+20)*2-1);
      else if(i<4) MicroDetails.coffeeRing(ctx, dx, dy);
      else if(i<5) MicroDetails.phone(ctx, dx, dy);
      else if(i<6) MicroDetails.postit(ctx, dx, dy, ['#ffeb3b','#ff9800','#4caf50','#2196f3'][i%4]);
      else if(i<7) MicroDetails.glasses(ctx, dx, dy);
      else MicroDetails.bottle(ctx, dx, dy);
    }
  }
  if(floorId === 'f4') {
    // Engineering gets rubber ducks and extra cables
    MicroDetails.duck(ctx, w*0.12, h*0.28);
    MicroDetails.duck(ctx, w*0.48, h*0.23);
    MicroDetails.usbCable(ctx, w*0.08, h*0.38, 30, '#333');
    MicroDetails.usbCable(ctx, w*0.55, h*0.35, 25, '#FF6B2B');
    MicroDetails.headphones(ctx, w*0.24, h*0.28);
    MicroDetails.tape(ctx, w*0.32, h*0.42);
    MicroDetails.stapler(ctx, w*0.06, h*0.42);
    for(let m=0;m<3;m++) MicroDetails.marker(ctx, w*0.62+m*8, h*0.66, ['#c00','#00c','#0a0'][m]);
  }
  if(floorId === 'f7') {
    // Server room — LED strips, cables
    MicroDetails.ledStrip(ctx, w*0.08, h*0.13, 15, t);
    MicroDetails.ledStrip(ctx, w*0.08, h*0.53, 15, t);
    for(let c=0;c<4;c++) MicroDetails.usbCable(ctx, w*0.15+c*w*0.2, h*0.5, 20, '#FF6B2B');
  }
  if(floorId === 'f6') {
    // Lab — cables, components
    MicroDetails.usbCable(ctx, w*0.1, h*0.15, 35, '#333');
    MicroDetails.usbCable(ctx, w*0.3, h*0.48, 25, '#FF6B2B');
    MicroDetails.usbCable(ctx, w*0.55, h*0.45, 20, '#4CAF50');
    MicroDetails.tape(ctx, w*0.25, h*0.45);
    MicroDetails.glasses(ctx, w*0.35, h*0.44);
  }
  if(floorId === 'f1') {
    // Lobby — keys, brochures
    MicroDetails.keys(ctx, w*0.15, h*0.58);
    for(let b=0;b<3;b++) MicroDetails.paper(ctx, w*0.72+b*12, h*0.6, b*0.2);
  }
  if(floorId === 'b1') {
    // Break room — napkins, spoons
    for(let n=0;n<3;n++) MicroDetails.paper(ctx, w*0.32+n*18, h*0.48, n*0.3);
    MicroDetails.bottle(ctx, w*0.4, h*0.48);
    MicroDetails.phone(ctx, w*0.55, h*0.48);
  }
  if(floorId === 'b2') {
    // Rec room — controllers, drinks
    MicroDetails.phone(ctx, w*0.7, h*0.65);
    MicroDetails.bottle(ctx, w*0.75, h*0.6);
    MicroDetails.headphones(ctx, w*0.82, h*0.68);
  }
}

// ── Rich ambient objects ──
const Ambient = {
  // Fish tank with swimming fish
  fishTank(ctx, x, y, w, h, t) {
    // Tank body
    drawRect(ctx, x, y, w, h, '#1a3a4a');
    drawRect(ctx, x+2, y+2, w-4, h-4, 'rgba(40,130,180,0.25)');
    // Water gradient
    const wg = ctx.createLinearGradient(x, y, x, y+h);
    wg.addColorStop(0, 'rgba(60,160,200,0.15)');
    wg.addColorStop(1, 'rgba(20,80,120,0.25)');
    ctx.fillStyle = wg;
    ctx.fillRect(x+2, y+2, w-4, h-4);
    // Gravel
    ctx.fillStyle = '#4a3a2a';
    ctx.fillRect(x+2, y+h-8, w-4, 6);
    for(let g=0;g<10;g++) { ctx.fillStyle=['#5a4a3a','#6a5a4a','#3a2a1a'][g%3]; ctx.beginPath(); ctx.arc(x+5+g*(w-10)/10, y+h-5, 2+Math.sin(g)*1, 0, Math.PI*2); ctx.fill(); }
    // Plants
    ctx.fillStyle = '#2a8a3a';
    for(let p=0;p<3;p++) {
      const px = x+8+p*(w-16)/3;
      for(let leaf=0;leaf<3;leaf++) {
        ctx.beginPath();
        ctx.moveTo(px, y+h-8);
        ctx.quadraticCurveTo(px+Math.sin(t*2+leaf+p)*5+leaf*4, y+h-20-leaf*6, px+Math.sin(t+leaf)*3, y+h-25-leaf*8);
        ctx.lineWidth = 2; ctx.strokeStyle = '#2a8a3a'; ctx.stroke();
      }
    }
    // Fish (3 swimming)
    for(let f=0;f<3;f++) {
      const fx = x+10+((t*15+f*80)%(w-20));
      const fy = y+12+f*((h-30)/3)+Math.sin(t*3+f*2)*5;
      const dir = Math.sin(t*0.5+f)>0 ? 1 : -1;
      ctx.fillStyle = ['#FF6B2B','#FFD700','#FF1D6C'][f];
      // Body
      ctx.beginPath();
      ctx.ellipse(fx, fy, 6, 3, 0, 0, Math.PI*2);
      ctx.fill();
      // Tail
      ctx.beginPath();
      ctx.moveTo(fx-dir*6, fy);
      ctx.lineTo(fx-dir*10, fy-3);
      ctx.lineTo(fx-dir*10, fy+3);
      ctx.closePath();
      ctx.fill();
      // Eye
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.arc(fx+dir*3, fy-1, 1, 0, Math.PI*2); ctx.fill();
    }
    // Bubbles
    for(let b=0;b<4;b++) {
      const bx = x+10+Math.sin(t+b*2)*8+b*(w-20)/4;
      const by = y+h-12-((t*20+b*30)%(h-20));
      ctx.strokeStyle = 'rgba(150,220,255,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(bx, by, 2+Math.sin(b)*1, 0, Math.PI*2); ctx.stroke();
    }
    // Light shimmer on water surface
    ctx.fillStyle = `rgba(200,230,255,${0.05+Math.sin(t*3)*0.03})`;
    ctx.fillRect(x+3, y+3, w-6, 3);
    // Tank frame
    ctx.strokeStyle = '#888'; ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
    // Stand
    drawRect(ctx, x+4, y+h, 4, 15, '#666');
    drawRect(ctx, x+w-8, y+h, 4, 15, '#666');
  },

  // Ceiling fan (animated)
  ceilingFan(ctx, x, y, s, t, speed) {
    speed = speed || 1;
    // Mount
    ctx.fillStyle = '#888';
    ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI*2); ctx.fill();
    // Blades (4)
    ctx.strokeStyle = 'rgba(200,200,200,0.5)';
    ctx.lineWidth = 5;
    for(let b=0;b<4;b++) {
      const angle = t*speed*3 + b*Math.PI/2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x+Math.cos(angle)*s, y+Math.sin(angle)*s*0.3); // perspective
      ctx.stroke();
    }
    // Center hub
    ctx.fillStyle = '#aaa';
    ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI*2); ctx.fill();
  },

  // Monitor with screensaver
  screensaver(ctx, x, y, w, h, t, type) {
    drawRect(ctx, x, y, w, h, '#0a0a0a');
    if(type === 'matrix') {
      ctx.fillStyle = 'rgba(0,255,0,0.15)';
      ctx.font = '8px "JetBrains Mono"';
      for(let col=0;col<Math.floor(w/8);col++) {
        const charY = ((t*30+col*17)%h);
        const chars = '01アイウエオカキクケコ';
        ctx.fillText(chars[Math.floor(t*5+col)%chars.length], x+3+col*8, y+charY);
      }
    } else if(type === 'bounce') {
      const bx = x+5+Math.abs(Math.sin(t*1.5))*(w-20);
      const by = y+5+Math.abs(Math.cos(t*1.3))*(h-16);
      ctx.fillStyle = '#FF1D6C';
      ctx.font = '8px "Space Grotesk"';
      ctx.textAlign = 'left';
      ctx.fillText('BR', bx, by);
    } else if(type === 'pulse') {
      ctx.strokeStyle = `rgba(41,121,255,${0.3+Math.sin(t*2)*0.15})`;
      ctx.lineWidth = 1;
      for(let r=0;r<3;r++) {
        ctx.beginPath();
        ctx.arc(x+w/2, y+h/2, 5+r*8+Math.sin(t*2+r)*3, 0, Math.PI*2);
        ctx.stroke();
      }
    } else { // stars
      ctx.fillStyle = '#fff';
      for(let s2=0;s2<12;s2++) {
        const sx = x+3+((t*5+s2*13)%w);
        const sy = y+3+Math.sin(s2*7)*h*0.4+h*0.5;
        if(Math.sin(t+s2)>0) ctx.fillRect(sx, sy, 1, 1);
      }
    }
  },

  // Whiteboard with architecture diagram
  archDiagram(ctx, x, y, s) {
    // Boxes
    ctx.strokeStyle = 'rgba(0,0,200,0.3)'; ctx.lineWidth = 1;
    // User
    ctx.strokeRect(x+s*0.5, y+s*0.2, s*1.2, s*0.5);
    ctx.fillStyle = 'rgba(0,0,200,0.15)'; ctx.font = '6px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('User', x+s*1.1, y+s*0.5);
    // Arrow
    ctx.beginPath(); ctx.moveTo(x+s*1.1, y+s*0.7); ctx.lineTo(x+s*1.1, y+s*0.9); ctx.stroke();
    // Edge
    ctx.strokeStyle = 'rgba(200,0,100,0.3)';
    ctx.strokeRect(x+s*0.3, y+s*0.9, s*1.6, s*0.5);
    ctx.fillStyle = 'rgba(200,0,100,0.15)';
    ctx.fillText('Edge', x+s*1.1, y+s*1.2);
    // Arrow
    ctx.beginPath(); ctx.moveTo(x+s*1.1, y+s*1.4); ctx.lineTo(x+s*1.1, y+s*1.6); ctx.stroke();
    // Fleet
    ctx.strokeStyle = 'rgba(0,150,0,0.3)';
    ctx.strokeRect(x+s*0.1, y+s*1.6, s*2, s*0.5);
    ctx.fillStyle = 'rgba(0,150,0,0.15)';
    ctx.fillText('Fleet', x+s*1.1, y+s*1.9);
  },

  // Weather outside windows (rain or snow or sun)
  windowWeather(ctx, x, y, w, h, t, type) {
    if(type === 'rain') {
      ctx.strokeStyle = 'rgba(150,200,255,0.2)'; ctx.lineWidth = 1;
      for(let r=0;r<8;r++) {
        const rx = x+5+r*(w-10)/8+Math.sin(t+r)*3;
        const ry = ((t*40+r*20)%h);
        ctx.beginPath(); ctx.moveTo(rx, y+ry); ctx.lineTo(rx-1, y+ry+6); ctx.stroke();
      }
    } else if(type === 'snow') {
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      for(let s2=0;s2<6;s2++) {
        const sx = x+5+Math.sin(t*0.5+s2*1.5)*10+s2*(w-10)/6;
        const sy = y+((t*10+s2*25)%h);
        ctx.beginPath(); ctx.arc(sx, sy, 2, 0, Math.PI*2); ctx.fill();
      }
    }
    // Sun streaks through windows
    if(type === 'sun') {
      ctx.fillStyle = 'rgba(255,240,200,0.02)';
      ctx.beginPath();
      ctx.moveTo(x+w/2, y);
      ctx.lineTo(x+w/2-40, y+h+50);
      ctx.lineTo(x+w/2+40, y+h+50);
      ctx.closePath();
      ctx.fill();
    }
  },

  // Potted succulent (small desk plant)
  succulent(ctx, x, y) {
    ctx.fillStyle = '#8B6538'; drawRoundRect(ctx, x, y+6, 10, 6, 2, '#8B6538');
    ctx.fillStyle = '#3a8a4a';
    ctx.beginPath(); ctx.ellipse(x+5, y+4, 5, 4, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#4a9a5a';
    ctx.beginPath(); ctx.ellipse(x+3, y+2, 3, 4, -0.3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+7, y+2, 3, 4, 0.3, 0, Math.PI*2); ctx.fill();
  },

  // Motivational poster
  poster(ctx, x, y, s, text, color) {
    drawRect(ctx, x, y, s*2.5, s*3.5, '#222');
    drawRect(ctx, x+2, y+2, s*2.5-4, s*3.5-4, color||'#1a1a2a');
    ctx.fillStyle = '#fff'; ctx.font = `${s*0.35}px "Space Grotesk"`; ctx.textAlign = 'center';
    const words = text.split(' ');
    words.forEach((w2, i) => ctx.fillText(w2, x+s*1.25, y+s*1+i*s*0.5));
  },
};

// ── Enhanced scatter with ambient objects ──
function scatterAmbient(ctx, floorId, w, h, t) {
  const s = Math.min(w,h)*0.025;

  // Fish tank in lobby
  if(floorId === 'f1') {
    Ambient.fishTank(ctx, w*0.03, h*0.4, s*4, s*5, t);
  }

  // Ceiling fans in break room and rec room
  if(floorId === 'b1') {
    Ambient.ceilingFan(ctx, w*0.25, h*0.45, 35, t, 1.5);
    Ambient.ceilingFan(ctx, w*0.6, h*0.45, 35, t, 1.2);
  }
  if(floorId === 'b2') {
    Ambient.ceilingFan(ctx, w*0.3, h*0.4, 30, t, 1.8);
  }

  // Monitor screensavers on idle monitors
  if(floorId === 'f10') {
    // Some monitors show matrix, some show data
    Ambient.screensaver(ctx, w*0.26+2, h*0.14+2, w*0.18-4, h*0.1-4, t, 'pulse');
  }
  if(floorId === 'f9') {
    // Hologram-adjacent screens
    for(let ss=0;ss<4;ss++) {
      const sx = w*0.1+ss*w*0.22;
      Ambient.screensaver(ctx, sx+2, h*0.03, w*0.14-4, h*0.06, t, ['matrix','pulse','bounce','stars'][ss]);
    }
  }
  if(floorId === 'f4') {
    // Dev monitors — some have matrix screensaver
    Ambient.screensaver(ctx, w*0.04+s*0.9, h*0.2-s*1.4, s*1.8, s*1.1, t, 'matrix');
  }

  // Architecture diagram on engineering whiteboard
  if(floorId === 'f4') {
    Ambient.archDiagram(ctx, w*0.62, h*0.5, s*1.2);
  }

  // Weather in windows
  if(floorId === 'f10' || floorId === 'f8' || floorId === 'f2' || floorId === 'f4') {
    const hour = new Date().getHours();
    const weather = hour > 20 || hour < 6 ? 'stars' : 'sun';
    // Apply to each window
    const ww = w / 7;
    for(let wi=0;wi<6;wi++) {
      Ambient.windowWeather(ctx, ww*(wi+0.6), h*0.02, ww*0.5, h*0.08, t, weather);
    }
  }

  // Succulents on desks
  if(floorId === 'f10') { Ambient.succulent(ctx, w*0.15, h*0.34); Ambient.succulent(ctx, w*0.65, h*0.34); }
  if(floorId === 'f4') { Ambient.succulent(ctx, w*0.1, h*0.22); Ambient.succulent(ctx, w*0.6, h*0.22); }
  if(floorId === 'f8') { Ambient.succulent(ctx, w*0.78, h*0.47); }

  // ── BlackRoad product features on screens ──
  // Ollama terminal on Command Center screens
  if(floorId === 'f9') {
    // Ollama model list on right panel - animate through models
    const ollamaModels = ['qwen2.5:7b','deepseek-r1:7b','llama3.2:3b','mistral:7b','cece:7b','nomic-embed','gemma2:2b','phi3:mini'];
    const activeModel = ollamaModels[Math.floor(t*0.3)%ollamaModels.length];
    // Show active inference on hologram
    ctx.fillStyle = `rgba(156,39,176,${0.15+Math.sin(t*3)*0.05})`;
    ctx.font = '9px "JetBrains Mono"'; ctx.textAlign = 'center';
    ctx.fillText('> ollama run '+activeModel, w*0.5, h*0.53);
    ctx.fillStyle = 'rgba(76,175,80,0.3)';
    ctx.fillText('generating...'+'.'.repeat(Math.floor(t*3)%4), w*0.5, h*0.56);
  }

  // Fleet dashboard on Mission Control big screen
  if(floorId === 'f10') {
    ctx.fillStyle = '#2979FF'; ctx.font = '8px "JetBrains Mono"'; ctx.textAlign = 'left';
    const nodes = ['alice  34C  88%','cecilia 55C  19%','octavia 35C  63%','aria    51C  81%','lucidia 54C  32%'];
    const visNode = Math.floor(t*0.5)%nodes.length;
    ctx.fillText('> '+nodes[visNode], w*0.52, h*0.18);
    ctx.fillText('  '+nodes[(visNode+1)%5], w*0.52, h*0.21);
    ctx.fillText('  '+nodes[(visNode+2)%5], w*0.52, h*0.24);
  }

  // Git activity on Engineering monitors
  if(floorId === 'f4') {
    const commits = ['feat: add SDK endpoints','fix: fleet-api KV proxy','docs: update README','ci: add workflow badges','feat: pixel metaverse HQ'];
    ctx.fillStyle = 'rgba(76,175,80,0.2)'; ctx.font = '6px "JetBrains Mono"'; ctx.textAlign = 'left';
    const visCommit = Math.floor(t*0.4)%commits.length;
    // Show on a monitor that has code
    ctx.fillText('$ git log --oneline', w*0.19+s*0.9+3, h*0.2-s*1.2);
    ctx.fillText(commits[visCommit], w*0.19+s*0.9+3, h*0.2-s*0.9);
    ctx.fillText(commits[(visCommit+1)%5], w*0.19+s*0.9+3, h*0.2-s*0.6);
  }

  // Slack messages on NOC screens
  if(floorId === 'f5') {
    ctx.fillStyle = 'rgba(76,175,80,0.15)'; ctx.font = '6px "JetBrains Mono"'; ctx.textAlign = 'left';
    const slackMsgs = ['alice: heal cycle complete','cecilia: 15 models loaded','octavia: gitea synced','shellfish: ports scanned','alexa: pave tomorrow'];
    const visMsg = Math.floor(t*0.3)%slackMsgs.length;
    // On one of the top screens
    ctx.fillText('#fleet', w*0.07, h*0.06);
    ctx.fillText(slackMsgs[visMsg], w*0.07, h*0.09);
    ctx.fillText(slackMsgs[(visMsg+1)%5], w*0.07, h*0.12);
  }

  // RoadChain on a boardroom screen
  if(floorId === 'f2') {
    ctx.fillStyle = 'rgba(255,165,0,0.15)'; ctx.font = '7px "JetBrains Mono"'; ctx.textAlign = 'left';
    ctx.fillText('ROADCHAIN', w*0.39, h*0.17);
    ctx.fillText('Block #'+Math.floor(t*0.1+1000), w*0.39, h*0.2);
    ctx.fillText('Hash: '+Math.floor(Math.sin(t)*999999).toString(16), w*0.39, h*0.23);
  }

  // Hailo inference stats on Hardware Lab scope
  if(floorId === 'f6') {
    ctx.fillStyle = 'rgba(76,175,80,0.2)'; ctx.font = '7px "JetBrains Mono"'; ctx.textAlign = 'left';
    ctx.fillText('HAILO-8 INFERENCE', w*0.52, h*0.1);
    ctx.fillText(Math.floor(26+Math.sin(t)*2)+' TOPS', w*0.52, h*0.13);
    ctx.fillText(Math.floor(180+Math.sin(t*3)*20)+' tok/s', w*0.52, h*0.16);
  }

  // CarPool agent matching on Open Floor presentation
  if(floorId === 'f3') {
    ctx.fillStyle = 'rgba(255,29,108,0.15)'; ctx.font = '7px "JetBrains Mono"'; ctx.textAlign = 'center';
    ctx.fillText('CARPOOL: 14 agents deployed', w*0.54, h*0.55);
    ctx.fillText('load balanced across 5 nodes', w*0.54, h*0.575);
  }

  // Motivational posters
  if(floorId === 'b3') {
    Ambient.poster(ctx, w*0.46, h*0.08, s, 'NO DAYS OFF', '#1a2a1a');
    Ambient.poster(ctx, w*0.56, h*0.08, s, 'PROTECT EVERY LAYER', '#1a1a2a');
  }
  if(floorId === 'f5') {
    Ambient.poster(ctx, w*0.84, h*0.82, s*0.8, 'STAY VIGILANT', '#2a1a1a');
  }
}

// ── Shadow system for furniture depth ──
function drawFurnitureShadows(ctx, floorId, w, h) {
  ctx.fillStyle = 'rgba(0,0,0,0.04)';
  // Subtle shadow under all major furniture
  if(['f10','f4','f3','f8','f2'].includes(floorId)) {
    // Desk shadows
    for(let ds=0;ds<5;ds++) {
      const dx = w*0.1+ds*w*0.18;
      ctx.beginPath(); ctx.ellipse(dx+20, h*0.5, 30, 5, 0, 0, Math.PI*2); ctx.fill();
    }
  }
}

// ── Animated overlays per floor — drawn AFTER furniture ──
const FLOOR_ANIMATIONS = {
  'f7': (ctx, w, h, t) => {
    // Blinking status lights on ceiling
    for (let i = 0; i < 8; i++) {
      const lx = w * 0.1 + i * w * 0.1;
      ctx.fillStyle = Math.sin(t * 4 + i * 1.5) > 0.5 ? 'rgba(76,175,80,0.4)' : 'rgba(76,175,80,0.05)';
      ctx.beginPath(); ctx.arc(lx, 8, 3, 0, Math.PI * 2); ctx.fill();
    }
    // Scrolling data on monitoring desk
    ctx.fillStyle = 'rgba(100,200,255,0.15)';
    ctx.font = '8px "JetBrains Mono"';
    ctx.textAlign = 'left';
    const lines = ['cpu: 34C OK', 'disk: 63% OK', 'ram: 2.1/8G', 'eth0: UP 1Gbps', 'wg0: 5 peers'];
    const scrollY = (t * 30) % (lines.length * 12);
    lines.forEach((l, i) => {
      ctx.fillText(l, w * 0.42, h * 0.44 + i * 10 - scrollY % 12);
    });
  },

  'f9': (ctx, w, h, t) => {
    // Pulsing hologram rings
    for (let r = 0; r < 3; r++) {
      const radius = 30 + r * 25 + Math.sin(t * 2 + r) * 5;
      ctx.strokeStyle = `rgba(156,39,176,${0.15 - r * 0.04})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(w * 0.5, h * 0.45, radius, radius * 0.5, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    // Floating data numbers
    ctx.fillStyle = 'rgba(156,39,176,0.2)';
    ctx.font = '9px "JetBrains Mono"';
    for (let d = 0; d < 6; d++) {
      const dx = w * 0.3 + Math.sin(t * 0.7 + d * 1.1) * w * 0.2;
      const dy = h * 0.2 + d * 15 + Math.cos(t + d) * 5;
      ctx.fillText(Math.floor(Math.sin(t * 3 + d) * 50 + 50), dx, dy);
    }
  },

  'f1': (ctx, w, h, t) => {
    // Fountain water drops
    ctx.fillStyle = 'rgba(180,220,255,0.4)';
    for (let d = 0; d < 8; d++) {
      const da = t * 3 + d * 0.8;
      const dx = w * 0.5 + Math.sin(da) * 30;
      const dy = h * 0.25 + Math.abs(Math.sin(da * 1.5)) * 40;
      ctx.beginPath();
      ctx.arc(dx, dy, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    // Light reflections on marble
    ctx.fillStyle = `rgba(255,255,255,${0.02 + Math.sin(t) * 0.01})`;
    ctx.beginPath();
    ctx.ellipse(w * 0.3, h * 0.6, 80, 20, 0.3, 0, Math.PI * 2);
    ctx.fill();
  },

  'rooftop': (ctx, w, h, t) => {
    // Wind effect on plants
    // Birds
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    for (let b = 0; b < 3; b++) {
      const bx = ((t * 40 + b * 300) % (w + 200)) - 100;
      const by = h * 0.15 + b * 25 + Math.sin(t * 2 + b) * 10;
      ctx.beginPath();
      ctx.moveTo(bx - 8, by);
      ctx.quadraticCurveTo(bx - 4, by - 5 - Math.sin(t * 8 + b) * 3, bx, by);
      ctx.quadraticCurveTo(bx + 4, by - 5 - Math.sin(t * 8 + b + 1) * 3, bx + 8, by);
      ctx.stroke();
    }
    // Sun glint
    const sunX = w * 0.85;
    const sunY = h * 0.08;
    ctx.fillStyle = `rgba(255,240,200,${0.3 + Math.sin(t) * 0.1})`;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 20, 0, Math.PI * 2);
    ctx.fill();
    // Sun rays
    ctx.strokeStyle = 'rgba(255,240,200,0.1)';
    for (let r = 0; r < 8; r++) {
      const ra = t * 0.2 + r * Math.PI / 4;
      ctx.beginPath();
      ctx.moveTo(sunX + Math.cos(ra) * 22, sunY + Math.sin(ra) * 22);
      ctx.lineTo(sunX + Math.cos(ra) * 35, sunY + Math.sin(ra) * 35);
      ctx.stroke();
    }
  },

  'f6': (ctx, w, h, t) => {
    // Oscilloscope wave (animated)
    const s = Math.min(w, h) * 0.025;
    ctx.strokeStyle = '#0f0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let sx = 0; sx < 40; sx++) {
      const sv = Math.sin(t * 5 + sx * 0.3) * s * 0.5;
      const px = w * 0.52 + sx * s * 0.065;
      const py = w > 0 ? h * 0.22 + sv : 0; // safety
      if (sx === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    // Soldering sparks
    if (Math.sin(t * 7) > 0.8) {
      ctx.fillStyle = '#ff8';
      for (let sp = 0; sp < 4; sp++) {
        ctx.beginPath();
        ctx.arc(w * 0.18 + Math.random() * 10, h * 0.63 + Math.random() * 8, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  },

  'b1': (ctx, w, h, t) => {
    // Coffee steam
    const s = Math.min(w, h) * 0.025;
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    for (let st = 0; st < 3; st++) {
      ctx.beginPath();
      const sx = w * 0.1 + s * 0.75;
      ctx.moveTo(sx + st * 5, h * 0.07 + s * 1.9);
      ctx.quadraticCurveTo(sx + st * 5 + Math.sin(t * 3 + st) * 5, h * 0.04, sx + st * 5 - 3, h * 0.01);
      ctx.stroke();
    }
    // TV screen animation
    ctx.fillStyle = `hsl(${t * 30 % 360},40%,25%)`;
    ctx.fillRect(w * 0.16, h * 0.59, s * 2.8, s * 1.8);
  },

  'b2': (ctx, w, h, t) => {
    // Arcade screen flicker
    const s = Math.min(w, h) * 0.025;
    ctx.fillStyle = `hsl(${200 + Math.sin(t * 5) * 30},60%,40%)`;
    ctx.fillRect(w * 0.7 + 3, h * 0.12, s * 1.5 - 6, s * 1.2);
    ctx.fillStyle = `hsl(${340 + Math.sin(t * 4) * 20},60%,35%)`;
    ctx.fillRect(w * 0.82 + 3, h * 0.12, s * 1.5 - 6, s * 1.2);
    // Score text
    ctx.fillStyle = '#fff';
    ctx.font = '7px "JetBrains Mono"';
    ctx.textAlign = 'center';
    ctx.fillText('HI ' + Math.floor(99999 + Math.sin(t) * 100), w * 0.7 + s * 0.75, h * 0.14);
  },

  'f4': (ctx, w, h, t) => {
    // Code scrolling on monitors
    ctx.fillStyle = 'rgba(76,175,80,0.12)';
    ctx.font = '7px "JetBrains Mono"';
    ctx.textAlign = 'left';
    const code = ['const br = new BlackRoad()', 'await br.fleet.status()', 'br.slack.post("deployed")', 'git push origin main', 'npm run build && deploy', 'fn pave_tomorrow() {'];
    const scrollOffset = (t * 20) % (code.length * 10);
    for (let m = 0; m < 4; m++) {
      const mx = [0.07, 0.27, 0.57, 0.77][m];
      const line = code[(Math.floor(t + m) % code.length)];
      ctx.fillText(line, w * mx + 10, h * 0.28);
    }
  },

  'f5': (ctx, w, h, t) => {
    // Radar sweep on globe
    const s = Math.min(w, h) * 0.025;
    ctx.strokeStyle = 'rgba(41,121,255,0.2)';
    ctx.lineWidth = 1;
    const sweepAngle = t * 2;
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h * 0.4);
    ctx.lineTo(w * 0.5 + Math.cos(sweepAngle) * s * 3, h * 0.4 + Math.sin(sweepAngle) * s * 1.5);
    ctx.stroke();
    // Alert flash
    if (Math.sin(t * 4) > 0.9) {
      ctx.fillStyle = 'rgba(255,69,0,0.05)';
      ctx.fillRect(0, 0, w, h);
    }
  },

  'f2': (ctx, w, h, t) => {
    // Presentation slide changes
    const slide = Math.floor(t * 0.3) % 4;
    const titles = ['Q1 Revenue: $0 (pre-revenue)', '90% Reserved C Corp', '52 TOPS Edge Compute', '275+ Repositories'];
    ctx.fillStyle = '#ccc';
    ctx.font = '9px "JetBrains Mono"';
    ctx.textAlign = 'center';
    ctx.fillText(titles[slide], w * 0.175, h * 0.25);
  },

  'b3': (ctx, w, h, t) => {
    // Treadmill belt animation
    const s = Math.min(w, h) * 0.025;
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let belt = 0; belt < 2; belt++) {
      const bx = w * 0.05 + belt * w * 0.15;
      for (let line = 0; line < 5; line++) {
        const ly = h * 0.56 + ((t * 40 + line * 14) % (s * 0.7));
        ctx.beginPath();
        ctx.moveTo(bx + 4, h * 0.51 + ly % 12);
        ctx.lineTo(bx + s * 3 - 8, h * 0.51 + ly % 12);
        ctx.stroke();
      }
    }
  },
};

// ── Render a floor ──
function renderCustomFloor(ctx, floorId, w, h, t) {
  const layout = FLOOR_LAYOUTS[floorId];
  if (layout) {
    // Shadows first
    drawFurnitureShadows(ctx, floorId, w, h);
    // Main layout
    layout(ctx, w, h, t);
    // Micro details (pens, papers, cables, etc)
    scatterDetails(ctx, floorId, w, h, t);
    // Ambient objects (fish tank, fans, screensavers, weather)
    scatterAmbient(ctx, floorId, w, h, t);
    // Animated overlay
    const anim = FLOOR_ANIMATIONS[floorId];
    if (anim) anim(ctx, w, h, t);
    return true;
  }
  return false;
}

// ── WAVE 2: Even more life ──

// Animated clock with second hand on walls
Ambient.wallClockAnimated = function(ctx, x, y, r, t) {
  // Face
  ctx.fillStyle = '#f8f8f0'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#888'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.stroke();
  // Tick marks
  for(let i=0;i<12;i++) {
    const a = i*Math.PI/6;
    ctx.fillStyle = '#444';
    ctx.fillRect(x+Math.cos(a)*(r-4)-1, y+Math.sin(a)*(r-4)-1, 2, 2);
  }
  // Real time hands
  const now = new Date();
  const hr = (now.getHours()%12+now.getMinutes()/60)*Math.PI/6 - Math.PI/2;
  const mn = (now.getMinutes()+now.getSeconds()/60)*Math.PI/30 - Math.PI/2;
  const sc = now.getSeconds()*Math.PI/30 - Math.PI/2;
  // Hour
  ctx.strokeStyle = '#222'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+Math.cos(hr)*r*0.45, y+Math.sin(hr)*r*0.45); ctx.stroke();
  // Minute
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+Math.cos(mn)*r*0.65, y+Math.sin(mn)*r*0.65); ctx.stroke();
  // Second (red)
  ctx.strokeStyle = '#c33'; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+Math.cos(sc)*r*0.7, y+Math.sin(sc)*r*0.7); ctx.stroke();
  // Center dot
  ctx.fillStyle = '#c33'; ctx.beginPath(); ctx.arc(x,y,2,0,Math.PI*2); ctx.fill();
};

// Smoke/steam particles
Ambient.steamParticles = function(ctx, x, y, count, t) {
  for(let i=0;i<count;i++) {
    const age = ((t*2+i*1.7)%3)/3;
    const px = x + Math.sin(t*2+i*2.3)*6*age;
    const py = y - age*25;
    const size = 2+age*4;
    ctx.fillStyle = `rgba(200,200,200,${0.08*(1-age)})`;
    ctx.beginPath(); ctx.arc(px, py, size, 0, Math.PI*2); ctx.fill();
  }
};

// Notification badge (red dot with number)
Ambient.notifBadge = function(ctx, x, y, count) {
  if(count <= 0) return;
  ctx.fillStyle = '#F44336';
  ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = '7px "JetBrains Mono"'; ctx.textAlign = 'center';
  ctx.fillText(count > 99 ? '99+' : count, x, y+3);
};

// Loading spinner
Ambient.spinner = function(ctx, x, y, r, t) {
  for(let i=0;i<8;i++) {
    const a = i*Math.PI/4 + t*5;
    ctx.fillStyle = `rgba(255,29,108,${0.1+i*0.1})`;
    ctx.beginPath();
    ctx.arc(x+Math.cos(a)*r, y+Math.sin(a)*r, 2, 0, Math.PI*2);
    ctx.fill();
  }
};

// Progress bar
Ambient.progressBar = function(ctx, x, y, w, h, pct, color) {
  drawRect(ctx, x, y, w, h, 'rgba(255,255,255,0.05)');
  drawRect(ctx, x, y, w*Math.min(pct,1), h, color||'#4CAF50');
};

// Terminal output window
Ambient.terminal = function(ctx, x, y, w, h, lines, t) {
  drawRoundRect(ctx, x, y, w, h, 3, '#1a1a1a');
  // Title bar
  drawRect(ctx, x+1, y+1, w-2, 10, '#2a2a2a');
  ctx.fillStyle = '#F44336'; ctx.beginPath(); ctx.arc(x+8, y+6, 3, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#F5A623'; ctx.beginPath(); ctx.arc(x+16, y+6, 3, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#4CAF50'; ctx.beginPath(); ctx.arc(x+24, y+6, 3, 0, Math.PI*2); ctx.fill();
  // Content
  ctx.fillStyle = '#4CAF50'; ctx.font = '7px "JetBrains Mono"'; ctx.textAlign = 'left';
  const visLine = Math.floor(t*0.5) % lines.length;
  for(let i=0;i<Math.min(lines.length, Math.floor((h-15)/9));i++) {
    const li = (visLine+i) % lines.length;
    ctx.fillStyle = lines[li].startsWith('$') ? '#4CAF50' : lines[li].startsWith('!') ? '#F44336' : '#888';
    ctx.fillText(lines[li], x+5, y+20+i*9);
  }
  // Blinking cursor
  if(Math.sin(t*4)>0) { ctx.fillStyle = '#4CAF50'; ctx.fillRect(x+5, y+20+Math.min(lines.length,3)*9, 5, 8); }
};

// Wi-Fi signal indicator
Ambient.wifiSignal = function(ctx, x, y, strength, t) {
  const bars = Math.min(Math.floor(strength*4), 4);
  for(let b=0;b<4;b++) {
    ctx.strokeStyle = b < bars ? '#4CAF50' : 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y+8, 4+b*4, -Math.PI*0.8, -Math.PI*0.2);
    ctx.stroke();
  }
  // Pulse when transmitting
  if(Math.sin(t*6)>0.8 && bars > 2) {
    ctx.fillStyle = 'rgba(76,175,80,0.2)';
    ctx.beginPath(); ctx.arc(x, y+8, 18, 0, Math.PI*2); ctx.fill();
  }
};

// QR code (decorative)
Ambient.qrCode = function(ctx, x, y, s) {
  drawRect(ctx, x, y, s, s, '#fff');
  // Random-ish pattern that looks like QR
  const pattern = [1,0,1,1,0,1,1,0,0,1,0,1,1,1,0,1,0,1,0,0,1,1,0,1,0];
  const cellSize = s/5;
  for(let r=0;r<5;r++) for(let c=0;c<5;c++) {
    if(pattern[r*5+c]) ctx.fillStyle = '#000'; else continue;
    ctx.fillRect(x+c*cellSize, y+r*cellSize, cellSize, cellSize);
  }
  // Corner markers
  drawRect(ctx, x, y, cellSize*2, cellSize*2, '#000');
  drawRect(ctx, x+2, y+2, cellSize*2-4, cellSize*2-4, '#fff');
  drawRect(ctx, x+4, y+4, cellSize*2-8, cellSize*2-8, '#000');
};

// ── Apply wave 2 to floors ──
const origScatterAmbient = scatterAmbient;
scatterAmbient = function(ctx, floorId, w, h, t) {
  origScatterAmbient(ctx, floorId, w, h, t);
  const s = Math.min(w,h)*0.025;

  // Real animated clocks (replace static ones)
  if(['f10','f4','f3','f8','f2','b1','b2','b3'].includes(floorId)) {
    Ambient.wallClockAnimated(ctx, w*0.5, h*0.05, s*1.2, t);
  }

  // Coffee steam in break room
  if(floorId === 'b1') {
    Ambient.steamParticles(ctx, w*0.1, h*0.04, 5, t);
    // Terminal showing menu
    Ambient.terminal(ctx, w*0.5, h*0.35, s*5, s*4, [
      '$ cat /menu/today',
      '  Pizza Friday!',
      '  Coffee: Ethiopian',
      '  Snacks: unlimited',
      '$ echo "we care"',
      '  we care',
    ], t);
  }

  // Ollama terminal on Command Center
  if(floorId === 'f9') {
    Ambient.terminal(ctx, w*0.02, h*0.55, s*6, s*5, [
      '$ ollama list',
      '  qwen2.5:7b     4.4GB',
      '  deepseek-r1:7b 4.7GB',
      '  llama3.2:3b    2.0GB',
      '  mistral:7b     4.1GB',
      '  cece:7b        4.2GB',
      '  nomic-embed    274MB',
      '$ ollama run cece',
      '> Hello CECE',
      '  Hey! I\'m running on',
      '  52 TOPS of Hailo-8.',
      '  How can I help?',
    ], t);
    // Wi-Fi signal
    Ambient.wifiSignal(ctx, w*0.95, h*0.9, 1.0, t);
  }

  // Fleet terminal on Mission Control
  if(floorId === 'f10') {
    Ambient.terminal(ctx, w*0.7, h*0.62, s*6, s*5, [
      '$ br fleet status',
      '  alice    ONLINE  34C',
      '  cecilia  ONLINE  55C',
      '  octavia  ONLINE  35C',
      '  aria     ONLINE  51C',
      '  lucidia  ONLINE  54C',
      '$ br fleet health',
      '  5/5 nodes | 100%',
      '  44 models loaded',
      '  52 TOPS available',
    ], t);
    // Notification badges on screens
    Ambient.notifBadge(ctx, w*0.28+w*0.18, h*0.14, 3);
  }

  // Git terminal on Engineering
  if(floorId === 'f4') {
    Ambient.terminal(ctx, w*0.75, h*0.15, s*5, s*4, [
      '$ git log --oneline -5',
      '  a5f936f docs: CODE_OF_CONDUCT',
      '  bdb5f24 feat: real SDKs',
      '  6259b9a docs: AI org profile',
      '  58e65e7 docs: Inc profile',
      '$ npm test',
      '  PASS all tests',
      '$ wrangler deploy',
      '  Deployed hq-blackroad',
    ], t);
    // Loading spinner on a deploy
    Ambient.spinner(ctx, w*0.88, h*0.28, 8, t);
  }

  // NOC has progress bars for tunnel health
  if(floorId === 'f5') {
    const barY = h*0.38;
    ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.font = '6px "JetBrains Mono"'; ctx.textAlign = 'left';
    const tunnels = ['alice-tunnel','cecilia-tun','octavia-tun','aria-tunnel','lucidia-tun'];
    tunnels.forEach((tn, i) => {
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fillText(tn, w*0.35, barY+i*12+8);
      Ambient.progressBar(ctx, w*0.5, barY+i*12+2, w*0.12, 6, 0.85+Math.sin(t+i)*0.15, '#4CAF50');
    });
    // Wi-Fi signals at satellite
    Ambient.wifiSignal(ctx, w*0.9, h*0.18, 0.9, t);
  }

  // Strategy room — Stripe dashboard
  if(floorId === 'f8') {
    Ambient.terminal(ctx, w*0.03, h*0.75, s*5, s*3.5, [
      '$ stripe products list',
      '  Starter  $9/mo   ACTIVE',
      '  Pro      $29/mo  ACTIVE',
      '  Enter.   $99/mo  ACTIVE',
      '$ stripe balance',
      '  Available: $0.00',
      '  (pre-revenue)',
    ], t);
  }

  // QR codes in lobby (link to blackroad.io)
  if(floorId === 'f1') {
    Ambient.qrCode(ctx, w*0.04, h*0.77, s*2);
    ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.font = '6px "JetBrains Mono"'; ctx.textAlign = 'center';
    ctx.fillText('blackroad.io', w*0.04+s, h*0.77+s*2.2);
  }

  // Hardware lab — Raspberry Pi boot terminal
  if(floorId === 'f6') {
    Ambient.terminal(ctx, w*0.03, h*0.82, s*6, s*3, [
      '$ ssh pi@192.168.4.49',
      '  Welcome to Alice!',
      '  Raspbian GNU/Linux',
      '$ vcgencmd measure_temp',
      '  temp=34.0\'C',
      '$ hailo-info',
      '  HLLWM2B233704667',
      '  26 TOPS | READY',
    ], t);
    // Wi-Fi
    Ambient.wifiSignal(ctx, w*0.72, h*0.92, 0.85, t);
  }

  // Boardroom — company metrics
  if(floorId === 'f2') {
    // Revenue progress bar on screen
    ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.font = '7px "JetBrains Mono"'; ctx.textAlign = 'left';
    ctx.fillText('Infrastructure', w*0.05, h*0.155);
    Ambient.progressBar(ctx, w*0.15, h*0.15, w*0.12, 5, 0.95, '#4CAF50');
    ctx.fillText('Revenue', w*0.05, h*0.175);
    Ambient.progressBar(ctx, w*0.15, h*0.17, w*0.12, 5, 0.05, '#F5A623');
    ctx.fillText('Team', w*0.05, h*0.195);
    Ambient.progressBar(ctx, w*0.15, h*0.19, w*0.12, 5, 0.3, '#2979FF');
  }

  // Gym — workout timer
  if(floorId === 'b3') {
    drawRect(ctx, w*0.02, h*0.05, s*3, s*2, '#111');
    drawRect(ctx, w*0.025, h*0.055, s*2.9, s*1.9, '#0a0a0a');
    ctx.fillStyle = '#FF1D6C'; ctx.font = `${s*0.8}px "JetBrains Mono"`; ctx.textAlign = 'center';
    const mins = Math.floor((t*2)%60);
    const secs = Math.floor((t*20)%60);
    ctx.fillText(`${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`, w*0.02+s*1.5, h*0.055+s*1.4);
    ctx.fillStyle = '#888'; ctx.font = '7px "JetBrains Mono"';
    ctx.fillText('INTERVAL', w*0.02+s*1.5, h*0.055+s*1.8);
  }

  // Rec room — scoreboard
  if(floorId === 'b2') {
    drawRect(ctx, w*0.35, h*0.02, s*4, s*1.5, '#111');
    drawRect(ctx, w*0.355, h*0.025, s*3.9, s*1.4, '#0a1a0a');
    ctx.fillStyle = '#4CAF50'; ctx.font = '8px "JetBrains Mono"'; ctx.textAlign = 'center';
    ctx.fillText('SCOREBOARD', w*0.35+s*2, h*0.04);
    ctx.fillStyle = '#fff'; ctx.font = '7px "JetBrains Mono"';
    ctx.fillText('alice: 47  |  octavia: 52', w*0.35+s*2, h*0.06);
    ctx.fillText('ping pong championship', w*0.35+s*2, h*0.075);
  }

  // Open floor — live visitor count
  if(floorId === 'f3') {
    ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.font = '8px "JetBrains Mono"'; ctx.textAlign = 'right';
    ctx.fillText('visitors today: '+Math.floor(20+Math.sin(t*0.1)*5), w*0.97, h*0.96);
  }
};

// ── WAVE 3: MAXIMUM DETAIL ──

// Footprint trail system
Ambient.footprints = function(ctx, x, y, angle, age) {
  if(age > 1) return;
  ctx.fillStyle = `rgba(100,100,100,${0.03*(1-age)})`;
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
  // Left foot
  ctx.beginPath(); ctx.ellipse(-3, 0, 3, 5, 0, 0, Math.PI*2); ctx.fill();
  // Right foot
  ctx.beginPath(); ctx.ellipse(3, -8, 3, 5, 0, 0, Math.PI*2); ctx.fill();
  ctx.restore();
};

// Sparkle/glint effect
Ambient.sparkle = function(ctx, x, y, t, color) {
  const size = 2 + Math.sin(t*8)*1.5;
  if(size < 1) return;
  ctx.fillStyle = color || 'rgba(255,255,255,0.4)';
  // 4-point star
  ctx.beginPath();
  ctx.moveTo(x, y-size); ctx.lineTo(x+1, y-1); ctx.lineTo(x+size, y);
  ctx.lineTo(x+1, y+1); ctx.lineTo(x, y+size); ctx.lineTo(x-1, y+1);
  ctx.lineTo(x-size, y); ctx.lineTo(x-1, y-1);
  ctx.closePath(); ctx.fill();
};

// Dust motes floating in light
Ambient.dustMotes = function(ctx, x, y, w, h, t, count) {
  for(let i=0;i<count;i++) {
    const dx = x + Math.sin(t*0.3+i*2.7)*w*0.4 + w*0.5;
    const dy = y + Math.sin(t*0.2+i*3.1)*h*0.4 + h*0.5;
    const size = 1 + Math.sin(t+i)*0.5;
    ctx.fillStyle = `rgba(255,250,230,${0.04+Math.sin(t*2+i)*0.02})`;
    ctx.beginPath(); ctx.arc(dx, dy, size, 0, Math.PI*2); ctx.fill();
  }
};

// Electrical spark
Ambient.electricSpark = function(ctx, x, y, t) {
  if(Math.sin(t*7) < 0.9) return;
  ctx.strokeStyle = 'rgba(100,200,255,0.5)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x, y);
  for(let s=0;s<3;s++) {
    ctx.lineTo(x+Math.random()*12-6, y+s*5+Math.random()*4);
  }
  ctx.stroke();
};

// Blinking server activity
Ambient.serverActivity = function(ctx, x, y, w, h, t) {
  // Random blink pattern
  for(let r=0;r<4;r++) for(let c=0;c<3;c++) {
    const on = Math.sin(t*6+r*2.3+c*3.7) > 0.2;
    ctx.fillStyle = on ? (Math.sin(t*4+r+c)>0.5 ? '#4CAF50' : '#2979FF') : '#1a1a1a';
    ctx.beginPath(); ctx.arc(x+c*8+4, y+r*8+4, 2, 0, Math.PI*2); ctx.fill();
  }
};

// Holographic display
Ambient.holoDisplay = function(ctx, x, y, w, h, t, text) {
  // Scanlines
  ctx.fillStyle = `rgba(0,200,255,${0.03+Math.sin(t*2)*0.01})`;
  for(let sl=0;sl<Math.floor(h/3);sl++) {
    if(Math.sin(t*10+sl)>0) ctx.fillRect(x, y+sl*3, w, 1);
  }
  // Flicker
  if(Math.sin(t*15)>0.95) { ctx.fillStyle='rgba(0,200,255,0.05)'; ctx.fillRect(x,y,w,h); }
  // Text
  ctx.fillStyle = `rgba(0,200,255,${0.4+Math.sin(t*3)*0.1})`;
  ctx.font = '9px "JetBrains Mono"'; ctx.textAlign = 'center';
  ctx.fillText(text, x+w/2, y+h/2+3);
};

// Neon sign
Ambient.neonSign = function(ctx, x, y, text, color, t) {
  const flicker = Math.sin(t*20) > 0.98 ? 0.3 : 1;
  // Glow
  ctx.fillStyle = `rgba(${color === '#FF1D6C' ? '255,29,108' : color === '#4CAF50' ? '76,175,80' : '41,121,255'},${0.05*flicker})`;
  ctx.beginPath(); ctx.ellipse(x, y, text.length*5+10, 15, 0, 0, Math.PI*2); ctx.fill();
  // Text
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.6*flicker + Math.sin(t*3)*0.1;
  ctx.font = '14px "Space Grotesk"'; ctx.textAlign = 'center';
  ctx.fillText(text, x, y+5);
  ctx.globalAlpha = 1;
};

// Camera feed thumbnail
Ambient.cameraFeed = function(ctx, x, y, w, h, t, label) {
  drawRect(ctx, x, y, w, h, '#0a0a0a');
  // Static noise
  for(let px=0;px<15;px++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random()*0.06})`;
    ctx.fillRect(x+Math.random()*w, y+Math.random()*h, 2, 2);
  }
  // REC indicator
  ctx.fillStyle = Math.sin(t*3)>0 ? '#F44336' : '#000';
  ctx.beginPath(); ctx.arc(x+w-8, y+6, 3, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#888'; ctx.font = '5px "JetBrains Mono"'; ctx.textAlign = 'left';
  ctx.fillText('REC', x+w-18, y+8);
  // Label
  ctx.fillStyle = '#666'; ctx.fillText(label||'CAM', x+3, y+h-3);
  // Timestamp
  const now = new Date();
  ctx.fillText(now.toLocaleTimeString(), x+3, y+8);
};

// ── Apply wave 3 ──
const origScatterAmbient2 = scatterAmbient;
scatterAmbient = function(ctx, floorId, w, h, t) {
  origScatterAmbient2(ctx, floorId, w, h, t);
  const s = Math.min(w,h)*0.025;

  // Dust motes in sunlit rooms
  if(['f10','f4','f8','f2','rooftop'].includes(floorId)) {
    Ambient.dustMotes(ctx, 0, 0, w, h, t, 15);
  }

  // Sparkles on clean surfaces
  if(floorId === 'f1') {
    // Marble floor sparkles
    for(let sp=0;sp<8;sp++) {
      const sx = Math.sin(sp*4.3+0.5)*w*0.4+w*0.5;
      const sy = Math.sin(sp*3.7+1.2)*h*0.3+h*0.5;
      Ambient.sparkle(ctx, sx, sy, t+sp*1.5, 'rgba(255,255,255,0.15)');
    }
    // Trophy sparkles in strategy room too
  }
  if(floorId === 'f8') {
    Ambient.sparkle(ctx, w*0.062, h*0.71, t, 'rgba(218,165,32,0.3)');
    Ambient.sparkle(ctx, w*0.102, h*0.72, t+1, 'rgba(192,192,192,0.3)');
  }

  // Server room electrical effects
  if(floorId === 'f7') {
    Ambient.electricSpark(ctx, w*0.3, h*0.5, t);
    Ambient.electricSpark(ctx, w*0.7, h*0.5, t+2);
    // Extra server activity indicators
    for(let rack=0;rack<5;rack++) {
      Ambient.serverActivity(ctx, w*0.1+rack*w*0.18, h*0.32, 24, 32, t);
    }
  }

  // Holo displays
  if(floorId === 'f9') {
    Ambient.holoDisplay(ctx, w*0.38, h*0.28, w*0.24, h*0.05, t, '52 TOPS ACTIVE');
  }
  if(floorId === 'f5') {
    Ambient.holoDisplay(ctx, w*0.36, h*0.35, w*0.08, h*0.03, t, '18 TUNNELS');
  }

  // Neon signs
  if(floorId === 'f1') {
    // Behind reception
    Ambient.neonSign(ctx, w*0.18, h*0.53, 'PAVE TOMORROW', '#FF1D6C', t);
  }
  if(floorId === 'b2') {
    Ambient.neonSign(ctx, w*0.5, h*0.95, 'GAME ON', '#2979FF', t);
  }
  if(floorId === 'b3') {
    Ambient.neonSign(ctx, w*0.5, h*0.95, 'NO EXCUSES', '#FF1D6C', t);
  }

  // Security camera feeds on NOC
  if(floorId === 'f5') {
    const cams = ['LOBBY','SERVER','ROOF','PARKING'];
    cams.forEach((cam, i) => {
      Ambient.cameraFeed(ctx, w*0.06+i*w*0.18+2, h*0.04, w*0.14-4, h*0.13, t, cam);
    });
  }

  // Rooftop — firepit sparkle embers floating up
  if(floorId === 'rooftop') {
    for(let e=0;e<8;e++) {
      const ex = w*0.75 + Math.sin(t*2+e*1.1)*15;
      const ey = h*0.83 - ((t*15+e*20)%40);
      const life = 1-((t*15+e*20)%40)/40;
      ctx.fillStyle = `rgba(255,${100+e*20},0,${life*0.4})`;
      ctx.beginPath(); ctx.arc(ex, ey, 1.5*life, 0, Math.PI*2); ctx.fill();
    }
  }

  // Hardware lab — soldering iron heat waves
  if(floorId === 'f6') {
    Ambient.steamParticles(ctx, w*0.055, h*0.44, 3, t);
  }

  // Break room — pizza steam
  if(floorId === 'b1') {
    Ambient.steamParticles(ctx, w*0.35, h*0.4, 3, t*0.7);
  }

  // Command center — data rain effect (subtle)
  if(floorId === 'f9') {
    ctx.fillStyle = 'rgba(156,39,176,0.03)'; ctx.font = '8px "JetBrains Mono"';
    for(let dr=0;dr<10;dr++) {
      const dx = w*0.1+dr*w*0.08;
      const dy = ((t*25+dr*40)%h);
      ctx.fillText(Math.random()>0.5?'0':'1', dx, dy);
    }
  }

  // Boardroom — BlackRoad logo watermark on table
  if(floorId === 'f2') {
    ctx.fillStyle = 'rgba(255,29,108,0.02)';
    ctx.font = '24px "Space Grotesk"'; ctx.textAlign = 'center';
    ctx.fillText('BR', w*0.38, h*0.57);
  }

  // Open floor — ambient chatter indicator (sound waves)
  if(floorId === 'f3') {
    for(let sw=0;sw<3;sw++) {
      const swx = w*0.15 + sw*w*0.3;
      ctx.strokeStyle = `rgba(255,255,255,${0.02+Math.sin(t*4+sw)*0.01})`;
      ctx.lineWidth = 0.5;
      for(let r=0;r<3;r++) {
        ctx.beginPath();
        ctx.arc(swx, h*0.3, 5+r*4+Math.sin(t*3+sw)*2, -0.5, 0.5);
        ctx.stroke();
      }
    }
  }

  // Gym — heart rate display on treadmill
  if(floorId === 'b3') {
    ctx.fillStyle = '#F44336'; ctx.font = '7px "JetBrains Mono"'; ctx.textAlign = 'center';
    const hr = Math.floor(120+Math.sin(t*2)*15);
    ctx.fillText(hr+' BPM', w*0.1, h*0.12);
    // Heart icon pulse
    const pulse = 1+Math.sin(t*6)*0.2;
    ctx.fillStyle = `rgba(244,67,54,${0.3+Math.sin(t*6)*0.15})`;
    ctx.save(); ctx.translate(w*0.1-15, h*0.11); ctx.scale(pulse, pulse);
    ctx.beginPath(); ctx.moveTo(0,-3); ctx.bezierCurveTo(-5,-8,-10,-3,-5,2); ctx.lineTo(0,6); ctx.lineTo(5,2); ctx.bezierCurveTo(10,-3,5,-8,0,-3);
    ctx.fill(); ctx.restore();
  }
};

// ── WAVE 4: THE FINAL WAVE ──

// Rain on windows (global weather system)
Ambient.rainOnGlass = function(ctx, x, y, w, h, t) {
  // Raindrops running down glass
  for(let d=0;d<12;d++) {
    const dx = x + 3 + (d * w/12) + Math.sin(d*3)*3;
    const speed = 15 + d*3;
    const dy = y + ((t*speed + d*40) % h);
    // Drop
    ctx.fillStyle = 'rgba(150,200,255,0.15)';
    ctx.beginPath(); ctx.ellipse(dx, dy, 1, 3, 0, 0, Math.PI*2); ctx.fill();
    // Trail
    ctx.strokeStyle = 'rgba(150,200,255,0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(dx, dy); ctx.lineTo(dx+Math.sin(dy*0.1), dy-8); ctx.stroke();
  }
};

// Lightning flash (rare)
Ambient.lightning = function(ctx, w, h, t) {
  if(Math.sin(t*0.3)*Math.sin(t*7.7) > 0.98) {
    ctx.fillStyle = 'rgba(200,220,255,0.08)';
    ctx.fillRect(0, 0, w, h);
  }
};

// Snowfall on rooftop
Ambient.snowfall = function(ctx, x, y, w, h, t, count) {
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  for(let s2=0;s2<count;s2++) {
    const sx = x + ((t*8+s2*47)%(w));
    const sy = y + ((t*12+s2*31)%(h));
    const size = 1.5 + Math.sin(s2)*0.8;
    ctx.beginPath(); ctx.arc(sx, sy+Math.sin(t+s2)*2, size, 0, Math.PI*2); ctx.fill();
  }
};

// Confetti burst
Ambient.confetti = function(ctx, x, y, t, count) {
  const colors = ['#FF1D6C','#F5A623','#4CAF50','#2979FF','#9C27B0','#00BCD4','#FFD700'];
  for(let c=0;c<count;c++) {
    const age = ((t*2+c*0.7)%4)/4;
    if(age > 0.8) continue;
    const cx2 = x + Math.cos(c*2.4+t)*40*age + Math.sin(c)*20;
    const cy2 = y - 30*age + age*age*50;
    const rot = t*5+c*3;
    ctx.fillStyle = colors[c%colors.length];
    ctx.save(); ctx.translate(cx2, cy2); ctx.rotate(rot);
    ctx.fillRect(-3, -1, 6, 2);
    ctx.restore();
  }
};

// Typing text effect (types out letter by letter)
Ambient.typingText = function(ctx, x, y, text, t, speed, color) {
  const chars = Math.floor((t*speed)%((text.length+10)));
  const visible = text.substring(0, Math.min(chars, text.length));
  ctx.fillStyle = color || '#4CAF50';
  ctx.font = '8px "JetBrains Mono"'; ctx.textAlign = 'left';
  ctx.fillText(visible, x, y);
  // Cursor
  if(chars < text.length && Math.sin(t*5)>0) {
    ctx.fillRect(x + ctx.measureText(visible).width + 1, y-7, 5, 9);
  }
};

// Ripple effect (water, touch)
Ambient.ripple = function(ctx, x, y, t, interval) {
  const phase = (t*2)%interval;
  if(phase < 2) {
    for(let r=0;r<3;r++) {
      const radius = phase*15+r*8;
      ctx.strokeStyle = `rgba(150,200,255,${0.15*(1-phase/2)*(1-r*0.3)})`;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI*2); ctx.stroke();
    }
  }
};

// Emoji reaction floating up
Ambient.emojiFloat = function(ctx, x, y, emoji, t, offset) {
  const age = ((t+offset)%5)/5;
  if(age > 0.6) return;
  const fy = y - age*40;
  const fx = x + Math.sin(t*2+offset)*8;
  ctx.globalAlpha = 1-age*1.5;
  ctx.font = '14px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(emoji, fx, fy);
  ctx.globalAlpha = 1;
};

// Battery/power indicator
Ambient.battery = function(ctx, x, y, pct) {
  drawRect(ctx, x, y, 16, 8, 'rgba(255,255,255,0.1)');
  drawRect(ctx, x+16, y+2, 2, 4, 'rgba(255,255,255,0.1)');
  const color = pct > 0.5 ? '#4CAF50' : pct > 0.2 ? '#F5A623' : '#F44336';
  drawRect(ctx, x+1, y+1, 14*pct, 6, color);
};

// Mini network topology diagram
Ambient.networkTopo = function(ctx, x, y, s, t) {
  const nodes = [
    {name:'AL', x:0, y:0, c:'#4CAF50'},
    {name:'CE', x:s*3, y:-s, c:'#9C27B0'},
    {name:'OC', x:s*6, y:0, c:'#7B1FA2'},
    {name:'AR', x:s*3, y:s, c:'#2979FF'},
    {name:'LU', x:s*1.5, y:s*2, c:'#00BCD4'},
  ];
  // Connections
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;
  for(let i=0;i<nodes.length;i++) for(let j=i+1;j<nodes.length;j++) {
    ctx.beginPath(); ctx.moveTo(x+nodes[i].x, y+nodes[i].y); ctx.lineTo(x+nodes[j].x, y+nodes[j].y); ctx.stroke();
    // Data packet animation
    const progress = (Math.sin(t*2+i+j)+1)/2;
    const px = x+nodes[i].x+(nodes[j].x-nodes[i].x)*progress;
    const py = y+nodes[i].y+(nodes[j].y-nodes[i].y)*progress;
    ctx.fillStyle = 'rgba(41,121,255,0.2)';
    ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI*2); ctx.fill();
  }
  // Node circles
  nodes.forEach(n => {
    ctx.fillStyle = n.c; ctx.beginPath(); ctx.arc(x+n.x, y+n.y, 6, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = '6px "JetBrains Mono"'; ctx.textAlign = 'center';
    ctx.fillText(n.name, x+n.x, y+n.y+2);
  });
};

// Analog gauge (temperature, etc)
Ambient.gauge = function(ctx, x, y, r, value, max, label, color) {
  // Background arc
  ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(x, y, r, Math.PI*0.7, Math.PI*2.3); ctx.stroke();
  // Value arc
  const pct = value/max;
  ctx.strokeStyle = color || (pct > 0.8 ? '#F44336' : pct > 0.6 ? '#F5A623' : '#4CAF50');
  ctx.beginPath(); ctx.arc(x, y, r, Math.PI*0.7, Math.PI*0.7+pct*Math.PI*1.6); ctx.stroke();
  // Needle
  const needleAngle = Math.PI*0.7+pct*Math.PI*1.6;
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x+Math.cos(needleAngle)*r*0.8, y+Math.sin(needleAngle)*r*0.8); ctx.stroke();
  // Label
  ctx.fillStyle = '#888'; ctx.font = '6px "JetBrains Mono"'; ctx.textAlign = 'center';
  ctx.fillText(label, x, y+r+8);
  ctx.fillStyle = color || '#fff'; ctx.fillText(Math.round(value), x, y+4);
};

// ── Apply wave 4 ──
const origScatterAmbient3 = scatterAmbient;
scatterAmbient = function(ctx, floorId, w, h, t) {
  origScatterAmbient3(ctx, floorId, w, h, t);
  const s = Math.min(w,h)*0.025;

  // Fountain ripples in lobby
  if(floorId === 'f1') {
    Ambient.ripple(ctx, w*0.33+s*4, h*0.2+s*5, t, 3);
    Ambient.ripple(ctx, w*0.33+s*4, h*0.2+s*5, t+1.5, 3);
  }

  // Network topology on NOC wall
  if(floorId === 'f5') {
    Ambient.networkTopo(ctx, w*0.6, h*0.25, s*1.2, t);
  }

  // Temperature gauges in server room
  if(floorId === 'f7') {
    Ambient.gauge(ctx, w*0.94, h*0.6, s*1.2, 34, 80, 'TEMP', '#4CAF50');
    Ambient.gauge(ctx, w*0.94, h*0.72, s*1.2, 45, 100, 'HUMID');
    Ambient.gauge(ctx, w*0.94, h*0.84, s*1.2, 92, 100, 'UPS%', '#4CAF50');
    // Battery indicators
    Ambient.battery(ctx, w*0.02, h*0.92, 0.95);
    ctx.fillStyle='rgba(255,255,255,0.05)'; ctx.font='6px "JetBrains Mono"'; ctx.textAlign='left';
    ctx.fillText('UPS-A', w*0.02, h*0.91);
    Ambient.battery(ctx, w*0.02, h*0.96, 0.88);
    ctx.fillText('UPS-B', w*0.02, h*0.955);
  }

  // Rain on windows (evening/night)
  const hour = new Date().getHours();
  if(hour >= 18 || hour < 6) {
    if(['f10','f4','f8','f2'].includes(floorId)) {
      // Rain on each window
      const ww = w/7;
      for(let wi=0;wi<6;wi++) {
        Ambient.rainOnGlass(ctx, ww*(wi+0.6), h*0.02, ww*0.5, h*0.08, t);
      }
    }
    // Lightning on all floors (rare)
    Ambient.lightning(ctx, w, h, t);
  }

  // Typing text on various screens
  if(floorId === 'f9') {
    Ambient.typingText(ctx, w*0.04, h*0.62, '> Running inference on qwen2.5:7b...', t, 3, '#9C27B0');
  }
  if(floorId === 'f10') {
    Ambient.typingText(ctx, w*0.72, h*0.73, '$ slack-say "all systems nominal"', t, 2, '#4CAF50');
  }

  // Strategy room — typing Stripe commands
  if(floorId === 'f8') {
    Ambient.typingText(ctx, w*0.04, h*0.82, '$ stripe listen --forward-to localhost', t, 1.5, '#F5A623');
  }

  // Emoji reactions floating up from roundtables
  if(floorId === 'f3') {
    const emojis = ['o','!','+','*'];
    for(let e=0;e<3;e++) {
      Ambient.emojiFloat(ctx, w*0.18+e*w*0.3, h*0.35, emojis[e%4], t, e*1.7);
    }
  }

  // Confetti on rec room (after a win)
  if(floorId === 'b2' && Math.sin(t*0.2) > 0.95) {
    Ambient.confetti(ctx, w*0.5, h*0.3, t, 20);
  }

  // Rooftop snowfall (if winter — December-February)
  const month = new Date().getMonth();
  if(floorId === 'rooftop' && (month === 11 || month <= 1)) {
    Ambient.snowfall(ctx, 0, h*0.42, w, h*0.58, t, 30);
  }

  // Hardware lab — oscilloscope cursor line
  if(floorId === 'f6') {
    const cursorX = w*0.52+((t*30)%(s*3.7));
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(cursorX, h*0.09); ctx.lineTo(cursorX, h*0.09+s*2.3); ctx.stroke();
  }

  // Network topology mini on Mission Control
  if(floorId === 'f10') {
    Ambient.networkTopo(ctx, w*0.38, h*0.68, s, t);
  }

  // Boardroom — clock with company founding date
  if(floorId === 'f2') {
    ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.font = '7px "JetBrains Mono"'; ctx.textAlign = 'center';
    ctx.fillText('EST. 2025', w*0.5, h*0.09);
  }

  // Engineering — deploy status light
  if(floorId === 'f4') {
    // Green deploy light
    ctx.fillStyle = `rgba(76,175,80,${0.3+Math.sin(t*2)*0.15})`;
    ctx.beginPath(); ctx.arc(w*0.92, h*0.13, 5, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.font = '6px "JetBrains Mono"'; ctx.textAlign = 'center';
    ctx.fillText('DEPLOY', w*0.92, h*0.15);
    ctx.fillText('OK', w*0.92, h*0.165);
  }

  // Lobby — rotating display board
  if(floorId === 'f1') {
    const msgs = ['Welcome to BlackRoad OS','Pave Tomorrow','hq.blackroad.io','52 TOPS Edge AI','Delaware C Corp'];
    const visMsg = msgs[Math.floor(t*0.2)%msgs.length];
    ctx.fillStyle = 'rgba(255,29,108,0.04)'; ctx.font = '10px "Space Grotesk"'; ctx.textAlign = 'center';
    ctx.fillText(visMsg, w*0.5, h*0.98);
  }

  // Gym — rep counter
  if(floorId === 'b3') {
    const reps = Math.floor(Math.abs(Math.sin(t*0.5))*12)+1;
    ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.font = '20px "Space Grotesk"'; ctx.textAlign = 'center';
    ctx.fillText(reps, w*0.2, h*0.72);
    ctx.font = '7px "JetBrains Mono"'; ctx.fillText('REPS', w*0.2, h*0.75);
  }
};
