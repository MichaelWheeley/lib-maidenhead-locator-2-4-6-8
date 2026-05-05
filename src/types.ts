export type GridLocator = string;
export type LatLon = [number, number];
export interface WGS84 { lat: number; lon: number; }
export type CoordinateLike = LatLon | WGS84;
export type BoundingBox = { sw: WGS84; ne: WGS84; };
export type BoundingBoxLatLon = { sw: LatLon; ne: LatLon; };
