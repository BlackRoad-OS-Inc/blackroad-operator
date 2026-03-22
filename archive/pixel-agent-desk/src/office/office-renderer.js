/**
 * Office Renderer — Canvas render loop, layer compositing, effects
 * Ported from pixel_office renderer.ts (rendering parts)
 */

/* eslint-disable no-unused-vars */

var officeRenderer = {
  canvas: null,
  ctx: null,
  rafId: 0,
  lastTime: 0,
  effects: [],
  laptopImages: { down: null, up: null, left: null, right: null },
  laptopOpenImages: { down: null, up: null, left: null, right: null },

  async init(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // 1. Load layers (bg/fg)
    await buildOfficeLayers();
    canvas.width = officeLayers.width;
    canvas.height = officeLayers.height;

    // 2. Build pathfinder
    await officePathfinder.init(officeLayers.width, officeLayers.height);

    // 3. Parse coordinates
    await parseMapCoordinates(officeLayers.width, officeLayers.height);

    // 4. Load all skins + laptop images in parallel
    const resMap = { down: 'front', up: 'back', left: 'left', right: 'right' };
    const directions = ['down', 'up', 'left', 'right'];
    const self = this;
    const ts = Date.now();

    const promises = [loadAllOfficeSkins()];
    directions.forEach(function (d) {
      promises.push(new Promise(function (resolve) {
        const img = new Image();
        img.src = '/public/office/ojects/office_laptop_' + resMap[d] + '_close.webp?v=' + ts;
        img.onload = function () { self.laptopImages[d] = img; resolve(); };
        img.onerror = function () { resolve(); };
      }));
      promises.push(new Promise(function (resolve) {
        const img = new Image();
        img.src = '/public/office/ojects/office_laptop_' + resMap[d] + '_open.webp?v=' + ts;
        img.onload = function () { self.laptopOpenImages[d] = img; resolve(); };
        img.onerror = function () { resolve(); };
      }));
    });

    await Promise.all(promises);

    // 5. Parse laptop object coords
    await parseObjectCoordinates(officeLayers.width, officeLayers.height);

    this.lastTime = performance.now();
    this.loop(this.lastTime);
  },

  stop: function () {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;
  },

  resume: function () {
    if (this.rafId) return; // already running
    if (!this.canvas) return;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  },

  loop: function (now) {
    const self = this;
    self.rafId = requestAnimationFrame(function (t) { self.loop(t); });
    const deltaMs = Math.min(now - self.lastTime, 100);
    self.lastTime = now;
    self.update(deltaMs);
    self.render();
  },

  update: function (deltaMs) {
    const deltaSec = deltaMs / 1000;
    officeCharacters.updateAll(deltaSec, deltaMs);
    this.updateEffects(deltaMs);
  },

  render: function () {
    if (!this.ctx || !officeLayers.bgImage) return;
    const ctx = this.ctx;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. Background
    ctx.drawImage(officeLayers.bgImage, 0, 0);

    // 2. Laptops
    const laptopSpots = officeCoords.laptopSpots || [];
    const chars = officeCharacters.getCharacterArray();
    for (let i = 0; i < laptopSpots.length; i++) {
      const spot = laptopSpots[i];
      const seatId = LAPTOP_ID_MAP[i] !== undefined ? LAPTOP_ID_MAP[i] : i;

      const isAtDesk = chars.some(function (a) {
        return a.deskIndex === seatId &&
          (a.agentState === 'working' || a.agentState === 'thinking' ||
           a.agentState === 'error' || a.agentState === 'help');
      });

      const img = isAtDesk ? this.laptopOpenImages[spot.dir] : this.laptopImages[spot.dir];
      if (img) ctx.drawImage(img, spot.x, spot.y);
    }

    // 3. Characters (Y-sorted)
    const sorted = chars.slice().sort(function (a, b) { return a.y - b.y; });

    for (let j = 0; j < sorted.length; j++) {
      const agent = sorted[j];

      if (agent.agentState === 'error') {
        if (Math.random() < 0.1) this.spawnEffect('warning', agent.x, agent.y - 65);
      }

      const isSubType = agent.metadata && agent.metadata.type === 'sub';
      const baseScale = isSubType ? 0.85 : 1.0;

      ctx.save();
      ctx.translate(agent.x, agent.y);
      ctx.scale(baseScale, baseScale);
      ctx.translate(-agent.x, -agent.y);
      drawOfficeSprite(ctx, agent);
      ctx.restore();

      drawOfficeNameTag(ctx, agent);
      drawOfficeBubble(ctx, agent);
    }

    // 4. Foreground
    if (officeLayers.fgImage && officeLayers.fgImage.complete && officeLayers.fgImage.naturalWidth > 0) {
      ctx.drawImage(officeLayers.fgImage, 0, 0);
    }

    // 5. Effects
    this.renderEffects(ctx);
  },

  spawnEffect: function (type, x, y) {
    const id = Math.random().toString(36).substr(2, 9);
    const now = performance.now();

    if (type === 'confetti') {
      const colors = ['#ff4d4d', '#ffeb3b', '#4caf50', '#2196f3', '#e91e63', '#9c27b0'];
      for (let i = 0; i < 20; i++) {
        this.effects.push({
          id: id + i, type: type,
          x: x + (Math.random() - 0.5) * 10, y: y - 5,
          vx: (Math.random() - 0.5) * 6, vy: -Math.random() * 8 - 2,
          rotation: Math.random() * Math.PI * 2,
          vRotation: (Math.random() - 0.5) * 0.4,
          startTime: now, duration: 1500 + Math.random() * 1000,
          alpha: 1, scale: 0.6 + Math.random() * 0.8,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    } else if (type === 'warning') {
      this.effects.push({
        id: id, type: type, x: x, y: y,
        vx: 0, vy: -0.2, rotation: 0, vRotation: 0,
        startTime: now, duration: 1200, alpha: 1, scale: 1,
      });
    } else if (type === 'focus') {
      this.effects.push({
        id: id, type: type,
        x: x + (Math.random() - 0.5) * 15, y: y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 0.3, vy: -0.4 - Math.random() * 0.4,
        rotation: (Math.random() - 0.5) * 0.2,
        vRotation: (Math.random() - 0.5) * 0.05,
        startTime: now, duration: 1000 + Math.random() * 500,
        alpha: 1, scale: 0.8 + Math.random() * 0.4,
        color: Math.random() > 0.5 ? '#00f2ff' : '#00ffaa',
      });
    } else if (type === 'stateChange') {
      this.effects.push({
        id: id, type: type, x: x, y: y,
        vx: 0, vy: 0, rotation: 0, vRotation: 0,
        startTime: now, duration: 600, alpha: 1, scale: 0.3,
        color: arguments[3] || '#f97316', // 4th argument = color
      });
    }
  },

  updateEffects: function (deltaMs) {
    const now = performance.now();
    this.effects = this.effects.filter(function (fx) {
      const elapsed = now - fx.startTime;
      if (elapsed > fx.duration) return false;
      fx.alpha = 1 - (elapsed / fx.duration);
      fx.x += fx.vx * (deltaMs / 16);
      fx.y += fx.vy * (deltaMs / 16);
      fx.rotation += fx.vRotation * (deltaMs / 16);
      if (fx.type === 'confetti') {
        fx.vy += 0.15;
        fx.vx *= 0.98;
      } else if (fx.type === 'focus') {
        fx.vy -= 0.02;
      }
      return true;
    });
  },

  renderEffects: function (ctx) {
    for (let i = 0; i < this.effects.length; i++) {
      const fx = this.effects[i];
      ctx.save();
      ctx.translate(fx.x, fx.y);
      ctx.rotate(fx.rotation);
      ctx.scale(fx.scale, fx.scale);
      ctx.globalAlpha = fx.alpha;

      if (fx.type === 'confetti') {
        ctx.fillStyle = fx.color || '#fff';
        ctx.fillRect(-2, -3, 4, 6);
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillRect(-2, -3, 2, 2);
      } else if (fx.type === 'warning') {
        const size = 24;
        const wobble = Math.sin(performance.now() * 0.02) * 3;
        ctx.translate(wobble, 0);
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        this._drawTri(ctx, 2, 2, size);
        ctx.fillStyle = '#ffcc00';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        this._drawTri(ctx, 0, 0, size);
        ctx.fill();
        ctx.stroke();
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.fillText('!', 0, 7);
      } else if (fx.type === 'focus') {
        ctx.fillStyle = fx.color || '#fff';
        ctx.font = 'bold 9px "Courier New", monospace';
        ctx.textAlign = 'center';
        const chars = ['0', '1', '{', '}', ';', '>', '_'];
        const charIdx = parseInt(fx.id.slice(-1), 36) % chars.length;
        ctx.fillText(chars[charIdx], 0, 0);
        ctx.shadowBlur = 4;
        ctx.shadowColor = fx.color || '#fff';
        ctx.fillText(chars[charIdx], 0, 0);
      } else if (fx.type === 'stateChange') {
        // Expanding circular ring effect
        const elapsed = performance.now() - fx.startTime;
        const t = elapsed / fx.duration;
        const radius = 8 + t * 20;
        ctx.strokeStyle = fx.color || '#f97316';
        ctx.lineWidth = 2 * (1 - t);
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    }
  },

  _drawTri: function (ctx, x, y, size) {
    const h = size * (Math.sqrt(3) / 2);
    ctx.beginPath();
    ctx.moveTo(x, y - h / 2 - 2);
    ctx.lineTo(x + size / 2 + 2, y + h / 2);
    ctx.lineTo(x - size / 2 - 2, y + h / 2);
    ctx.closePath();
  },
};
