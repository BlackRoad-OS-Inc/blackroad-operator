const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// City portals
const cities = new Map();
const portals = new Map();
const userLocations = new Map();

// Initialize major cities
const majorCities = [
  { name: 'San Francisco', country: 'USA', coordinates: { lat: 37.7749, lng: -122.4194 } },
  { name: 'New York', country: 'USA', coordinates: { lat: 40.7128, lng: -74.0060 } },
  { name: 'London', country: 'UK', coordinates: { lat: 51.5074, lng: -0.1278 } },
  { name: 'Tokyo', country: 'Japan', coordinates: { lat: 35.6762, lng: 139.6503 } },
  { name: 'Singapore', country: 'Singapore', coordinates: { lat: 1.3521, lng: 103.8198 } },
  { name: 'Berlin', country: 'Germany', coordinates: { lat: 52.5200, lng: 13.4050 } },
  { name: 'Dubai', country: 'UAE', coordinates: { lat: 25.2048, lng: 55.2708 } },
  { name: 'Sydney', country: 'Australia', coordinates: { lat: -33.8688, lng: 151.2093 } },
  { name: 'Toronto', country: 'Canada', coordinates: { lat: 43.6532, lng: -79.3832 } },
  { name: 'Mumbai', country: 'India', coordinates: { lat: 19.0760, lng: 72.8777 } }
];

majorCities.forEach(city => {
  const cityId = uuidv4();
  cities.set(cityId, {
    id: cityId,
    ...city,
    population: 0,
    portals: [],
    createdAt: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'city-portal',
    uptime: process.uptime(),
    stats: {
      cities: cities.size,
      portals: portals.size,
      activeUsers: userLocations.size
    }
  });
});

// City Management
app.get('/api/v1/cities', (req, res) => {
  const { country } = req.query;
  let filteredCities = Array.from(cities.values());

  if (country) {
    filteredCities = filteredCities.filter(c => c.country === country);
  }

  res.json({ cities: filteredCities });
});

app.post('/api/v1/cities', async (req, res) => {
  const city = {
    id: uuidv4(),
    ...req.body,
    population: 0,
    portals: [],
    createdAt: new Date().toISOString()
  };

  // Create metaverse campus for this city
  try {
    const campusResponse = await axios.post('http://metaverse-campus:4400/api/v1/campuses', {
      name: `${city.name} Campus`,
      location: {
        city: city.name,
        country: city.country,
        coordinates: [
          city.coordinates.lng,
          city.coordinates.lat,
          0
        ]
      },
      size: 'large',
      buildings: [
        { type: 'office', name: 'Main Building' },
        { type: 'auditorium', name: 'Event Hall' },
        { type: 'lounge', name: 'Social Hub' }
      ]
    });

    city.campusId = campusResponse.data.campus.id;
  } catch (error) {
    console.error('Campus creation failed:', error.message);
  }

  cities.set(city.id, city);
  res.json({ city });
});

app.get('/api/v1/cities/:id', (req, res) => {
  const city = cities.get(req.params.id);
  if (!city) return res.status(404).json({ error: 'City not found' });
  res.json({ city });
});

// Portal Management
app.post('/api/v1/portals', async (req, res) => {
  const portal = {
    id: uuidv4(),
    ...req.body,
    type: req.body.type || 'teleport', // teleport, gateway, landmark
    cityId: req.body.cityId,
    position: req.body.position || { x: 0, y: 0, z: 0 },
    destination: req.body.destination, // Can link to another city/space
    active: true,
    createdAt: new Date().toISOString()
  };

  portals.set(portal.id, portal);

  // Add to city
  const city = cities.get(portal.cityId);
  if (city) {
    city.portals.push(portal.id);
  }

  res.json({ portal });
});

app.get('/api/v1/portals', (req, res) => {
  const { cityId } = req.query;
  let filteredPortals = Array.from(portals.values());

  if (cityId) {
    filteredPortals = filteredPortals.filter(p => p.cityId === cityId);
  }

  res.json({ portals: filteredPortals });
});

// User Location Tracking
app.post('/api/v1/users/location', async (req, res) => {
  const { userId, cityId, coordinates } = req.body;

  const location = {
    userId,
    cityId,
    coordinates,
    timestamp: new Date().toISOString()
  };

  userLocations.set(userId, location);

  // Update city population
  const city = cities.get(cityId);
  if (city) {
    city.population = Array.from(userLocations.values())
      .filter(loc => loc.cityId === cityId).length;
  }

  res.json({ location });
});

app.get('/api/v1/users/:userId/location', (req, res) => {
  const location = userLocations.get(req.params.userId);
  if (!location) return res.status(404).json({ error: 'Location not found' });
  res.json({ location });
});

// Nearby Users
app.get('/api/v1/users/nearby', (req, res) => {
  const { userId, radius } = req.query;

  const userLocation = userLocations.get(userId);
  if (!userLocation) {
    return res.status(404).json({ error: 'User location not found' });
  }

  const nearbyUsers = Array.from(userLocations.entries())
    .filter(([uid, loc]) => {
      if (uid === userId) return false;
      if (loc.cityId !== userLocation.cityId) return false;

      const distance = calculateDistance(
        userLocation.coordinates,
        loc.coordinates
      );

      return distance <= (parseFloat(radius) || 100);
    })
    .map(([uid, loc]) => ({ userId: uid, ...loc }));

  res.json({ nearbyUsers });
});

// City Events
app.post('/api/v1/events', async (req, res) => {
  const event = {
    id: uuidv4(),
    ...req.body,
    cityId: req.body.cityId,
    attendees: [],
    status: 'scheduled',
    startTime: req.body.startTime,
    endTime: req.body.endTime,
    createdAt: new Date().toISOString()
  };

  res.json({ event });
});

// Portal Travel
app.post('/api/v1/portals/:id/travel', async (req, res) => {
  const portal = portals.get(req.params.id);
  if (!portal) return res.status(404).json({ error: 'Portal not found' });

  const { userId } = req.body;

  if (!portal.active) {
    return res.status(400).json({ error: 'Portal is inactive' });
  }

  // Get destination
  const destinationCity = cities.get(portal.destination.cityId);
  if (!destinationCity) {
    return res.status(404).json({ error: 'Destination not found' });
  }

  // Update user location
  userLocations.set(userId, {
    userId,
    cityId: destinationCity.id,
    coordinates: portal.destination.coordinates,
    timestamp: new Date().toISOString()
  });

  // Teleport in metaverse
  try {
    await axios.post('http://metaverse-campus:4400/api/v1/teleport', {
      userId,
      targetSpaceId: portal.destination.spaceId,
      targetPosition: portal.destination.coordinates
    });
  } catch (error) {
    console.error('Teleport failed:', error.message);
  }

  res.json({
    success: true,
    destination: destinationCity,
    portal
  });
});

// City Discovery
app.get('/api/v1/discover', (req, res) => {
  const { category } = req.query;

  // Recommend cities based on category
  const recommendations = Array.from(cities.values())
    .map(city => ({
      ...city,
      score: Math.random() * 100,
      reason: `Popular for ${category || 'general'} activities`
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  res.json({ recommendations });
});

// Analytics
app.get('/api/v1/analytics', (req, res) => {
  const totalPopulation = Array.from(cities.values())
    .reduce((sum, c) => sum + c.population, 0);

  const mostPopular = Array.from(cities.values())
    .sort((a, b) => b.population - a.population)[0];

  res.json({
    cities: {
      total: cities.size,
      totalPopulation
    },
    portals: {
      total: portals.size,
      active: Array.from(portals.values()).filter(p => p.active).length
    },
    mostPopularCity: mostPopular ? {
      name: mostPopular.name,
      population: mostPopular.population
    } : null,
    activeUsers: userLocations.size
  });
});

// Helper functions
function calculateDistance(coords1, coords2) {
  if (!coords1 || !coords2) return Infinity;

  const dx = coords1.x - coords2.x;
  const dy = coords1.y - coords2.y;
  const dz = (coords1.z || 0) - (coords2.z || 0);

  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

const PORT = process.env.PORT || 4401;
app.listen(PORT, () => {
  console.log(`City Portal service listening on port ${PORT}`);
  console.log(`Initialized ${cities.size} cities`);
});
