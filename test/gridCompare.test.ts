import { describe, it, expect } from "vitest";
import { Grid, GridCompare } from "../src";

describe("class GridCompare tests", () => {
  const TestCases = [
    {
      originGridLocator: "DM12kv", // San Diego, California
      destinationGridLocator: "QF56od", // Sydney, Australia
      range_km: 12101.9,
      bearing_deg: 241.3,
    },
  ];

  for (const {
    originGridLocator,
    destinationGridLocator,
    range_km,
    bearing_deg,
  } of TestCases) {
    it("should compare two instances of the Grid class", () => {
      const origin = new Grid(originGridLocator);
      const destination = new Grid(destinationGridLocator);
      const comparison: GridCompare = origin.compareTo(destination);

      expect(comparison.isValid).toBe(true);
      expect(comparison.range_km).toBeCloseTo(range_km, 1);
      expect(comparison.bearing_deg).toBeCloseTo(bearing_deg, 1);
    });
  }

  it("should gracefully detect invalid comparison", () => {
    const origin = new Grid("invalid grid locator");
    const destination = new Grid("DM12KV");
    const comparison: GridCompare = origin.compareTo(destination);

    expect(comparison.isValid).toBe(false);
    expect(comparison.range_km).toBeNull;
    expect(comparison.bearing_deg).toBeNull;
  });
});
