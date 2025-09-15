// OSM Routing utility for replacing Google Maps Directions API
export interface OSMRoute {
  coordinates: Array<{ latitude: number; longitude: number }>;
  distance: number;
  duration: number;
}

export interface OSMWaypoint {
  latitude: number;
  longitude: number;
}

export const getOSMRoute = async (
  origin: OSMWaypoint,
  destination: OSMWaypoint
): Promise<OSMRoute | null> => {
  try {
    // Using OpenRouteService API (free tier available)
    // Alternative: You can use other OSM-based routing services like GraphHopper, OSRM, etc.
    const response = await fetch(
      `https://api.openrouteservice.org/v2/directions/driving-car/json?api_key=${process.env.EXPO_PUBLIC_OPENROUTE_API_KEY}&start=${origin.longitude},${origin.latitude}&end=${destination.longitude},${destination.latitude}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const route = data.features[0];
      const coordinates = route.geometry.coordinates.map((coord: [number, number]) => ({
        latitude: coord[1],
        longitude: coord[0]
      }));

      return {
        coordinates,
        distance: route.properties.summary.distance,
        duration: route.properties.summary.duration
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching OSM route:', error);
    return null;
  }
};

// Fallback routing using OSRM (completely free, no API key required)
export const getOSRMRoute = async (
  origin: OSMWaypoint,
  destination: OSMWaypoint
): Promise<OSMRoute | null> => {
  try {
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const coordinates = route.geometry.coordinates.map((coord: [number, number]) => ({
        latitude: coord[1],
        longitude: coord[0]
      }));

      return {
        coordinates,
        distance: route.distance,
        duration: route.duration
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching OSRM route:', error);
    return null;
  }
};
