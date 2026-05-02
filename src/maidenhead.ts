import { CoordinateLike, GridLocator, LatLon, WGS84 } from "./types";

// code was originally based on https://github.com/HoshinoSuzumi/lib-maidenhead-locator
// however it was found the original code does not support Maidenhead grid locators other than 6 characters even though 2 and 4 digit squares are valid.
// Also, the original code does not have support for bounding box coordinates which are useful for mapping applications.

/**
 * Validate Maidenhead grid locator, can be 2, 4, or 6 characters long
 * @param gridLocator Maidenhead grid locator
 * @returns true if the grid locator is valid, else false
 */
const validateGridLocator = (gridLocator: GridLocator): boolean => {
  if (typeof gridLocator !== 'string') return false
  if (gridLocator.length < 2 || gridLocator.length > 6) return false
  if (gridLocator.length % 2 !== 0) return false
  const regex = /^[A-R]{2}(?:[0-9]{2})?(?:[A-Xa-x]{2})?$/
  return regex.test(gridLocator)
}

/**
 * Convert Maidenhead grid locator to latitude/longitude coordinates
 * @param grid Maidenhead grid locator
 * @returns Latitude and longitude coordinates
 */
const maidenheadToWGS84 = (grid: GridLocator): WGS84 => {
  const bbox: LatLon[] = maidenheadToBoundingBox(grid);

  if (!bbox || bbox.length !== 2 || bbox[0]!.length !== 2 || bbox[1]!.length !== 2) return {lat: 0, lon: 0} as WGS84;
  const lat = (bbox[0]![0] + bbox[1]![0]) / 2;
  const lon = (bbox[0]![1] + bbox[1]![1]) / 2;
  return {lat, lon} as WGS84;
}

const maidenheadToLatLon = (grid: GridLocator): LatLon => {
  const wgs84 = maidenheadToWGS84(grid);
  return [wgs84.lat, wgs84.lon];
}

const wgs84ToMaidenhead = (coord: CoordinateLike, precision = 6): GridLocator => {
  return latLonToMaidenhead(coord, precision);
}

// Convert lat/lon to Maidenhead grid at given precision
/**
 * Convert latitude/longitude coordinates to Maidenhead grid locator at specified precision (2, 4, or 6 characters)
 * @param coord Latitude/longitude coordinates
 * @param precision Precision of the grid locator, can be 2, 4, or 6 characters long (default is 6)
 * @returns Maidenhead grid locator
 */
const latLonToMaidenhead = (coord: CoordinateLike, precision = 6): GridLocator => {

  if (typeof coord !== 'object' && !Array.isArray(coord)) throw new Error("invalid coord. it should be [number, number] or {lat: number, lng: number}")
  const { lat, lon }: WGS84 = Array.isArray(coord) ? { lat: coord[0], lon: coord[1] } : coord
  if (lat < -90 || lat > 90) throw new Error("invalid latitude, it should be between -90 and 90")
  if (lon < -180 || lon > 180) throw new Error("invalid longitude, it should be between -180 and 180")

  const latNorm = lat + 90;
  const lonNorm = lon + 180;

  // Field (2 chars): 20° lon x 10° lat
  const field1 = String.fromCharCode(65 + Math.floor(lonNorm / 20)); // A-R
  const field2 = String.fromCharCode(65 + Math.floor(latNorm / 10)); // A-R

  if (precision === 2) {
    return `${field1}${field2}`;
  }

  // Square (2 digits): 2° lon x 1° lat
  const square1 = Math.floor((lonNorm % 20) / 2);
  const square2 = Math.floor((latNorm % 10) / 1);

  if (precision === 4) {
    return `${field1}${field2}${square1}${square2}`;
  }

  // Subsquare (2 chars): 5' lon x 2.5' lat
  const subsq1 = String.fromCharCode(97 + Math.floor(((lonNorm % 2) * 60) / 5)); // a-x
  const subsq2 = String.fromCharCode(97 + Math.floor(((latNorm % 1) * 60) / 2.5)); // a-x

  return `${field1}${field2}${square1}${square2}${subsq1}${subsq2}`;
}

/**
 * Convert Maidenhead grid square to lat/lon bounding box coordinates, [SW, NE] corners
 * @param grid Maidenhead grid locator
 * @returns A two-dimensional array containing two diagonal coordinates of bounds
 */
const maidenheadToBoundingBox = (grid: GridLocator): LatLon[] => {
  if (!grid || grid.length < 2)
    return [
      [0, 0],
      [1, 1],
    ];

  const gridUpper = grid.toUpperCase();
  let minLat = -90;
  let maxLat = 90;
  let minLon = -180;
  let maxLon = 180;

  // Field (2 chars): 20° lon x 10° lat
  if (gridUpper.length >= 2) {
    const fieldLon = gridUpper.charCodeAt(0) - 65; // A-R
    const fieldLat = gridUpper.charCodeAt(1) - 65; // A-R

    minLon = -180 + fieldLon * 20;
    maxLon = minLon + 20;
    minLat = -90 + fieldLat * 10;
    maxLat = minLat + 10;
  }

  // Square (2 digits): 2° lon x 1° lat
  if (gridUpper.length >= 4) {
    const sqLon = parseInt(gridUpper[2]!);
    const sqLat = parseInt(gridUpper[3]!);

    minLon += sqLon * 2;
    maxLon = minLon + 2;
    minLat += sqLat * 1;
    maxLat = minLat + 1;
  }

  // Subsquare (2 chars): 5' lon x 2.5' lat
  if (gridUpper.length >= 6) {
    const subLon = gridUpper.charCodeAt(4) - 65; // A thru X
    const subLat = gridUpper.charCodeAt(5) - 65 // A thru X

    minLon += (subLon * 5) / 60;
    maxLon = minLon + 5 / 60;
    minLat += (subLat * 2.5) / 60;
    maxLat = minLat + 2.5 / 60;
  }

  return [
    [minLat, minLon],
    [maxLat, maxLon],
  ];
}

export {
  validateGridLocator,
  maidenheadToLatLon,
  maidenheadToWGS84,
  latLonToMaidenhead,
  wgs84ToMaidenhead,
  maidenheadToBoundingBox
}
