export interface Ability {
  name: string
  description: string
  magnitude: number
}

export interface CritterRecord {
  id: string
  name: string
  nickname?: string
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
