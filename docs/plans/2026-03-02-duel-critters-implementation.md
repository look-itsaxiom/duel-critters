# Duel Critters Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an MVP web app where users upload a photo of a toy critter, get 3D animated stat rolls, and receive a printable birth certificate + battle card. Includes a map builder and rules reference for physical play.

**Architecture:** Next.js 15 App Router fullstack on Vercel. Client-side 3D dice via @3d-dice/dice-box. Gemini API for vision (creature ID) and text (ability generation). Vercel KV for data, Vercel Blob for photos. No accounts.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, @3d-dice/dice-box, @google/generative-ai, @vercel/kv, @vercel/blob, qrcode, jspdf, html2canvas, Vitest

**Design doc:** `docs/plans/2026-03-02-duel-critters-design.md`

---

### Task 1: Scaffold Project

**Files:**
- Create: project root via `create-next-app`
- Create: `vitest.config.ts`
- Create: `.env.local` (gitignored)
- Create: `.env.example`

**Step 1: Create Next.js project**

Run from `C:/Users/ChaseSkibeness/Projects/duel-critters`:
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Expected: Project scaffold created with `src/app/` directory structure.

**Step 2: Install all dependencies**

```bash
npm install @3d-dice/dice-box @google/generative-ai @vercel/kv @vercel/blob qrcode jspdf html2canvas nanoid
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @types/qrcode
```

**Step 3: Configure Vitest**

Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

Add to `package.json` scripts:
```json
"test": "vitest",
"test:run": "vitest run"
```

**Step 4: Create environment files**

Create `.env.example`:
```
GEMINI_API_KEY=
KV_REST_API_URL=
KV_REST_API_TOKEN=
BLOB_READ_WRITE_TOKEN=
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

Create `.env.local` with same keys (gitignored by default in Next.js).

**Step 5: Verify setup**

```bash
npm run dev
```
Expected: Next.js dev server starts on localhost:3000.

```bash
npm run test:run
```
Expected: Vitest runs with 0 tests (no test files yet).

**Step 6: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js project with dependencies and Vitest"
```

---

### Task 2: Shared Types and Constants

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/lib/constants.ts`

**Step 1: Create type definitions**

Create `src/lib/types.ts`:
```typescript
export interface Ability {
  name: string
  description: string
  magnitude: number
}

export interface CritterRecord {
  id: string
  name: string
  creatureType: string
  characteristics: string[]
  starLevel: number
  hp: number
  hpDice: number[]
  atk: number
  spd: number
  hasAbility: boolean
  ability: Ability | null
  photoUrl: string
  createdAt: string
}

export interface DiceResult {
  notation: string
  total: number
  rolls: number[]
}

export interface GenerationRolls {
  starLevel: DiceResult
  hp: DiceResult
  atk: DiceResult
  spd: DiceResult
  abilityCheck: DiceResult
}

export interface CreatureIdentification {
  name: string
  creatureType: string
  characteristics: string[]
}

export type TerrainType = 'open' | 'obstacle' | 'base-red' | 'base-blue'

export const TERRAIN_VALUES: Record<TerrainType, number> = {
  'open': 0,
  'obstacle': 1,
  'base-red': 2,
  'base-blue': 3,
}

export interface MapRecord {
  id: string
  name: string
  grid: number[][]
  createdAt: string
}
```

**Step 2: Create game constants**

Create `src/lib/constants.ts`:
```typescript
export const GRID_COLS = 8
export const GRID_ROWS = 10
export const BASE_ROWS = 2
export const TEAM_SIZE = 3
export const VP_TO_WIN = 3

// Card dimensions in inches (standard playing card)
export const CARD_WIDTH_IN = 2.5
export const CARD_HEIGHT_IN = 3.5

// Card dimensions in mm
export const CARD_WIDTH_MM = 63.5
export const CARD_HEIGHT_MM = 88.5

// Critter ID prefix
export const CRITTER_ID_PREFIX = 'DC'
export const MAP_ID_PREFIX = 'MAP'
export const ID_LENGTH = 6
```

**Step 3: Commit**

```bash
git add src/lib/types.ts src/lib/constants.ts
git commit -m "feat: add shared types and game constants"
```

---

### Task 3: Dice Rolling & Stat Generation Logic (TDD)

**Files:**
- Create: `src/lib/dice.ts`
- Create: `src/lib/generation.ts`
- Test: `src/lib/__tests__/dice.test.ts`
- Test: `src/lib/__tests__/generation.test.ts`

**Step 1: Write failing tests for dice utilities**

Create `src/lib/__tests__/dice.test.ts`:
```typescript
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
```

**Step 2: Run tests to verify they fail**

```bash
npm run test:run -- src/lib/__tests__/dice.test.ts
```
Expected: FAIL — module not found.

**Step 3: Implement dice utilities**

Create `src/lib/dice.ts`:
```typescript
import type { DiceResult } from './types'

export function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1
}

export function rollDice(count: number, sides: number): DiceResult {
  const rolls: number[] = []
  for (let i = 0; i < count; i++) {
    rolls.push(rollDie(sides))
  }
  return {
    notation: `${count}d${sides}`,
    total: rolls.reduce((a, b) => a + b, 0),
    rolls,
  }
}

export function sumDice(rolls: number[], modifier: number): number {
  return rolls.reduce((a, b) => a + b, 0) + modifier
}
```

**Step 4: Run tests to verify they pass**

```bash
npm run test:run -- src/lib/__tests__/dice.test.ts
```
Expected: All PASS.

**Step 5: Write failing tests for stat generation**

Create `src/lib/__tests__/generation.test.ts`:
```typescript
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
      // (1+1)/2=1 to (6+1)/2=3.5→3
      expect(result.total).toBeGreaterThanOrEqual(1)
      expect(result.total).toBeLessThanOrEqual(3)
    }
  })

  it('SL 6: range 3-6', () => {
    for (let i = 0; i < 100; i++) {
      const result = calculateATK(6)
      // (1+6)/2=3.5→3 to (6+6)/2=6
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
    // abs(1 - 6) = 5
    expect(checkAbility(1, 5).passed).toBe(true)
    expect(checkAbility(1, 6).passed).toBe(false)
  })

  it('SL 5: threshold is 1, passes only on roll of 1', () => {
    // abs(5 - 6) = 1
    expect(checkAbility(5, 1).passed).toBe(true)
    expect(checkAbility(5, 2).passed).toBe(false)
  })

  it('SL 6: threshold is 0, never passes', () => {
    // abs(6 - 6) = 0
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
```

**Step 6: Run tests to verify they fail**

```bash
npm run test:run -- src/lib/__tests__/generation.test.ts
```
Expected: FAIL — module not found.

**Step 7: Implement stat generation**

Create `src/lib/generation.ts`:
```typescript
import { rollDie, rollDice } from './dice'
import type { DiceResult } from './types'

export interface HPResult {
  total: number
  rolls: number[]
}

export function calculateHP(starLevel: number): HPResult {
  const result = rollDice(starLevel, 6)
  return {
    total: result.total + 6,
    rolls: result.rolls,
  }
}

export interface ATKResult {
  total: number
  roll: number
}

export function calculateATK(starLevel: number): { total: number; rolls: number[] } {
  const roll = rollDie(6)
  return {
    total: Math.floor((roll + starLevel) / 2),
    rolls: [roll],
  }
}

export function calculateSPD(): { total: number; rolls: number[] } {
  const roll = rollDie(3)
  return {
    total: roll,
    rolls: [roll],
  }
}

export interface AbilityCheckResult {
  passed: boolean
  roll: number
  threshold: number
}

export function checkAbility(starLevel: number, roll: number): AbilityCheckResult {
  const threshold = Math.abs(starLevel - 6)
  return {
    passed: roll <= threshold,
    roll,
    threshold,
  }
}

export function abilityMagnitude(starLevel: number): number {
  return 6 - starLevel
}

export interface CritterStats {
  starLevel: number
  hp: number
  hpDice: number[]
  atk: number
  spd: number
  abilityCheck: AbilityCheckResult
  qualifiesForAbility: boolean
  abilityMagnitude: number
}

export function generateCritterStats(): CritterStats {
  const starLevel = rollDie(6)
  const hpResult = calculateHP(starLevel)
  const atkResult = calculateATK(starLevel)
  const spdResult = calculateSPD()
  const abilityRoll = rollDie(6)
  const abilityResult = checkAbility(starLevel, abilityRoll)

  return {
    starLevel,
    hp: hpResult.total,
    hpDice: hpResult.rolls,
    atk: atkResult.total,
    spd: spdResult.total,
    abilityCheck: abilityResult,
    qualifiesForAbility: abilityResult.passed,
    abilityMagnitude: abilityResult.passed ? abilityMagnitude(starLevel) : 0,
  }
}
```

**Step 8: Run tests to verify they pass**

```bash
npm run test:run -- src/lib/__tests__/generation.test.ts
```
Expected: All PASS.

**Step 9: Commit**

```bash
git add src/lib/dice.ts src/lib/generation.ts src/lib/__tests__/
git commit -m "feat: add dice rolling and stat generation logic with tests"
```

---

### Task 4: ID Generation

**Files:**
- Create: `src/lib/ids.ts`
- Test: `src/lib/__tests__/ids.test.ts`

**Step 1: Write failing tests**

Create `src/lib/__tests__/ids.test.ts`:
```typescript
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
```

**Step 2: Run tests to verify they fail**

```bash
npm run test:run -- src/lib/__tests__/ids.test.ts
```
Expected: FAIL.

**Step 3: Implement ID generation**

Create `src/lib/ids.ts`:
```typescript
import { nanoid, customAlphabet } from 'nanoid'
import { CRITTER_ID_PREFIX, MAP_ID_PREFIX, ID_LENGTH } from './constants'

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const generate = customAlphabet(alphabet, ID_LENGTH)

export function generateCritterId(): string {
  return `${CRITTER_ID_PREFIX}-${generate()}`
}

export function generateMapId(): string {
  return `${MAP_ID_PREFIX}-${generate()}`
}
```

**Step 4: Run tests to verify they pass**

```bash
npm run test:run -- src/lib/__tests__/ids.test.ts
```
Expected: All PASS.

**Step 5: Commit**

```bash
git add src/lib/ids.ts src/lib/__tests__/ids.test.ts
git commit -m "feat: add critter and map ID generation"
```

---

### Task 5: Storage Layer

**Files:**
- Create: `src/lib/storage.ts`

**Step 1: Implement storage wrapper**

Create `src/lib/storage.ts`:
```typescript
import { kv } from '@vercel/kv'
import { put } from '@vercel/blob'
import type { CritterRecord, MapRecord } from './types'

// --- Critter Storage ---

export async function saveCritter(critter: CritterRecord): Promise<void> {
  await kv.set(`critter:${critter.id}`, critter)
}

export async function getCritter(id: string): Promise<CritterRecord | null> {
  return await kv.get<CritterRecord>(`critter:${id}`)
}

// --- Photo Storage ---

export async function uploadPhoto(
  file: Buffer,
  filename: string
): Promise<string> {
  const blob = await put(`critters/${filename}`, file, {
    access: 'public',
    contentType: 'image/jpeg',
  })
  return blob.url
}

// --- Map Storage ---

export async function saveMap(map: MapRecord): Promise<void> {
  await kv.set(`map:${map.id}`, map)
}

export async function getMap(id: string): Promise<MapRecord | null> {
  return await kv.get<MapRecord>(`map:${id}`)
}
```

Note: Storage functions are thin wrappers over Vercel SDK. They'll be tested via integration tests with the API routes. No mocking needed at this layer.

**Step 2: Commit**

```bash
git add src/lib/storage.ts
git commit -m "feat: add Vercel KV and Blob storage layer"
```

---

### Task 6: Gemini AI Integration

**Files:**
- Create: `src/lib/gemini.ts`
- Test: `src/lib/__tests__/gemini.test.ts`

**Step 1: Implement Gemini client**

Create `src/lib/gemini.ts`:
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai'
import type { CreatureIdentification, Ability } from './types'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// --- Creature Identification ---

export async function identifyCreature(
  imageBase64: string,
  mimeType: string
): Promise<CreatureIdentification> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const result = await model.generateContent([
    {
      inlineData: { data: imageBase64, mimeType },
    },
    {
      text: `You are looking at a small toy figurine (likely a resin or plastic animal).

Identify what creature this is and respond with ONLY valid JSON in this exact format:
{
  "name": "A fun name for this creature (e.g., 'Triceratops', 'Big Chicken', 'Capybara')",
  "creatureType": "the animal type in lowercase (e.g., 'triceratops', 'chicken', 'capybara')",
  "characteristics": ["3-5 physical traits like 'horned', 'winged', 'four-legged', 'translucent', 'small']
}

Use a playful, kid-friendly name. If it's clearly a specific animal, use that. If it's ambiguous or fantasy, pick the closest match with a fun twist.`,
    },
  ])

  const text = result.response.text()
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Failed to parse creature identification from AI response')
  }
  return JSON.parse(jsonMatch[0]) as CreatureIdentification
}

// --- Ability Generation ---

const ABILITY_SYSTEM_PROMPT = `You are a game designer for Duel Critters, a tactical grid battle game for kids ages 6-12.

GAME RULES:
- 3v3 on an 8x10 grid. First 2 rows on each side are team bases.
- Each turn, each critter can: move (up to SPD squares, diagonals OK), attack (adjacent enemy, damage = 1d6 + ATK), and use ability.
- Obstacles block movement AND line of sight (straight unobstructed line).
- Defeat a critter = 1 VP. Enter empty enemy base + spend attack action = 1 VP. First to 3 VP wins.

ABILITY DESIGN RULES:
You are generating an ability for a critter. The ability MUST:
1. Be thematically tied to the creature (a turtle gets defensive, a hawk gets mobility, a fox gets trickery)
2. Be explainable in 2 kid-friendly sentences MAX
3. Only reference game concepts: grid squares, HP, ATK, SPD, adjacency, line of sight, obstacles, bases, turns
4. Respect the magnitude number (higher = more powerful)
5. Be trackable by kids on a physical board with no extra tokens

ALLOWED MECHANICS (easy for kids to track):
- Flat number bonuses/penalties ("+2 damage", "-1 damage taken")
- This-turn-only effects
- Adjacent/nearby critter targeting
- Straight line movement/targeting
- Once-per-game effects
- Single target or "all adjacent"

FORBIDDEN MECHANICS (too hard for kids):
- Multi-turn durations
- Stacking/counting effects
- Triggers on opponent's turn
- Hidden information
- Rule-changing effects
- Extra tokens or bookkeeping

EXAMPLE ABILITIES:
- Unbothered (Capybara, magnitude 4): "Critter friends 1 space away take -1 damage."
- Trick (Fox, magnitude 5): "Swap spaces with any critter on the board that this critter can see."
- Big Chomp (Dinosaurns, magnitude 4): "Once per game, you can choose to do 2 attacks this turn."
- Horn Charge (Triceratops, magnitude 5): "Move any spaces in a straight line then attack. Deals bonus damage equal to spaces moved."

Respond with ONLY valid JSON in this exact format:
{
  "name": "Ability Name",
  "description": "1-2 kid-friendly sentences describing what the ability does."
}`

export async function generateAbility(
  creatureType: string,
  characteristics: string[],
  starLevel: number,
  magnitude: number
): Promise<Ability> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const result = await model.generateContent([
    { text: ABILITY_SYSTEM_PROMPT },
    {
      text: `Generate an ability for this critter:
- Creature: ${creatureType}
- Characteristics: ${characteristics.join(', ')}
- Star Level: ${starLevel}
- Ability Magnitude: ${magnitude} (out of 5, where 5 is extremely powerful)

Create a unique, fun ability that fits this creature's identity.`,
    },
  ])

  const text = result.response.text()
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Failed to parse ability from AI response')
  }

  const parsed = JSON.parse(jsonMatch[0])
  return {
    name: parsed.name,
    description: parsed.description,
    magnitude,
  }
}
```

**Step 2: Write test with mocked Gemini**

Create `src/lib/__tests__/gemini.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the @google/generative-ai module
vi.mock('@google/generative-ai', () => {
  const mockGenerateContent = vi.fn()
  return {
    GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
      getGenerativeModel: vi.fn().mockReturnValue({
        generateContent: mockGenerateContent,
      }),
    })),
    __mockGenerateContent: mockGenerateContent,
  }
})

// Must import AFTER mock setup
import { identifyCreature, generateAbility } from '../gemini'
import { __mockGenerateContent } from '@google/generative-ai'

describe('identifyCreature', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('parses creature identification from AI response', async () => {
    const mockResponse = {
      response: {
        text: () => JSON.stringify({
          name: 'Triceratops',
          creatureType: 'triceratops',
          characteristics: ['horned', 'sturdy', 'four-legged'],
        }),
      },
    };
    (__mockGenerateContent as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

    const result = await identifyCreature('base64data', 'image/jpeg')
    expect(result.name).toBe('Triceratops')
    expect(result.creatureType).toBe('triceratops')
    expect(result.characteristics).toContain('horned')
  })
})

describe('generateAbility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('parses ability from AI response', async () => {
    const mockResponse = {
      response: {
        text: () => JSON.stringify({
          name: 'Shell Shield',
          description: 'This turn, take 3 less damage from the next attack.',
        }),
      },
    };
    (__mockGenerateContent as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

    const result = await generateAbility('turtle', ['shelled', 'slow'], 2, 4)
    expect(result.name).toBe('Shell Shield')
    expect(result.description).toContain('damage')
    expect(result.magnitude).toBe(4)
  })
})
```

**Step 3: Run tests**

```bash
npm run test:run -- src/lib/__tests__/gemini.test.ts
```
Expected: All PASS.

**Step 4: Commit**

```bash
git add src/lib/gemini.ts src/lib/__tests__/gemini.test.ts
git commit -m "feat: add Gemini AI integration for creature ID and ability generation"
```

---

### Task 7: API Routes

**Files:**
- Create: `src/app/api/identify/route.ts`
- Create: `src/app/api/generate/route.ts`
- Create: `src/app/api/critter/[id]/route.ts`
- Create: `src/app/api/maps/route.ts`
- Create: `src/app/api/maps/[id]/route.ts`

**Step 1: POST /api/identify — Upload photo, get creature ID**

Create `src/app/api/identify/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { identifyCreature } from '@/lib/gemini'
import { uploadPhoto } from '@/lib/storage'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('photo') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No photo provided' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const base64 = buffer.toString('base64')
  const mimeType = file.type || 'image/jpeg'

  // Upload photo to blob storage
  const filename = `${nanoid()}.jpg`
  const photoUrl = await uploadPhoto(buffer, filename)

  // Identify creature via Gemini vision
  const identification = await identifyCreature(base64, mimeType)

  return NextResponse.json({
    ...identification,
    photoUrl,
  })
}
```

**Step 2: POST /api/generate — Save finalized critter**

Create `src/app/api/generate/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { generateAbility } from '@/lib/gemini'
import { saveCritter } from '@/lib/storage'
import { generateCritterId } from '@/lib/ids'
import type { CritterRecord } from '@/lib/types'

export async function POST(request: NextRequest) {
  const body = await request.json()

  const {
    name,
    creatureType,
    characteristics,
    starLevel,
    hp,
    hpDice,
    atk,
    spd,
    qualifiesForAbility,
    abilityMagnitude,
    photoUrl,
  } = body

  // Generate ability if qualified
  let ability = null
  if (qualifiesForAbility) {
    ability = await generateAbility(
      creatureType,
      characteristics,
      starLevel,
      abilityMagnitude
    )
  }

  const critter: CritterRecord = {
    id: generateCritterId(),
    name,
    creatureType,
    characteristics,
    starLevel,
    hp,
    hpDice,
    atk,
    spd,
    hasAbility: qualifiesForAbility,
    ability,
    photoUrl,
    createdAt: new Date().toISOString(),
  }

  await saveCritter(critter)

  return NextResponse.json(critter)
}
```

**Step 3: GET /api/critter/[id] — Fetch critter for verification**

Create `src/app/api/critter/[id]/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getCritter } from '@/lib/storage'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const critter = await getCritter(id)

  if (!critter) {
    return NextResponse.json({ error: 'Critter not found' }, { status: 404 })
  }

  return NextResponse.json(critter)
}
```

**Step 4: Map API routes**

Create `src/app/api/maps/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { saveMap } from '@/lib/storage'
import { generateMapId } from '@/lib/ids'
import type { MapRecord } from '@/lib/types'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { name, grid } = body

  const map: MapRecord = {
    id: generateMapId(),
    name,
    grid,
    createdAt: new Date().toISOString(),
  }

  await saveMap(map)

  return NextResponse.json(map)
}
```

Create `src/app/api/maps/[id]/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getMap } from '@/lib/storage'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const map = await getMap(id)

  if (!map) {
    return NextResponse.json({ error: 'Map not found' }, { status: 404 })
  }

  return NextResponse.json(map)
}
```

**Step 5: Commit**

```bash
git add src/app/api/
git commit -m "feat: add API routes for critter generation, verification, and maps"
```

---

### Task 8: 3D Dice Roller Component

**Files:**
- Create: `src/components/DiceRoller.tsx`
- Create: `src/components/DiceRoller.css`

**Step 1: Implement dice roller component**

This component wraps @3d-dice/dice-box to render physics-simulated 3D dice.

Create `src/components/DiceRoller.tsx`:
```tsx
'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface DiceRollerProps {
  notation: string // e.g. "3d6", "1d3"
  label: string // e.g. "Star Level", "HP"
  onResult: (rolls: number[], total: number) => void
  disabled?: boolean
}

export default function DiceRoller({ notation, label, onResult, disabled }: DiceRollerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const diceBoxRef = useRef<any>(null)
  const [isReady, setIsReady] = useState(false)
  const [rolling, setRolling] = useState(false)

  useEffect(() => {
    let mounted = true

    async function initDiceBox() {
      // @3d-dice/dice-box must be dynamically imported (uses Web Workers)
      const { default: DiceBox } = await import('@3d-dice/dice-box')

      if (!mounted || !containerRef.current) return

      const box = new DiceBox('#dice-canvas', {
        assetPath: '/assets/dice-box/',
        theme: 'default',
        scale: 6,
        gravity: 1,
        throwForce: 5,
      })

      await box.init()
      diceBoxRef.current = box
      if (mounted) setIsReady(true)
    }

    initDiceBox()
    return () => { mounted = false }
  }, [])

  const roll = useCallback(async () => {
    if (!diceBoxRef.current || rolling || disabled) return
    setRolling(true)

    const result = await diceBoxRef.current.roll(notation)

    // dice-box returns array of die results
    const rolls = result.map((die: any) => die.value)
    const total = rolls.reduce((a: number, b: number) => a + b, 0)

    setRolling(false)
    onResult(rolls, total)
  }, [notation, onResult, rolling, disabled])

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-sm font-bold uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div
        ref={containerRef}
        id="dice-canvas"
        className="relative w-80 h-48 bg-gray-900 rounded-lg overflow-hidden"
      />
      <button
        onClick={roll}
        disabled={!isReady || rolling || disabled}
        className="px-6 py-2 bg-amber-500 text-white font-bold rounded-lg
                   hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors"
      >
        {rolling ? 'Rolling...' : `Roll ${notation}`}
      </button>
    </div>
  )
}
```

Note: @3d-dice/dice-box requires its static assets (3D models, textures) copied to `public/assets/dice-box/`. This is done during setup:
```bash
cp -r node_modules/@3d-dice/dice-box/src/assets public/assets/dice-box
```

**Step 2: Commit**

```bash
git add src/components/DiceRoller.tsx
git commit -m "feat: add 3D dice roller component with physics simulation"
```

---

### Task 9: Photo Upload Component

**Files:**
- Create: `src/components/PhotoUpload.tsx`

**Step 1: Implement photo upload**

Create `src/components/PhotoUpload.tsx`:
```tsx
'use client'

import { useState, useRef, useCallback } from 'react'

interface PhotoUploadProps {
  onUpload: (file: File, preview: string) => void
  disabled?: boolean
}

export default function PhotoUpload({ onUpload, disabled }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      setPreview(dataUrl)
      onUpload(file, dataUrl)
    }
    reader.readAsDataURL(file)
  }, [onUpload])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  return (
    <div
      className={`relative border-2 border-dashed rounded-xl p-8 text-center
                  transition-colors cursor-pointer
                  ${dragging ? 'border-amber-500 bg-amber-50' : 'border-gray-300 hover:border-amber-400'}
                  ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        className="hidden"
        disabled={disabled}
      />

      {preview ? (
        <img
          src={preview}
          alt="Critter preview"
          className="mx-auto max-h-48 rounded-lg object-contain"
        />
      ) : (
        <div className="space-y-2">
          <div className="text-4xl">📸</div>
          <p className="text-lg font-medium">Drop your critter photo here</p>
          <p className="text-sm text-gray-500">or tap to take a picture</p>
        </div>
      )}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/PhotoUpload.tsx
git commit -m "feat: add photo upload component with drag-and-drop"
```

---

### Task 10: Certificate & Battle Card Renderer

**Files:**
- Create: `src/components/BirthCertificate.tsx`
- Create: `src/components/BattleCard.tsx`
- Create: `src/components/CertificatePage.tsx`
- Create: `src/lib/qr.ts`

**Step 1: QR code helper**

Create `src/lib/qr.ts`:
```typescript
import QRCode from 'qrcode'

export async function generateQRDataUrl(url: string): Promise<string> {
  return await QRCode.toDataURL(url, {
    width: 120,
    margin: 1,
    color: { dark: '#000000', light: '#ffffff' },
  })
}
```

**Step 2: Implement HP dice pip display helper**

This renders the individual d6 results as dice face icons so kids know which physical dice to lay out.

Create `src/components/DicePips.tsx`:
```tsx
const PIP_CHARS: Record<number, string> = {
  1: '\u2680', // ⚀
  2: '\u2681', // ⚁
  3: '\u2682', // ⚂
  4: '\u2683', // ⚃
  5: '\u2684', // ⚄
  6: '\u2685', // ⚅
}

interface DicePipsProps {
  rolls: number[]
  className?: string
}

export default function DicePips({ rolls, className = '' }: DicePipsProps) {
  return (
    <span className={`font-mono text-lg ${className}`}>
      {rolls.map((roll, i) => (
        <span key={i} title={`${roll}`}>{PIP_CHARS[roll] || '?'}</span>
      ))}
    </span>
  )
}
```

**Step 3: Implement Birth Certificate (top portion)**

Create `src/components/BirthCertificate.tsx`:
```tsx
import DicePips from './DicePips'
import type { CritterRecord } from '@/lib/types'

interface BirthCertificateProps {
  critter: CritterRecord
  qrDataUrl: string
}

export default function BirthCertificate({ critter, qrDataUrl }: BirthCertificateProps) {
  const stars = '★'.repeat(critter.starLevel) + '☆'.repeat(6 - critter.starLevel)

  return (
    <div className="border-4 border-double border-gray-800 p-6 bg-amber-50 font-serif max-w-lg mx-auto">
      <div className="text-center space-y-3">
        <h1 className="text-xl font-bold tracking-widest uppercase">
          Official Critter Certificate
        </h1>
        <div className="border-b border-gray-400" />

        <p className="text-sm italic">This certifies that</p>

        <h2 className="text-3xl font-bold">{critter.name}</h2>
        <div className="text-xl tracking-wider">{stars}</div>

        {critter.photoUrl && (
          <img
            src={critter.photoUrl}
            alt={critter.name}
            className="mx-auto w-32 h-32 object-contain rounded-lg border border-gray-300"
          />
        )}

        <p className="text-sm italic">
          has been officially registered as a Duel Critter
          on {new Date(critter.createdAt).toLocaleDateString()}.
        </p>

        <div className="border-b border-gray-400" />

        <div className="text-left space-y-1 font-mono text-sm">
          <div className="flex gap-4">
            <span>HP: {critter.hp}</span>
            <DicePips rolls={critter.hpDice} />
          </div>
          <div>ATK: +{critter.atk} &nbsp; 1d6+{critter.atk}</div>
          <div>SPD: {critter.spd}</div>
        </div>

        {critter.hasAbility && critter.ability && (
          <div className="text-left border-t border-gray-300 pt-2">
            <div className="font-bold">Ability: {critter.ability.name}</div>
            <div className="text-sm">{critter.ability.description}</div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-gray-500">
            <div>ID: {critter.id}</div>
            <div>Certified by: Duel Critters HQ</div>
          </div>
          <img src={qrDataUrl} alt="QR Code" className="w-16 h-16" />
        </div>
      </div>
    </div>
  )
}
```

**Step 4: Implement Battle Card (cuttable, standard playing card size)**

Create `src/components/BattleCard.tsx`:
```tsx
import DicePips from './DicePips'
import type { CritterRecord } from '@/lib/types'

interface BattleCardProps {
  critter: CritterRecord
  qrDataUrl: string
}

export default function BattleCard({ critter, qrDataUrl }: BattleCardProps) {
  const stars = '★'.repeat(critter.starLevel)

  return (
    <div
      className="border-2 border-black rounded-lg p-2 bg-white font-sans"
      style={{
        width: '2.5in',
        height: '3.5in',
        fontSize: '10px',
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-1">
        <span className="font-bold text-xs truncate max-w-[60%]">{critter.name}</span>
        <span className="text-amber-500 text-xs">{stars}</span>
      </div>

      {/* Photo */}
      {critter.photoUrl && (
        <img
          src={critter.photoUrl}
          alt={critter.name}
          className="w-16 h-16 object-contain mx-auto rounded border border-gray-200 mb-1"
        />
      )}

      {/* Stats */}
      <div className="space-y-0.5 font-mono" style={{ fontSize: '9px' }}>
        <div className="flex gap-2">
          <span>HP: {critter.hp}</span>
          <DicePips rolls={critter.hpDice} className="text-xs" />
        </div>
        <div>ATK: +{critter.atk} &nbsp; 1d6+{critter.atk}</div>
        <div>SPD: {critter.spd}</div>
      </div>

      {/* Ability */}
      {critter.hasAbility && critter.ability && (
        <div className="mt-1 border-t border-gray-200 pt-1">
          <div className="font-bold" style={{ fontSize: '9px' }}>
            Ability: {critter.ability.name}
          </div>
          <div style={{ fontSize: '8px', lineHeight: '1.2' }}>
            {critter.ability.description}
          </div>
        </div>
      )}

      {/* Footer with QR */}
      <div className="absolute bottom-2 right-2">
        <img src={qrDataUrl} alt="QR" className="w-8 h-8" />
      </div>
    </div>
  )
}
```

**Step 5: Implement combined printable page**

Create `src/components/CertificatePage.tsx`:
```tsx
'use client'

import { useRef } from 'react'
import BirthCertificate from './BirthCertificate'
import BattleCard from './BattleCard'
import type { CritterRecord } from '@/lib/types'

interface CertificatePageProps {
  critter: CritterRecord
  qrDataUrl: string
}

export default function CertificatePage({ critter, qrDataUrl }: CertificatePageProps) {
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    window.print()
  }

  return (
    <div>
      {/* Print button (hidden when printing) */}
      <div className="print:hidden text-center mb-4">
        <button
          onClick={handlePrint}
          className="px-8 py-3 bg-amber-500 text-white font-bold rounded-lg
                     hover:bg-amber-600 transition-colors text-lg"
        >
          Print Certificate
        </button>
      </div>

      {/* Printable area */}
      <div ref={printRef} className="print:m-0">
        <BirthCertificate critter={critter} qrDataUrl={qrDataUrl} />

        {/* Cut line */}
        <div className="border-t-2 border-dashed border-gray-400 my-4 relative">
          <span className="absolute -top-3 left-4 bg-white px-2 text-xs text-gray-400">
            ✂ CUT HERE
          </span>
        </div>

        <div className="flex justify-center">
          <BattleCard critter={critter} qrDataUrl={qrDataUrl} />
        </div>
      </div>
    </div>
  )
}
```

**Step 6: Commit**

```bash
git add src/lib/qr.ts src/components/DicePips.tsx src/components/BirthCertificate.tsx src/components/BattleCard.tsx src/components/CertificatePage.tsx
git commit -m "feat: add birth certificate and battle card renderers with QR codes"
```

---

### Task 11: Generation Flow Page (/generate)

**Files:**
- Create: `src/app/generate/page.tsx`

**Step 1: Implement the multi-step generation wizard**

This is the core user experience: Upload → Identify → Roll → Certify.

Create `src/app/generate/page.tsx`:
```tsx
'use client'

import { useState, useCallback } from 'react'
import PhotoUpload from '@/components/PhotoUpload'
import DiceRoller from '@/components/DiceRoller'
import CertificatePage from '@/components/CertificatePage'
import { calculateHP, calculateATK, calculateSPD, checkAbility, abilityMagnitude } from '@/lib/generation'
import { generateQRDataUrl } from '@/lib/qr'
import type { CritterRecord, CreatureIdentification } from '@/lib/types'

type Step = 'upload' | 'identifying' | 'rolling' | 'certifying' | 'done'

type RollingPhase = 'star-level' | 'hp' | 'atk' | 'spd' | 'ability-check' | 'complete'

export default function GeneratePage() {
  const [step, setStep] = useState<Step>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string>('')
  const [creature, setCreature] = useState<CreatureIdentification | null>(null)
  const [rollingPhase, setRollingPhase] = useState<RollingPhase>('star-level')
  const [starLevel, setStarLevel] = useState(0)
  const [hp, setHp] = useState(0)
  const [hpDice, setHpDice] = useState<number[]>([])
  const [atk, setAtk] = useState(0)
  const [spd, setSpd] = useState(0)
  const [qualifiesForAbility, setQualifiesForAbility] = useState(false)
  const [magnitude, setMagnitude] = useState(0)
  const [critter, setCritter] = useState<CritterRecord | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState('')

  // Step 1: Photo uploaded
  const handleUpload = useCallback(async (uploadedFile: File) => {
    setFile(uploadedFile)
    setStep('identifying')

    const formData = new FormData()
    formData.append('photo', uploadedFile)

    const res = await fetch('/api/identify', { method: 'POST', body: formData })
    const data = await res.json()

    setCreature(data)
    setPhotoUrl(data.photoUrl)
    setStep('rolling')
  }, [])

  // Step 2: Dice rolling sequence
  // Each phase rolls, computes the stat, and advances to the next phase.
  // The DiceRoller component handles the 3D animation; we compute stats from results.

  const handleStarLevel = useCallback((_rolls: number[], total: number) => {
    setStarLevel(total)
    setRollingPhase('hp')
  }, [])

  const handleHP = useCallback((rolls: number[], total: number) => {
    setHp(total + 6)
    setHpDice(rolls)
    setRollingPhase('atk')
  }, [])

  const handleATK = useCallback((rolls: number[], _total: number) => {
    const atkValue = Math.floor((rolls[0] + starLevel) / 2)
    setAtk(atkValue)
    setRollingPhase('spd')
  }, [starLevel])

  const handleSPD = useCallback((_rolls: number[], total: number) => {
    setSpd(total)
    setRollingPhase('ability-check')
  }, [])

  const handleAbilityCheck = useCallback((_rolls: number[], total: number) => {
    const result = checkAbility(starLevel, total)
    setQualifiesForAbility(result.passed)
    if (result.passed) {
      setMagnitude(abilityMagnitude(starLevel))
    }
    setRollingPhase('complete')
  }, [starLevel])

  // Step 3: Certify — send everything to the server
  const handleCertify = useCallback(async () => {
    if (!creature) return
    setStep('certifying')

    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: creature.name,
        creatureType: creature.creatureType,
        characteristics: creature.characteristics,
        starLevel,
        hp,
        hpDice,
        atk,
        spd,
        qualifiesForAbility,
        abilityMagnitude: magnitude,
        photoUrl,
      }),
    })

    const critterData: CritterRecord = await res.json()
    setCritter(critterData)

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin
    const qr = await generateQRDataUrl(`${baseUrl}/v/${critterData.id}`)
    setQrDataUrl(qr)

    setStep('done')
  }, [creature, starLevel, hp, hpDice, atk, spd, qualifiesForAbility, magnitude, photoUrl])

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Register Your Critter
        </h1>

        {/* Step: Upload */}
        {step === 'upload' && (
          <PhotoUpload onUpload={handleUpload} />
        )}

        {/* Step: Identifying */}
        {step === 'identifying' && (
          <div className="text-center py-12">
            <div className="animate-spin text-4xl mb-4">🔍</div>
            <p className="text-lg">Identifying your critter...</p>
          </div>
        )}

        {/* Step: Rolling */}
        {step === 'rolling' && creature && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">{creature.name}</h2>
              <p className="text-gray-500">{creature.characteristics.join(' / ')}</p>
            </div>

            {/* Show accumulated stats */}
            <div className="bg-white rounded-lg p-4 shadow font-mono text-sm space-y-1">
              {starLevel > 0 && <div>Star Level: {'★'.repeat(starLevel)} ({starLevel})</div>}
              {hp > 0 && <div>HP: {hp}</div>}
              {atk > 0 && <div>ATK: +{atk} (1d6+{atk})</div>}
              {spd > 0 && <div>SPD: {spd}</div>}
              {rollingPhase === 'complete' && (
                <div>
                  Ability: {qualifiesForAbility
                    ? `Yes! (magnitude ${magnitude})`
                    : 'None — pure stats!'}
                </div>
              )}
            </div>

            {/* Current dice roll phase */}
            {rollingPhase === 'star-level' && (
              <DiceRoller notation="1d6" label="Star Level" onResult={handleStarLevel} />
            )}
            {rollingPhase === 'hp' && (
              <DiceRoller notation={`${starLevel}d6`} label="Hit Points" onResult={handleHP} />
            )}
            {rollingPhase === 'atk' && (
              <DiceRoller notation="1d6" label="Attack" onResult={handleATK} />
            )}
            {rollingPhase === 'spd' && (
              <DiceRoller notation="1d3" label="Speed" onResult={handleSPD} />
            )}
            {rollingPhase === 'ability-check' && (
              <DiceRoller notation="1d6" label="Ability Check" onResult={handleAbilityCheck} />
            )}

            {/* Certify button */}
            {rollingPhase === 'complete' && (
              <div className="text-center">
                <button
                  onClick={handleCertify}
                  className="px-8 py-4 bg-green-600 text-white text-xl font-bold rounded-xl
                             hover:bg-green-700 transition-colors shadow-lg"
                >
                  Certify This Critter!
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step: Certifying */}
        {step === 'certifying' && (
          <div className="text-center py-12">
            <div className="animate-bounce text-4xl mb-4">📜</div>
            <p className="text-lg">Generating certificate...</p>
            {qualifiesForAbility && (
              <p className="text-sm text-gray-500 mt-2">
                Discovering ability...
              </p>
            )}
          </div>
        )}

        {/* Step: Done — show certificate */}
        {step === 'done' && critter && (
          <CertificatePage critter={critter} qrDataUrl={qrDataUrl} />
        )}
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/app/generate/page.tsx
git commit -m "feat: add generation flow page with step-by-step wizard"
```

---

### Task 12: Verification Page (/v/[id])

**Files:**
- Create: `src/app/v/[id]/page.tsx`

**Step 1: Implement SSR verification page**

Create `src/app/v/[id]/page.tsx`:
```tsx
import { getCritter } from '@/lib/storage'
import { notFound } from 'next/navigation'
import DicePips from '@/components/DicePips'

interface VerifyPageProps {
  params: Promise<{ id: string }>
}

export default async function VerifyPage({ params }: VerifyPageProps) {
  const { id } = await params
  const critter = await getCritter(id)

  if (!critter) {
    notFound()
  }

  const stars = '★'.repeat(critter.starLevel) + '☆'.repeat(6 - critter.starLevel)

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
        <div className="text-center mb-4">
          <div className="text-xs uppercase tracking-widest text-green-600 font-bold">
            Verified Critter
          </div>
          <h1 className="text-2xl font-bold mt-1">{critter.name}</h1>
          <div className="text-xl text-amber-500">{stars}</div>
        </div>

        {critter.photoUrl && (
          <img
            src={critter.photoUrl}
            alt={critter.name}
            className="w-32 h-32 object-contain mx-auto rounded-lg border mb-4"
          />
        )}

        <div className="space-y-2 font-mono text-sm">
          <div className="flex items-center gap-2">
            <span className="font-bold">HP:</span> {critter.hp}
            <DicePips rolls={critter.hpDice} />
          </div>
          <div>
            <span className="font-bold">ATK:</span> +{critter.atk} &nbsp; 1d6+{critter.atk}
          </div>
          <div>
            <span className="font-bold">SPD:</span> {critter.spd}
          </div>
        </div>

        {critter.hasAbility && critter.ability && (
          <div className="mt-4 border-t pt-3">
            <div className="font-bold">Ability: {critter.ability.name}</div>
            <div className="text-sm text-gray-700">{critter.ability.description}</div>
          </div>
        )}

        <div className="mt-4 text-center text-xs text-gray-400">
          ID: {critter.id} | Registered {new Date(critter.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/app/v/
git commit -m "feat: add critter verification page (QR code target)"
```

---

### Task 13: Map Builder (/maps)

**Files:**
- Create: `src/components/MapEditor.tsx`
- Create: `src/app/maps/page.tsx`
- Create: `src/app/maps/[id]/page.tsx`

**Step 1: Implement grid editor component**

Create `src/components/MapEditor.tsx`:
```tsx
'use client'

import { useState, useCallback } from 'react'
import { GRID_COLS, GRID_ROWS, BASE_ROWS } from '@/lib/constants'

interface MapEditorProps {
  onSave: (name: string, grid: number[][]) => void
}

function createEmptyGrid(): number[][] {
  const grid: number[][] = []
  for (let row = 0; row < GRID_ROWS; row++) {
    const cells: number[] = []
    for (let col = 0; col < GRID_COLS; col++) {
      if (row < BASE_ROWS) {
        cells.push(3) // base-blue (top)
      } else if (row >= GRID_ROWS - BASE_ROWS) {
        cells.push(2) // base-red (bottom)
      } else {
        cells.push(0) // open
      }
    }
    grid.push(cells)
  }
  return grid
}

const TERRAIN_COLORS: Record<number, string> = {
  0: 'bg-white hover:bg-gray-100',
  1: 'bg-gray-700',
  2: 'bg-red-200',
  3: 'bg-blue-200',
}

export default function MapEditor({ onSave }: MapEditorProps) {
  const [grid, setGrid] = useState<number[][]>(createEmptyGrid)
  const [name, setName] = useState('')

  const toggleCell = useCallback((row: number, col: number) => {
    // Don't allow editing base zones
    if (row < BASE_ROWS || row >= GRID_ROWS - BASE_ROWS) return

    setGrid(prev => {
      const next = prev.map(r => [...r])
      // Toggle between open (0) and obstacle (1)
      next[row][col] = next[row][col] === 0 ? 1 : 0
      return next
    })
  }, [])

  const handleSave = () => {
    if (!name.trim()) return
    onSave(name.trim(), grid)
  }

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Map name (e.g., Crystal Cavern)"
        className="w-full px-4 py-2 border rounded-lg text-lg"
      />

      <div className="inline-block border-2 border-gray-800">
        {grid.map((row, rowIdx) => (
          <div key={rowIdx} className="flex">
            {row.map((cell, colIdx) => (
              <button
                key={colIdx}
                className={`w-10 h-10 border border-gray-300 ${TERRAIN_COLORS[cell]}
                           transition-colors`}
                onClick={() => toggleCell(rowIdx, colIdx)}
                title={`Row ${rowIdx + 1}, Col ${colIdx + 1}`}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="flex gap-4 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 bg-white border inline-block" /> Open
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 bg-gray-700 inline-block" /> Obstacle
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 bg-red-200 inline-block" /> Red Base
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 bg-blue-200 inline-block" /> Blue Base
        </span>
      </div>

      <button
        onClick={handleSave}
        disabled={!name.trim()}
        className="px-6 py-2 bg-amber-500 text-white font-bold rounded-lg
                   hover:bg-amber-600 disabled:opacity-50 transition-colors"
      >
        Save Map
      </button>
    </div>
  )
}
```

**Step 2: Map builder page**

Create `src/app/maps/page.tsx`:
```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MapEditor from '@/components/MapEditor'

export default function MapsPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const handleSave = async (name: string, grid: number[][]) => {
    setSaving(true)
    const res = await fetch('/api/maps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, grid }),
    })
    const map = await res.json()
    router.push(`/maps/${map.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Build a Battlefield
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Click squares to place obstacles. Base zones are locked.
        </p>
        {saving ? (
          <div className="text-center py-12">Saving map...</div>
        ) : (
          <MapEditor onSave={handleSave} />
        )}
      </div>
    </div>
  )
}
```

**Step 3: Map viewer page**

Create `src/app/maps/[id]/page.tsx`:
```tsx
import { getMap } from '@/lib/storage'
import { notFound } from 'next/navigation'
import { GRID_COLS, GRID_ROWS, BASE_ROWS } from '@/lib/constants'

const TERRAIN_COLORS: Record<number, string> = {
  0: 'bg-white',
  1: 'bg-gray-700',
  2: 'bg-red-200',
  3: 'bg-blue-200',
}

interface MapViewPageProps {
  params: Promise<{ id: string }>
}

export default async function MapViewPage({ params }: MapViewPageProps) {
  const { id } = await params
  const map = await getMap(id)

  if (!map) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-2">{map.name}</h1>
        <p className="text-sm text-gray-500 mb-6">Map ID: {map.id}</p>

        <div className="inline-block border-2 border-gray-800 print:border-black">
          {map.grid.map((row, rowIdx) => (
            <div key={rowIdx} className="flex">
              {row.map((cell, colIdx) => (
                <div
                  key={colIdx}
                  className={`w-10 h-10 border border-gray-300 ${TERRAIN_COLORS[cell]}`}
                />
              ))}
            </div>
          ))}
        </div>

        <div className="mt-6 print:hidden">
          <button
            onClick={() => window.print()}
            className="px-6 py-2 bg-amber-500 text-white font-bold rounded-lg
                       hover:bg-amber-600 transition-colors"
          >
            Print Map
          </button>
        </div>
      </div>
    </div>
  )
}
```

**Step 4: Commit**

```bash
git add src/components/MapEditor.tsx src/app/maps/
git commit -m "feat: add map builder with grid editor and viewer"
```

---

### Task 14: Rules Page (/rules)

**Files:**
- Create: `src/app/rules/page.tsx`

**Step 1: Implement static rules page**

Create `src/app/rules/page.tsx` with the complete game rules from the design document, formatted for readability and print-friendliness. The content should match the "Game Rules" section of the design doc exactly, formatted with headers, bullet points, and a clean layout.

Key sections to include:
- Setup (3v3, 8x10 grid, bases, initiative roll)
- Turn Structure (full team turns, move + attack + ability)
- Movement (SPD squares, diagonals count as 1)
- Combat (adjacent attack, 1d6 + ATK damage)
- Line of Sight (straight unobstructed line)
- Abilities (once per turn default, overrides possible)
- Scoring (defeat = 1 VP, base attack = 1 VP, first to 3 VP)

Include a print button and print-friendly Tailwind classes.

**Step 2: Commit**

```bash
git add src/app/rules/page.tsx
git commit -m "feat: add rules reference page"
```

---

### Task 15: Landing Page (/)

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/layout.tsx`

**Step 1: Update root layout**

Modify `src/app/layout.tsx` to include:
- App-wide nav bar with links to `/generate`, `/maps`, `/rules`
- Print-hidden nav (so certificates and maps print clean)
- Basic metadata (title, description)

**Step 2: Implement landing page**

Replace `src/app/page.tsx` with a landing page that includes:
- Hero section: "Got a critter? Make it real."
- Brief explanation of the game loop (upload → roll → print → play)
- CTA button linking to `/generate`
- Secondary links to `/maps` and `/rules`
- Keep it simple, fun, kid-friendly

**Step 3: Commit**

```bash
git add src/app/page.tsx src/app/layout.tsx
git commit -m "feat: add landing page and navigation"
```

---

### Task 16: Dice Box Asset Setup & Final Integration

**Files:**
- Copy: `node_modules/@3d-dice/dice-box/src/assets` → `public/assets/dice-box/`
- Modify: `next.config.ts` (if needed for external images)

**Step 1: Copy dice-box static assets**

```bash
cp -r node_modules/@3d-dice/dice-box/src/assets public/assets/dice-box
```

**Step 2: Configure Next.js for Vercel Blob external images**

Add to `next.config.ts`:
```typescript
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
}
```

**Step 3: Run the full test suite**

```bash
npm run test:run
```
Expected: All tests pass.

**Step 4: Run the dev server and manually test the full flow**

```bash
npm run dev
```

Verify:
- [ ] Landing page loads at `/`
- [ ] Photo upload works at `/generate`
- [ ] AI identification returns creature data
- [ ] 3D dice roll through all phases
- [ ] Certificate renders with QR code
- [ ] QR code links to verification page
- [ ] Map builder works at `/maps`
- [ ] Rules page displays at `/rules`

**Step 5: Commit and push**

```bash
git add -A
git commit -m "chore: add dice-box assets and final integration config"
git push -u origin main
```

---

## Summary

| Task | Description | Key Files |
|------|-------------|-----------|
| 1 | Scaffold project | Project root, vitest config |
| 2 | Types & constants | `src/lib/types.ts`, `src/lib/constants.ts` |
| 3 | Dice & stat generation (TDD) | `src/lib/dice.ts`, `src/lib/generation.ts` |
| 4 | ID generation (TDD) | `src/lib/ids.ts` |
| 5 | Storage layer | `src/lib/storage.ts` |
| 6 | Gemini AI integration | `src/lib/gemini.ts` |
| 7 | API routes | `src/app/api/` |
| 8 | 3D dice roller component | `src/components/DiceRoller.tsx` |
| 9 | Photo upload component | `src/components/PhotoUpload.tsx` |
| 10 | Certificate & battle card | `src/components/BirthCertificate.tsx`, `BattleCard.tsx` |
| 11 | Generation flow page | `src/app/generate/page.tsx` |
| 12 | Verification page | `src/app/v/[id]/page.tsx` |
| 13 | Map builder | `src/components/MapEditor.tsx`, `src/app/maps/` |
| 14 | Rules page | `src/app/rules/page.tsx` |
| 15 | Landing page | `src/app/page.tsx` |
| 16 | Asset setup & integration | Config, assets, testing |
