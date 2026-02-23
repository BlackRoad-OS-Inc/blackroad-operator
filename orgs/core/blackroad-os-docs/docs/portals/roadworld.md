# RoadWorld — Navigation Portal

> *"Context-aware guidance with local knowledge."*

**Portal ID:** `portal.roadworld`
**Status:** Planning
**Primary Domain:** Navigation, Local Discovery, Travel Intelligence

---

## Overview

RoadWorld is BlackRoad OS's navigation portal — an AI-powered guide that understands not just where you're going, but why you're going there. Unlike traditional maps that give the same directions to everyone, RoadWorld adapts to your context, preferences, and current situation.

Whether you're commuting to work, exploring a new city, planning a road trip, or finding the perfect coffee shop, RoadWorld is your intelligent companion for navigating the physical world.

---

## Core Value Proposition

### The Problem with Current Navigation

1. **Context-blind** — Same route whether you're rushing or leisurely exploring
2. **Generic recommendations** — "Top 10" lists instead of personalized suggestions
3. **Outdated information** — Hours, closures, and conditions change
4. **Fragmented experience** — Separate apps for maps, reviews, transit, parking
5. **No memory** — Doesn't learn your preferences over time

### The RoadWorld Solution

| Problem | RoadWorld Solution |
|---------|---------------------|
| Context-blind | Intent-aware routing (commute vs. explore) |
| Generic recommendations | AI-personalized suggestions based on your taste |
| Outdated information | Real-time data + community reports |
| Fragmented experience | Unified navigation + discovery |
| No memory | Persistent preferences and learned patterns |

---

## Key Features

### 1. Intent-Aware Navigation

Routes that understand your purpose:

```
You: Navigate to downtown

RoadWorld: I see you have a meeting at 2 PM. It's currently 1:15.

Option A: Fastest (18 min)
- Highway route, $3.50 toll, tight parking

Option B: Recommended (24 min)
- Scenic route, no toll, passes a coffee shop you like,
  parking garage with availability

Option C: Transit (28 min)
- Blue Line, no driving stress, can prep for meeting en route

Based on your preference for stress-free arrivals,
I'd suggest Option B. You'll arrive at 1:39 with time to spare.
```

### 2. Contextual Discovery

Find places that match your current context:

```
Context Signals:
├── Time of day (morning = coffee, evening = dinner)
├── Weather (rainy = indoor options)
├── Who you're with (solo, date, family, friends)
├── Current mood (energetic, relaxed, focused)
├── Recent activity (just finished gym, leaving work)
├── Calendar (meeting soon, free afternoon)
└── Preferences (dietary, accessibility, price range)
```

```
You: Find somewhere for lunch

RoadWorld: You're near the arts district with 90 min before
your next meeting. Based on your preferences:

🌟 Recommended: Café Lumina (0.3 mi)
   - Mediterranean, which you rated highly last month
   - Quick service (avg 25 min)
   - Outdoor seating (it's 72°F and sunny)
   - 4.6★ (87 reviews) — "great falafel wrap"

Also consider:
📍 Noodle House (0.2 mi) — Fast, affordable, you've been 3x
📍 The Garden Bistro (0.4 mi) — New, matches your preferences
📍 Street Tacos Cart (0.1 mi) — Quick grab, highly rated
```

### 3. Live Conditions Intelligence

Real-time awareness beyond traffic:

| Data Type | Sources |
|-----------|---------|
| **Traffic** | Live GPS data, incident reports |
| **Transit** | Real-time arrivals, service alerts |
| **Parking** | Garage availability, street parking probability |
| **Weather** | Current + forecast, route impact |
| **Events** | Concerts, sports, conferences affecting area |
| **Business** | Open/closed status, wait times, capacity |
| **Safety** | Well-lit routes, community reports |

### 4. Personal Travel Patterns

Learn from your behavior:

```typescript
interface TravelPattern {
  pattern_id: string;
  user_id: string;

  // Commute patterns
  commutes: {
    work: {
      typical_departure: string;  // "8:15 AM"
      typical_arrival: string;
      preferred_route: string;
      alternatives_tried: RouteHistory[];
    };
    home: {
      typical_departure: string;
      stops_common: Place[];  // gym, grocery, etc.
    };
  };

  // Preferences learned
  preferences: {
    routing: {
      avoid_highways: boolean;
      avoid_tolls: boolean;
      prefer_scenic: boolean;
      walking_comfort: 'minimal' | 'moderate' | 'active';
    };
    dining: {
      cuisines_liked: string[];
      price_range: [number, number];
      dietary: string[];
      ambiance: string[];
    };
    shopping: {
      store_types: string[];
      brands_preferred: string[];
    };
  };

  // Favorite places
  favorites: Place[];
  frequent_visits: Place[];
  saved_for_later: Place[];
}
```

### 5. Trip Planning & Itineraries

Plan complex journeys:

```
You: Plan a day trip to wine country this Saturday

RoadWorld: I'll create a wine country itinerary for Saturday.
You mentioned you like smaller boutique wineries and scenic views.

📅 Saturday Wine Country Trip

🚗 9:00 AM — Depart home
   - 1.5 hr drive via scenic Route 12
   - Audiobook suggestion: "Cork Dork" (wine memoir)

🍷 10:30 AM — First stop: Hillside Vineyards
   - Small family winery, great views
   - Reservation made for tasting (4 wines, $25)

🍽 12:30 PM — Lunch: Farm Table Restaurant
   - Farm-to-table, wine-friendly menu
   - Reservation for 2 at 12:30

🍷 2:30 PM — Second stop: Oak Valley Estate
   - Award-winning Pinot Noir (you rated similar wines highly)
   - Cave tour available (30 min, $15)

🍷 4:30 PM — Optional: Sunset Cellars
   - Only if you're feeling it, great sunset views
   - Walk-in friendly

🚗 6:00 PM — Head home
   - Dinner suggestion: stop at Italian place you saved

Total: ~$150 (tastings, lunch, gas)
Weather: 75°F, sunny — perfect wine country day

Shall I book the reservations?
```

### 6. AR Navigation & Overlays

Augmented reality for the real world:

- **Walking directions** — AR arrows on streets
- **Place information** — Point camera at business for details
- **Transit info** — See real-time arrivals at stops
- **Historical/cultural** — Learn about landmarks
- **Accessibility** — Highlight accessible entrances, elevators

---

## Architecture

### Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    ROADWORLD PORTAL                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Mobile App  │  │  Car Display │  │  Wearable    │       │
│  │  (iOS/And)   │  │  (CarPlay)   │  │  (Watch)     │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                 │                 │                │
│  ┌──────▼─────────────────▼─────────────────▼──────┐        │
│  │              NAVIGATION ENGINE                   │        │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐ │        │
│  │  │ Routing │ │ Traffic │ │ Transit │ │Geocoder│ │        │
│  │  │         │ │ Engine  │ │ Planner │ │        │ │        │
│  │  └─────────┘ └─────────┘ └─────────┘ └────────┘ │        │
│  └──────────────────────┬──────────────────────────┘        │
│                         │                                    │
│  ┌──────────────────────▼──────────────────────────┐        │
│  │              DISCOVERY ENGINE                    │        │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐ │        │
│  │  │ Places  │ │ Reviews │ │Recommend│ │ Events │ │        │
│  │  │ Index   │ │ Aggreg  │ │ Engine  │ │ Tracker│ │        │
│  │  └─────────┘ └─────────┘ └─────────┘ └────────┘ │        │
│  └──────────────────────┬──────────────────────────┘        │
│                         │                                    │
│  ┌──────────────────────▼──────────────────────────┐        │
│  │              CONTEXT ENGINE                      │        │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐ │        │
│  │  │ Pattern │ │ Intent  │ │Calendar │ │ Weather│ │        │
│  │  │ Learner │ │ Detector│ │ Sync    │ │ Service│ │        │
│  │  └─────────┘ └─────────┘ └─────────┘ └────────┘ │        │
│  └─────────────────────────────────────────────────┘        │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                    GOVERNANCE LAYER                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐            │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘            │
└─────────────────────────────────────────────────────────────┘
```

### Place Model

```typescript
interface Place {
  place_id: string;
  name: string;

  // Location
  location: {
    lat: number;
    lng: number;
    address: Address;
    what3words?: string;
  };

  // Categorization
  categories: string[];
  tags: string[];

  // Business info
  business: {
    hours: BusinessHours;
    phone?: string;
    website?: string;
    price_level: 1 | 2 | 3 | 4;
    reservations?: 'required' | 'recommended' | 'not_needed';
  };

  // Ratings & reviews
  ratings: {
    overall: number;
    count: number;
    aspects: {
      food?: number;
      service?: number;
      ambiance?: number;
      value?: number;
    };
  };

  // Real-time data
  live: {
    open_now: boolean;
    busy_level?: 'low' | 'moderate' | 'busy' | 'very_busy';
    wait_time_min?: number;
    last_updated: string;
  };

  // User relationship
  user_data?: {
    visited: boolean;
    visit_count: number;
    last_visit?: string;
    rating?: number;
    saved: boolean;
    notes?: string;
  };
}

interface Route {
  route_id: string;
  origin: Location;
  destination: Location;
  waypoints?: Location[];

  // Route options
  mode: 'driving' | 'transit' | 'walking' | 'cycling' | 'rideshare';

  // Segments
  segments: RouteSegment[];

  // Summary
  summary: {
    distance_m: number;
    duration_s: number;
    duration_in_traffic_s?: number;
    toll_cost?: number;
    transit_fare?: number;
  };

  // Conditions
  conditions: {
    traffic: 'light' | 'moderate' | 'heavy' | 'severe';
    weather_impact?: string;
    incidents?: Incident[];
  };

  // Context-aware scoring
  scores: {
    fastest: number;
    scenic: number;
    stress_free: number;
    eco_friendly: number;
  };
}
```

---

## Navigation Modes

### Driving

- Turn-by-turn with voice guidance
- Lane guidance and exit numbers
- Speed limit warnings
- Traffic rerouting
- Toll and HOV lane options
- Parking suggestions at destination

### Transit

- Multi-modal routing (bus, train, subway, ferry)
- Real-time arrival predictions
- Service alerts and delays
- Walking connections with accessibility options
- Fare calculation and payment integration
- First/last mile solutions (scooter, bike share)

### Walking

- Pedestrian-optimized routes
- Indoor navigation (malls, airports)
- Accessibility routing (wheelchair, stroller)
- Safety-aware routing (well-lit, busy streets)
- AR navigation overlay

### Cycling

- Bike lane preference routing
- Elevation profile
- Bike share station availability
- Secure parking locations
- E-bike range optimization

---

## User Experience

### Main Interface

```
┌─────────────────────────────────────────────────────────────┐
│ ≡  RoadWorld                          🔍 Search anywhere    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                      [MAP VIEW]                              │
│                                                              │
│         📍 You are here                                      │
│              ↓                                               │
│         ══════════════                                       │
│              ↓                                               │
│         🏢 Office (25 min)                                   │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  Quick Actions:                                              │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐               │
│  │🏠 Home │ │🏢 Work │ │☕ Coffee│ │⛽ Gas  │               │
│  └────────┘ └────────┘ └────────┘ └────────┘               │
├─────────────────────────────────────────────────────────────┤
│  📅 Upcoming:                                                │
│  • Meeting at HQ (2:00 PM) — Leave by 1:35 PM               │
│  • Dinner reservation (7:30 PM) — 15 min away               │
├─────────────────────────────────────────────────────────────┤
│  🤖 Suggestions for you:                                    │
│  • New ramen place opened near your gym (4.7★)              │
│  • Traffic lighter than usual on 101 — good commute day     │
└─────────────────────────────────────────────────────────────┘
```

### Voice Interaction

```
You: "Hey RoadWorld, find me a quiet place to work for a few hours"

RoadWorld: Looking for work-friendly spots nearby...

I found 3 options within 10 minutes:

1. Brew & Focus Café — Designed for remote work
   - Fast WiFi, outlets everywhere, quiet zones
   - Medium busy right now, should find a seat
   - 0.4 miles, 8 min walk

2. Central Library — Downtown branch
   - Free, very quiet, 2-hour laptop sections
   - Currently low occupancy
   - 0.6 miles, 12 min walk

3. The Study Hotel Lobby — Open to public
   - Upscale, great coffee, very quiet
   - Bit pricey but comfortable
   - 0.3 miles, 6 min walk

Which sounds good? Or should I look for something different?
```

---

## Data Sources & Integrations

### Data Partners

| Category | Sources |
|----------|---------|
| **Maps** | OpenStreetMap, proprietary data |
| **Traffic** | Aggregated GPS, DOT feeds |
| **Transit** | GTFS feeds, agency APIs |
| **Places** | Business data providers, user contributions |
| **Reviews** | Aggregated from multiple platforms |
| **Events** | Ticketing platforms, venue calendars |
| **Weather** | National weather services, local stations |

### Connected Services

| Service | Integration |
|---------|-------------|
| **Calendar** | Google Calendar, Outlook, Apple Calendar |
| **Rideshare** | Uber, Lyft (pricing, ETA) |
| **Parking** | SpotHero, ParkWhiz, garage APIs |
| **Transit** | Transit agencies, Moovit |
| **Reservations** | OpenTable, Resy, Yelp |
| **Tickets** | Eventbrite, Ticketmaster |

---

## Governance & Privacy

### Location Privacy

```yaml
policies:
  - scope: roadworld.location.collect
    rules:
      - condition: "precision == 'exact' AND purpose != 'navigation'"
        action: transform
        transform_fn: "reduce_precision_to_neighborhood"
        reason: "Exact location only needed during active navigation"

  - scope: roadworld.location.share
    rules:
      - condition: "recipient == 'third_party'"
        action: require_human_approval
        reason: "Location sharing with third parties needs consent"

  - scope: roadworld.history.retain
    rules:
      - condition: "age_days > 90"
        action: transform
        transform_fn: "anonymize_and_aggregate"
        reason: "Old location history is anonymized"
```

### Data Controls

- **Location history** — View, export, delete
- **Sharing controls** — Who sees your location, when
- **Incognito mode** — Navigate without saving history
- **Data minimization** — Collect only what's needed

---

## API Endpoints

### Navigation

```bash
# Get route
POST /portal/roadworld/routes
{
  "origin": {"lat": 37.7749, "lng": -122.4194},
  "destination": {"place_id": "place-123"},
  "mode": "driving",
  "preferences": {
    "avoid_tolls": true,
    "departure_time": "2025-11-30T14:00:00Z"
  }
}

# Start navigation session
POST /portal/roadworld/navigation/start
{
  "route_id": "route-456"
}

# Get live traffic
GET /portal/roadworld/traffic?bounds=37.7,-122.5,37.8,-122.3
```

### Discovery

```bash
# Search places
GET /portal/roadworld/places/search?q=coffee&near=37.7749,-122.4194

# Get place details
GET /portal/roadworld/places/{place_id}

# Get recommendations
POST /portal/roadworld/discover
{
  "context": {
    "intent": "lunch",
    "time_available_min": 60,
    "party_size": 2
  }
}
```

### Trip Planning

```bash
# Create itinerary
POST /portal/roadworld/trips
{
  "title": "Wine Country Saturday",
  "date": "2025-12-07",
  "preferences": {
    "interests": ["wine", "scenic", "food"],
    "pace": "relaxed"
  }
}

# Get itinerary
GET /portal/roadworld/trips/{trip_id}

# Book reservation through trip
POST /portal/roadworld/trips/{trip_id}/bookings
{
  "place_id": "place-winery-1",
  "time": "10:30",
  "party_size": 2
}
```

---

## Pricing Tiers

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0/mo | Basic navigation, limited discovery |
| **Plus** | $5/mo | Offline maps, advanced routing, no ads |
| **Pro** | $12/mo | Full discovery, trip planning, integrations |
| **Family** | $20/mo | 6 accounts, shared places, location sharing |
| **Business** | Custom | Fleet tracking, expense integration, API access |

---

## Roadmap

### MVP (Phase 1)
- [ ] Basic navigation (driving, walking)
- [ ] Place search and details
- [ ] Pattern learning (home, work)
- [ ] Calendar integration

### Beta (Phase 2)
- [ ] Transit navigation
- [ ] Contextual recommendations
- [ ] Trip planning
- [ ] Voice interaction

### v1.0 (Phase 3)
- [ ] AR navigation
- [ ] Full discovery engine
- [ ] Reservation integrations
- [ ] Offline maps

### Future
- [ ] Indoor navigation
- [ ] Predictive suggestions
- [ ] Social features (shared trips)
- [ ] Autonomous vehicle integration

---

## Competitive Differentiation

| Feature | RoadWorld | Google Maps | Waze | Apple Maps |
|---------|-----------|-------------|------|------------|
| Intent-aware routing | ✅ Yes | ❌ No | ❌ No | ❌ No |
| Context discovery | ✅ AI-powered | ⚠️ Basic | ❌ No | ⚠️ Basic |
| Pattern learning | ✅ Advanced | ⚠️ Limited | ❌ No | ⚠️ Limited |
| Trip planning | ✅ AI itineraries | ❌ Manual | ❌ No | ❌ No |
| Privacy controls | ✅ Granular | ⚠️ Limited | ⚠️ Limited | ✅ Good |
| Governance/audit | ✅ Full | ❌ No | ❌ No | ❌ No |

---

## References

- [Lucidia Portal](./lucidia.md)
- [RoadWork Portal](./roadwork.md)
- [RoadView Portal](./roadview.md)
- [RoadGlitch Portal](./roadglitch.md)
- [Architecture Overview](../meta/vision/architecture.md)
