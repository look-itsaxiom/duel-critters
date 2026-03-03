import { NextRequest, NextResponse } from 'next/server'
import { del } from '@vercel/blob'
import { generateAbility } from '@/lib/gemini'
import { saveCritter } from '@/lib/storage'
import { generateCritterId } from '@/lib/ids'
import type { CritterRecord } from '@/lib/types'

export async function POST(request: NextRequest) {
  const body = await request.json() as {
    name: string; creatureType: string; characteristics: string[]
    starLevel: number; hp: number; hpDice: number[]
    atk: number; spd: number; qualifiesForAbility: boolean
    abilityMagnitude: number; photoUrl: string
  }
  const {
    name, creatureType, characteristics, starLevel, hp, hpDice,
    atk, spd, qualifiesForAbility, abilityMagnitude, photoUrl,
  } = body

  try {
    let ability = null
    if (qualifiesForAbility) {
      ability = await generateAbility(creatureType, characteristics, starLevel, abilityMagnitude)
    }

    const critter: CritterRecord = {
      id: generateCritterId(),
      name, creatureType, characteristics, starLevel, hp, hpDice,
      atk, spd,
      hasAbility: qualifiesForAbility,
      ability,
      photoUrl,
      createdAt: new Date().toISOString(),
    }

    await saveCritter(critter)
    return NextResponse.json(critter)
  } catch (err) {
    console.error('Generate API error:', err)
    // Clean up the uploaded photo so it doesn't stay orphaned in blob storage
    if (photoUrl) {
      try { await del(photoUrl) } catch { /* best-effort cleanup */ }
    }
    const message = err instanceof Error ? err.message : 'Failed to generate critter'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
