import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGenerateContent = vi.fn()

vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: class {
      getGenerativeModel() {
        return { generateContent: mockGenerateContent }
      }
    },
  }
})

import { identifyCreature, generateAbility } from '../gemini'

beforeEach(() => {
  mockGenerateContent.mockReset()
})

describe('identifyCreature', () => {
  it('parses JSON from AI response correctly', async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          '```json\n{"name":"Big Chicken","creatureType":"chicken","characteristics":["winged","small","feathered"]}\n```',
      },
    })

    const result = await identifyCreature('base64data', 'image/png')

    expect(result).toEqual({
      name: 'Big Chicken',
      creatureType: 'chicken',
      characteristics: ['winged', 'small', 'feathered'],
    })
  })

  it('handles response with extra text around JSON', async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          'Here is the identification:\n{"name":"Snappy","creatureType":"turtle","characteristics":["shelled","four-legged","slow"]}\nHope that helps!',
      },
    })

    const result = await identifyCreature('base64data', 'image/jpeg')

    expect(result).toEqual({
      name: 'Snappy',
      creatureType: 'turtle',
      characteristics: ['shelled', 'four-legged', 'slow'],
    })
  })

  it('throws when AI returns non-JSON', async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => 'I cannot identify this creature from the image.',
      },
    })

    await expect(identifyCreature('base64data', 'image/png')).rejects.toThrow(
      'Failed to parse creature identification from AI response'
    )
  })
})

describe('generateAbility', () => {
  it('parses JSON and returns correct magnitude', async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          '{"name":"Shell Shield","description":"This turn, take 2 less damage from attacks."}',
      },
    })

    const result = await generateAbility('turtle', ['shelled', 'slow'], 2, 4)

    expect(result).toEqual({
      name: 'Shell Shield',
      description: 'This turn, take 2 less damage from attacks.',
      magnitude: 4,
    })
  })

  it('uses the provided magnitude regardless of AI response', async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          '{"name":"Peck Attack","description":"Deal 1 extra damage to an adjacent enemy this turn."}',
      },
    })

    const result = await generateAbility(
      'chicken',
      ['winged', 'small'],
      1,
      5
    )

    expect(result.magnitude).toBe(5)
    expect(result.name).toBe('Peck Attack')
    expect(result.description).toBe(
      'Deal 1 extra damage to an adjacent enemy this turn.'
    )
  })

  it('throws when AI returns non-JSON', async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => 'Sorry, I could not generate an ability for this creature.',
      },
    })

    await expect(
      generateAbility('unknown', ['mysterious'], 3, 3)
    ).rejects.toThrow('Failed to parse ability from AI response')
  })
})
