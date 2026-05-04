# @mr_uu/maidenhead-grid

![NPM Version (with dist tag)](https://img.shields.io/npm/v/%40mr_uu%2Fmaidenhead-grid/latest)
![GitHub License](https://img.shields.io/github/license/HoshinoSuzumi/lib-maidenhead-locator)

[link](https://github.com/MichaelWheeley/lib-maidenhead-locator-2-4-6-8)

Maidenhead grid locator and WGS84 coordinate calculation and transformation

## Usage

```bash
npm i @mr_uu/maidenhead-grid
```

```js
import {
  validateGridLocator,
  maidenheadToLatLon,
  maidenheadToWGS84,
  latLonToMaidenhead,
  wgs84ToMaidenhead,
  maidenheadToBoundingBox,
  LatLon,
  WGS84,
  CoordinateLike,
  LatLonBounds,
  GridLocator,
} from '@mr_uu/maidenhead-grid';

# needs editing:

// convert maidenhead grid locator to WGS84 coordinate
const grid_locator = 'DM06gs'
const coordinate: WGS84 = maidenheadToWGS84(grid_locator);
// output: { lat: 36.75, lon: -119.5 }

// convert WGS84 coordinate to maidenhead grid locator
const coordinate: LatLon = { lat: 36.75, lon: -119.5 }
const grid_locator: GridLocator = WGS84ToMaidenhead(coordinate);
// output: 'DM06gs'

// get bounding box coordinates from maidenhead grid locator
const grid_locator = 'DM06gs'
const bounds: [LatLon, LatLon] = maidenheadToBoundingBox(grid_locator); 
// output: [ [ 36.75, -119.5 ], [ 36.791666666666664, -119.41666666666667 ] ]
```

## APIs

```typescript
import { CoordinateLike, GridLocator, WGS84 } from "./types";
/**
 * Validate grid locator
 * @param gridLocator grid locator
 * @returns true if the grid locator is valid
 */
declare const validateGridLocator: (gridLocator: GridLocator) => boolean;
/**
 * Convert WGS84 to Maidenhead
 * @param coord coordinate
 * @returns grid locator
 */
declare const WGS84ToMaidenhead: (coord: CoordinateLike) => GridLocator;
/**
 * Convert Maidenhead to WGS84
 * @param gridLocator grid locator
 * @returns coordinate
 */
declare const maidenheadToWGS84: (gridLocator: GridLocator) => WGS84;
/**
 * Convert Maidenhead to bounding box coordinates
 * @param gridLocator grid locator
 * @returns A two-dimensional array containing two diagonal coordinates of bounds
 */
declare const maidenheadToBoundingBox: (gridLocator: GridLocator) => [LatLon, LatLon];

//
// types
//
export type LatLon = [number, number];
export interface WGS84 {
    lat: number;
    lon: number;
}
export type CoordinateLike = LatLon | WGS84;
export type LatLonBounds = [LatLon, LatLon];
export type GridLocator = string;
```
