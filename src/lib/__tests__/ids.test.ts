import { describe, it, expect } from 'vitest'
import { generateCritterId, generateMapId } from '../ids'

describe('generateCritterId', () => {
  it('starts with DC- prefix', () => {
    const id = generateCritterId()
    expect(id).toMatch(/^DC-/)
  })

  it('has correct length after prefix', () => {
    const id = generateCritterId()
    const suffix = id.replace('DC-', '')
    expect(suffix).toHaveLength(6)
  })

  it('uses only uppercase alphanumeric characters', () => {
    for (let i = 0; i < 50; i++) {
      const id = generateCritterId()
      const suffix = id.replace('DC-', '')
      expect(suffix).toMatch(/^[A-Z0-9]+$/)
    }
  })

  it('generates unique IDs', () => {
    const ids = new Set<string>()
    for (let i = 0; i < 100; i++) {
      ids.add(generateCritterId())
    }
    expect(ids.size).toBe(100)
  })
})

describe('generateMapId', () => {
  it('starts with MAP- prefix', () => {
    const id = generateMapId()
    expect(id).toMatch(/^MAP-/)
  })
})
