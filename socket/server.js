require('dotenv').config();
const express = require("express");
const { WebSocketServer } = require("ws");
const geolib = require("geolib");

const app = express();
const HTTP_PORT = process.env.HTTP_PORT || 3001;
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