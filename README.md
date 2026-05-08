# @mr_uu/maidenhead-grid

![NPM Version (with dist tag)](https://img.shields.io/npm/v/%40mr_uu%2Fmaidenhead-grid/latest)
![GitHub License](https://img.shields.io/github/license/HoshinoSuzumi/lib-maidenhead-locator)

Maidenhead grid locator and WGS84 coordinate calculation and transformation. (for code see [here](https://github.com/MichaelWheeley/lib-maidenhead-locator-2-4-6-8)).

- Forked from [@hamset/maidenhead-locator](https://github.com/HoshinoSuzumi/lib-maidenhead-locator).
- Extends support for valid grid locators size 2, 4, (6), and 8, which are all valid sizes in the Maidenhead standard,
  - e.g. `DM`, `DM12`, `DM12KV`, and `DM12KV99`.
- Provides support for bounding box coordinates, that is, the corners of the grid square. These are useful for mapping applications.
- Defines an optional Grid class that can be constructed using a grid locator or using coordinates, comparison of two instances of the Grid class reveals range and bearing between them.

## install

```bash
npm i @mr_uu/maidenhead-grid
```

## example

```js
import {
  validateGridLocator,
  maidenheadToLatLon,
  maidenheadToWGS84,
  latLonToMaidenhead,
  maidenheadToBoundingBox,
  LatLon,
  WGS84,
  CoordinateLike,
  GridLocator,
} from '@mr_uu/maidenhead-grid';

// validate Maidenhead grid locators
let isValid = validateGridLocator("DM12KV"); // true
isValid = validateGridLocator("DM12kv"); // true

// Convert Maidenhead grid locator to WGS84 coordinate
let coordinate = maidenheadToWGS84("DM"); // { lat: 35, lon: -110, }
coordinate = maidenheadToWGS84("DM12"); // { lat: 32.5, lon: -117, }
coordinate = maidenheadToWGS84("DM12KV"); // { lat: 32.8958,   lon: -117.125, }
coordinate = maidenheadToWGS84("DM12KV99"); // { lat: 32.9145, lon: -117.0875, }

// Convert WGS84 coordinate to Maidenhead grid locator with default size 6
let c: WGS84 = { lat: 32.8958, lon: -117.125 }
const grid = latLonToMaidenhead(c); // "DM12KV"

// Get bounding-box coordinates from Maidenhead grid locator
const bounds: BoundingBox | null = maidenheadToBoundingBox("DM12"); // { sw: { lat: 32, lon: -118, }, ne: { lat: 33, lon: -116, }, }

```

## API

```typescript
import { GridLocator, LatLon, WGS84, CoordinateLike, BoundingBox, BoundingBoxLatLon } from "./types";

/**
 * Validate Maidenhead grid locator, can be 2, 4, 6, or 8 characters long.
 * e.g. DM, DM12, DM12KV, or DM12KV99 are all valid locators.
 * Although not specified in Maidenhead standard, compatibility provided with commonly used small-letters e.g. DM12kv validates true.
 *
 * @param {GridLocator} grid Maidenhead grid locator
 * @returns {boolean} true if the grid locator is valid, else false
 */
declare const validateGridLocator = (grid: GridLocator): boolean;

/**
 * Convert Maidenhead grid locator to latitude/longitude
 *
 * @param {GridLocator} grid Maidenhead grid locator
 * @returns {(WGS84 | null)} Latitude and longitude coordinates as WGS84
 */
declare const maidenheadToWGS84 = (grid: GridLocator): WGS84 | null;

/**
 * Convert Maidenhead grid locator to latitude/longitude
 *
 * @param {GridLocator} grid Maidenhead grid locator
 * @returns {(LatLon | null)} Latitude and longitude coordinates
 */
declare const maidenheadToLatLon = (grid: GridLocator): LatLon | null;

/**
 * Convert latitude/longitude coordinates to Maidenhead grid locator of specified precision (character length)
 *
 * @param {CoordinateLike} coord latitude/longitude coordinates
 * @param {number} [precision=6] Precision (character length) of the grid locator returned, can be 2, 4, 6, or 8. (default if not specified is 6)
 * @returns {(GridLocator | null)} Maidenhead grid locator
 */
declare const latLonToMaidenhead = ( coord: CoordinateLike, precision = 6, ): GridLocator | null;

/**
 * Convert Maidenhead grid square to lat/lon bounding box coordinates, [SW, NE] corners
 *
 * @param {GridLocator} grid Maidenhead grid locator
 * @returns {(BoundingBox | null)} a bounding box containing coordinates of SW and NE corners
 */
declare const maidenheadToBoundingBox = (grid: GridLocator): BoundingBox | null;

/**
 * Convert Maidenhead grid square to lat/lon bounding box coordinates, [SW, NE] corners
 *
 * @param {GridLocator} grid Maidenhead grid locator
 * @returns {(BoundingBoxLatLon | null)} a bounding box containing coordinates of SW and NE corners
 */
declare const maidenheadToBoundingBoxLatLon = (grid: GridLocator): BoundingBoxLatLon | null;

//
// types
//
export type GridLocator = string;
export type LatLon = [number, number];
export interface WGS84 { lat: number; lon: number; }
export type CoordinateLike = LatLon | WGS84;
export type BoundingBox = { sw: WGS84; ne: WGS84; };
export type BoundingBoxLatLon = { sw: LatLon; ne: LatLon; };
```
