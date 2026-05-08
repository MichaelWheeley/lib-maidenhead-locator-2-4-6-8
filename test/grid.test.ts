import { describe, it, expect } from "vitest";
import { Grid } from "../src";

describe("class Grid tests", () => {
  const gridCases = [
    // location in San Diego, CA, USA
    {
      gridLocator: "DM12kv99",
      actualLatLon: { lat: 32.91254, lon: -117.08409 },
      latLonSWCornerGrid6: [32.875, -117.167],
      latLonNECornerGrid6: [32.917, -117.083],
    },
  ];

  for (const { gridLocator, actualLatLon } of gridCases) {
    const grid = new Grid(gridLocator); // instance of Grid from grid locator

    it("should validate instance of Grid object has isValid === true", () => {
      expect(grid.isValid).toBe(true);
    });

    it("should confirm coordinates LatLon of instance of Grid", () => {
      const location = grid.locationLatLon;
      expect(location![0]).toBeCloseTo(actualLatLon.lat, 2);
      expect(location![1]).toBeCloseTo(actualLatLon.lon, 2);
    });

    it("should confirm coordinates WGS84 of instance of Grid", () => {
      const location = grid.locationWGS84;
      expect(location!.lat).toBeCloseTo(actualLatLon.lat, 2);
      expect(location!.lon).toBeCloseTo(actualLatLon.lon, 2);
    });

    it("should create instance of Grid based on LatLon and confirm calculated grid locator agrees with expected", () => {
      const gridLocatorSize = gridLocator.length;
      const grid = new Grid(actualLatLon, gridLocatorSize);
      expect(grid.gridLocator).toBe(gridLocator.toUpperCase());
    });
  }

  for (const { gridLocator, actualLatLon } of gridCases) {
    it("expect that instance of Grid built from coordinates and of specified grid locator size to be the same grid locator as specified in the test case", () => {
      const grid = new Grid(actualLatLon, gridLocator.length); // instance of Grid from coordinates as type WGS84, with specified size
      expect(grid.gridLocator).toBe(gridLocator.toUpperCase());
    });

    it("expect that instance of Grid built from coordinates and of specified grid locator size to be the same grid locator as specified in the test case", () => {
      const grid = new Grid(
        [actualLatLon.lat, actualLatLon.lon],
        gridLocator.length,
      ); // instance of Grid from coordinates as type LatLon, with specified size
      expect(grid.gridLocator).toBe(gridLocator.toUpperCase());
    });
  }

  it("should confirm equality of two instances of Grid with the same grid locator", () => {
    const grid1 = new Grid("DM12KV");
    const grid2 = new Grid("DM12KV");
    expect(grid1.isEqual(grid2)).toBe(true);
  });

  it("should gracefully confirm inequality between an instance of Grid and another object type", () => {
    const grid1 = new Grid("DM12KV");
    expect(grid1.isEqual(5)).toBe(false);
  });

  it("should indicate invalid coordinates for instance of Grid that is invalid", () => {
    const grid = new Grid("invalid grid locator");
    expect(grid.isValid).toBe(false);
    expect(grid.locationLatLon).toBeNull;
    expect(grid.locationWGS84).toBeNull;
  });

  it("should with invalid coordinates generate instance Grid but with isValid flag false", () => {
    expect(new Grid([-999.0, 0]).isValid).toBe(false);
  });
});
