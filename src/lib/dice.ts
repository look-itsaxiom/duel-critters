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
