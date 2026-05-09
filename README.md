# @mr_uu/maidenhead-grid

![NPM Version (with dist tag)](https://img.shields.io/npm/v/%40mr_uu%2Fmaidenhead-grid/latest)
![GitHub License](https://img.shields.io/github/license/HoshinoSuzumi/lib-maidenhead-locator)

Maidenhead grid locator and WGS84 coordinate calculation and transformation. (for code see [here](https://github.com/MichaelWheeley/lib-maidenhead-locator-2-4-6-8)).

- Forked from [@hamset/maidenhead-locator](https://github.com/HoshinoSuzumi/lib-maidenhead-locator).
- Extends support for valid grid locators size 2, 4, (6), and 8, which are all valid sizes in the Maidenhead standard,
  - e.g. `DM`, `DM12`, `DM12KV`, and `DM12KV99`.
- Provides support for bounding box coordinates, the corners of the grid square. These corners are useful for mapping applications.
- Defines an optional `Grid` class that is an alternate way of working. An instance of the class represents a grid location and can be constructed by grid locator or by using coordinates.
  - Once instantiated a single refernce can be used within code and the `isValid`, grid locator and coordinates are all available as properties.
  - Additionally comparison of two instances using `compareTo()` reveals range and bearing between them, see example below.

## install

```bash
npm i @mr_uu/maidenhead-grid
```

## example

```js
import assert from "assert";
import {
  validateGridLocator,
  maidenheadToLatLon,
  maidenheadToWGS84,
  latLonToMaidenhead,
  maidenheadToBoundingBox,
  Grid,
} from "@mr_uu/maidenhead-grid";

// validate Maidenhead grid locators
let isValid = validateGridLocator("DM12KV"); // true
isValid = validateGridLocator("DM12kv"); // true

// Convert Maidenhead grid locator to WGS84 coordinate
let coordinate = maidenheadToWGS84("DM"); // {lat: 35, lon: -110}
coordinate = maidenheadToWGS84("DM12"); // {lat: 32.5, lon: -117}
coordinate = maidenheadToWGS84("DM12KV"); // {lat: 32.8958, lon: -117.125} (truncated)
coordinate = maidenheadToWGS84("DM12KV99"); // {lat: 32.9145, lon: -117.0875} (truncated)

// Convert WGS84 coordinate to Maidenhead grid locator with default size 6
let c = { lat: 32.8958, lon: -117.125 };
let grid = latLonToMaidenhead(c); // 'DM12KV'
grid = latLonToMaidenhead(c, 4); // 'DM12' (grid size 4 specified)

// Get bounding-box coordinates from Maidenhead grid locator
const bounds = maidenheadToBoundingBox("DM12"); // {sw: {lat: 32, lon: -118}, ne: {lat: 33, lon: -116}}

//*****************************************************
// OPTIONAL USE OF Grid CLASS
const origin = new Grid("DM12"); // San Diego, CA
assert(origin.isValid);
assert(origin.locationWGS84.lat === 32.5);
assert(origin.locationWGS84.lon === -117);

const destination = new Grid("QF56"); // Sydney, Australia
const compare = origin.compareTo(destination);
assert(Math.round(compare.range_km) === 12090); // [km]
assert(Math.round(compare.bearing_deg) === 242); // [deg.]
```

## API

```typescript
import { GridLocator, CoordinateLike, LatLon, WGS84, BoundingBox, BoundingBoxLatLon } from "./types";

/**
 * Validate Maidenhead grid locator, can be 2, 4, 6, or 8 characters long,
 * e.g. `DM`, `DM12`, `DM12KV`, or `DM12KV99` are all valid locators.
 *
 * Although not specified in Maidenhead standard, compatibility provided with commonly used small-letters,
 * e.g. `DM12kv` validates true.
 * @param {GridLocator} grid Maidenhead grid locator
 * @returns {boolean} returns true if the grid locator is valid, else false.
 */
declare const validateGridLocator = (grid: GridLocator): boolean;

/**
 * Convert Maidenhead grid locator to latitude/longitude.
 * @param {GridLocator} grid Maidenhead grid locator.
 * @returns {(WGS84 | null)} returns latitude and longitude coordinates as WGS84.
 */
declare const maidenheadToWGS84 = (grid: GridLocator): WGS84 | null;

/**
 * Convert Maidenhead grid locator to latitude/longitude.
 * @param {GridLocator} grid Maidenhead grid locator.
 * @returns {(LatLon | null)} returns latitude and longitude coordinates.
 */
declare const maidenheadToLatLon = (grid: GridLocator): LatLon | null;

/**
 * Determines whether argument loc has type LatLon.
 * @param {CoordinateLike} loc location argument.
 * @returns returns a value indicating whether `loc` is a LatLon type.
 */
declare const isLatLon = (loc: CoordinateLike): loc is LatLon;

/**
 * Determines whether argument loc has type WGS84.
 * @param {CoordinateLike} loc location argument.
 * @returns returns a value indicating whether loc is a WGS84 type.
 */
declare const isWGS84 = (x: CoordinateLike): x is WGS84;

/**
 * Convert latitude/longitude coordinates to Maidenhead grid locator of specified precision (character length).
 * @param {CoordinateLike} coord Lat/Long coordinates.
 * @param {number} [precision=6] Precision (character length) of the grid locator returned, can be 2, 4, 6, or 8, (default if not specified is 6).
 * @returns {(GridLocator | null)} returns Maidenhead grid locator.
 */
declare const latLonToMaidenhead = ( coord: CoordinateLike, precision = 6, ): GridLocator | null;

/**
 * Convert Maidenhead grid square to lat/lon bounding box coordinates, [SW, NE] corners.
 * @param {GridLocator} grid Maidenhead grid locator.
 * @returns {(BoundingBox | null)} returns a bounding box containing coordinates of SW and NE corners.
 */
declare const maidenheadToBoundingBox = (grid: GridLocator): BoundingBox | null;

/**
 * Convert Maidenhead grid square to lat/lon bounding box coordinates, [SW, NE] corners.
 * @param {GridLocator} grid Maidenhead grid locator.
 * @returns {(BoundingBoxLatLon | null)} a bounding box containing coordinates of SW and NE corners.
 */
declare const maidenheadToBoundingBoxLatLon = ( grid: GridLocator, ): BoundingBoxLatLon | null;

/**
 * Grid class representing a grid location that can be constructed using an existing Maidenhead grid locator,
 * or by using a coordinate in LatLon or WGS84 format.
 * @class Grid
 * @typedef {Grid}
 */
declare class Grid {
  /**
   * The Maidenhead grid locator for the instance of the class.
   * @readonly
   * @type {GridLocator}
   */
  readonly gridLocator: GridLocator;

  /*
   * Creates an instance of Grid.
   * @constructor
   * @param {(GridLocator | CoordinateLike)} location, either a Maidenhead grid locator or a coordinate in LatLon or WGS84 format.
   * @param {number} [gridLocatorSize=6] The desired size of the @see gridLocator, used only if location is of type CoordinateLike. Value can be 2, 4, 6 or 8.
   */
  constructor( location: GridLocator | CoordinateLike, gridLocatorSize: number = 6, );

  /**
   * A value indicating whether gridLocator is valid
   * @readonly
   * @type {boolean}
   * @see gridLocator
   */
  get isValid(): boolean;

  /**
   * The coordinates of the grid locator in LatLon format.
   * @readonly
   * @type {(LatLon | null)}
   */
  get locationLatLon(): LatLon | null;

  /**
   * The coordinates of the grid locator in WGS84 format.
   * @readonly
   * @type {(LatLon | null)}
   */
  get locationWGS84(): WGS84 | null;

  /**
   * Compares two instances of the Grid class, returns the GridCompare which has range and bearing information between the origin and destination.
   * @param {Grid} destination the destination instance of the class, 'this' is the origin
   * @returns {GridCompare} returns an instance of the GridCompare class containing the range and bearing
   * @see isEqual
   */
  compareTo(destination: Grid): GridCompare;

  /**
   * A value indicating whether two instances of the Grid class are equal.
   * @param {*} other the other instance of the class
   * @returns {boolean} returns true if the two instances are equal
   * @see compareTo
   */
  isEqual(other: any): boolean;
}

/**
 * A comparison of two instances of the Grid class, returned by Grid.compareTo()
 * @class GridCompare
 * @typedef {GridCompare}
 */
declare class GridCompare {
  /**
   * A value indicating the distance [km] between the origin and destination instances of the Grid class.
   * @readonly
   * @type {(number | null)}
   */
  readonly range_km: number | null;

  /**
   * A value indicating the bearing [deg.] from the origin to the destination instances of the Grid class.
   * @readonly
   * @type {(number | null)}
   */
  readonly bearing_deg: number | null;

  /**
   * Creates an instance of GridCompare.
   * Note: this class expected to be constructed solely by call to Grid.compareTo() rather than directly by a user.
   * @constructor
   * @param {Grid} origin origin 'this' instance of Grid
   * @param {Grid} destination destination 'compare to' instance of Grid
   */
  constructor(origin: Grid, destination: Grid);

  /**
   * A value indicating whether the comparison is valid.
   * @readonly
   * @type {boolean}
   */
  get isValid(): boolean;
}

//
// types
//
export type GridLocator = string;
export type CoordinateLike = LatLon | WGS84;
export type LatLon = [number, number];
export interface WGS84 { lat: number; lon: number; }
export type BoundingBox = { sw: WGS84; ne: WGS84 };
export type BoundingBoxLatLon = { sw: LatLon; ne: LatLon };
```
