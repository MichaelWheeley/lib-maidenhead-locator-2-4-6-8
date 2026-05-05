import { CoordinateLike, GridLocator, LatLon, WGS84, BoundingBox, BoundingBoxLatLon } from "./types";

// Code was forked from https://github.com/HoshinoSuzumi/lib-maidenhead-locator.
// This code extends support for valid grid locators size 2, 4, (6), and 8 - all valid sizes in the Maidenhead standard.
// The version also provides support for bounding box coordinates, that is the coordinates of the corners of the grid square which are useful for mapping applications.

const FIELD_LAT_DEG = 10;
const FIELD_LON_DEG = 20;
const SQUARE_LAT_DEG = 1;
const SQUARE_LON_DEG = 2;
const SUB_LAT_MIN = 2.5;
const SUB_LON_MIN = 5;
const EXT_LAT_MIN = 0.25;
const EXT_LON_MIN = 0.5;

/**
 * Validate Maidenhead grid locator, can be 2, 4, 6, or 8 characters long.
 * e.g. DM, DM12, DM12KV, or DM12KV99 are all valid locators.
 * Although not specified in Maidenhead standard, compatibility provided with commonly used small-letters e.g. DM12kv validates true.
 *
 * @param {GridLocator} grid Maidenhead grid locator
 * @returns {boolean} true if the grid locator is valid, else false
 */
const validateGridLocator = (grid: GridLocator): boolean => {
  if (typeof grid !== "string") return false;
  if (grid.length % 2 !== 0) return false;
  if (![2, 4, 6, 8].includes(grid.length)) return false;
  const regex = /^[A-R]{2}(?:[0-9]{2}(?:[A-Xa-x]{2}(?:[0-9]{2})?)?)?$/;
  return regex.test(grid);
};

/**
 * Convert Maidenhead grid locator to latitude/longitude
 *
 * @param {GridLocator} grid Maidenhead grid locator
 * @returns {(WGS84 | null)} Latitude and longitude coordinates as WGS84
 */
const maidenheadToWGS84 = (grid: GridLocator): WGS84 | null => {
  const bbox = maidenheadToBoundingBox(grid);
  if (bbox === null) return null;
  const lat = (bbox.sw.lat + bbox.ne.lat) / 2;
  const lon = (bbox.sw.lon + bbox.ne.lon) / 2;
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

  const {lat, lon} = Array.isArray(coord) ? { lat: coord[0]!, lon: coord[1]! } : coord;
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

  if (lat < -90 || lat > 90)
    return null; // invalid latitude, it should be between -90 and 90
  if (lon < -180 || lon > 180)
    return null; // invalid longitude, it should be between -180 and 180

  const latNorm = lat + 90;
  const lonNorm = lon + 180;

  // Field (2 chars): 20° lon x 10° lat
  const field1 = String.fromCharCode("A".charCodeAt(0) + Math.floor(lonNorm / FIELD_LON_DEG)); // A-R
  const field2 = String.fromCharCode("A".charCodeAt(0) + Math.floor(latNorm / FIELD_LAT_DEG)); // A-R

  if (precision === 2) {
    return `${field1}${field2}`;
  }

  // Square (2 digits): 2° lon x 1° lat
  const square1 = Math.floor((lonNorm % FIELD_LON_DEG) / SQUARE_LON_DEG);
  const square2 = Math.floor((latNorm % FIELD_LAT_DEG) / SQUARE_LAT_DEG);

  if (precision === 4) {
    return `${field1}${field2}${square1}${square2}`;
  }

  // Subsquare (2 chars): 5' lon x 2.5' lat
  // note, although often these digits are written in small letters a-x the Maidenhead standard specifies them as all-CAPS A-X
  const subsq1 = String.fromCharCode("A".charCodeAt(0) + Math.floor(((lonNorm % SQUARE_LON_DEG) * 60) / SUB_LON_MIN));
  const subsq2 = String.fromCharCode("A".charCodeAt(0) + Math.floor(((latNorm % SQUARE_LAT_DEG) * 60) / SUB_LAT_MIN));

  if (precision === 6) {
    return `${field1}${field2}${square1}${square2}${subsq1}${subsq2}`;
  }

  if (precision === 8) {
    // Extended square (2 digits): 0.5' lon x 0.25' lat
    const extSq1 = Math.floor((((lonNorm % SQUARE_LON_DEG) * 60) % SUB_LON_MIN) / EXT_LON_MIN);
    const extSq2 = Math.floor((((latNorm % SQUARE_LAT_DEG) * 60) % SUB_LAT_MIN) / EXT_LAT_MIN);

    return `${field1}${field2}${square1}${square2}${subsq1}${subsq2}${extSq1}${extSq2}`;
  }

  return null; // Invalid precision
};

/**
 * Convert Maidenhead grid square to lat/lon bounding box coordinates, [SW, NE] corners
 *
 * @param {GridLocator} grid Maidenhead grid locator
 * @returns {(BoundingBox | null)} a bounding box containing coordinates of SW and NE corners
 */
const maidenheadToBoundingBox = (grid: GridLocator): BoundingBox | null => {
  if (!grid || !validateGridLocator(grid)) return null;

  let minLat = -90;
  let maxLat = 90;
  let minLon = -180;
  let maxLon = 180;

  const gridUpper = grid.toUpperCase();

  // Field (2 chars): 20° lon x 10° lat - (2 chars is always the case since grid was already validated)
  {
    const fieldLat = gridUpper.charCodeAt(1) - "A".charCodeAt(0); // A-R
    const fieldLon = gridUpper.charCodeAt(0) - "A".charCodeAt(0); // A-R

    minLat += fieldLat * FIELD_LAT_DEG;
    maxLat = minLat + FIELD_LAT_DEG;
    minLon += fieldLon * FIELD_LON_DEG;
    maxLon = minLon + FIELD_LON_DEG;
  }

  // Square (2 digits): 2° lon x 1° lat
  if (gridUpper.length >= 4) {
    const sqLon = parseInt(gridUpper[2]!);
    const sqLat = parseInt(gridUpper[3]!);

    minLon += sqLon * SQUARE_LON_DEG;
    maxLon = minLon + SQUARE_LON_DEG;
    minLat += sqLat * SQUARE_LAT_DEG;
    maxLat = minLat + SQUARE_LAT_DEG;
  }

  // Subsquare (2 chars): 5' lon x 2.5' lat
  // Note that these letters are often written as small-letters although the standard specifies all-CAPS.
  // To provide compatibility with common usage toUpperCase() was used to force all-CAPS prior to decoding.
  if (gridUpper.length >= 6) {
    const subLat = gridUpper.charCodeAt(5) - "A".charCodeAt(0); // A thru X
    const subLon = gridUpper.charCodeAt(4) - "A".charCodeAt(0); // A thru X

    minLat += (subLat * SUB_LAT_MIN) / 60;
    maxLat = minLat + SUB_LAT_MIN / 60;
    minLon += (subLon * SUB_LON_MIN) / 60;
    maxLon = minLon + SUB_LON_MIN / 60;
  }

  // Extended square (2 digits): 0.5' lon x 0.25' lat
  if (gridUpper.length >= 8) {
    const subLat = parseInt(gridUpper[7]!);
    const subLon = parseInt(gridUpper[6]!);

    minLat += (subLat * EXT_LAT_MIN) / 60;
    maxLat = minLat + EXT_LAT_MIN / 60;
    minLon += (subLon * EXT_LON_MIN) / 60;
    maxLon = minLon + EXT_LON_MIN / 60;
  }

  return {sw: { lat: minLat, lon: minLon }, ne: { lat: maxLat, lon: maxLon }};
};

/**
 * Convert Maidenhead grid square to lat/lon bounding box coordinates, [SW, NE] corners
 *
 * @param {GridLocator} grid Maidenhead grid locator
 * @returns {(BoundingBoxLatLon | null)} a bounding box containing coordinates of SW and NE corners
 */
const maidenheadToBoundingBoxLatLon = (grid: GridLocator): BoundingBoxLatLon | null => {
  const bbox = maidenheadToBoundingBox(grid);
  return bbox ? { sw: [bbox.sw.lat, bbox.sw.lon], ne: [bbox.ne.lat, bbox.ne.lon] } : null;
}

export {
  validateGridLocator,
  maidenheadToLatLon,
  maidenheadToWGS84,
  latLonToMaidenhead,
  wgs84ToMaidenhead,
  maidenheadToBoundingBox,
  maidenheadToBoundingBoxLatLon,
};
