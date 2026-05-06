import { describe, it, expect } from "vitest";
import { Grid, GridCompare } from "../src";

describe("class GridCompare tests", () => {
  const TestCases = [
    {
      originGridLocator: "DM12kv", // San Diego, California
      destinationGridLocator: "QF56od", // Sydney, Australia
      distance_km: 12101.9,
      bearing_deg: 241.3,
    },
  ];

  for (const {
    originGridLocator,
    destinationGridLocator,
    distance_km,
    bearing_deg,
  } of TestCases) {
    it("should compare two instances of the Grid class", () => {
      const origin = new Grid(originGridLocator);
      const destination = new Grid(destinationGridLocator);
      const comparison: GridCompare = origin.compareTo(destination);

      expect(comparison.isValid).toBe(true);
      expect(comparison.distance_km).toBeCloseTo(distance_km, 1);
      expect(comparison.bearing_deg).toBeCloseTo(bearing_deg, 1);
    });
  }

  it("should gracefully detect invalid comparison", () => {
    const origin = new Grid("invalid grid locator");
    const destination = new Grid("DM12KV");
    const comparison: GridCompare = origin.compareTo(destination);

    expect(comparison.isValid).toBe(false);
    expect(comparison.distance_km).toBeNull;
    expect(comparison.bearing_deg).toBeNull;
  });
});
