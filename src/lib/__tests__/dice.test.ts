import { describe, it, expect } from 'vitest'
import { rollDie, rollDice, sumDice } from '../dice'

describe('rollDie', () => {
  it('returns a number between 1 and sides', () => {
    for (let i = 0; i < 100; i++) {
      const result = rollDie(6)
      expect(result).toBeGreaterThanOrEqual(1)
      expect(result).toBeLessThanOrEqual(6)
    }
  })

  it('works for d3', () => {
    for (let i = 0; i < 100; i++) {
      const result = rollDie(3)
      expect(result).toBeGreaterThanOrEqual(1)
      expect(result).toBeLessThanOrEqual(3)
    }
  })
})

describe('rollDice', () => {
  it('rolls the correct number of dice', () => {
    const result = rollDice(4, 6)
    expect(result.rolls).toHaveLength(4)
    expect(result.notation).toBe('4d6')
  })

  it('each die is within range', () => {
    const result = rollDice(3, 6)
    for (const roll of result.rolls) {
      expect(roll).toBeGreaterThanOrEqual(1)
      expect(roll).toBeLessThanOrEqual(6)
    }
  })

  it('total equals sum of rolls', () => {
    const result = rollDice(5, 6)
    const expectedTotal = result.rolls.reduce((a, b) => a + b, 0)
    expect(result.total).toBe(expectedTotal)
  })
})

describe('sumDice', () => {
  it('sums dice results with a modifier', () => {
    expect(sumDice([3, 4, 2], 6)).toBe(15)
  })

  it('sums without modifier', () => {
    expect(sumDice([1, 2, 3], 0)).toBe(6)
  })
})
