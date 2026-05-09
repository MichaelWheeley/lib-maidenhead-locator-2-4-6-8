import { Grid } from "./grid";

/**
 * A comparison of two instances of the Grid class, returned by Grid.compareTo()
 * @class GridCompare
 * @typedef {GridCompare}
 */
class GridCompare {
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
  constructor(origin: Grid, destination: Grid) {
    this.gridOrigin = origin;
    this.gridDestination = destination;

    if (this.isValid) {
      const origin = this.gridOrigin.locationWGS84;
      const destination = this.gridDestination.locationWGS84;
      this.range_km = this.calculateDistance(
        origin!.lat,
        origin!.lon,
        destination!.lat,
        destination!.lon,
      );
      this.bearing_deg = this.calculateBearing(
        origin!.lat,
        origin!.lon,
        destination!.lat,
        destination!.lon,
      );
    } else {
      this.range_km = null;
      this.bearing_deg = null;
    }
  }

  /**
   * A value indicating whether the comparison is valid.
   * @readonly
   * @type {boolean}
   */
  get isValid(): boolean {
    return this.gridOrigin.isValid && this.gridDestination.isValid;
  }

  private gridOrigin: Grid;
  private gridDestination: Grid;

  // Calculate bearing between two points
  private calculateBearing = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) => {
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x =
      Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
  };

  // Calculate distance between two points in km
  private calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) => {
    const R = 6371;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };
}

export { GridCompare };
