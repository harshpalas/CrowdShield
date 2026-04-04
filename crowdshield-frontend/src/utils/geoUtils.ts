/**
 * Calculates the distance between two points on the Earth's surface (Haversine formula).
 * @param lat1 Latitude of point 1
 * @param lng1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lng2 Longitude of point 2
 * @returns Distance in meters
 */
export const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * Calculates a point that is offset from a central point by a given distance and bearing.
 * Useful for finding detour waypoints around bottlenecked danger zones.
 * @param lat Latitude of center point
 * @param lng Longitude of center point
 * @param distance Distance in meters
 * @param bearing Bearing in degrees (0 = North, 90 = East, 180 = South, 270 = West)
 * @returns Offset {lat, lng} point
 */
export const calculateOffsetPoint = (lat: number, lng: number, distance: number, bearing: number) => {
    const R = 6371e3; // Earth radius in meters
    const δ = distance / R;
    const θ = (bearing * Math.PI) / 180;
    
    const φ1 = (lat * Math.PI) / 180;
    const λ1 = (lng * Math.PI) / 180;
  
    const φ2 = Math.asin(
      Math.sin(φ1) * Math.cos(δ) +
      Math.cos(φ1) * Math.sin(δ) * Math.cos(θ)
    );
    
    const λ2 = λ1 + Math.atan2(
      Math.sin(θ) * Math.sin(δ) * Math.cos(φ1),
      Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2)
    );
  
    return {
      lat: (φ2 * 180) / Math.PI,
      lng: (λ2 * 180) / Math.PI
    };
};
