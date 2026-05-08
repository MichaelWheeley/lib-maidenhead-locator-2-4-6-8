import { GridCompare } from "./gridCompare";
import {
  latLonToMaidenhead,
  maidenheadToLatLon,
  maidenheadToWGS84,
  validateGridLocator,
  isLatLon,
  isWGS84,
} from "./maidenhead";
import { CoordinateLike, GridLocator, LatLon, WGS84 } from "./types";

/**
 * Grid class representing a grid location that can be constructed using an existing Maidenhead grid locator,
 * or by using a coordinate in LatLon or WGS84 format.
 * @class Grid
 * @typedef {Grid}
 * @see gridCompare see also grid comparison class for range and bearing comparison.
 */
class Grid {
  /**
   * The Maidenhead grid locator for the instance of the class.
   * @readonly
   * @type {GridLocator}
   * @see isValid
   */
  readonly gridLocator: GridLocator;

  /*
   * Creates an instance of Grid.
   * @constructor
   * @param {(GridLocator | CoordinateLike)} location, either a Maidenhead grid locator or a coordinate in LatLon or WGS84 format.
   * @param {number} [gridLocatorSize=6] The desired size of the @see gridLocator, used only if location is of type CoordinateLike. Value can be 2, 4, 6 or 8.
   */
  constructor(
    location: GridLocator | CoordinateLike,
    gridLocatorSize: number = 6,
  ) {
    if (this.isGridLocator(location)) {
      this.gridLocator = location;
    } else if (isLatLon(location) || isWGS84(location)) {
      const locator = latLonToMaidenhead(location, gridLocatorSize);
      this.gridLocator = locator === null ? "" : locator;
    } else {
      throw new Error(
        "Invalid location: expected GridLocator string or CoordinateLike value",
      );
    }
  }

  /**
   * A value indicating whether gridLocator is valid
   * @readonly
   * @type {boolean}
   * @see gridLocator
   */
  get isValid(): boolean {
    return validateGridLocator(this.gridLocator);
  }

  /**
   * The coordinates of the grid locator in LatLon format.
   * @readonly
   * @type {(LatLon | null)}
   */
  get locationLatLon(): LatLon | null {
    return this.isValid ? maidenheadToLatLon(this.gridLocator) : null;
  }

  /**
   * The coordinates of the grid locator in WGS84 format.
   * @readonly
   * @type {(LatLon | null)}
   */
  get locationWGS84(): WGS84 | null {
    return this.isValid ? maidenheadToWGS84(this.gridLocator) : null;
  }

  /**
   * Compares two instances of the Grid class, returns the GridCompare which has range and bearing information between the origin and destination.
   * @param {Grid} destination the destination instance of the class, 'this' is the origin
   * @returns {GridCompare} returns an instance of the GridCompare class containing the range and bearing
   * @see isEqual
   */
  compareTo(destination: Grid): GridCompare {
    return new GridCompare(this, destination);
  }

  /**
   * A value indicating whether two instances of the Grid class are equal.
   * @param {*} other the other instance of the class
   * @returns {boolean} returns true if the two instances are equal
   * @see compareTo
   */
  isEqual(other: any): boolean {
    if (other instanceof Grid && this.isValid && other.isValid) {
      return this.gridLocator === other.gridLocator;
    }
    return false; // Different types or unsupported comparison
  }

  private isGridLocator(x: GridLocator | CoordinateLike): x is GridLocator {
    return typeof x === "string";
  }
}

export { Grid, GridCompare };
