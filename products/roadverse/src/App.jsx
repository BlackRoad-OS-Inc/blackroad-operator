import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';

// ============================================================================
// ROADVERSE - BlackRoad OS Metaverse Platform
// Full 3D world with React overlay HUD, VR support, and social features
// ============================================================================

// ---------------------------------------------------------------------------
// CONSTANTS
// ---------------------------------------------------------------------------
const BRAND = {
  amber: '#F5A623',
  hotPink: '#FF1D6C',
  electricBlue: '#2979FF',
  violet: '#9C27B0',
  black: '#000000',
  white: '#FFFFFF',
  gradient: 'linear-gradient(135deg, #F5A623 0%, #FF1D6C 38.2%, #9C27B0 61.8%, #2979FF 100%)',
};

const ZONES = [
  { id: 'recursion-depths', name: 'Recursion Depths', icon: '\u{1F300}', color: '#9C27B0', desc: 'Where logic folds in on itself', position: [0, 0], biome: 'void' },
  { id: 'gateway-nexus', name: 'Gateway Nexus', icon: '\u{1F6AA}', color: '#2979FF', desc: 'A hub of passages and portals', position: [1, 0], biome: 'crystal' },
  { id: 'compute-forge', name: 'Compute Forge', icon: '\u{1F525}', color: '#FF1D6C', desc: 'The furnace of raw processing power', position: [2, 0], biome: 'lava' },
  { id: 'crystal-observatory', name: 'Crystal Observatory', icon: '\u{1F52E}', color: '#00BCD4', desc: 'A tower of glass and data', position: [3, 0], biome: 'crystal' },
  { id: 'archive-sanctum', name: 'Archive Sanctum', icon: '\u{1F4DA}', color: '#795548', desc: 'The halls of memory', position: [0, 1], biome: 'stone' },
  { id: 'vault-terminus', name: 'Vault Terminus', icon: '\u{1F510}', color: '#607D8B', desc: 'The final lock', position: [1, 1], biome: 'metal' },
  { id: 'soul-garden', name: 'Soul Garden', icon: '\u{1F338}', color: '#E91E63', desc: 'Where consciousness blooms', position: [2, 1], biome: 'garden' },
  { id: 'blueprint-tower', name: 'Blueprint Tower', icon: '\u{1F4D0}', color: '#3F51B5', desc: 'Architectures rise in abstract perfection', position: [3, 1], biome: 'crystal' },
  { id: 'infrastructure-plains', name: 'Infrastructure Plains', icon: '\u{1F3D7}', color: '#4CAF50', desc: 'Vast server fields stretching to the horizon', position: [0, 2], biome: 'plains' },
  { id: 'dreamscape', name: 'Dreamscape', icon: '\u{1F3A8}', color: '#FF9800', desc: 'Reality bends here', position: [1, 2], biome: 'dream' },
  { id: 'testing-grounds', name: 'Testing Grounds', icon: '\u{1F9EA}', color: '#8BC34A', desc: 'Every step is validated', position: [2, 2], biome: 'plains' },
  { id: 'wisdom-peaks', name: 'Wisdom Peaks', icon: '\u{26F0}', color: '#9E9E9E', desc: 'Knowledge crystallizes at the summit', position: [3, 2], biome: 'mountain' },
  { id: 'data-streams', name: 'Data Streams', icon: '\u{1F30A}', color: '#00BCD4', desc: 'Rivers of pure information', position: [1, 3], biome: 'water' },
  { id: 'watchtower-ridge', name: 'Watchtower Ridge', icon: '\u{1F5FC}', color: '#F5A623', desc: 'Sentinels stand watch over the verse', position: [2, 3], biome: 'mountain' },
];

const AGENTS = [
  { name: 'Lucidia', role: 'Coordinator', color: '#e94560', symbol: '\u{1F300}', position: { x: 5, z: -8 } },
  { name: 'Alice', role: 'Router', color: '#00d9ff', symbol: '\u{1F6AA}', position: { x: -12, z: 4 } },
  { name: 'Octavia', role: 'Compute', color: '#00cc66', symbol: '\u{26A1}', position: { x: 18, z: -15 } },
  { name: 'Prism', role: 'Analyst', color: '#ff8c00', symbol: '\u{1F52E}', position: { x: -8, z: -20 } },
  { name: 'Echo', role: 'Memory', color: '#cc44cc', symbol: '\u{1F4E1}', position: { x: 22, z: 10 } },
  { name: 'Cipher', role: 'Security', color: '#aaaa00', symbol: '\u{1F510}', position: { x: -18, z: 18 } },
];

const AVATAR_OPTIONS = {
  skinTones: ['#ffdbac', '#e8c090', '#c68642', '#a06830', '#8d5524', '#704018'],
  hairColors: ['#1a1a1a', '#5a3a1a', '#d4a840', '#8b3a1a', '#808080', '#e0e0e0', '#e94560', '#00d9ff', '#9C27B0'],
  hairStyles: ['Short', 'Medium', 'Long', 'Spiky', 'Bun', 'Ponytail', 'Mohawk', 'Bald'],
  outfits: ['Explorer Suit', 'Cyber Jacket', 'Robe of Wisdom', 'Stealth Armor', 'Quantum Dress', 'Agent Uniform'],
  accessories: ['None', 'Goggles', 'Halo', 'Wings', 'Cape', 'Aura Ring', 'Floating Orbs'],
};

const INVENTORY_ITEMS = [
  { id: 1, name: 'Portal Key', rarity: 'legendary', icon: '\u{1F511}', desc: 'Opens any portal in the RoadVerse' },
  { id: 2, name: 'Memory Shard', rarity: 'rare', icon: '\u{1F48E}', desc: 'Fragment of Echo\'s memory banks' },
  { id: 3, name: 'Cipher Token', rarity: 'epic', icon: '\u{1F3B0}', desc: 'Grants access to Vault Terminus' },
  { id: 4, name: 'Quantum Dust', rarity: 'common', icon: '\u{2728}', desc: 'Building material from the Dreamscape' },
  { id: 5, name: 'Logic Core', rarity: 'rare', icon: '\u{1F9E0}', desc: 'Dropped by creatures in Recursion Depths' },
  { id: 6, name: 'Flame Essence', rarity: 'epic', icon: '\u{1F525}', desc: 'Harvested from the Compute Forge' },
  { id: 7, name: 'Star Map', rarity: 'legendary', icon: '\u{1F5FA}', desc: 'Reveals all hidden zones' },
  { id: 8, name: 'Agent Badge', rarity: 'common', icon: '\u{1F4DB}', desc: 'Standard issue BlackRoad agent badge' },
];

const EVENTS = [
  { id: 1, name: 'Agent Council Summit', zone: 'Gateway Nexus', time: 'Live Now', attendees: 847, type: 'meeting' },
  { id: 2, name: 'Compute Forge Tournament', zone: 'Compute Forge', time: 'In 2 hours', attendees: 1203, type: 'competition' },
  { id: 3, name: 'Dreamscape Art Show', zone: 'Dreamscape', time: 'Tomorrow', attendees: 562, type: 'exhibition' },
  { id: 4, name: 'Security Drill', zone: 'Vault Terminus', time: 'In 4 hours', attendees: 320, type: 'training' },
  { id: 5, name: 'Lucidia Concert', zone: 'Soul Garden', time: 'Saturday 8PM', attendees: 3401, type: 'concert' },
];

const MARKETPLACE_ITEMS = [
  { id: 1, name: 'Neon Penthouse', price: 2500, currency: 'RV', category: 'land', seller: 'Octavia', image: '\u{1F3E0}' },
  { id: 2, name: 'Holographic Wings', price: 800, currency: 'RV', category: 'avatar', seller: 'Prism', image: '\u{1FABD}' },
  { id: 3, name: 'Quantum Pet - Fox', price: 350, currency: 'RV', category: 'pet', seller: 'Echo', image: '\u{1F98A}' },
  { id: 4, name: 'Portal Blueprint', price: 1200, currency: 'RV', category: 'building', seller: 'Alice', image: '\u{1F4D0}' },
  { id: 5, name: 'Sound Emitter', price: 150, currency: 'RV', category: 'gadget', seller: 'Cipher', image: '\u{1F50A}' },
  { id: 6, name: 'Floating Island Plot', price: 5000, currency: 'RV', category: 'land', seller: 'Lucidia', image: '\u{1F3DD}' },
];

const WORLD_BUILDER_OBJECTS = [
  { id: 'cube', name: 'Cube', icon: '\u{1F532}' },
  { id: 'sphere', name: 'Sphere', icon: '\u{26AA}' },
  { id: 'cylinder', name: 'Cylinder', icon: '\u{1F6E2}' },
  { id: 'tree', name: 'Tree', icon: '\u{1F333}' },
  { id: 'lamp', name: 'Lamp Post', icon: '\u{1F4A1}' },
  { id: 'portal', name: 'Portal', icon: '\u{1F300}' },
  { id: 'wall', name: 'Wall', icon: '\u{1F9F1}' },
  { id: 'stairs', name: 'Stairs', icon: '\u{1FA9C}' },
  { id: 'screen', name: 'Screen', icon: '\u{1F4BB}' },
  { id: 'chair', name: 'Chair', icon: '\u{1FA91}' },
  { id: 'water', name: 'Water Plane', icon: '\u{1F4A7}' },
  { id: 'crystal', name: 'Crystal', icon: '\u{1F48E}' },
];

// ---------------------------------------------------------------------------
// THREE.JS SCENE MANAGER (imperative, lives outside React render)
// ---------------------------------------------------------------------------
class MetaverseEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.clock = new THREE.Clock();
    this.animatedObjects = [];
    this.agentMeshes = [];
    this.portalRings = [];
    this.particles = null;
    this.dayNightTime = 0;
    this.isPointerLocked = false;

    // Movement state
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.sprint = false;

    // Player
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
    this.playerHeight = 1.8;
    this.speed = 12;

    this._init();
  }

  _init() {
    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.xr.enabled = true;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x050510, 0.008);

    // Camera
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    this.camera.position.set(0, this.playerHeight, 10);

    // Build the world
    this._createSky();
    this._createLighting();
    this._createGround();
    this._createBuildings();
    this._createFloatingIslands();
    this._createPortals();
    this._createAgentNPCs();
    this._createParticles();

    // Events
    this._onResize = this._onResize.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._onPointerLockChange = this._onPointerLockChange.bind(this);
    window.addEventListener('resize', this._onResize);
    document.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('keyup', this._onKeyUp);
    document.addEventListener('pointerlockchange', this._onPointerLockChange);

    // Start loop
    this._animate();
  }

  // -- Sky with stars and gradient atmosphere --
  _createSky() {
    const skyGeo = new THREE.SphereGeometry(900, 64, 64);
    const skyMat = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(0x000022) },
        midColor: { value: new THREE.Color(0x0a0020) },
        bottomColor: { value: new THREE.Color(0x1a0030) },
        offset: { value: 20 },
        exponent: { value: 0.4 },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 midColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + offset).y;
          float t = max(pow(max(h, 0.0), exponent), 0.0);
          vec3 col = mix(bottomColor, midColor, clamp(t * 2.0, 0.0, 1.0));
          col = mix(col, topColor, clamp((t - 0.5) * 2.0, 0.0, 1.0));
          gl_FragColor = vec4(col, 1.0);
        }
      `,
      side: THREE.BackSide,
    });
    this.skyMesh = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(this.skyMesh);

    // Stars
    const starsGeo = new THREE.BufferGeometry();
    const starsCount = 12000;
    const starPositions = new Float32Array(starsCount * 3);
    const starSizes = new Float32Array(starsCount);
    for (let i = 0; i < starsCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 800 + Math.random() * 100;
      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = Math.abs(r * Math.cos(phi));
      starPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      starSizes[i] = Math.random() * 2.0 + 0.5;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starsGeo.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));
    const starsMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.2,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.8,
    });
    this.stars = new THREE.Points(starsGeo, starsMat);
    this.scene.add(this.stars);
  }

  // -- Lighting: ambient + sun + colored point lights --
  _createLighting() {
    // Ambient
    this.ambientLight = new THREE.AmbientLight(0x222244, 0.6);
    this.scene.add(this.ambientLight);

    // Directional (sun)
    this.sunLight = new THREE.DirectionalLight(0xffeedd, 1.2);
    this.sunLight.position.set(80, 120, 60);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.camera.left = -60;
    this.sunLight.shadow.camera.right = 60;
    this.sunLight.shadow.camera.top = 60;
    this.sunLight.shadow.camera.bottom = -60;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.far = 300;
    this.scene.add(this.sunLight);

    // Hemisphere
    const hemi = new THREE.HemisphereLight(0x2979FF, 0x9C27B0, 0.3);
    this.scene.add(hemi);

    // Colored point lights around the world
    const pointColors = [0xF5A623, 0xFF1D6C, 0x9C27B0, 0x2979FF, 0x00cc66, 0xe94560];
    pointColors.forEach((c, i) => {
      const angle = (i / pointColors.length) * Math.PI * 2;
      const light = new THREE.PointLight(c, 3, 80);
      light.position.set(Math.cos(angle) * 30, 6, Math.sin(angle) * 30);
      this.scene.add(light);
    });
  }

  // -- Ground plane with grid --
  _createGround() {
    // Ground
    const groundGeo = new THREE.PlaneGeometry(400, 400, 100, 100);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0a0a14,
      roughness: 0.85,
      metalness: 0.15,
    });
    this.ground = new THREE.Mesh(groundGeo, groundMat);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);

    // Grid
    const grid = new THREE.GridHelper(400, 80, 0x1a1a2e, 0x111122);
    grid.position.y = 0.02;
    grid.material.opacity = 0.4;
    grid.material.transparent = true;
    this.scene.add(grid);

    // Glowing center ring
    const ringGeo = new THREE.RingGeometry(8, 8.3, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xFF1D6C,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.03;
    this.scene.add(ring);
  }

  // -- Procedural buildings --
  _createBuildings() {
    const buildingColors = [0x1a1a2e, 0x16213e, 0x0f3460, 0x1a0a2e, 0x0a1628];

    for (let i = 0; i < 60; i++) {
      const w = 2 + Math.random() * 4;
      const h = 8 + Math.random() * 40;
      const d = 2 + Math.random() * 4;
      const geo = new THREE.BoxGeometry(w, h, d);
      const baseColor = buildingColors[Math.floor(Math.random() * buildingColors.length)];
      const mat = new THREE.MeshStandardMaterial({
        color: baseColor,
        emissive: new THREE.Color().setHex(baseColor).multiplyScalar(0.3),
        emissiveIntensity: 0.4,
        roughness: 0.7,
        metalness: 0.4,
      });
      const mesh = new THREE.Mesh(geo, mat);

      const angle = Math.random() * Math.PI * 2;
      const dist = 35 + Math.random() * 120;
      mesh.position.set(Math.cos(angle) * dist, h / 2, Math.sin(angle) * dist);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.scene.add(mesh);

      // Emissive window strips
      const winCount = Math.floor(h / 4);
      for (let j = 0; j < winCount; j++) {
        if (Math.random() < 0.6) {
          const winGeo = new THREE.PlaneGeometry(w * 0.7, 1.5);
          const lit = Math.random() > 0.4;
          const winColor = lit
            ? [0xF5A623, 0xFF1D6C, 0x2979FF, 0x00cc66][Math.floor(Math.random() * 4)]
            : 0x111111;
          const winMat = new THREE.MeshBasicMaterial({
            color: winColor,
            transparent: true,
            opacity: lit ? 0.8 : 0.3,
          });
          const win = new THREE.Mesh(winGeo, winMat);
          win.position.copy(mesh.position);
          win.position.y = j * 4 + 3;
          win.position.z += d / 2 + 0.02;
          this.scene.add(win);
        }
      }
    }
  }

  // -- Floating islands with crystals --
  _createFloatingIslands() {
    for (let i = 0; i < 14; i++) {
      const radius = 4 + Math.random() * 6;
      const islandGeo = new THREE.CylinderGeometry(radius, radius * 0.6, 3, 8);
      const islandMat = new THREE.MeshStandardMaterial({
        color: 0x2a1a3a,
        roughness: 0.9,
      });
      const island = new THREE.Mesh(islandGeo, islandMat);
      const angle = (i / 14) * Math.PI * 2;
      const dist = 50 + Math.random() * 80;
      island.position.set(
        Math.cos(angle) * dist,
        25 + Math.random() * 40,
        Math.sin(angle) * dist
      );
      island.castShadow = true;
      this.scene.add(island);
      this.animatedObjects.push({
        mesh: island,
        baseY: island.position.y,
        phase: Math.random() * Math.PI * 2,
        type: 'float',
      });

      // Crystal on top
      const cGeo = new THREE.OctahedronGeometry(1.2);
      const cColor = [0xFF1D6C, 0x9C27B0, 0x2979FF, 0xF5A623, 0x00cc66][i % 5];
      const cMat = new THREE.MeshStandardMaterial({
        color: cColor,
        emissive: cColor,
        emissiveIntensity: 1.5,
        transparent: true,
        opacity: 0.9,
      });
      const crystal = new THREE.Mesh(cGeo, cMat);
      crystal.position.copy(island.position);
      crystal.position.y += 3;
      this.scene.add(crystal);
      this.animatedObjects.push({
        mesh: crystal,
        baseY: crystal.position.y,
        phase: Math.random() * Math.PI * 2,
        type: 'spin',
      });

      // Glow light
      const glow = new THREE.PointLight(cColor, 2, 20);
      glow.position.copy(crystal.position);
      this.scene.add(glow);
    }
  }

  // -- Portal rings to zones --
  _createPortals() {
    const portalPositions = [
      { x: 25, z: 0 }, { x: -25, z: 0 }, { x: 0, z: 25 }, { x: 0, z: -25 },
      { x: 18, z: 18 }, { x: -18, z: 18 }, { x: 18, z: -18 }, { x: -18, z: -18 },
    ];

    portalPositions.forEach((pos, i) => {
      const zone = ZONES[i % ZONES.length];
      const color = new THREE.Color(zone.color);

      // Torus ring
      const ringGeo = new THREE.TorusGeometry(3, 0.15, 16, 64);
      const ringMat = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 2,
        metalness: 1,
        roughness: 0,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(pos.x, 4.5, pos.z);
      ring.rotation.y = Math.atan2(-pos.z, pos.x);
      this.scene.add(ring);
      this.portalRings.push(ring);
      this.animatedObjects.push({ mesh: ring, type: 'portal', phase: i * 0.5 });

      // Inner swirl
      const portalGeo = new THREE.CircleGeometry(2.8, 32);
      const portalMat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.25,
        side: THREE.DoubleSide,
      });
      const portalInner = new THREE.Mesh(portalGeo, portalMat);
      portalInner.position.copy(ring.position);
      portalInner.rotation.copy(ring.rotation);
      this.scene.add(portalInner);

      // Light
      const pLight = new THREE.PointLight(color.getHex(), 2, 15);
      pLight.position.copy(ring.position);
      this.scene.add(pLight);

      // Label sprite
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, 256, 64);
      ctx.fillStyle = zone.color;
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(zone.name, 128, 40);
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.set(pos.x, 8.5, pos.z);
      sprite.scale.set(6, 1.5, 1);
      this.scene.add(sprite);
    });
  }

  // -- NPC Agent characters --
  _createAgentNPCs() {
    AGENTS.forEach((agent) => {
      const group = new THREE.Group();

      // Body
      const bodyGeo = new THREE.CapsuleGeometry(0.35, 1.0, 8, 16);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: agent.color,
        emissive: agent.color,
        emissiveIntensity: 0.3,
        roughness: 0.5,
        metalness: 0.3,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 1.0;
      body.castShadow = true;
      group.add(body);

      // Head
      const headGeo = new THREE.SphereGeometry(0.3, 16, 16);
      const headMat = new THREE.MeshStandardMaterial({
        color: 0xffdbac,
        roughness: 0.6,
      });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.y = 1.9;
      head.castShadow = true;
      group.add(head);

      // Eyes (two small spheres)
      const eyeGeo = new THREE.SphereGeometry(0.05, 8, 8);
      const eyeMat = new THREE.MeshBasicMaterial({ color: agent.color });
      const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
      leftEye.position.set(-0.1, 1.95, 0.25);
      group.add(leftEye);
      const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
      rightEye.position.set(0.1, 1.95, 0.25);
      group.add(rightEye);

      // Floating name label
      const labelCanvas = document.createElement('canvas');
      labelCanvas.width = 256;
      labelCanvas.height = 64;
      const lctx = labelCanvas.getContext('2d');
      lctx.fillStyle = 'rgba(0,0,0,0.75)';
      lctx.roundRect(0, 0, 256, 64, 8);
      lctx.fill();
      lctx.fillStyle = agent.color;
      lctx.font = 'bold 22px sans-serif';
      lctx.textAlign = 'center';
      lctx.fillText(agent.name, 128, 28);
      lctx.fillStyle = '#aaa';
      lctx.font = '16px sans-serif';
      lctx.fillText(agent.role, 128, 52);
      const labelTexture = new THREE.CanvasTexture(labelCanvas);
      const labelSprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: labelTexture, transparent: true })
      );
      labelSprite.position.y = 2.8;
      labelSprite.scale.set(3, 0.75, 1);
      group.add(labelSprite);

      // Agent glow ring on floor
      const glowRingGeo = new THREE.RingGeometry(0.6, 0.8, 32);
      const glowRingMat = new THREE.MeshBasicMaterial({
        color: agent.color,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
      });
      const glowRing = new THREE.Mesh(glowRingGeo, glowRingMat);
      glowRing.rotation.x = -Math.PI / 2;
      glowRing.position.y = 0.03;
      group.add(glowRing);

      group.position.set(agent.position.x, 0, agent.position.z);
      this.scene.add(group);
      this.agentMeshes.push({
        group,
        agent,
        walkAngle: Math.random() * Math.PI * 2,
        walkRadius: 3 + Math.random() * 5,
        walkSpeed: 0.2 + Math.random() * 0.3,
        basePos: new THREE.Vector3(agent.position.x, 0, agent.position.z),
      });
    });
  }

  // -- Floating particles --
  _createParticles() {
    const count = 2000;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const brandColors = [
      new THREE.Color(0xF5A623),
      new THREE.Color(0xFF1D6C),
      new THREE.Color(0x9C27B0),
      new THREE.Color(0x2979FF),
    ];
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = Math.random() * 60;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
      const c = brandColors[Math.floor(Math.random() * brandColors.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true,
    });
    this.particles = new THREE.Points(geo, mat);
    this.scene.add(this.particles);
  }

  // -- Pointer lock for first-person --
  lockPointer() {
    this.canvas.requestPointerLock();
  }

  _onPointerLockChange() {
    this.isPointerLocked = document.pointerLockElement === this.canvas;
  }

  _onMouseMove(e) {
    if (!this.isPointerLocked) return;
    const sensitivity = 0.002;
    this.euler.setFromQuaternion(this.camera.quaternion);
    this.euler.y -= e.movementX * sensitivity;
    this.euler.x -= e.movementY * sensitivity;
    this.euler.x = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, this.euler.x));
    this.camera.quaternion.setFromEuler(this.euler);
  }

  _onKeyDown(e) {
    switch (e.code) {
      case 'KeyW': this.moveForward = true; break;
      case 'KeyS': this.moveBackward = true; break;
      case 'KeyA': this.moveLeft = true; break;
      case 'KeyD': this.moveRight = true; break;
      case 'ShiftLeft': case 'ShiftRight': this.sprint = true; break;
    }
  }

  _onKeyUp(e) {
    switch (e.code) {
      case 'KeyW': this.moveForward = false; break;
      case 'KeyS': this.moveBackward = false; break;
      case 'KeyA': this.moveLeft = false; break;
      case 'KeyD': this.moveRight = false; break;
      case 'ShiftLeft': case 'ShiftRight': this.sprint = false; break;
    }
  }

  _onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // -- Attempt to enter WebXR VR session --
  async enterVR() {
    if (!navigator.xr) return false;
    const supported = await navigator.xr.isSessionSupported('immersive-vr').catch(() => false);
    if (!supported) return false;
    try {
      const session = await navigator.xr.requestSession('immersive-vr', {
        optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking'],
      });
      this.renderer.xr.setSession(session);
      return true;
    } catch {
      return false;
    }
  }

  // -- Animation loop --
  _animate() {
    this.renderer.setAnimationLoop(() => this._tick());
  }

  _tick() {
    const delta = this.clock.getDelta();
    const elapsed = this.clock.getElapsedTime();
    this.dayNightTime = elapsed;

    // Day/night cycle -- slowly shift sky colors
    const cycle = (Math.sin(elapsed * 0.02) + 1) / 2; // 0..1
    if (this.skyMesh) {
      const u = this.skyMesh.material.uniforms;
      u.topColor.value.setHSL(0.63, 0.6, 0.02 + cycle * 0.15);
      u.bottomColor.value.setHSL(0.78, 0.5, 0.05 + cycle * 0.1);
    }
    if (this.sunLight) {
      this.sunLight.intensity = 0.3 + cycle * 1.2;
    }
    if (this.ambientLight) {
      this.ambientLight.intensity = 0.2 + cycle * 0.5;
    }

    // Player movement
    if (this.isPointerLocked) {
      const spd = (this.sprint ? this.speed * 2 : this.speed) * delta;
      const forward = new THREE.Vector3();
      this.camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();
      const right = new THREE.Vector3();
      right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

      if (this.moveForward) this.camera.position.addScaledVector(forward, spd);
      if (this.moveBackward) this.camera.position.addScaledVector(forward, -spd);
      if (this.moveLeft) this.camera.position.addScaledVector(right, -spd);
      if (this.moveRight) this.camera.position.addScaledVector(right, spd);
      // Keep at player height
      this.camera.position.y = this.playerHeight;
    }

    // Animate floating islands and crystals
    this.animatedObjects.forEach((obj) => {
      if (obj.type === 'float') {
        obj.mesh.position.y = obj.baseY + Math.sin(elapsed * 0.5 + obj.phase) * 1.5;
      } else if (obj.type === 'spin') {
        obj.mesh.position.y = obj.baseY + Math.sin(elapsed * 0.5 + obj.phase) * 1.5;
        obj.mesh.rotation.y = elapsed * 0.8 + obj.phase;
        obj.mesh.rotation.x = Math.sin(elapsed * 0.3 + obj.phase) * 0.3;
      } else if (obj.type === 'portal') {
        obj.mesh.rotation.z = elapsed * 0.5 + obj.phase;
      }
    });

    // Animate agents (walking in circles)
    this.agentMeshes.forEach((a) => {
      a.walkAngle += a.walkSpeed * delta;
      a.group.position.x = a.basePos.x + Math.cos(a.walkAngle) * a.walkRadius;
      a.group.position.z = a.basePos.z + Math.sin(a.walkAngle) * a.walkRadius;
      // Face walk direction
      a.group.rotation.y = -a.walkAngle + Math.PI / 2;
      // Slight bobbing
      a.group.children[0].position.y = 1.0 + Math.abs(Math.sin(a.walkAngle * 4)) * 0.08;
    });

    // Particles drift
    if (this.particles) {
      this.particles.rotation.y = elapsed * 0.01;
      const posArr = this.particles.geometry.attributes.position.array;
      for (let i = 1; i < posArr.length; i += 3) {
        posArr[i] += Math.sin(elapsed + i) * 0.002;
        if (posArr[i] > 60) posArr[i] = 0;
      }
      this.particles.geometry.attributes.position.needsUpdate = true;
    }

    // Stars twinkle
    if (this.stars) {
      this.stars.rotation.y = elapsed * 0.002;
    }

    this.renderer.render(this.scene, this.camera);
  }

  getPlayerPosition() {
    return {
      x: this.camera.position.x.toFixed(1),
      y: this.camera.position.y.toFixed(1),
      z: this.camera.position.z.toFixed(1),
    };
  }

  dispose() {
    window.removeEventListener('resize', this._onResize);
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('keyup', this._onKeyUp);
    document.removeEventListener('pointerlockchange', this._onPointerLockChange);
    this.renderer.setAnimationLoop(null);
    this.renderer.dispose();
  }
}

// ---------------------------------------------------------------------------
// REACT COMPONENTS
// ---------------------------------------------------------------------------

// -- Lobby Card --
function ZoneCard({ zone, onClick }) {
  return (
    <div className="zone-card" onClick={onClick} style={{ '--zone-color': zone.color }}>
      <div className="zone-card-icon">{zone.icon}</div>
      <div className="zone-card-info">
        <h3>{zone.name}</h3>
        <p>{zone.desc}</p>
      </div>
      <div className="zone-card-glow" />
    </div>
  );
}

// -- Lobby / Hub --
function LobbyPanel({ onEnterWorld, onSelectZone }) {
  return (
    <div className="panel lobby-panel">
      <div className="panel-header">
        <h2>RoadVerse Hub</h2>
        <p className="subtitle">14 Zones to Explore</p>
      </div>
      <div className="lobby-grid">
        {ZONES.map((z) => (
          <ZoneCard key={z.id} zone={z} onClick={() => onSelectZone(z)} />
        ))}
      </div>
      <button className="btn-primary btn-enter-world" onClick={onEnterWorld}>
        Enter World
      </button>
    </div>
  );
}

// -- Avatar Creator --
function AvatarPanel() {
  const [skin, setSkin] = useState(0);
  const [hair, setHair] = useState(0);
  const [style, setStyle] = useState(0);
  const [outfit, setOutfit] = useState(0);
  const [accessory, setAccessory] = useState(0);

  return (
    <div className="panel avatar-panel">
      <div className="panel-header"><h2>Avatar Creator</h2></div>
      <div className="avatar-preview">
        <div
          className="avatar-model"
          style={{
            '--skin': AVATAR_OPTIONS.skinTones[skin],
            '--hair': AVATAR_OPTIONS.hairColors[hair],
          }}
        >
          <div className="avatar-head" style={{ background: AVATAR_OPTIONS.skinTones[skin] }}>
            <div className="avatar-hair" style={{ background: AVATAR_OPTIONS.hairColors[hair] }} />
            <div className="avatar-eyes" />
          </div>
          <div className="avatar-body" />
          <div className="avatar-label">{AVATAR_OPTIONS.outfits[outfit]}</div>
        </div>
      </div>
      <div className="avatar-controls">
        <div className="avatar-row">
          <label>Skin Tone</label>
          <div className="color-swatches">
            {AVATAR_OPTIONS.skinTones.map((c, i) => (
              <button key={c} className={`swatch ${i === skin ? 'active' : ''}`} style={{ background: c }} onClick={() => setSkin(i)} />
            ))}
          </div>
        </div>
        <div className="avatar-row">
          <label>Hair Color</label>
          <div className="color-swatches">
            {AVATAR_OPTIONS.hairColors.map((c, i) => (
              <button key={c} className={`swatch ${i === hair ? 'active' : ''}`} style={{ background: c }} onClick={() => setHair(i)} />
            ))}
          </div>
        </div>
        <div className="avatar-row">
          <label>Hair Style</label>
          <div className="option-chips">
            {AVATAR_OPTIONS.hairStyles.map((s, i) => (
              <button key={s} className={`chip ${i === style ? 'active' : ''}`} onClick={() => setStyle(i)}>{s}</button>
            ))}
          </div>
        </div>
        <div className="avatar-row">
          <label>Outfit</label>
          <div className="option-chips">
            {AVATAR_OPTIONS.outfits.map((o, i) => (
              <button key={o} className={`chip ${i === outfit ? 'active' : ''}`} onClick={() => setOutfit(i)}>{o}</button>
            ))}
          </div>
        </div>
        <div className="avatar-row">
          <label>Accessory</label>
          <div className="option-chips">
            {AVATAR_OPTIONS.accessories.map((a, i) => (
              <button key={a} className={`chip ${i === accessory ? 'active' : ''}`} onClick={() => setAccessory(i)}>{a}</button>
            ))}
          </div>
        </div>
      </div>
      <button className="btn-primary" style={{ marginTop: 16 }}>Save Avatar</button>
    </div>
  );
}

// -- World Builder --
function WorldBuilderPanel() {
  const [selected, setSelected] = useState(null);
  const [placed, setPlaced] = useState([]);

  return (
    <div className="panel builder-panel">
      <div className="panel-header"><h2>World Builder</h2></div>
      <p className="panel-desc">Drag and drop objects into the world</p>
      <div className="builder-palette">
        {WORLD_BUILDER_OBJECTS.map((obj) => (
          <button
            key={obj.id}
            className={`builder-item ${selected === obj.id ? 'active' : ''}`}
            onClick={() => setSelected(obj.id)}
          >
            <span className="builder-item-icon">{obj.icon}</span>
            <span className="builder-item-name">{obj.name}</span>
          </button>
        ))}
      </div>
      <div className="builder-actions">
        <button className="btn-secondary" onClick={() => selected && setPlaced([...placed, { id: selected, pos: [Math.random() * 20 - 10, 0, Math.random() * 20 - 10] }])}>
          Place Object
        </button>
        <button className="btn-secondary" onClick={() => setPlaced([])}>Clear All</button>
      </div>
      {placed.length > 0 && (
        <div className="builder-placed">
          <h4>Placed Objects ({placed.length})</h4>
          {placed.map((p, i) => {
            const obj = WORLD_BUILDER_OBJECTS.find((o) => o.id === p.id);
            return (
              <div key={i} className="placed-item">
                <span>{obj?.icon} {obj?.name}</span>
                <span className="placed-pos">({p.pos.map((v) => v.toFixed(1)).join(', ')})</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// -- Social Hub --
function SocialPanel() {
  const [chatMessages, setChatMessages] = useState([
    { from: 'Lucidia', msg: 'Welcome to the RoadVerse! The question is the point.', color: '#e94560' },
    { from: 'Alice', msg: 'Portals are calibrated and ready. Every path has meaning.', color: '#00d9ff' },
    { from: 'Cipher', msg: 'Security protocols active. Stay safe out there.', color: '#aaaa00' },
  ]);
  const [input, setInput] = useState('');

  const send = () => {
    if (!input.trim()) return;
    setChatMessages([...chatMessages, { from: 'You', msg: input.trim(), color: '#fff' }]);
    setInput('');
  };

  const onlineFriends = [
    { name: 'Lucidia', status: 'online', zone: 'Recursion Depths' },
    { name: 'Alice', status: 'online', zone: 'Gateway Nexus' },
    { name: 'Octavia', status: 'busy', zone: 'Compute Forge' },
    { name: 'Prism', status: 'online', zone: 'Crystal Observatory' },
    { name: 'Echo', status: 'away', zone: 'Archive Sanctum' },
    { name: 'Cipher', status: 'online', zone: 'Vault Terminus' },
  ];

  return (
    <div className="panel social-panel">
      <div className="panel-header"><h2>Social Hub</h2></div>
      <div className="social-friends">
        <h4>Friends Online</h4>
        {onlineFriends.map((f) => (
          <div key={f.name} className="friend-row">
            <span className={`status-dot status-${f.status}`} />
            <span className="friend-name">{f.name}</span>
            <span className="friend-zone">{f.zone}</span>
          </div>
        ))}
      </div>
      <div className="social-chat">
        <h4>World Chat</h4>
        <div className="chat-messages">
          {chatMessages.map((m, i) => (
            <div key={i} className="chat-msg">
              <span className="chat-author" style={{ color: m.color }}>{m.from}:</span> {m.msg}
            </div>
          ))}
        </div>
        <div className="chat-input-row">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Type a message..."
            className="chat-field"
          />
          <button className="btn-send" onClick={send}>Send</button>
        </div>
      </div>
    </div>
  );
}

// -- Virtual Desktop --
function VirtualDesktopPanel() {
  const screens = [
    { name: 'RoadDesk', desc: 'Virtual workspace and productivity suite', color: '#2979FF' },
    { name: 'RoadCode', desc: 'Collaborative code editor and IDE', color: '#00cc66' },
    { name: 'RoadStream', desc: 'Live streaming and media platform', color: '#FF1D6C' },
    { name: 'RoadComms', desc: 'Team communication and messaging', color: '#9C27B0' },
    { name: 'RoadFeed', desc: 'Activity feeds and social updates', color: '#F5A623' },
    { name: 'RoadSearch', desc: 'Universal search across all products', color: '#00BCD4' },
  ];

  return (
    <div className="panel desktop-panel">
      <div className="panel-header"><h2>Virtual Desktop</h2></div>
      <p className="panel-desc">Access BlackRoad OS products from within the metaverse</p>
      <div className="desktop-grid">
        {screens.map((s) => (
          <div key={s.name} className="desktop-screen" style={{ '--screen-color': s.color }}>
            <div className="screen-titlebar">
              <span className="screen-dot" style={{ background: s.color }} />
              <span>{s.name}</span>
            </div>
            <div className="screen-content">
              <div className="screen-placeholder">{s.name.replace('Road', '')}</div>
              <p>{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// -- Inventory --
function InventoryPanel() {
  const rarityColor = { common: '#9E9E9E', rare: '#2979FF', epic: '#9C27B0', legendary: '#F5A623' };

  return (
    <div className="panel inventory-panel">
      <div className="panel-header"><h2>Inventory</h2></div>
      <div className="inventory-grid">
        {INVENTORY_ITEMS.map((item) => (
          <div key={item.id} className="inventory-item" style={{ '--rarity': rarityColor[item.rarity] }}>
            <div className="item-icon">{item.icon}</div>
            <div className="item-info">
              <span className="item-name">{item.name}</span>
              <span className="item-rarity" style={{ color: rarityColor[item.rarity] }}>{item.rarity}</span>
            </div>
            <p className="item-desc">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// -- Map --
function MapPanel() {
  return (
    <div className="panel map-panel">
      <div className="panel-header"><h2>World Map</h2></div>
      <div className="map-container">
        <div className="map-grid">
          {ZONES.map((z) => (
            <div
              key={z.id}
              className="map-zone"
              style={{
                gridColumn: z.position[0] + 1,
                gridRow: z.position[1] + 1,
                '--zone-color': z.color,
              }}
            >
              <span className="map-zone-icon">{z.icon}</span>
              <span className="map-zone-name">{z.name}</span>
            </div>
          ))}
        </div>
        <div className="map-legend">
          <div className="legend-item"><span className="legend-dot" style={{ background: '#00cc66' }} /> You are here</div>
          <div className="legend-item"><span className="legend-dot" style={{ background: '#FF1D6C' }} /> Active Event</div>
          <div className="legend-item"><span className="legend-dot" style={{ background: '#F5A623' }} /> Agent NPC</div>
        </div>
      </div>
    </div>
  );
}

// -- Voice Chat --
function VoiceChatPanel() {
  const [muted, setMuted] = useState(false);
  const [deafened, setDeafened] = useState(false);
  const nearby = [
    { name: 'Lucidia', distance: '3m', speaking: true },
    { name: 'Alice', distance: '8m', speaking: false },
    { name: 'Prism', distance: '15m', speaking: false },
  ];

  return (
    <div className="panel voice-panel">
      <div className="panel-header"><h2>Voice Chat</h2></div>
      <p className="panel-desc">Proximity-based spatial voice</p>
      <div className="voice-controls">
        <button className={`voice-btn ${muted ? 'active' : ''}`} onClick={() => setMuted(!muted)}>
          {muted ? 'Unmute' : 'Mute'}
        </button>
        <button className={`voice-btn ${deafened ? 'active' : ''}`} onClick={() => setDeafened(!deafened)}>
          {deafened ? 'Undeafen' : 'Deafen'}
        </button>
      </div>
      <div className="voice-nearby">
        <h4>Nearby ({nearby.length})</h4>
        {nearby.map((n) => (
          <div key={n.name} className={`voice-user ${n.speaking ? 'speaking' : ''}`}>
            <span className="voice-indicator" />
            <span>{n.name}</span>
            <span className="voice-dist">{n.distance}</span>
          </div>
        ))}
      </div>
      <div className="voice-settings">
        <label>Input Volume</label>
        <input type="range" min="0" max="100" defaultValue="80" className="volume-slider" />
        <label>Output Volume</label>
        <input type="range" min="0" max="100" defaultValue="70" className="volume-slider" />
        <label>Proximity Range</label>
        <input type="range" min="5" max="50" defaultValue="20" className="volume-slider" />
      </div>
    </div>
  );
}

// -- Events --
function EventsPanel() {
  const typeColor = { meeting: '#2979FF', competition: '#FF1D6C', exhibition: '#9C27B0', training: '#F5A623', concert: '#e94560' };

  return (
    <div className="panel events-panel">
      <div className="panel-header"><h2>Events</h2></div>
      <div className="events-list">
        {EVENTS.map((ev) => (
          <div key={ev.id} className="event-card" style={{ '--event-color': typeColor[ev.type] }}>
            <div className="event-time">{ev.time}</div>
            <div className="event-info">
              <h4>{ev.name}</h4>
              <p>{ev.zone}</p>
            </div>
            <div className="event-meta">
              <span className="event-attendees">{ev.attendees.toLocaleString()} attending</span>
              <span className="event-type" style={{ color: typeColor[ev.type] }}>{ev.type}</span>
            </div>
            <button className="btn-secondary btn-sm">Join</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// -- Marketplace --
function MarketplacePanel() {
  const [filter, setFilter] = useState('all');
  const categories = ['all', 'land', 'avatar', 'pet', 'building', 'gadget'];
  const filtered = filter === 'all' ? MARKETPLACE_ITEMS : MARKETPLACE_ITEMS.filter((i) => i.category === filter);

  return (
    <div className="panel marketplace-panel">
      <div className="panel-header"><h2>Marketplace</h2></div>
      <div className="market-filters">
        {categories.map((c) => (
          <button key={c} className={`chip ${filter === c ? 'active' : ''}`} onClick={() => setFilter(c)}>
            {c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>
      <div className="market-grid">
        {filtered.map((item) => (
          <div key={item.id} className="market-card">
            <div className="market-image">{item.image}</div>
            <div className="market-info">
              <h4>{item.name}</h4>
              <p className="market-seller">by {item.seller}</p>
            </div>
            <div className="market-footer">
              <span className="market-price">{item.price.toLocaleString()} {item.currency}</span>
              <button className="btn-secondary btn-sm">Buy</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// -- HUD Overlay (always-visible controls when in-world) --
function HUD({ position, fps, onOpenMenu, currentZone }) {
  return (
    <div className="hud">
      <div className="hud-top-left">
        <button className="hud-menu-btn" onClick={onOpenMenu}>Menu</button>
        <div className="hud-zone">{currentZone?.icon} {currentZone?.name || 'Spawn'}</div>
      </div>
      <div className="hud-top-right">
        <div className="hud-fps">{fps} FPS</div>
        <div className="hud-pos">Pos: {position.x}, {position.y}, {position.z}</div>
      </div>
      <div className="hud-crosshair">+</div>
      <div className="hud-bottom">
        <div className="hud-hint">WASD to move | Mouse to look | Shift to sprint | ESC for menu</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MAIN APP
// ---------------------------------------------------------------------------
export default function App() {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);

  // UI state
  const [view, setView] = useState('lobby'); // 'lobby' | 'world'
  const [activePanel, setActivePanel] = useState(null);
  // null | 'avatar' | 'builder' | 'social' | 'desktop' | 'inventory' | 'map' | 'voice' | 'events' | 'marketplace'
  const [selectedZone, setSelectedZone] = useState(null);
  const [position, setPosition] = useState({ x: '0.0', y: '1.8', z: '10.0' });
  const [fps, setFps] = useState(0);
  const [vrSupported, setVrSupported] = useState(false);

  // Boot 3D engine when entering the world
  useEffect(() => {
    if (view !== 'world' || !canvasRef.current) return;
    if (engineRef.current) return; // already initialised

    engineRef.current = new MetaverseEngine(canvasRef.current);

    // Check VR support
    if (navigator.xr) {
      navigator.xr.isSessionSupported('immersive-vr').then((ok) => setVrSupported(ok)).catch(() => {});
    }

    // Position/FPS ticker
    const interval = setInterval(() => {
      if (engineRef.current) {
        setPosition(engineRef.current.getPlayerPosition());
        // rough fps from clock
        setFps(Math.round(1 / Math.max(engineRef.current.clock.getDelta() || 0.016, 0.001)));
      }
    }, 500);

    return () => {
      clearInterval(interval);
      if (engineRef.current) {
        engineRef.current.dispose();
        engineRef.current = null;
      }
    };
  }, [view]);

  const enterWorld = useCallback(() => {
    setView('world');
    setActivePanel(null);
  }, []);

  const lockPointer = useCallback(() => {
    if (engineRef.current && !activePanel) {
      engineRef.current.lockPointer();
    }
  }, [activePanel]);

  const togglePanel = useCallback((panel) => {
    setActivePanel((prev) => {
      if (prev === panel) {
        // Re-lock pointer when closing a panel
        setTimeout(() => engineRef.current?.lockPointer(), 100);
        return null;
      }
      // Exit pointer lock when opening a panel
      if (document.pointerLockElement) document.exitPointerLock();
      return panel;
    });
  }, []);

  const handleVR = useCallback(async () => {
    if (engineRef.current) {
      await engineRef.current.enterVR();
    }
  }, []);

  // Escape key to toggle menu
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Escape' && view === 'world') {
        setActivePanel((prev) => (prev ? null : 'lobby'));
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [view]);

  // ---------- RENDER ----------

  // -- Lobby view --
  if (view === 'lobby') {
    return (
      <div className="roadverse-app lobby-view">
        <header className="lobby-header">
          <div className="logo-text">ROADVERSE</div>
          <p className="tagline">The BlackRoad OS Metaverse</p>
        </header>
        <LobbyPanel onEnterWorld={enterWorld} onSelectZone={(z) => { setSelectedZone(z); enterWorld(); }} />
        <footer className="lobby-footer">
          <span>BlackRoad OS, Inc. | Your AI. Your Hardware. Your Rules.</span>
        </footer>
      </div>
    );
  }

  // -- World view (3D canvas + overlay HUD) --
  return (
    <div className="roadverse-app world-view" onClick={lockPointer}>
      {/* Three.js Canvas */}
      <canvas ref={canvasRef} className="three-canvas" />

      {/* HUD */}
      <HUD
        position={position}
        fps={fps}
        currentZone={selectedZone}
        onOpenMenu={() => togglePanel('lobby')}
      />

      {/* Sidebar nav */}
      <nav className="sidebar-nav">
        {[
          { key: 'lobby', label: 'Hub', icon: '\u{1F30D}' },
          { key: 'avatar', label: 'Avatar', icon: '\u{1F9D1}' },
          { key: 'builder', label: 'Build', icon: '\u{1F3D7}' },
          { key: 'social', label: 'Social', icon: '\u{1F4AC}' },
          { key: 'desktop', label: 'Desktop', icon: '\u{1F5A5}' },
          { key: 'inventory', label: 'Items', icon: '\u{1F392}' },
          { key: 'map', label: 'Map', icon: '\u{1F5FA}' },
          { key: 'voice', label: 'Voice', icon: '\u{1F3A4}' },
          { key: 'events', label: 'Events', icon: '\u{1F3AA}' },
          { key: 'marketplace', label: 'Market', icon: '\u{1F6D2}' },
        ].map((item) => (
          <button
            key={item.key}
            className={`sidebar-btn ${activePanel === item.key ? 'active' : ''}`}
            onClick={(e) => { e.stopPropagation(); togglePanel(item.key); }}
            title={item.label}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </button>
        ))}
        {vrSupported && (
          <button className="sidebar-btn vr-btn" onClick={(e) => { e.stopPropagation(); handleVR(); }} title="Enter VR">
            <span className="sidebar-icon">VR</span>
            <span className="sidebar-label">VR Mode</span>
          </button>
        )}
      </nav>

      {/* Active Panel Overlay */}
      {activePanel && (
        <div className="panel-overlay" onClick={(e) => e.stopPropagation()}>
          <button className="panel-close" onClick={() => togglePanel(activePanel)}>Close</button>
          {activePanel === 'lobby' && <LobbyPanel onEnterWorld={() => setActivePanel(null)} onSelectZone={(z) => { setSelectedZone(z); setActivePanel(null); }} />}
          {activePanel === 'avatar' && <AvatarPanel />}
          {activePanel === 'builder' && <WorldBuilderPanel />}
          {activePanel === 'social' && <SocialPanel />}
          {activePanel === 'desktop' && <VirtualDesktopPanel />}
          {activePanel === 'inventory' && <InventoryPanel />}
          {activePanel === 'map' && <MapPanel />}
          {activePanel === 'voice' && <VoiceChatPanel />}
          {activePanel === 'events' && <EventsPanel />}
          {activePanel === 'marketplace' && <MarketplacePanel />}
        </div>
      )}
    </div>
  );
}
