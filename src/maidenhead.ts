import { CoordinateLike, GridLocator, LatLon, WGS84 } from "./types";

// code was originally based on https://github.com/HoshinoSuzumi/lib-maidenhead-locator
// however it was found the original code does not support Maidenhead grid locators other than 6 characters even though 2, 4, 6, and 8 digit locators are valid.
// Also, the original code does not have support for bounding box coordinates which are useful for mapping applications.

/**
 * Validate Maidenhead grid locator, can be 2, 4, 6, or 8 characters long, e.g. DM, DM12, DM12kv, or DM12kv99 are all valid locators.
 *
 * @param {GridLocator} gridLocator Maidenhead grid locator
 * @returns {boolean} true if the grid locator is valid, else false
 */
const validateGridLocator = (gridLocator: GridLocator): boolean => {
  if (!gridLocator || typeof gridLocator !== "string") return false;
  if (gridLocator.length < 2 || gridLocator.length > 8) return false;
  if (gridLocator.length % 2 !== 0) return false;
  const regex = /^[A-R]{2}([0-9]{2}([A-Xa-x]{2}([0-9]{2})?)?)?$/;
  return regex.test(gridLocator);
};

/**
 * Convert Maidenhead grid locator to latitude/longitude
 *
 * @param {GridLocator} grid Maidenhead grid locator
 * @returns {(WGS84 | null)} Latitude and longitude coordinates as WGS84
 */
const maidenheadToWGS84 = (grid: GridLocator): WGS84 | null => {
  const bbox: LatLon[] | null = maidenheadToBoundingBox(grid);
  if (bbox === null) return null;
  const lat = (bbox[0]![0] + bbox[1]![0]) / 2;
  const lon = (bbox[0]![1] + bbox[1]![1]) / 2;
  return { lat, lon } as WGS84;
};

/**
 * Convert Maidenhead grid locator to latitude/longitude
 *
 * @param {GridLocator} grid Maidenhead grid locator
 * @returns {(LatLon | null)} Latitude and longitude coordinates
 */
const maidenheadToLatLon = (grid: GridLocator): LatLon | null => {
  const wgs84 = maidenheadToWGS84(grid);
  return wgs84 === null ? null : [wgs84.lat, wgs84.lon];
};

/**
 * Convert latitude/longitude coordinates to Maidenhead grid locator of specified precision (character length)
 *
 * @param {CoordinateLike} coord latitude/longitude coordinates
 * @param {number} [precision=6] Precision (character length) of the grid locator returned, can be 2, 4, 6, or 8. (default if not specified is 6)
 * @returns {(GridLocator | null)} Maidenhead grid locator
 * @see maidenheadToLatLon
 */
const wgs84ToMaidenhead = (
  coord: CoordinateLike,
  precision = 6,
): GridLocator | null => {
  return latLonToMaidenhead(coord, precision);
};

/**
 * Convert latitude/longitude coordinates to Maidenhead grid locator of specified precision (character length)
 *
 * @param {CoordinateLike} coord latitude/longitude coordinates
 * @param {number} [precision=6] Precision (character length) of the grid locator returned, can be 2, 4, 6, or 8. (default if not specified is 6)
 * @returns {(GridLocator | null)} Maidenhead grid locator
 */
const latLonToMaidenhead = (
  coord: CoordinateLike,
  precision = 6,
): GridLocator | null => {
  const {lat, lon}: WGS84 = Array.isArray(coord) ? { lat: coord[0], lon: coord[1] } : coord;
  if (lat < -90 || lat > 90)
    return null; // invalid latitude, it should be between -90 and 90
  if (lon < -180 || lon > 180)
    return null; // invalid longitude, it should be between -180 and 180

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
  const subsq2 = String.fromCharCode(
    97 + Math.floor(((latNorm % 1) * 60) / 2.5),
  ); // a-x

  if (precision === 6) {
    return `${field1}${field2}${square1}${square2}${subsq1}${subsq2}`;
  }

  if (precision === 8) {
    // Extended square (2 digits): 0.5' lon x 0.25' lat
    const extSq1 = Math.floor((((lonNorm % 2) * 60) % 5) / 0.5);
    const extSq2 = Math.floor((((latNorm % 1) * 60) % 2.5) / 0.25);

    return `${field1}${field2}${square1}${square2}${subsq1}${subsq2}${extSq1}${extSq2}`;
  }

  return null; // Invalid precision
};

/**
 * Convert Maidenhead grid square to lat/lon bounding box coordinates, [SW, NE] corners
 *
 * @param {GridLocator} grid Maidenhead grid locator
 * @returns {(LatLon[] | null)} two-dimensional array containing two diagonal coordinates of bounds
 */
const maidenheadToBoundingBox = (grid: GridLocator): LatLon[] | null => {
  if (!grid || !validateGridLocator(grid)) return null;

  let minLat = -90;
  let maxLat = 90;
  let minLon = -180;
  let maxLon = 180;

  const gridUpper = grid.toUpperCase();

  // Field (2 chars): 20° lon x 10° lat - (2 chars is always the case since grid was already validated)
  {
    const fieldLat = gridUpper.charCodeAt(1) - 65; // A-R
    const fieldLon = gridUpper.charCodeAt(0) - 65; // A-R

    minLat += fieldLat * 10;
    maxLat = minLat + 10;
    minLon += fieldLon * 20;
    maxLon = minLon + 20;
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
    const subLat = gridUpper.charCodeAt(5) - 65; // A thru X
    const subLon = gridUpper.charCodeAt(4) - 65; // A thru X

    minLat += (subLat * 2.5) / 60;
    maxLat = minLat + 2.5 / 60;
    minLon += (subLon * 5) / 60;
    maxLon = minLon + 5 / 60;
  }

  // Extended square (2 digits): 0.5' lon x 0.25' lat
  if (gridUpper.length >= 8) {
    const subLat = parseInt(gridUpper[7]!);
    const subLon = parseInt(gridUpper[6]!);

    minLat += (subLat * 0.25) / 60;
    maxLat = minLat + 0.25 / 60;
    minLon += (subLon * 0.5) / 60;
    maxLon = minLon + 0.5 / 60;
  }

  return [
    [minLat, minLon],
    [maxLat, maxLon],
  ];
};

export {
  validateGridLocator,
  maidenheadToLatLon,
  maidenheadToWGS84,
  latLonToMaidenhead,
  wgs84ToMaidenhead,
  maidenheadToBoundingBox,
};
