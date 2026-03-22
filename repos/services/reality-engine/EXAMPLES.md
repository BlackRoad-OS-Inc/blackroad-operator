# Reality Engine - Example Projects

## Example 1: Modern City District

Create a complete city district with skyscrapers, parks, and streets.

```bash
# 1. Create terrain base
curl -X POST http://localhost:4500/api/create/terrain \
  -H "Content-Type: application/json" \
  -d '{"biome": "grassland"}'

# 2. Create downtown area (10x10 blocks)
curl -X POST http://localhost:4500/api/create/city-block \
  -H "Content-Type: application/json" \
  -d '{
    "gridSize": 10,
    "blockSize": 50,
    "position": { "x": 0, "y": 0, "z": 0 }
  }'

# 3. Add a landmark skyscraper
curl -X POST http://localhost:4500/api/create/building \
  -H "Content-Type: application/json" \
  -d '{
    "template": {
      "name": "BlackRoad Tower",
      "floors": 75,
      "width": 60,
      "depth": 60,
      "height": 262,
      "style": "modern",
      "materials": {
        "walls": "glass",
        "roof": "chrome",
        "windows": "glass",
        "doors": "chrome"
      }
    },
    "position": { "x": 250, "y": 0, "z": 250 }
  }'

# 4. Export your city
curl http://localhost:4500/api/scene/export > my-city.json
```

**Result:** A photorealistic city with 100+ buildings!

---

## Example 2: Mountain Resort

Create a ski resort with realistic terrain and buildings.

```bash
# 1. Generate mountain terrain
curl -X POST http://localhost:4500/api/create/terrain \
  -H "Content-Type: application/json" \
  -d '{"biome": "mountain"}'

# 2. Add lodge at base
curl -X POST http://localhost:4500/api/create/building \
  -H "Content-Type: application/json" \
  -d '{
    "template": {
      "name": "Mountain Lodge",
      "floors": 3,
      "width": 40,
      "depth": 25,
      "height": 12,
      "style": "residential",
      "materials": {
        "walls": "wood-oak",
        "roof": "wood-oak",
        "windows": "glass",
        "doors": "wood-oak"
      }
    },
    "position": { "x": 100, "y": 50, "z": 100 }
  }'

# 3. Add vehicles
curl -X POST http://localhost:4500/api/create/vehicle \
  -H "Content-Type: application/json" \
  -d '{
    "type": "truck",
    "position": { "x": 120, "y": 50, "z": 100 }
  }'
```

**Result:** Realistic mountain resort with natural terrain!

---

## Example 3: Residential Neighborhood

Create a suburban neighborhood with houses and characters.

```bash
# 1. Flat grassland
curl -X POST http://localhost:4500/api/create/terrain \
  -H "Content-Type: application/json" \
  -d '{"biome": "grassland"}'

# 2. Create houses in a grid
for x in 0 50 100 150 200; do
  for z in 0 50 100; do
    curl -X POST http://localhost:4500/api/create/building \
      -H "Content-Type: application/json" \
      -d "{
        \"template\": {
          \"name\": \"House-${x}-${z}\",
          \"floors\": 2,
          \"width\": 12,
          \"depth\": 15,
          \"height\": 8,
          \"style\": \"residential\",
          \"materials\": {
            \"walls\": \"concrete\",
            \"roof\": \"wood-oak\",
            \"windows\": \"glass\",
            \"doors\": \"wood-oak\"
          }
        },
        \"position\": { \"x\": ${x}, \"y\": 0, \"z\": ${z} }
      }"
  done
done

# 3. Add residents
curl -X POST http://localhost:4500/api/create/character \
  -H "Content-Type: application/json" \
  -d '{
    "template": {
      "name": "Neighbor 1",
      "bodyType": "female",
      "height": 1.7,
      "proportions": { "head": 1.0, "torso": 1.0, "arms": 1.0, "legs": 1.0 },
      "customization": {
        "skinTone": "medium",
        "hairStyle": "long",
        "clothing": ["dress-casual", "shoes-sneakers"],
        "accessories": []
      }
    },
    "position": { "x": 10, "y": 0, "z": 10 }
  }'
```

**Result:** Peaceful neighborhood with realistic houses!

---

## Example 4: Desert Oasis

```bash
# 1. Desert terrain
curl -X POST http://localhost:4500/api/create/terrain \
  -H "Content-Type: application/json" \
  -d '{"biome": "desert"}'

# 2. Small settlement
curl -X POST http://localhost:4500/api/create/city-block \
  -H "Content-Type: application/json" \
  -d '{
    "gridSize": 3,
    "blockSize": 30,
    "position": { "x": 0, "y": 0, "z": 0 }
  }'
```

**Result:** Desert landscape with sand dunes and buildings!

---

## Example 5: Interactive Showroom

Create a car showroom with multiple vehicles.

```bash
# 1. Indoor-style flat terrain
curl -X POST http://localhost:4500/api/create/terrain \
  -H "Content-Type: application/json" \
  -d '{"biome": "grassland"}'

# 2. Large showroom building
curl -X POST http://localhost:4500/api/create/building \
  -H "Content-Type: application/json" \
  -d '{
    "template": {
      "name": "Auto Showroom",
      "floors": 1,
      "width": 80,
      "depth": 100,
      "height": 8,
      "style": "modern",
      "materials": {
        "walls": "glass",
        "roof": "chrome",
        "windows": "glass",
        "doors": "chrome"
      }
    },
    "position": { "x": 0, "y": 0, "z": 0 }
  }'

# 3. Add vehicles in a line
for i in 0 1 2 3 4; do
  x=$((i * 15 - 30))
  curl -X POST http://localhost:4500/api/create/vehicle \
    -H "Content-Type: application/json" \
    -d "{
      \"type\": \"car\",
      \"position\": { \"x\": ${x}, \"y\": 0, \"z\": 0 }
    }"
done
```

**Result:** Professional car showroom!

---

## Example 6: Real-Time Multiplayer Demo

```javascript
// client.js - Connect multiple users

const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:4500');

ws.on('open', () => {
  console.log('Connected!');

  // Create a building for this user
  fetch('http://localhost:4500/api/create/building', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      template: {
        name: `Player-${Date.now()}-Building`,
        floors: Math.floor(Math.random() * 20) + 5,
        width: 20,
        depth: 20,
        height: 70,
        style: 'modern',
        materials: {
          walls: 'concrete',
          roof: 'chrome',
          windows: 'glass',
          doors: 'chrome'
        }
      },
      position: {
        x: Math.random() * 200 - 100,
        y: 0,
        z: Math.random() * 200 - 100
      }
    })
  });
});

ws.on('message', (data) => {
  const message = JSON.parse(data);

  switch (message.type) {
    case 'building-created':
      console.log('Someone created a building!', message.meshes.length, 'parts');
      break;

    case 'chat':
      console.log(`${message.clientId}: ${message.message}`);
      break;
  }
});

// Send chat message
function chat(text) {
  ws.send(JSON.stringify({
    type: 'chat',
    text
  }));
}

// Run this script multiple times to simulate multiple users!
```

**Result:** Real-time collaborative world building!

---

## Example 7: Complete Game World

Full game world with terrain, city, characters, and vehicles.

```javascript
// create-game-world.js

const axios = require('axios');
const BASE_URL = 'http://localhost:4500';

async function createGameWorld() {
  console.log('🌍 Creating photorealistic game world...');

  // 1. Terrain
  console.log('⛰️  Generating terrain...');
  await axios.post(`${BASE_URL}/api/create/terrain`, {
    biome: 'grassland'
  });

  // 2. City
  console.log('🏙️  Building city...');
  await axios.post(`${BASE_URL}/api/create/city-block`, {
    gridSize: 8,
    blockSize: 50,
    position: { x: 0, y: 0, z: 0 }
  });

  // 3. Characters
  console.log('👥 Spawning characters...');
  const characterTypes = ['male', 'female'];
  for (let i = 0; i < 10; i++) {
    await axios.post(`${BASE_URL}/api/create/character`, {
      template: {
        name: `NPC-${i}`,
        bodyType: characterTypes[i % 2],
        height: 1.6 + Math.random() * 0.4,
        proportions: { head: 1.0, torso: 1.0, arms: 1.0, legs: 1.0 },
        customization: {
          skinTone: ['light', 'medium', 'dark'][Math.floor(Math.random() * 3)],
          hairStyle: 'short',
          clothing: ['shirt-casual', 'pants-jeans'],
          accessories: []
        }
      },
      position: {
        x: Math.random() * 400 - 200,
        y: 0,
        z: Math.random() * 400 - 200
      }
    });
  }

  // 4. Vehicles
  console.log('🚗 Adding vehicles...');
  for (let i = 0; i < 5; i++) {
    await axios.post(`${BASE_URL}/api/create/vehicle`, {
      type: 'car',
      position: {
        x: Math.random() * 400 - 200,
        y: 0,
        z: Math.random() * 400 - 200
      }
    });
  }

  // 5. Export
  console.log('💾 Exporting world...');
  const response = await axios.get(`${BASE_URL}/api/scene/export`);
  require('fs').writeFileSync('game-world.json', JSON.stringify(response.data, null, 2));

  console.log('✅ Complete! World exported to game-world.json');

  // Stats
  const scene = response.data;
  console.log(`
📊 World Statistics:
   - Meshes: ${scene.meshes.length}
   - Lights: ${scene.lights.length}
   - Materials: ${Object.keys(scene.materials).length}
  `);
}

createGameWorld().catch(console.error);
```

Run it:
```bash
node create-game-world.js
```

**Result:** Complete game-ready world in under 30 seconds!

---

## Tips for Best Results

### 1. Lighting

Add custom lights for dramatic effect:

```bash
# Add a sunset light
POST /api/lights
{
  "type": "directional",
  "position": { "x": 100, "y": 50, "z": 100 },
  "direction": { "x": -1, "y": -0.5, "z": -1 },
  "color": { "r": 1.0, "g": 0.6, "b": 0.3 },  # Orange sunset
  "intensity": 2.0,
  "castShadow": true
}
```

### 2. Camera Angles

Position camera for best views:

```bash
# Bird's eye view
PUT /api/camera/main
{
  "position": { "x": 0, "y": 500, "z": 0 },
  "target": { "x": 0, "y": 0, "z": 0 },
  "fov": 60
}

# Cinematic angle
PUT /api/camera/main
{
  "position": { "x": 100, "y": 20, "z": 100 },
  "target": { "x": 0, "y": 10, "z": 0 },
  "fov": 35,
  "postProcessing": {
    "depthOfField": { "enabled": true, "focusDistance": 100 }
  }
}
```

### 3. Material Customization

Create custom materials:

```bash
POST /api/materials
{
  "id": "my-material",
  "name": "Custom Gold",
  "albedo": { "r": 1.0, "g": 0.85, "b": 0.0 },
  "metallic": 1.0,
  "roughness": 0.2,
  "envMapIntensity": 1.5
}
```

### 4. Performance

For large scenes:

```javascript
// Enable LOD
mesh.lod = [
  { distance: 0, geometry: 'high' },
  { distance: 100, geometry: 'medium' },
  { distance: 500, geometry: 'low' }
];

// Reduce shadow map size for distant lights
light.shadowMapSize = 1024;  // Instead of 4096

// Use fog to hide distant objects
scene.environment.fog = {
  enabled: true,
  type: 'exponential',
  density: 0.0015,
  color: { r: 0.8, g: 0.85, b: 0.9 }
};
```

---

## Community Examples

Share your creations! Export and upload:

```bash
# Export your creation
curl http://localhost:4500/api/scene/export > my-amazing-world.json

# Share it with the community
# (Upload to GitHub, Reality Engine marketplace, etc.)
```

---

**Happy Creating! Build the next Roblox hit with photorealistic graphics!** 🎨✨
