import { NextRequest, NextResponse } from 'next/server'
import { generateAbility } from '@/lib/gemini'
import { saveCritter } from '@/lib/storage'
import { generateCritterId } from '@/lib/ids'
import type { CritterRecord } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name, creatureType, characteristics, starLevel, hp, hpDice,
      atk, spd, qualifiesForAbility, abilityMagnitude, photoUrl,
    } = body

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
    const message = err instanceof Error ? err.message : 'Failed to generate critter'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
