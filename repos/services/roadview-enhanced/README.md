# RoadView Enhanced Service

Advanced spatial visualization and mapping service with 3D terrain rendering, real-time traffic data, and comprehensive geospatial analytics.

## Features

- **3D Terrain Rendering**: High-resolution elevation data and mesh generation
- **Map Tiles**: Dynamic tile generation and caching
- **Geocoding**: Forward and reverse geocoding
- **Route Calculation**: Multi-modal routing (driving, walking, cycling)
- **Geospatial Analysis**: Buffer, intersection, area calculations using Turf.js
- **Real-time Updates**: WebSocket-based viewport subscriptions
- **Points of Interest**: POI search and categorization
- **Coordinate Projection**: Support for multiple coordinate systems via Proj4

## API Endpoints

### REST API

- `GET /api/v1/tiles/:z/:x/:y` - Get map tile
- `GET /api/v1/geocode?query=address` - Geocode address
- `GET /api/v1/reverse-geocode?lat=X&lng=Y` - Reverse geocode
- `POST /api/v1/routes` - Calculate route
- `POST /api/v1/analyze` - Perform geospatial analysis
- `GET /api/v1/terrain?bounds=...` - Get 3D terrain data
- `GET /api/v1/poi?lat=X&lng=Y&radius=R` - Find points of interest
- `GET /health` - Health check

### WebSocket Events

**Client → Server:**
- `subscribe-viewport` - Subscribe to viewport updates
- `update-location` - Update user location
- `query-features` - Query map features

**Server → Client:**
- `viewport-subscribed` - Viewport subscription confirmed
- `location-updated` - Location update confirmed
- `features` - Map features response

## Configuration

```bash
PORT=4210
MAPBOX_API_KEY=your_key_here
ELEVATION_API_URL=https://elevation-api.io
CACHE_TTL=3600
```

## Technology Stack

- **Turf.js** - Geospatial analysis
- **Proj4** - Coordinate transformations
- **Three.js** - 3D rendering support
- **WebSocket** - Real-time updates
- **GeoJSON** - Standard spatial data format

## Integration

- **Unity World Builder** - Generate 3D environments from map data
- **Metaverse Campus** - Spatial positioning
- **Backroad Service** - Route optimization
