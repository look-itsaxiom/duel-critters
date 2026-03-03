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

export interface MapRule {
  name: string
  description: string
}

export interface MapRecord {
  id: string
  name: string
  grid: number[][]
  rules?: MapRule[]
}
