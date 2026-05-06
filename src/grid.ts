import { GridCompare } from "./gridCompare";
import {
  maidenheadToLatLon,
  maidenheadToWGS84,
  validateGridLocator,
} from "./maidenhead";
import { GridLocator, LatLon, WGS84 } from "./types";

class Grid {
  private gridLocator: GridLocator;
  private gridLocatorSize: number;

  constructor(grid: GridLocator) {
    this.gridLocator = grid;
    this.gridLocatorSize = this.isValid ? grid.length : 0;
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
      return (
        this.gridLocatorSize === other.gridLocatorSize &&
        this.gridLocator === other.gridLocator
      );
    }
    return false; // Different types or unsupported comparison
  }
}

export { Grid, GridCompare };
