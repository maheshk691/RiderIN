# 🔌 RiderIN Socket Server - Local Development & Testing Guide

## Overview

This guide provides comprehensive instructions for setting up and testing the RiderIN Socket Server locally on your system. The socket server handles real-time communication for location tracking and ride requests using WebSocket technology.

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Development Environment Setup](#development-environment-setup)
3. [Project Setup](#project-setup)
4. [Socket Server Configuration](#socket-server-configuration)
5. [WebSocket Development Server](#websocket-development-server)
6. [Real-time Testing](#real-time-testing)
7. [Location Services Testing](#location-services-testing)
8. [Client Integration Testing](#client-integration-testing)
9. [Debugging & Development Tools](#debugging--development-tools)
10. [Common Issues & Solutions](#common-issues--solutions)
11. [Development Workflow](#development-workflow)

## 🖥️ System Requirements

### Minimum Requirements
- **OS**: Windows 10/11, macOS 10.15+, or Ubuntu 18.04+
- **RAM**: 2GB minimum (4GB recommended)
- **Storage**: 1GB free space
- **Node.js**: v14.0.0 or higher
- **Git**: Latest version

### Recommended Development Setup
- **IDE**: Visual Studio Code with JavaScript/Node.js extensions
- **Terminal**: PowerShell (Windows), Terminal (macOS), or Bash (Linux)
- **WebSocket Testing**: WebSocket King or wscat
- **API Testing**: Postman or Insomnia

## 🛠️ Development Environment Setup

### 1. Install Node.js

#### Windows
```powershell
# Download and install Node.js from https://nodejs.org/
# Or use Chocolatey
choco install nodejs

# Verify installation
node --version
npm --version
```

#### macOS
```bash
# Using Homebrew
brew install node

# Or download from https://nodejs.org/
# Verify installation
node --version
npm --version
```

#### Linux (Ubuntu/Debian)
```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 2. Install WebSocket Testing Tools

#### Install wscat (WebSocket Client)
```bash
# Install wscat globally
npm install -g wscat

# Verify installation
wscat --version
```

#### Install WebSocket King (Optional)
```bash
# Download from https://websocketking.com/
# Or use browser-based WebSocket clients
```

## 📁 Project Setup

### 1. Clone and Navigate to Socket Server

```bash
# Navigate to your project directory
cd /path/to/ridewave/socket

# Install dependencies
npm install

# Verify project structure
ls -la
```

### 2. Project Structure Overview

```
socket/
├── server.js              # Main WebSocket server
├── package.json            # Dependencies
└── node_modules/          # Installed packages
```

### 3. Dependencies Analysis

#### Core Dependencies
```json
{
  "express": "^4.19.2",      // HTTP server
  "ws": "^8.18.0",           // WebSocket library
  "geolib": "^3.3.4"         // Geographic calculations
}
```

#### Key Features
- **WebSocket Server**: Real-time communication
- **Location Tracking**: Driver location updates
- **Ride Matching**: Find nearby drivers
- **Geographic Calculations**: Distance calculations

## ⚙️ Socket Server Configuration

### 1. Server Configuration

#### Default Configuration
```javascript
// server.js configuration
const PORT = 3000;           // HTTP server port
const WS_PORT = 8080;        // WebSocket server port
const MAX_DISTANCE = 5000;   // Maximum distance in meters (5km)
```

#### Environment Configuration
```bash
# Create .env file
touch .env
```

#### Environment Variables (.env)
```bash
# Server Configuration
HTTP_PORT=3000
WS_PORT=8080
NODE_ENV=development

# Location Configuration
MAX_DISTANCE=5000
DEFAULT_RADIUS=5000

# Development Settings
DEBUG=true
LOG_LEVEL=debug
```

### 2. Update Server Configuration

#### Enhanced server.js
```javascript
require('dotenv').config();
const express = require("express");
const { WebSocketServer } = require("ws");
const geolib = require("geolib");

const app = express();
const HTTP_PORT = process.env.HTTP_PORT || 3000;
const WS_PORT = process.env.WS_PORT || 8080;
const MAX_DISTANCE = process.env.MAX_DISTANCE || 5000;

// Store driver locations
let drivers = {};

// Create WebSocket server
const wss = new WebSocketServer({ port: WS_PORT });

// WebSocket connection handling
wss.on("connection", (ws) => {
  console.log("New WebSocket connection established");
  
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      console.log("Received message:", data);

      // Handle different message types
      switch (data.type) {
        case "locationUpdate":
          handleLocationUpdate(ws, data);
          break;
        case "requestRide":
          handleRideRequest(ws, data);
          break;
        case "ping":
          handlePing(ws);
          break;
        default:
          console.log("Unknown message type:", data.type);
      }
    } catch (error) {
      console.error("Failed to parse WebSocket message:", error);
    }
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed");
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

// Message handlers
function handleLocationUpdate(ws, data) {
  if (data.role === "driver") {
    drivers[data.driver] = {
      latitude: data.data.latitude,
      longitude: data.data.longitude,
      timestamp: Date.now()
    };
    console.log("Updated driver location:", drivers[data.driver]);
  }
}

function handleRideRequest(ws, data) {
  if (data.role === "user") {
    console.log("Requesting ride...");
    const nearbyDrivers = findNearbyDrivers(data.latitude, data.longitude);
    
    ws.send(JSON.stringify({
      type: "nearbyDrivers",
      drivers: nearbyDrivers,
      count: nearbyDrivers.length
    }));
  }
}

function handlePing(ws) {
  ws.send(JSON.stringify({
    type: "pong",
    timestamp: Date.now()
  }));
}

// Find nearby drivers
function findNearbyDrivers(userLat, userLon) {
  return Object.entries(drivers)
    .filter(([id, location]) => {
      const distance = geolib.getDistance(
        { latitude: userLat, longitude: userLon },
        location
      );
      return distance <= MAX_DISTANCE;
    })
    .map(([id, location]) => ({
      id,
      ...location,
      distance: geolib.getDistance(
        { latitude: userLat, longitude: userLon },
        location
      )
    }))
    .sort((a, b) => a.distance - b.distance);
}

// HTTP server for health checks
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    activeConnections: wss.clients.size,
    activeDrivers: Object.keys(drivers).length
  });
});

app.get("/drivers", (req, res) => {
  res.json({
    drivers: Object.keys(drivers).length,
    locations: drivers
  });
});

// Start HTTP server
app.listen(HTTP_PORT, () => {
  console.log(`HTTP Server is running on port ${HTTP_PORT}`);
});

// Start WebSocket server
console.log(`WebSocket Server is running on port ${WS_PORT}`);
```

## 🚀 WebSocket Development Server

### 1. Start Development Server

```bash
# Navigate to socket directory
cd socket

# Start socket server
npm start

# Alternative commands
node server.js
```

### 2. Development Server Options

```bash
# Start with nodemon for auto-restart
npx nodemon server.js

# Start with debugging
node --inspect server.js

# Start with specific environment
NODE_ENV=development node server.js
```

### 3. Server Endpoints

#### Health Check
```bash
# Check server health
curl http://localhost:3000/health

# Expected response
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "activeConnections": 0,
  "activeDrivers": 0
}
```

#### Driver Locations
```bash
# Get current driver locations
curl http://localhost:3000/drivers

# Expected response
{
  "drivers": 0,
  "locations": {}
}
```

## 🔌 Real-time Testing

### 1. WebSocket Connection Testing

#### Using wscat
```bash
# Connect to WebSocket server
wscat -c ws://localhost:8080

# Send test message
{"type": "ping"}

# Expected response
{"type": "pong", "timestamp": 1704067200000}
```

#### Using Browser Console
```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:8080');

// Handle connection
ws.onopen = function() {
  console.log('Connected to WebSocket server');
  
  // Send ping message
  ws.send(JSON.stringify({type: 'ping'}));
};

// Handle messages
ws.onmessage = function(event) {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};

// Handle errors
ws.onerror = function(error) {
  console.error('WebSocket error:', error);
};

// Handle close
ws.onclose = function() {
  console.log('WebSocket connection closed');
};
```

### 2. Location Update Testing

#### Simulate Driver Location Update
```bash
# Connect as driver
wscat -c ws://localhost:8080

# Send location update
{
  "type": "locationUpdate",
  "role": "driver",
  "driver": "driver_001",
  "data": {
    "latitude": 37.78825,
    "longitude": -122.4324
  }
}
```

#### Simulate User Ride Request
```bash
# Connect as user
wscat -c ws://localhost:8080

# Send ride request
{
  "type": "requestRide",
  "role": "user",
  "latitude": 37.78825,
  "longitude": -122.4324
}
```

### 3. Multi-Client Testing

#### Test Script
```javascript
// test-multi-client.js
const WebSocket = require('ws');

// Create multiple connections
const clients = [];

for (let i = 0; i < 5; i++) {
  const ws = new WebSocket('ws://localhost:8080');
  
  ws.on('open', () => {
    console.log(`Client ${i} connected`);
    
    // Send location update
    ws.send(JSON.stringify({
      type: 'locationUpdate',
      role: 'driver',
      driver: `driver_${i}`,
      data: {
        latitude: 37.78825 + (Math.random() - 0.5) * 0.01,
        longitude: -122.4324 + (Math.random() - 0.5) * 0.01
      }
    }));
  });
  
  ws.on('message', (data) => {
    console.log(`Client ${i} received:`, JSON.parse(data));
  });
  
  clients.push(ws);
}

// Test ride request after 2 seconds
setTimeout(() => {
  const userWs = new WebSocket('ws://localhost:8080');
  
  userWs.on('open', () => {
    userWs.send(JSON.stringify({
      type: 'requestRide',
      role: 'user',
      latitude: 37.78825,
      longitude: -122.4324
    }));
  });
  
  userWs.on('message', (data) => {
    console.log('Ride request response:', JSON.parse(data));
  });
}, 2000);
```

#### Run Test Script
```bash
# Run multi-client test
node test-multi-client.js
```

## 📍 Location Services Testing

### 1. Geographic Calculations Testing

#### Test Distance Calculation
```javascript
// test-distance.js
const geolib = require('geolib');

// Test locations
const location1 = { latitude: 37.78825, longitude: -122.4324 };
const location2 = { latitude: 37.78425, longitude: -122.4284 };

// Calculate distance
const distance = geolib.getDistance(location1, location2);
console.log(`Distance: ${distance} meters`);

// Test if within radius
const radius = 5000;
const isWithinRadius = distance <= radius;
console.log(`Within ${radius}m radius: ${isWithinRadius}`);
```

#### Test Multiple Locations
```javascript
// test-multiple-locations.js
const geolib = require('geolib');

const userLocation = { latitude: 37.78825, longitude: -122.4324 };
const drivers = [
  { id: '1', latitude: 37.78825, longitude: -122.4324 },
  { id: '2', latitude: 37.78425, longitude: -122.4284 },
  { id: '3', latitude: 37.79225, longitude: -122.4364 },
  { id: '4', latitude: 37.78025, longitude: -122.4204 }
];

// Find nearby drivers
const nearbyDrivers = drivers
  .map(driver => ({
    ...driver,
    distance: geolib.getDistance(userLocation, driver)
  }))
  .filter(driver => driver.distance <= 5000)
  .sort((a, b) => a.distance - b.distance);

console.log('Nearby drivers:', nearbyDrivers);
```

### 2. Real-time Location Updates

#### Simulate Continuous Location Updates
```javascript
// simulate-driver-movement.js
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8080');
let latitude = 37.78825;
let longitude = -122.4324;

ws.on('open', () => {
  console.log('Driver connected');
  
  // Simulate movement every 5 seconds
  setInterval(() => {
    // Random movement
    latitude += (Math.random() - 0.5) * 0.001;
    longitude += (Math.random() - 0.5) * 0.001;
    
    ws.send(JSON.stringify({
      type: 'locationUpdate',
      role: 'driver',
      driver: 'driver_001',
      data: { latitude, longitude }
    }));
    
    console.log(`Location updated: ${latitude}, ${longitude}`);
  }, 5000);
});
```

## 📱 Client Integration Testing

### 1. React Native WebSocket Testing

#### Test WebSocket Connection
```javascript
// Test WebSocket connection in React Native
import { WebSocket } from 'react-native';

const testWebSocketConnection = () => {
  const ws = new WebSocket('ws://localhost:8080');
  
  ws.onopen = () => {
    console.log('Connected to socket server');
    
    // Send location update
    ws.send(JSON.stringify({
      type: 'locationUpdate',
      role: 'driver',
      driver: 'test_driver',
      data: {
        latitude: 37.78825,
        longitude: -122.4324
      }
    }));
  };
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Received:', data);
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  ws.onclose = () => {
    console.log('WebSocket connection closed');
  };
};
```

### 2. API Integration Testing

#### Test with Main Server
```bash
# Start main server
cd ../server
npm run dev

# Start socket server
cd ../socket
npm start

# Test integration
curl http://localhost:3000/test
curl http://localhost:3000/health
```

## 🔧 Debugging & Development Tools

### 1. VS Code Configuration

#### Install Extensions
```bash
# Recommended VS Code extensions:
# - JavaScript (ES6) code snippets
# - Node.js Extension Pack
# - REST Client
# - Thunder Client
```

#### VS Code Settings
```json
// .vscode/settings.json
{
  "javascript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### 2. Debugging Configuration

#### VS Code Launch Configuration
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Socket Server",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/server.js",
      "env": {
        "NODE_ENV": "development",
        "DEBUG": "true"
      },
      "console": "integratedTerminal",
      "restart": true
    }
  ]
}
```

### 3. Logging Setup

#### Enhanced Logging
```javascript
// Add to server.js
const log = (message, data = null) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`, data ? JSON.stringify(data, null, 2) : '');
};

// Usage
log('WebSocket connection established');
log('Location update received', data);
log('Ride request processed', nearbyDrivers);
```

## 🚨 Common Issues & Solutions

### 1. Connection Issues

#### WebSocket Connection Failed
```bash
# Check if server is running
netstat -an | grep 8080

# Check firewall settings
# Windows: Check Windows Firewall
# macOS: Check System Preferences > Security & Privacy
# Linux: Check iptables or ufw
```

#### Port Already in Use
```bash
# Find process using port 8080
lsof -i :8080

# Kill process
kill -9 <PID>

# Or use different port
WS_PORT=8081 node server.js
```

### 2. Message Parsing Issues

#### Invalid JSON
```javascript
// Add error handling
ws.on('message', (message) => {
  try {
    const data = JSON.parse(message);
    // Process message
  } catch (error) {
    console.error('Invalid JSON received:', message);
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Invalid JSON format'
    }));
  }
});
```

### 3. Location Calculation Issues

#### Invalid Coordinates
```javascript
// Validate coordinates
function validateCoordinates(lat, lon) {
  return (
    typeof lat === 'number' && 
    typeof lon === 'number' &&
    lat >= -90 && lat <= 90 &&
    lon >= -180 && lon <= 180
  );
}

// Use in location update
if (validateCoordinates(data.data.latitude, data.data.longitude)) {
  // Process location update
} else {
  console.error('Invalid coordinates:', data.data);
}
```

## 🔄 Development Workflow

### 1. Daily Development Routine

```bash
# Morning setup
cd socket
npm start

# Test WebSocket connections
wscat -c ws://localhost:8080

# Make changes to code
# Test real-time functionality
# Debug issues
# Commit changes

# Evening cleanup
# Stop socket server
# Commit final changes
```

### 2. Feature Development

```bash
# Create feature branch
git checkout -b feature/websocket-enhancement

# Develop feature
# Test thoroughly
# Create pull request
# Merge to main
```

### 3. Testing Checklist

- [ ] Socket server starts successfully
- [ ] WebSocket connections work
- [ ] Location updates are processed
- [ ] Ride requests return nearby drivers
- [ ] Distance calculations are accurate
- [ ] Multiple clients can connect
- [ ] Error handling works properly
- [ ] Health check endpoint works

### 4. Performance Monitoring

```javascript
// Monitor performance
const startTime = Date.now();

// Your code here

const endTime = Date.now();
console.log(`Execution time: ${endTime - startTime} ms`);
```

## 📞 Support & Resources

### Documentation Links
- [WebSocket API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Node.js WebSocket Library](https://github.com/websockets/ws)
- [Geolib Documentation](https://github.com/manuelbieh/geolib)
- [Express.js Documentation](https://expressjs.com/)

### Community Support
- [Node.js Community](https://github.com/nodejs)
- [WebSocket Community](https://github.com/websockets)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/websocket)

### Development Tools
- [wscat](https://github.com/websockets/wscat)
- [WebSocket King](https://websocketking.com/)
- [Postman](https://www.postman.com/)

---

*This socket server development guide provides comprehensive instructions for setting up and testing the RideWave Socket Server locally. Follow these steps carefully and adapt them to your specific development environment.*
