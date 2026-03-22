const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');
const turf = require('@turf/turf');
const proj4 = require('proj4');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(express.json());

// In-memory cache for map tiles and geospatial data
const mapDataCache = new Map();
const activeViews = new Map();

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'roadview-enhanced',
    uptime: process.uptime(),
    activeViews: activeViews.size,
    cacheSize: mapDataCache.size
  });
});

// API: Get map tile
app.get('/api/v1/tiles/:z/:x/:y', async (req, res) => {
  try {
    const { z, x, y } = req.params;
    const tileKey = `${z}/${x}/${y}`;

    // Check cache
    if (mapDataCache.has(tileKey)) {
      return res.json(mapDataCache.get(tileKey));
    }

    // Generate or fetch tile data
    const tileData = await generateTileData(parseInt(z), parseInt(x), parseInt(y));
    mapDataCache.set(tileKey, tileData);

    res.json(tileData);
  } catch (error) {
    console.error('Error fetching tile:', error);
    res.status(500).json({ error: 'Failed to fetch tile' });
  }
});

// API: Geocoding
app.get('/api/v1/geocode', async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter required' });
    }

    // Mock geocoding (integrate with real service like Mapbox/Google)
    const results = await geocodeAddress(query);
    res.json({ results });
  } catch (error) {
    console.error('Error geocoding:', error);
    res.status(500).json({ error: 'Geocoding failed' });
  }
});

// API: Reverse geocoding
app.get('/api/v1/reverse-geocode', async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Lat/lng required' });
    }

    const address = await reverseGeocode(parseFloat(lat), parseFloat(lng));
    res.json({ address });
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    res.status(500).json({ error: 'Reverse geocoding failed' });
  }
});

// API: Route calculation
app.post('/api/v1/routes', async (req, res) => {
  try {
    const { origin, destination, mode } = req.body;

    if (!origin || !destination) {
      return res.status(400).json({ error: 'Origin and destination required' });
    }

    const route = await calculateRoute(origin, destination, mode || 'driving');
    res.json({ route });
  } catch (error) {
    console.error('Error calculating route:', error);
    res.status(500).json({ error: 'Route calculation failed' });
  }
});

// API: Geospatial analysis
app.post('/api/v1/analyze', async (req, res) => {
  try {
    const { type, geometry, parameters } = req.body;

    const result = await performGeospatialAnalysis(type, geometry, parameters);
    res.json({ result });
  } catch (error) {
    console.error('Error in geospatial analysis:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// API: 3D terrain data
app.get('/api/v1/terrain', async (req, res) => {
  try {
    const { bounds, resolution } = req.query;

    if (!bounds) {
      return res.status(400).json({ error: 'Bounds required' });
    }

    const terrain = await generateTerrainData(bounds, resolution || 'medium');
    res.json({ terrain });
  } catch (error) {
    console.error('Error generating terrain:', error);
    res.status(500).json({ error: 'Terrain generation failed' });
  }
});

// API: Points of Interest
app.get('/api/v1/poi', async (req, res) => {
  try {
    const { lat, lng, radius, category } = req.query;

    const pois = await findPointsOfInterest({
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      radius: parseFloat(radius) || 1000,
      category
    });

    res.json({ pois });
  } catch (error) {
    console.error('Error fetching POIs:', error);
    res.status(500).json({ error: 'POI fetch failed' });
  }
});

// WebSocket for real-time map updates
wss.on('connection', (ws, req) => {
  console.log('Client connected to RoadView');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case 'subscribe-viewport':
          handleViewportSubscription(ws, data.viewport);
          break;
        case 'update-location':
          handleLocationUpdate(ws, data.location);
          break;
        case 'query-features':
          handleFeatureQuery(ws, data.query);
          break;
        default:
          ws.send(JSON.stringify({ error: 'Unknown message type' }));
      }
    } catch (error) {
      console.error('WebSocket error:', error);
      ws.send(JSON.stringify({ error: error.message }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected from RoadView');
    // Clean up subscriptions
  });
});

// Helper functions
async function generateTileData(z, x, y) {
  // Generate map tile with roads, buildings, terrain
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [x, y],
            [x + 0.1, y + 0.1]
          ]
        },
        properties: {
          type: 'road',
          name: `Highway ${x}-${y}`,
          lanes: 4
        }
      }
    ],
    metadata: {
      zoom: z,
      x: x,
      y: y,
      generated: new Date().toISOString()
    }
  };
}

async function geocodeAddress(query) {
  // Mock geocoding - integrate with real service
  return [
    {
      address: query,
      location: {
        lat: 37.7749,
        lng: -122.4194
      },
      confidence: 0.9
    }
  ];
}

async function reverseGeocode(lat, lng) {
  // Mock reverse geocoding
  return {
    formattedAddress: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    components: {
      city: 'San Francisco',
      state: 'CA',
      country: 'USA'
    }
  };
}

async function calculateRoute(origin, destination, mode) {
  // Calculate route using Turf.js
  const line = turf.lineString([
    [origin.lng, origin.lat],
    [destination.lng, destination.lat]
  ]);

  const distance = turf.length(line, { units: 'kilometers' });

  return {
    geometry: line.geometry,
    distance: distance,
    duration: (distance / 60) * 3600, // Mock duration
    mode: mode,
    steps: [
      {
        instruction: 'Head north',
        distance: distance / 2,
        duration: 600
      },
      {
        instruction: 'Arrive at destination',
        distance: distance / 2,
        duration: 600
      }
    ]
  };
}

async function performGeospatialAnalysis(type, geometry, parameters) {
  switch (type) {
    case 'buffer':
      const buffered = turf.buffer(geometry, parameters.distance, {
        units: parameters.units || 'kilometers'
      });
      return buffered;

    case 'area':
      const area = turf.area(geometry);
      return { area, units: 'square meters' };

    case 'centroid':
      const centroid = turf.centroid(geometry);
      return centroid;

    case 'intersection':
      const intersection = turf.intersect(geometry, parameters.compareGeometry);
      return intersection;

    default:
      throw new Error(`Unknown analysis type: ${type}`);
  }
}

async function generateTerrainData(bounds, resolution) {
  // Generate 3D terrain mesh data
  const [minLng, minLat, maxLng, maxLat] = bounds.split(',').map(parseFloat);

  const gridSize = resolution === 'high' ? 100 : resolution === 'medium' ? 50 : 25;
  const vertices = [];
  const elevations = [];

  for (let i = 0; i <= gridSize; i++) {
    for (let j = 0; j <= gridSize; j++) {
      const lng = minLng + (maxLng - minLng) * (i / gridSize);
      const lat = minLat + (maxLat - minLat) * (j / gridSize);

      // Generate elevation (simplified - use real DEM data in production)
      const elevation = Math.sin(lng * 10) * Math.cos(lat * 10) * 100;

      vertices.push([lng, lat, elevation]);
      elevations.push(elevation);
    }
  }

  return {
    vertices,
    gridSize,
    bounds: { minLng, minLat, maxLng, maxLat },
    elevationRange: {
      min: Math.min(...elevations),
      max: Math.max(...elevations)
    }
  };
}

async function findPointsOfInterest(params) {
  // Mock POI data
  return [
    {
      id: '1',
      name: 'Blackroad HQ',
      category: 'office',
      location: {
        lat: params.lat + 0.01,
        lng: params.lng + 0.01
      },
      distance: 150
    }
  ];
}

function handleViewportSubscription(ws, viewport) {
  // Subscribe to real-time updates for this viewport
  ws.send(JSON.stringify({
    type: 'viewport-subscribed',
    viewport
  }));
}

function handleLocationUpdate(ws, location) {
  // Handle user location update
  ws.send(JSON.stringify({
    type: 'location-updated',
    location
  }));
}

function handleFeatureQuery(ws, query) {
  // Query map features
  ws.send(JSON.stringify({
    type: 'features',
    features: []
  }));
}

const PORT = process.env.PORT || 4210;
server.listen(PORT, () => {
  console.log(`RoadView Enhanced service running on port ${PORT}`);
});
