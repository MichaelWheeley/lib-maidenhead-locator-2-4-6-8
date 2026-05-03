import { describe, it, expect } from "vitest";
import {
  GridLocator,
  WGS84,
  validateGridLocator,
  latLonToMaidenhead,
  wgs84ToMaidenhead,
  maidenheadToLatLon,
  maidenheadToWGS84,
  maidenheadToBoundingBox,
  LatLon,
} from "../src";

describe("Maidenhead Grid tests", () => {
  const gridCases = [
    // location in San Diego, CA, USA
    {
      grid: "DM12kv99",
      actualLatLon: { lat: 32.91254, lon: -117.08409 },
      latLonSWCornerGrid6: [32.875, -117.167],
      latLonNECornerGrid6: [32.917, -117.083],
    },

    // location in Sydney, Australia
    {
      grid: "QF56od55",
      actualLatLon: { lat: -33.8519, lon: 151.210886 },
      latLonSWCornerGrid6: [-33.875, 151.1667],
      latLonNECornerGrid6: [-33.8333, 151.25],
    },
  ];

  it("should invalidate empty grid locator", () => {
    expect(validateGridLocator("")).toBe(false);
  });

  it("should invalidate grid locator with invalid length", () => {
    expect(validateGridLocator("D")).toBe(false);
    expect(validateGridLocator("DM1")).toBe(false);
  });

  it("should invalidate grid locator with invalid characters", () => {
    expect(validateGridLocator("DM12zz")).toBe(false);
  });

  for (const {
    grid,
    actualLatLon,
    latLonSWCornerGrid6,
    latLonNECornerGrid6,
  } of gridCases) {

    it("should validate test case grid locator has size 8", () => {
      expect(grid.length).toEqual(8);
    });

    const defaultSize = 6;
    const sizes = [2, 4, 6, 8];
    for (const size of sizes) {
      it(
        "should validate grid locator '" + grid.substring(0, size) + "'",
        () => {
          const subGrid = grid.substring(0, size);
          expect(validateGridLocator(subGrid)).toBe(true);
        },
      );
    }

    for (const size of sizes) {
      it(
        "should convert Lat/Lon to Maidenhead Grid of requested size " + size,
        () => {
          const result = latLonToMaidenhead(actualLatLon, size);
          expect(result?.toUpperCase()).toBe(
            grid.substring(0, size).toUpperCase(),
          );
        },
      );

      it(
        "should convert WGS84 to Maidenhead Grid of requested size " + size,
        () => {
          const result = wgs84ToMaidenhead(actualLatLon, size);
          expect(result?.toUpperCase()).toBe(
            grid.substring(0, size).toUpperCase(),
          );
        },
      );
    }

    const invalidSizes = [-1, 0, 1, 9];
    for (const size of invalidSizes) {
      it(
        "should gracefully return null trying to convert Lat/Lon to Maidenhead Grid of invalid requested size " +
          size,
        () => {
          expect(latLonToMaidenhead(actualLatLon, size)).toBeNull;
        },
      );
    }

    it("should convert Lat/Lon to Maidenhead Grid with default size 6 when no size is specified", () => {
      const result = latLonToMaidenhead(actualLatLon);
      expect(result?.toUpperCase()).toBe(grid.substring(0, defaultSize).toUpperCase());
    });

    for (const size of sizes) {
      it(
        "should convert Maidenhead Grid '" +
          grid.substring(0, size) +
          "' to Lat/Lon",
        () => {
          const { lat: expectedLat, lon: expectedLon } = actualLatLon;
          let latBucketSize,
            lonBucketSize,
            latBucketStart,
            latBucketEnd,
            lonBucketStart,
            lonBucketEnd;

          switch (size) {
            case 2:
              latBucketSize = 10; // degrees
              latBucketStart =
                Math.floor(expectedLat / latBucketSize) * latBucketSize;
              latBucketEnd = latBucketStart + latBucketSize;

              lonBucketSize = 20; // degrees
              lonBucketStart =
                Math.floor(expectedLon / lonBucketSize) * lonBucketSize;
              lonBucketEnd = lonBucketStart + lonBucketSize;
              break;

            case 4:
              latBucketSize = 1; // degrees
              latBucketStart =
                Math.floor(expectedLat / latBucketSize) * latBucketSize;
              latBucketEnd = latBucketStart + latBucketSize;

              lonBucketSize = 2; // degrees
              lonBucketStart =
                Math.floor(expectedLon / lonBucketSize) * lonBucketSize;
              lonBucketEnd = lonBucketStart + lonBucketSize;
              break;

            case 6:
              latBucketSize = 2.5; // minutes
              latBucketStart =
                (Math.floor((60 * expectedLat) / latBucketSize) *
                  latBucketSize) /
                60;
              latBucketEnd = latBucketStart + latBucketSize / 60;

              lonBucketSize = 5; // minutes
              lonBucketStart =
                (Math.floor((60 * expectedLon) / lonBucketSize) *
                  lonBucketSize) /
                60;
              lonBucketEnd = lonBucketStart + lonBucketSize / 60;
              break;

            case 8:
              latBucketSize = 0.25; // minutes
              latBucketStart =
                (Math.floor((10 * 60 * expectedLat) / latBucketSize) *
                  latBucketSize) /
                60 /
                10;
              latBucketEnd = latBucketStart + latBucketSize / 60;

              lonBucketSize = 0.5; // minutes
              lonBucketStart =
                (Math.floor((60 * expectedLon) / lonBucketSize) *
                  lonBucketSize) /
                60;
              lonBucketEnd = lonBucketStart + lonBucketSize / 60;
              break;

            default:
              throw new Error("invalid size");
          }

          const [lat, lon] = maidenheadToLatLon(grid.substring(0, size))!;

          expect(lat).toBeGreaterThanOrEqual(latBucketStart);
          expect(lat).toBeLessThan(latBucketEnd);
          expect(lon).toBeGreaterThanOrEqual(lonBucketStart);
          expect(lon).toBeLessThan(lonBucketEnd);
        },
      );
    }

    it(
      "should convert Maidenhead Grid '" +
        grid.substring(0, defaultSize) +
        "' to Lat/Lon bounding box coordinates",
      () => {
        const result = maidenheadToBoundingBox(grid.substring(0, defaultSize));
        expect(result).toHaveLength(2);
        expect(result?.[0]).toHaveLength(2);
        expect(result?.[1]).toHaveLength(2);

        expect(result?.[0][0]).toBeCloseTo(latLonSWCornerGrid6[0], 3);
        expect(result?.[0][1]).toBeCloseTo(latLonSWCornerGrid6[1], 3);
        expect(result?.[1][0]).toBeCloseTo(latLonNECornerGrid6[0], 3);
        expect(result?.[1][1]).toBeCloseTo(latLonNECornerGrid6[1], 3);
      },
    );
  }

  it("should gracefully attempt latLonToMaidenhead but reject lat/lon out of valid range", () => {
    expect(latLonToMaidenhead([-91, 0])).toBeNull
    expect(latLonToMaidenhead([91, 0])).toBeNull
    expect(latLonToMaidenhead([0, -181])).toBeNull
    expect(latLonToMaidenhead([0, 181])).toBeNull
  })

  it("should gracefully attempt maidenheadToBoundingBox with an invalid locator and detect a null returned", () => {
    expect(maidenheadToBoundingBox("invalid locator")).toBeNull;
  });

  it("should gracefully attempt maidenheadToLatLon with an invalid latLon and detect a null returned", () => {
    expect(maidenheadToLatLon("invalid locator")).toBeNull;
  });
});
