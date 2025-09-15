# 🔌 RiderIN Socket Server

## Overview

The RiderIN Socket Server is a lightweight WebSocket server built with Node.js that handles real-time communication between users and drivers in the RiderIN ride-sharing platform. It manages location updates, ride requests, and driver matching functionality.

## 🏗️ Architecture Overview

### Core Technologies
- **Runtime**: Node.js
- **WebSocket**: Native WebSocket API (`ws` package)
- **Geolocation**: Geolib for distance calculations
- **Express**: HTTP server for basic endpoints
- **Real-time**: WebSocket connections for live updates

### Project Structure
```
socket/
├── server.js              # Main WebSocket server implementation
├── package.json           # Dependencies and scripts
└── node_modules/          # Installed dependencies
```

## 🔌 Current Implementation

### WebSocket Server Configuration
```javascript
const { WebSocketServer } = require("ws");
const wss = new WebSocketServer({ port: 8080 });
```

### Core Features

#### 1. Driver Location Tracking
```javascript
// Store driver locations in memory
let drivers = {};

// Handle location updates from drivers
if (data.type === "locationUpdate" && data.role === "driver") {
  drivers[data.driver] = {
    latitude: data.data.latitude,
    longitude: data.data.longitude,
  };
}
```

#### 2. Nearby Driver Discovery
```javascript
const findNearbyDrivers = (userLat, userLon) => {
  return Object.entries(drivers)
    .filter(([id, location]) => {
      const distance = geolib.getDistance(
        { latitude: userLat, longitude: userLon },
        location
      );
      return distance <= 5000; // 5 kilometers
    })
    .map(([id, location]) => ({ id, ...location }));
};
```

#### 3. Ride Request Handling
```javascript
if (data.type === "requestRide" && data.role === "user") {
  const nearbyDrivers = findNearbyDrivers(data.latitude, data.longitude);
  ws.send(
    JSON.stringify({ type: "nearbyDrivers", drivers: nearbyDrivers })
  );
}
```

## 📊 Current Features Status

- ✅ WebSocket connection management
- ✅ Driver location tracking
- ✅ Nearby driver discovery (5km radius)
- ✅ Real-time ride requests
- ✅ Distance calculation using Geolib
- ✅ JSON message parsing
- ✅ Error handling for malformed messages

## 🚀 Enhancement Recommendations

### 1. Architecture Improvements

#### Database Integration
```javascript
// MongoDB integration for persistent storage
const mongoose = require('mongoose');
const DriverLocation = require('./models/DriverLocation');

// Store driver locations in database
const updateDriverLocation = async (driverId, location) => {
  await DriverLocation.findOneAndUpdate(
    { driverId },
    { 
      location: { type: 'Point', coordinates: [location.longitude, location.latitude] },
      lastUpdated: new Date()
    },
    { upsert: true, new: true }
  );
};
```

#### Redis Caching
```javascript
// Redis for fast location queries
const redis = require('redis');
const client = redis.createClient();

// Store driver locations in Redis with TTL
const storeDriverLocation = async (driverId, location) => {
  await client.geoadd('drivers', location.longitude, location.latitude, driverId);
  await client.expire('drivers', 300); // 5 minutes TTL
};

// Find nearby drivers using Redis GEO commands
const findNearbyDriversRedis = async (userLat, userLon, radius = 5000) => {
  const results = await client.georadius(
    'drivers', 
    userLon, 
    userLat, 
    radius, 
    'm', 
    'WITHCOORD'
  );
  return results.map(([driverId, lon, lat]) => ({
    id: driverId,
    latitude: parseFloat(lat),
    longitude: parseFloat(lon)
  }));
};
```

### 2. Enhanced Real-time Features

#### Room Management
```javascript
// Socket.IO for better room management
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Join driver to location-based rooms
io.on('connection', (socket) => {
  socket.on('join_driver_room', (driverId, location) => {
    const room = `area_${Math.floor(location.lat * 100)}_${Math.floor(location.lng * 100)}`;
    socket.join(room);
    socket.driverId = driverId;
    socket.currentRoom = room;
  });

  socket.on('location_update', (location) => {
    // Update driver location
    updateDriverLocation(socket.driverId, location);
    
    // Notify nearby users
    const nearbyUsers = getNearbyUsers(location);
    nearbyUsers.forEach(userSocket => {
      userSocket.emit('driver_location_update', {
        driverId: socket.driverId,
        location
      });
    });
  });
});
```

#### Advanced Driver Matching
```javascript
// Enhanced driver matching algorithm
const findBestDrivers = async (userLocation, preferences = {}) => {
  const {
    maxDistance = 10000, // 10km default
    vehicleType = null,
    minRating = 0,
    maxWaitTime = 15 // minutes
  } = preferences;

  // Get nearby drivers from database
  const nearbyDrivers = await DriverLocation.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [userLocation.longitude, userLocation.latitude]
        },
        $maxDistance: maxDistance
      }
    },
    lastUpdated: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // Active within 5 minutes
  }).populate('driver');

  // Filter by preferences
  let filteredDrivers = nearbyDrivers.filter(driverLoc => {
    const driver = driverLoc.driver;
    return (
      (!vehicleType || driver.vehicle_type === vehicleType) &&
      driver.ratings >= minRating &&
      driver.status === 'active'
    );
  });

  // Sort by distance and rating
  filteredDrivers.sort((a, b) => {
    const distanceA = geolib.getDistance(userLocation, a.location.coordinates);
    const distanceB = geolib.getDistance(userLocation, b.location.coordinates);
    const ratingScoreA = a.driver.ratings * 0.3 + (1 / (distanceA / 1000)) * 0.7;
    const ratingScoreB = b.driver.ratings * 0.3 + (1 / (distanceB / 1000)) * 0.7;
    return ratingScoreB - ratingScoreA;
  });

  return filteredDrivers.slice(0, 10); // Return top 10 drivers
};
```

### 3. Performance Optimizations

#### Connection Pooling
```javascript
// Connection pooling for better performance
const WebSocket = require('ws');
const { EventEmitter } = require('events');

class ConnectionManager extends EventEmitter {
  constructor() {
    super();
    this.connections = new Map();
    this.driverConnections = new Map();
    this.userConnections = new Map();
  }

  addConnection(ws, type, id) {
    this.connections.set(ws, { type, id, lastPing: Date.now() });
    
    if (type === 'driver') {
      this.driverConnections.set(id, ws);
    } else if (type === 'user') {
      this.userConnections.set(id, ws);
    }
    
    this.emit('connection_added', { type, id, ws });
  }

  removeConnection(ws) {
    const connection = this.connections.get(ws);
    if (connection) {
      this.connections.delete(ws);
      
      if (connection.type === 'driver') {
        this.driverConnections.delete(connection.id);
      } else if (connection.type === 'user') {
        this.userConnections.delete(connection.id);
      }
      
      this.emit('connection_removed', connection);
    }
  }

  broadcastToDrivers(message, excludeId = null) {
    this.driverConnections.forEach((ws, driverId) => {
      if (driverId !== excludeId && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });
  }
}
```

#### Message Queuing
```javascript
// Message queuing for reliability
const Queue = require('bull');
const messageQueue = new Queue('websocket messages');

// Process messages asynchronously
messageQueue.process('location_update', async (job) => {
  const { driverId, location } = job.data;
  await updateDriverLocation(driverId, location);
  
  // Notify nearby users
  const nearbyUsers = await getNearbyUsers(location);
  nearbyUsers.forEach(userId => {
    const userWs = connectionManager.getUserConnection(userId);
    if (userWs) {
      userWs.send(JSON.stringify({
        type: 'driver_location_update',
        driverId,
        location
      }));
    }
  });
});

// Add location update to queue
const queueLocationUpdate = (driverId, location) => {
  messageQueue.add('location_update', { driverId, location }, {
    delay: 100, // 100ms delay to batch updates
    attempts: 3
  });
};
```

### 4. Security Enhancements

#### Authentication Middleware
```javascript
// JWT authentication for WebSocket connections
const jwt = require('jsonwebtoken');

const authenticateConnection = (ws, token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    ws.userId = decoded.id;
    ws.userType = decoded.type; // 'driver' or 'user'
    return true;
  } catch (error) {
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Invalid authentication token'
    }));
    ws.close();
    return false;
  }
};

// Enhanced message validation
const validateMessage = (message) => {
  const schema = {
    locationUpdate: {
      required: ['type', 'role', 'driver', 'data'],
      data: {
        required: ['latitude', 'longitude'],
        latitude: { type: 'number', min: -90, max: 90 },
        longitude: { type: 'number', min: -180, max: 180 }
      }
    },
    requestRide: {
      required: ['type', 'role', 'latitude', 'longitude'],
      latitude: { type: 'number', min: -90, max: 90 },
      longitude: { type: 'number', min: -180, max: 180 }
    }
  };

  const messageSchema = schema[message.type];
  if (!messageSchema) return false;

  // Validate required fields
  for (const field of messageSchema.required) {
    if (!message[field]) return false;
  }

  // Validate data types and ranges
  for (const [field, rules] of Object.entries(messageSchema)) {
    if (rules.type && typeof message[field] !== rules.type) return false;
    if (rules.min !== undefined && message[field] < rules.min) return false;
    if (rules.max !== undefined && message[field] > rules.max) return false;
  }

  return true;
};
```

#### Rate Limiting
```javascript
// Rate limiting for WebSocket connections
const rateLimit = require('express-rate-limit');
const RateLimiter = require('limiter').RateLimiter;

class WebSocketRateLimiter {
  constructor() {
    this.limiters = new Map();
  }

  getLimiter(ws) {
    const key = ws.userId || ws._socket.remoteAddress;
    if (!this.limiters.has(key)) {
      this.limiters.set(key, new RateLimiter(10, 'second')); // 10 messages per second
    }
    return this.limiters.get(key);
  }

  checkLimit(ws) {
    const limiter = this.getLimiter(ws);
    if (limiter.tryRemoveTokens(1)) {
      return true;
    } else {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Rate limit exceeded'
      }));
      return false;
    }
  }
}
```

### 5. Monitoring & Analytics

#### Health Monitoring
```javascript
// Health check endpoint
const healthCheck = {
  status: 'healthy',
  uptime: process.uptime(),
  connections: {
    total: connectionManager.connections.size,
    drivers: connectionManager.driverConnections.size,
    users: connectionManager.userConnections.size
  },
  memory: process.memoryUsage(),
  timestamp: new Date().toISOString()
};

// Metrics collection
const metrics = {
  messagesReceived: 0,
  messagesSent: 0,
  locationUpdates: 0,
  rideRequests: 0,
  errors: 0
};

// Prometheus metrics
const prometheus = require('prom-client');
const register = new prometheus.Registry();

const messageCounter = new prometheus.Counter({
  name: 'websocket_messages_total',
  help: 'Total number of WebSocket messages',
  labelNames: ['type', 'status'],
  registers: [register]
});

const connectionGauge = new prometheus.Gauge({
  name: 'websocket_connections_active',
  help: 'Number of active WebSocket connections',
  labelNames: ['type'],
  registers: [register]
});
```

#### Logging
```javascript
// Structured logging
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'socket-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'socket-combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Log WebSocket events
const logWebSocketEvent = (event, data) => {
  logger.info({
    event,
    timestamp: new Date().toISOString(),
    data: {
      type: data.type,
      userId: data.userId,
      driverId: data.driverId,
      connectionCount: connectionManager.connections.size
    }
  });
};
```

### 6. Testing Implementation

#### Unit Tests
```javascript
// Jest tests for WebSocket functionality
const WebSocket = require('ws');
const { createServer } = require('http');

describe('WebSocket Server', () => {
  let server;
  let wss;
  let client;

  beforeEach((done) => {
    server = createServer();
    wss = new WebSocketServer({ server });
    server.listen(0, () => {
      const port = server.address().port;
      client = new WebSocket(`ws://localhost:${port}`);
      client.on('open', done);
    });
  });

  afterEach(() => {
    client.close();
    wss.close();
    server.close();
  });

  it('should handle location updates', (done) => {
    const locationUpdate = {
      type: 'locationUpdate',
      role: 'driver',
      driver: 'driver123',
      data: { latitude: 40.7128, longitude: -74.0060 }
    };

    client.send(JSON.stringify(locationUpdate));
    
    client.on('message', (data) => {
      const message = JSON.parse(data);
      expect(message.type).toBe('location_updated');
      done();
    });
  });

  it('should find nearby drivers', (done) => {
    // Add test driver location
    drivers['driver123'] = { latitude: 40.7128, longitude: -74.0060 };
    
    const rideRequest = {
      type: 'requestRide',
      role: 'user',
      latitude: 40.7130,
      longitude: -74.0062
    };

    client.send(JSON.stringify(rideRequest));
    
    client.on('message', (data) => {
      const message = JSON.parse(data);
      expect(message.type).toBe('nearbyDrivers');
      expect(message.drivers).toHaveLength(1);
      done();
    });
  });
});
```

## 📋 Implementation Priority

### High Priority
- ✅ Database integration for persistent storage
- ✅ Redis caching for fast location queries
- ✅ Authentication middleware
- ✅ Message validation and sanitization
- ✅ Error handling and logging

### Medium Priority
- ⚡ Socket.IO migration for better features
- ⚡ Advanced driver matching algorithm
- ⚡ Connection pooling and management
- ⚡ Rate limiting implementation
- ⚡ Health monitoring endpoints

### Low Priority
- 📊 Prometheus metrics integration
- 🧪 Comprehensive testing suite
- 📈 Performance analytics
- 🔒 Advanced security features
- 📚 API documentation

## 🛠️ Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (for persistent storage)
- Redis (for caching)

### Installation
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start development server
npm start

# Start with PM2 for production
pm2 start server.js --name "riderin-socket"
```

### Environment Variables
Create a `.env` file:
```env
# Server Configuration
PORT=8080
HTTP_PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/riderin
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your-jwt-secret

# Monitoring
PROMETHEUS_PORT=9090
```

## 🔧 Development Notes

- The server uses native WebSocket API for real-time communication
- Driver locations are stored in memory (consider database for production)
- Distance calculations use the Haversine formula via Geolib
- Maximum search radius is currently set to 5km
- No authentication is currently implemented (security risk)

## 📞 Support

For development questions or issues, refer to the main project documentation or contact the development team.

---

*This documentation provides a comprehensive overview of the RiderIN Socket Server architecture, features, and enhancement recommendations for future development.*
