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

class Grid {
  readonly gridLocator: GridLocator;

  private isGridLocator(x: GridLocator | CoordinateLike): x is GridLocator {
    return typeof x === "string";
  }

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

  get isValid(): boolean {
    return validateGridLocator(this.gridLocator);
  }

  get locationLatLon(): LatLon | null {
    return this.isValid ? maidenheadToLatLon(this.gridLocator) : null;
  }

  get locationWGS84(): WGS84 | null {
    return this.isValid ? maidenheadToWGS84(this.gridLocator) : null;
  }

  compareTo(destination: Grid): GridCompare {
    return new GridCompare(this, destination);
  }

  isEqual(other: any): boolean {
    if (other instanceof Grid && this.isValid && other.isValid) {
      return this.gridLocator === other.gridLocator;
    }
    return false; // Different types or unsupported comparison
  }
}

export { Grid, GridCompare };
