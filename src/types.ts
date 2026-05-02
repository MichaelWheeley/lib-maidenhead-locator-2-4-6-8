export type LatLon = [number, number];
export interface WGS84 {
  lat: number;
  lon: number;
}
export type CoordinateLike = LatLon | WGS84;
export type LatLonBounds = [LatLon, LatLon];

export type GridLocator = string;
