import { describe, it, expect } from 'vitest'
import {
  calculateHP,
  calculateATK,
  calculateSPD,
  checkAbility,
  abilityMagnitude,
  generateCritterStats,
} from '../generation'

describe('calculateHP', () => {
  it('SL 1: 1d6 + 6, range 7-12', () => {
    for (let i = 0; i < 100; i++) {
      const result = calculateHP(1)
      expect(result.total).toBeGreaterThanOrEqual(7)
      expect(result.total).toBeLessThanOrEqual(12)
      expect(result.rolls).toHaveLength(1)
    }
  })

  it('SL 6: 6d6 + 6, range 12-42', () => {
    for (let i = 0; i < 100; i++) {
      const result = calculateHP(6)
      expect(result.total).toBeGreaterThanOrEqual(12)
      expect(result.total).toBeLessThanOrEqual(42)
      expect(result.rolls).toHaveLength(6)
    }
  })

  it('HP dice array matches star level count', () => {
    const result = calculateHP(3)
    expect(result.rolls).toHaveLength(3)
  })
})

describe('calculateATK', () => {
  it('returns floor of (1d6 + SL) / 2', () => {
    for (let i = 0; i < 100; i++) {
      const result = calculateATK(1)
      // (1+1)/2=1 to (6+1)/2=3.5->3
      expect(result.total).toBeGreaterThanOrEqual(1)
      expect(result.total).toBeLessThanOrEqual(3)
    }
  })

  it('SL 6: range 3-6', () => {
    for (let i = 0; i < 100; i++) {
      const result = calculateATK(6)
      // (1+6)/2=3.5->3 to (6+6)/2=6
      expect(result.total).toBeGreaterThanOrEqual(3)
      expect(result.total).toBeLessThanOrEqual(6)
    }
  })
})

describe('calculateSPD', () => {
  it('returns 1d3, range 1-3', () => {
    for (let i = 0; i < 100; i++) {
      const result = calculateSPD()
      expect(result.total).toBeGreaterThanOrEqual(1)
      expect(result.total).toBeLessThanOrEqual(3)
    }
  })
})

describe('checkAbility', () => {
  it('SL 1: threshold is 5, passes if roll <= 5', () => {
    expect(checkAbility(1, 5).passed).toBe(true)
    expect(checkAbility(1, 6).passed).toBe(false)
  })

  it('SL 5: threshold is 1, passes only on roll of 1', () => {
    expect(checkAbility(5, 1).passed).toBe(true)
    expect(checkAbility(5, 2).passed).toBe(false)
  })

  it('SL 6: threshold is 0, never passes', () => {
    for (let roll = 1; roll <= 6; roll++) {
      expect(checkAbility(6, roll).passed).toBe(false)
    }
  })
})

describe('abilityMagnitude', () => {
  it('returns 6 - SL', () => {
    expect(abilityMagnitude(1)).toBe(5)
    expect(abilityMagnitude(2)).toBe(4)
    expect(abilityMagnitude(3)).toBe(3)
    expect(abilityMagnitude(5)).toBe(1)
  })
})

describe('generateCritterStats', () => {
  it('returns all required fields', () => {
    const stats = generateCritterStats()
    expect(stats.starLevel).toBeDefined()
    expect(stats.hp).toBeDefined()
    expect(stats.hpDice).toBeDefined()
    expect(stats.atk).toBeDefined()
    expect(stats.spd).toBeDefined()
    expect(stats.abilityCheck).toBeDefined()
    expect(typeof stats.qualifiesForAbility).toBe('boolean')
    if (stats.qualifiesForAbility) {
      expect(stats.abilityMagnitude).toBeGreaterThan(0)
    }
  })

  it('star level is 1-6', () => {
    for (let i = 0; i < 50; i++) {
      const stats = generateCritterStats()
      expect(stats.starLevel).toBeGreaterThanOrEqual(1)
      expect(stats.starLevel).toBeLessThanOrEqual(6)
    }
  })
})
