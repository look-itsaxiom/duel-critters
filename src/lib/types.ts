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
  updatedAt?: string
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

export interface ShopItem {
  id: string
  name: string
  description: string
  imageUrl: string
  affiliateUrl: string
  source: 'amazon' | 'etsy'
  price?: string
  featured: boolean
  createdAt: string
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
