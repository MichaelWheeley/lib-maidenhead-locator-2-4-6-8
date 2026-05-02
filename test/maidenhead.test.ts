import { describe, it, expect } from 'vitest'
import {
  GridLocator,
  WGS84,
  validateGridLocator,
  latLonToMaidenhead,
  wgs84ToMaidenhead,
  maidenheadToLatLon,
  maidenheadToWGS84,
  maidenheadToBoundingBox,
  LatLon
} from '../src'

describe('Maidenhead', () => {
  const cases = [
    {
      grid: 'DM06gs' as GridLocator,
      latlon: [
        36.778261, 
        -119.4179324
      ] as LatLon
    },
    {
      grid: 'OL39do' as GridLocator,
      latlon: {
        lat: 29.617238,
        lon: 106.324862
      } as WGS84
    }
  ]

  for (const { grid, latlon } of cases) {
    it('should validate grid locator', () => {
      expect(validateGridLocator(grid)).toBe(true)
    })

    it('should convert lat/lon to Maidenhead', () => {
      expect(latLonToMaidenhead(latlon)).toBe(grid)
    })

    it('should convert Maidenhead to lat/lon', () => {
      const result = maidenheadToWGS84(grid)
      
      if (Array.isArray(latlon)) {
        expect(result.lat).toBeCloseTo(latlon[0], 0)
        expect(result.lon).toBeCloseTo(latlon[1], 0)
      }
      if ('lat' in latlon && 'lon' in latlon) {
        expect(result.lat).toBeCloseTo(latlon.lat, 0)
        expect(result.lon).toBeCloseTo(latlon.lon, 0)
      }
    })

    it('should convert Maidenhead to bounding box coordinates', () => {
      const result = maidenheadToBoundingBox(grid)
      
      expect(result).toHaveLength(2)
      expect(result[0]).toHaveLength(2)
      expect(result[1]).toHaveLength(2)
    })
  }
})
