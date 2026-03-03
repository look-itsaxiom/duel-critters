import { rollDie, rollDice } from './dice'

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
