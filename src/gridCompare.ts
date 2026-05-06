import { Grid } from "./grid";

/**
 * Calculate bearing between two points
 */
const calculateBearing = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) => {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
};

/**
 * Calculate distance between two points in km
 */
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) => {
  const R = 6371;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export class GridCompare {
  private gridOrigin: Grid;
  private gridDestination: Grid;
  readonly distance_km: any;
  readonly bearing_deg: any;

  constructor(origin: Grid, destination: Grid) {
    this.gridOrigin = origin;
    this.gridDestination = destination;

    if (this.isValid) {
      const origin = this.gridOrigin.locationWGS84;
      const destination = this.gridDestination.locationWGS84;
      this.distance_km = calculateDistance(
        origin!.lat,
        origin!.lon,
        destination!.lat,
        destination!.lon,
      );
      this.bearing_deg = calculateBearing(
        origin!.lat,
        origin!.lon,
        destination!.lat,
        destination!.lon,
      );
    } else {
      this.distance_km = null;
      this.bearing_deg = null;
    }
  }

  get isValid(): boolean {
    return this.gridOrigin.isValid && this.gridDestination.isValid;
  }
}
