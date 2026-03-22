# Reality Engine - Photorealistic 3D Creation Platform

> **The Roblox Killer with Cities Skylines Realism**
>
> Create photorealistic 3D worlds, buildings, characters, and vehicles with zero coding required. What Roblox wishes it could be!

## 🎯 Vision

Reality Engine is a revolutionary platform that combines:
- **Roblox's Creative Freedom**: User-generated content, easy creation tools, social collaboration
- **Cities Skylines' Depth**: Complex city building, realistic infrastructure, detailed simulation
- **The Sims' Realism**: Lifelike characters, realistic interactions, detailed environments
- **AAA Graphics**: Photorealistic rendering that rivals Unreal Engine and Unity

**But unlike Unity (with their pricing disaster), Reality Engine is:**
- ✅ **Free for creators**
- ✅ **Web-based** (no downloads, works in browser)
- ✅ **Real-time multiplayer** built-in
- ✅ **Photorealistic** by default

---

## 🌟 Key Features

### 1. Photorealistic Rendering

#### How We Achieve Photorealism

**Physically Based Rendering (PBR)**
- Materials behave exactly like real-world surfaces
- Metallic-roughness workflow (industry standard)
- Albedo, metallic, roughness, normal, AO, emission maps
- Clearcoat for car paint and plastic
- Sheen for fabrics and velvet
- Transmission for glass and water

**Advanced Lighting**
- Three-point lighting system (key, fill, rim)
- HDR environment mapping for realistic reflections
- Soft shadows with PCF (Percentage Closer Filtering)
- Area lights for studio-quality illumination
- Physically accurate light falloff

**Post-Processing Pipeline**
- **ACES Tone Mapping**: Film-industry standard for color
- **TAA (Temporal Anti-Aliasing)**: Smooth edges
- **Bloom**: Realistic glow on bright surfaces
- **SSAO**: Screen-space ambient occlusion for depth
- **Depth of Field**: Camera-like focus blur
- **Color Grading**: Cinematic color adjustments
- **SSR**: Screen-space reflections
- **God Rays**: Volumetric lighting effects

#### What Your Eyes See vs What the Engine Renders

| Real World | Reality Engine |
|------------|----------------|
| **Light bounces** off surfaces | **PBR materials** simulate light bounce mathematically |
| **Rough surfaces** scatter light | **Roughness maps** control light scattering |
| **Metals** reflect environment | **Metallic property** + **HDR env maps** = perfect reflections |
| **Shadows** soften with distance | **Soft shadow mapping** with configurable radius |
| **Colors** affected by lighting | **Physically-based lighting** affects albedo correctly |
| **Depth perception** from focus | **Depth of field** mimics camera/eye focus |
| **Atmosphere** creates haze | **Fog system** with exponential falloff |

### 2. User Content Creation Tools

#### Building Creator (Cities Skylines Style)

```typescript
// Create a skyscraper with one API call!
POST /api/create/building
{
  "template": {
    "name": "Downtown Tower",
    "floors": 50,
    "width": 40,
    "depth": 40,
    "height": 175,
    "style": "modern",
    "materials": {
      "walls": "glass-blue-tint",
      "roof": "chrome",
      "windows": "glass",
      "doors": "chrome"
    }
  },
  "position": { "x": 0, "y": 0, "z": 0 }
}
```

**What happens:**
1. Procedural floor generation (50 floors)
2. Window placement with realistic spacing
3. Photorealistic glass materials with reflections
4. Automatic LOD (Level of Detail) generation
5. Physics collision meshes
6. Shadow casting/receiving
7. Real-time lighting

**Result:** A photorealistic 50-story building in milliseconds!

#### Character Creator (The Sims Style)

```typescript
POST /api/create/character
{
  "template": {
    "name": "John Smith",
    "bodyType": "male",
    "height": 1.8,
    "proportions": {
      "head": 1.0,
      "torso": 1.0,
      "arms": 1.0,
      "legs": 1.0
    },
    "customization": {
      "skinTone": "medium",
      "hairStyle": "short-modern",
      "clothing": ["shirt-casual", "pants-jeans"],
      "accessories": ["watch", "sunglasses"]
    }
  },
  "position": { "x": 0, "y": 0, "z": 0 }
}
```

**Features:**
- Realistic proportions
- Customizable everything
- Physics-enabled (ragdoll, animations)
- PBR skin materials (subsurface scattering)
- Clothing layers with proper materials

#### Terrain Generator

```typescript
POST /api/create/terrain
{
  "biome": "mountain"
}
```

**What makes it realistic:**

1. **Multi-Octave Noise**
   - Not random chaos - layered detail at multiple scales
   - Large features (mountains) + small features (rocks)
   - Natural-looking height variation

2. **Hydraulic Erosion Simulation**
   - Simulates water droplets flowing downhill
   - Creates realistic valleys and ridges
   - Carves natural-looking river beds
   - Accumulates sediment at low points

3. **Splat Mapping**
   - Multiple material layers (grass, rock, snow)
   - Height-based blending (grass low, snow high)
   - Slope-based blending (grass flat, rock steep)
   - Seamless transitions

4. **Detail Textures**
   - PBR materials for every surface type
   - Normal maps for surface detail without geometry
   - Height maps for parallax occlusion

**Result:** Terrain that looks like photographs of real mountains!

#### Vehicle Creator

```typescript
POST /api/create/vehicle
{
  "type": "car",
  "position": { "x": 0, "y": 0, "z": 0 }
}
```

**Features:**
- Realistic physics (mass, friction, suspension)
- Working wheels with proper collision
- Car paint materials (clearcoat for shine)
- Interior details
- Working lights (emissive materials)

#### City Generator

```typescript
POST /api/create/city-block
{
  "gridSize": 5,      // 5x5 buildings
  "blockSize": 50,    // 50m spacing
  "position": { "x": 0, "y": 0, "z": 0 }
}
```

**Generates:**
- Random building styles (modern, classical, industrial)
- Varied heights (3-50 floors)
- Procedural details (windows, doors, roofs)
- Realistic urban density
- Performance-optimized (LODs, instancing)

**Result:** An entire city district in seconds!

---

## 🎮 How to Use

### Installation

```bash
cd services/reality-engine
npm install
npm run dev
```

Server starts at `http://localhost:4500`

### Quick Start Examples

#### 1. Create Your First World

```bash
# Generate grassland terrain
curl -X POST http://localhost:4500/api/create/terrain \
  -H "Content-Type: application/json" \
  -d '{"biome": "grassland"}'

# Add a modern office building
curl -X POST http://localhost:4500/api/create/building \
  -H "Content-Type: application/json" \
  -d '{
    "template": {
      "name": "My Office",
      "floors": 10,
      "width": 30,
      "depth": 30,
      "height": 35,
      "style": "modern",
      "materials": {
        "walls": "concrete",
        "roof": "chrome",
        "windows": "glass",
        "doors": "chrome"
      }
    },
    "position": { "x": 0, "y": 0, "z": 0 }
  }'

# Add a character
curl -X POST http://localhost:4500/api/create/character \
  -H "Content-Type: application/json" \
  -d '{
    "template": {
      "name": "Player 1",
      "bodyType": "male",
      "height": 1.8,
      "proportions": { "head": 1.0, "torso": 1.0, "arms": 1.0, "legs": 1.0 },
      "customization": {
        "skinTone": "light",
        "hairStyle": "short",
        "clothing": ["shirt-blue", "pants-jeans"],
        "accessories": []
      }
    },
    "position": { "x": 5, "y": 0, "z": 5 }
  }'
```

#### 2. Create an Entire City

```bash
curl -X POST http://localhost:4500/api/create/city-block \
  -H "Content-Type: application/json" \
  -d '{
    "gridSize": 10,
    "blockSize": 50,
    "position": { "x": 0, "y": 0, "z": 0 }
  }'
```

This creates a 10x10 city block with 100 buildings!

#### 3. View Your Scene

```bash
# Get current scene
curl http://localhost:4500/api/scene

# Export scene to file
curl http://localhost:4500/api/scene/export > my-world.json

# Import scene
curl -X POST http://localhost:4500/api/scene \
  -H "Content-Type: application/json" \
  -d @my-world.json
```

### Real-Time Multiplayer

Connect via WebSocket:

```javascript
const ws = new WebSocket('ws://localhost:4500');

ws.onopen = () => {
  console.log('Connected to Reality Engine!');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  switch (data.type) {
    case 'welcome':
      console.log('Scene loaded:', data.scene);
      break;

    case 'mesh-added':
      // Another player added a mesh
      console.log('New mesh:', data.mesh);
      break;

    case 'transform-update':
      // Another player moved something
      updateMeshTransform(data.meshId, data.position, data.rotation);
      break;
  }
};

// Send transform updates
function moveObject(meshId, position, rotation) {
  ws.send(JSON.stringify({
    type: 'transform-update',
    meshId,
    position,
    rotation
  }));
}
```

---

## 🔬 Technical Deep Dive

### Photorealistic Rendering Explained

#### What is PBR (Physically Based Rendering)?

Traditional games fake lighting. PBR simulates physics!

**Old Way (Phong Shading):**
```
color = ambient + diffuse + specular
```
Problems:
- Looks "gamey" and fake
- Different in every lighting condition
- Artists have to tweak per-scene

**PBR Way:**
```
color = BRDF(albedo, metallic, roughness, normal) × lighting
```
Benefits:
- **Looks correct** in all lighting
- Materials are **portable** (work anywhere)
- **Physically accurate**

#### The BRDF (Bidirectional Reflectance Distribution Function)

This is the magic! It calculates how light reflects off a surface.

```typescript
// Simplified PBR material
interface PBRMaterial {
  albedo: Color;        // Base color (what you see)
  metallic: 0-1;        // Is it metal? (0=no, 1=yes)
  roughness: 0-1;       // How rough? (0=mirror, 1=matte)
  normal: Vector;       // Surface bumps
  ao: 0-1;              // Ambient occlusion (shadows in crevices)
}
```

**How it works:**

1. **Albedo**: The base color
   - For metals: affects reflection color (gold is yellow)
   - For dielectrics: the surface color (wood is brown)

2. **Metallic**: Determines reflection behavior
   - `1.0` = Perfect conductor (chrome, gold, copper)
   - `0.0` = Dielectric (plastic, wood, skin)
   - In-between values are rare (rust, oxidized metal)

3. **Roughness**: Micro-surface detail
   - `0.0` = Perfectly smooth (mirror, water)
   - `1.0` = Completely rough (concrete, dirt)
   - Controls how blurry reflections are

4. **Normal Map**: Fake geometry detail
   - RGB values encode surface angle
   - Creates bumps/dents without geometry
   - Cheap way to add massive detail

#### HDR Environment Mapping

Regular images: 0-255 brightness (SDR)
HDR images: 0-∞ brightness (real light values)

**Why this matters:**
- Sun is 1000x brighter than sky
- Indoor bulb is 10x brighter than walls
- These ratios create realistic lighting!

**How we use it:**
```typescript
environment: {
  skybox: {
    type: 'hdri',
    hdriUrl: '/assets/hdri/studio_sunset.hdr',  // HDR image
    rotation: 0
  },
  environmentIntensity: 1.0  // Multiply brightness
}
```

The HDR image provides:
- **Skybox**: What you see in background
- **Reflections**: What appears in reflective surfaces
- **Lighting**: Illuminates the scene

#### Shadow Mapping

**How shadows work in reality:**
- Light travels to surface
- If blocked, creates shadow
- Shadow softness depends on light size and distance

**How we simulate it:**

1. **Shadow Map Generation**
   ```
   Render scene from light's perspective
   Store depth values in texture
   This is the "shadow map"
   ```

2. **Shadow Testing**
   ```
   For each pixel:
     - Calculate distance to light
     - Check shadow map
     - If farther than shadow map: in shadow
     - If closer: lit
   ```

3. **Soft Shadows (PCF)**
   ```
   Instead of 1 sample, take 16 samples
   Average the results
   Creates soft, realistic shadow edges
   ```

**Configuration:**
```typescript
light: {
  castShadow: true,
  shadowMapSize: 4096,    // Higher = sharper shadows
  shadowBias: -0.0001,    // Prevents shadow acne
  shadowRadius: 2         // Softness (larger = softer)
}
```

#### Post-Processing Pipeline

**1. Tone Mapping (HDR → Screen)**

Problem: Monitors can only show 0-255, but our scene has 0-∞

Solution: ACES (Academy Color Encoding System)
- Used in film industry
- Preserves color relationships
- Smooth highlight rolloff
- No blown-out whites

**2. Bloom**

What it does: Makes bright things glow

How:
1. Extract bright pixels (threshold 0.85)
2. Blur them heavily (Gaussian blur)
3. Add back to original image
4. Controlled by strength

Result: Realistic glow on lights, metals, water

**3. Ambient Occlusion (SSAO)**

What it simulates: Light doesn't reach crevices

How:
1. For each pixel, sample surrounding depth
2. If surrounded by geometry: darken
3. Creates shadows in corners, cracks, contact points

Result: Objects look "grounded" and realistic

**4. Depth of Field**

What it simulates: Camera/eye focus

How:
1. Calculate distance from focus point
2. Blur pixels based on distance
3. Near and far blur = "bokeh"

Result: Cinematic look, focus attention

---

## 🎨 Material Library

### Default Materials

#### Metals

**Chrome**
```typescript
{
  albedo: { r: 0.95, g: 0.95, b: 0.95 },
  metallic: 1.0,    // Pure metal
  roughness: 0.1,   // Very smooth
  envMapIntensity: 1.0  // Strong reflections
}
```
Result: Perfect mirror-like reflections

**Brushed Aluminum**
```typescript
{
  albedo: { r: 0.9, g: 0.9, b: 0.9 },
  metallic: 1.0,
  roughness: 0.4,   // Medium roughness
  normalMap: 'brushed-metal-normal.jpg'  // Brush pattern
}
```
Result: Metal with directional scratches

#### Dielectrics

**Concrete**
```typescript
{
  albedo: { r: 0.5, g: 0.5, b: 0.5 },
  metallic: 0.0,    // Not metal
  roughness: 0.9,   // Very rough
  normalMap: 'concrete-normal.jpg',
  aoMap: 'concrete-ao.jpg',  // Shadows in pores
  heightMap: 'concrete-height.jpg'  // Surface bumps
}
```
Result: Realistic concrete with pores and bumps

**Glass**
```typescript
{
  albedo: { r: 1.0, g: 1.0, b: 1.0 },
  metallic: 0.0,
  roughness: 0.0,   // Perfectly smooth
  transmission: 0.95,  // See-through
  ior: 1.5,         // Index of refraction (physics!)
  transparent: true
}
```
Result: Clear glass with realistic refraction

#### Organics

**Wood (Oak)**
```typescript
{
  albedo: { r: 0.6, g: 0.4, b: 0.2 },
  metallic: 0.0,
  roughness: 0.7,
  normalMap: 'wood-grain-normal.jpg',  // Wood grain bumps
  aoMap: 'wood-ao.jpg'  // Shadows between grain
}
```
Result: Realistic wood grain

**Skin**
```typescript
{
  albedo: { r: 0.85, g: 0.7, b: 0.6 },
  metallic: 0.0,
  roughness: 0.5,
  subsurfaceScattering: true,  // Light penetrates skin!
  translucency: 0.3
}
```
Result: Realistic skin with light penetration

---

## 🚀 Performance Optimization

### Level of Detail (LOD)

Objects far away don't need full detail!

```typescript
mesh: {
  lod: [
    { distance: 0, geometry: 'high-detail' },    // Close up
    { distance: 50, geometry: 'medium-detail' }, // Mid range
    { distance: 200, geometry: 'low-detail' }    // Far away
  ]
}
```

**Savings:**
- Close building: 100K triangles
- Far building: 1K triangles
- 100x less geometry to render!

### Instancing

Same object many times? Share the geometry!

```typescript
// Instead of 100 trees with 100 geometries:
// 1 tree geometry + 100 transforms
```

**Savings:**
- Memory: 100x less
- Draw calls: 100 → 1
- FPS: 10 → 60

### Texture Atlasing

Combine textures to reduce draw calls:

```
Before: 100 textures = 100 draws
After: 1 atlas = 1 draw
```

### Frustum Culling

Don't render what you can't see!

```typescript
if (object not in camera view) {
  skip rendering
}
```

**Savings:** 50-80% less rendering

---

## 🌐 Multiplayer Architecture

### Real-Time Synchronization

**Client → Server → All Clients**

1. Player moves object
2. Client sends WebSocket message
3. Server updates authoritative state
4. Server broadcasts to all clients
5. Clients update their view

**Bandwidth Optimization:**
- Only send changes (delta compression)
- Interpolate between updates (smooth motion)
- Prioritize nearby objects
- LOD based on distance and importance

### State Management

**Authoritative Server:**
- Server owns the truth
- Clients request changes
- Server validates and broadcasts
- Prevents cheating

---

## 📊 Comparison Table

| Feature | Roblox | Unity | Unreal | Reality Engine |
|---------|--------|-------|--------|----------------|
| **Graphics** | Blocky/Cartoony | Good | Excellent | **Photorealistic** |
| **User Creation** | Excellent | Manual | Manual | **Automated** |
| **Pricing** | Free + % | $$$$ Disaster | % Revenue | **Free** |
| **Platform** | Client app | Desktop | Desktop | **Web Browser** |
| **Learning Curve** | Easy | Hard | Very Hard | **Easiest** |
| **Multiplayer** | Built-in | Manual | Manual | **Built-in** |
| **Setup Time** | Minutes | Hours | Hours | **Seconds** |

---

## 🎯 Use Cases

### 1. Game Development Platform

"I want to make a game but I'm not a programmer!"

**Solution:**
```bash
# Create game world
POST /api/create/terrain {"biome": "forest"}
POST /api/create/city-block {"gridSize": 5, "blockSize": 50}

# Add player character
POST /api/create/character {template}

# Done! You have a game world.
```

### 2. Architectural Visualization

"I need to show clients their building before it's built"

**Solution:**
```bash
# Create photorealistic building
POST /api/create/building {
  "floors": 20,
  "style": "modern",
  "materials": {"walls": "glass", "roof": "chrome"}
}

# Add surrounding context
POST /api/create/city-block

# Export for presentation
GET /api/scene/export
```

### 3. Virtual Real Estate

"I want to sell virtual land with actual value"

**Solution:**
- Generate photorealistic terrain
- Users build on their plots
- Real-time multiplayer visits
- Export as NFTs

### 4. Education & Training

"I need realistic simulations for training"

**Solution:**
- Create realistic environments (factories, hospitals, etc.)
- Add interactive objects
- Multiplayer for team training
- Photorealism for immersion

---

## 🔮 Future Roadmap

### Phase 1 (Current)
- ✅ PBR rendering engine
- ✅ Procedural terrain
- ✅ Building creator
- ✅ Character creator
- ✅ Vehicle creator
- ✅ Real-time multiplayer

### Phase 2 (Next)
- ⏳ WebGPU backend (even better graphics!)
- ⏳ Animation system
- ⏳ Asset marketplace
- ⏳ Visual scripting (Scratch-like)
- ⏳ Mobile support

### Phase 3 (Future)
- 🔮 AI-generated content
- 🔮 VR support
- 🔮 Ray tracing
- 🔮 Global illumination
- 🔮 Monetization for creators

---

## 🤝 Contributing

We need help with:
- WebGL/WebGPU rendering optimization
- Physics engine integration
- Asset creation (PBR materials, models)
- Documentation
- Example projects

---

## 📜 License

MIT License - Build whatever you want!

---

## 🙏 Credits

Built with:
- Three.js (3D rendering)
- Cannon.js (physics)
- Simplex Noise (procedural generation)
- Express (server)
- WebSocket (real-time)

---

## 💬 Support

Questions? Ideas? Want to collaborate?

Open an issue or join our community!

---

**Reality Engine: Where photorealism meets creativity** ✨
