import type { MapRecord } from './types'

/**
 * Terrain cell values:
 *   0 = open
 *   1 = obstacle
 *   2 = red base  (bottom 2 rows)
 *   3 = blue base (top 2 rows)
 *   4 = lava
 *   5 = water
 */

// Helper: 8-wide rows. B=blue base(3), R=red base(2), O=open(0), X=obstacle(1), L=lava(4), W=water(5)
const B = 3, R = 2, O = 0, X = 1, L = 4, W = 5

export const MAPS: MapRecord[] = [
  {
    id: 'open-field',
    name: 'Open Field',
    grid: [
      [B, B, B, B, B, B, B, B],
      [B, B, B, B, B, B, B, B],
      [O, O, O, O, O, O, O, O],
      [O, O, O, O, O, O, O, O],
      [O, O, O, O, O, O, O, O],
      [O, O, O, O, O, O, O, O],
      [O, O, O, O, O, O, O, O],
      [O, O, O, O, O, O, O, O],
      [R, R, R, R, R, R, R, R],
      [R, R, R, R, R, R, R, R],
    ],
  },
  {
    id: 'the-corridor',
    name: 'The Corridor',
    grid: [
      [B, B, B, B, B, B, B, B],
      [B, B, B, B, B, B, B, B],
      [X, X, O, O, O, O, X, X],
      [X, O, O, O, O, O, O, X],
      [X, O, O, O, O, O, O, X],
      [X, O, O, O, O, O, O, X],
      [X, O, O, O, O, O, O, X],
      [X, X, O, O, O, O, X, X],
      [R, R, R, R, R, R, R, R],
      [R, R, R, R, R, R, R, R],
    ],
  },
  {
    id: 'scatter',
    name: 'Scatter',
    grid: [
      [B, B, B, B, B, B, B, B],
      [B, B, B, B, B, B, B, B],
      [O, O, X, O, O, O, O, X],
      [O, O, O, O, X, O, O, O],
      [X, O, O, O, O, O, X, O],
      [O, X, O, O, O, O, O, O],
      [O, O, O, X, O, O, O, X],
      [X, O, O, O, O, X, O, O],
      [R, R, R, R, R, R, R, R],
      [R, R, R, R, R, R, R, R],
    ],
  },
  {
    id: 'twin-forts',
    name: 'Twin Forts',
    grid: [
      [B, B, B, B, B, B, B, B],
      [B, B, B, B, B, B, B, B],
      [O, X, X, O, O, X, X, O],
      [O, X, O, O, O, O, X, O],
      [O, O, O, O, O, O, O, O],
      [O, O, O, O, O, O, O, O],
      [O, X, O, O, O, O, X, O],
      [O, X, X, O, O, X, X, O],
      [R, R, R, R, R, R, R, R],
      [R, R, R, R, R, R, R, R],
    ],
  },
  {
    id: 'lava-crossing',
    name: 'Lava Crossing',
    grid: [
      [B, B, B, B, B, B, B, B],
      [B, B, B, B, B, B, B, B],
      [O, O, O, O, O, O, O, O],
      [O, O, X, O, O, X, O, O],
      [L, L, O, L, L, O, L, L],
      [L, L, O, L, L, O, L, L],
      [O, O, X, O, O, X, O, O],
      [O, O, O, O, O, O, O, O],
      [R, R, R, R, R, R, R, R],
      [R, R, R, R, R, R, R, R],
    ],
    rules: [
      {
        name: 'Lava Tiles',
        description: 'A critter takes 1 damage whenever it moves onto a lava tile. Ouch!',
      },
    ],
  },
  {
    id: 'river-run',
    name: 'River Run',
    grid: [
      [B, B, B, B, B, B, B, B],
      [B, B, B, B, B, B, B, B],
      [O, O, O, W, W, O, O, O],
      [O, X, O, W, W, O, X, O],
      [O, O, O, W, W, O, O, O],
      [O, O, O, W, W, O, O, O],
      [O, X, O, W, W, O, X, O],
      [O, O, O, W, W, O, O, O],
      [R, R, R, R, R, R, R, R],
      [R, R, R, R, R, R, R, R],
    ],
    rules: [
      {
        name: 'Water Tiles',
        description: 'Moving onto a water tile costs 2 SPD instead of 1. Plan your crossing carefully!',
      },
    ],
  },
  {
    id: 'king-of-the-hill',
    name: 'King of the Hill',
    grid: [
      [B, B, B, B, B, B, B, B],
      [B, B, B, B, B, B, B, B],
      [O, O, O, O, O, O, O, O],
      [O, X, O, O, O, O, X, O],
      [O, O, O, O, O, O, O, O],
      [O, O, O, O, O, O, O, O],
      [O, X, O, O, O, O, X, O],
      [O, O, O, O, O, O, O, O],
      [R, R, R, R, R, R, R, R],
      [R, R, R, R, R, R, R, R],
    ],
    rules: [
      {
        name: 'King of the Hill',
        description: 'The center 4 squares are "the hill." If your team has a critter on the hill at the end of 3 turns in a row, score 1 VP!',
      },
    ],
  },
  {
    id: 'capture-the-flag',
    name: 'Capture the Flag',
    grid: [
      [B, B, B, B, B, B, B, B],
      [B, B, B, B, B, B, B, B],
      [O, O, X, O, O, X, O, O],
      [O, O, O, O, O, O, O, O],
      [X, O, O, O, O, O, O, X],
      [X, O, O, O, O, O, O, X],
      [O, O, O, O, O, O, O, O],
      [O, O, X, O, O, X, O, O],
      [R, R, R, R, R, R, R, R],
      [R, R, R, R, R, R, R, R],
    ],
    rules: [
      {
        name: 'Capture the Flag',
        description: 'Each base has a flag in its center. Move a critter onto the enemy flag, then carry it back to your base to score 2 VP!',
      },
    ],
  },
  {
    id: 'gauntlet',
    name: 'The Gauntlet',
    grid: [
      [B, B, B, B, B, B, B, B],
      [B, B, B, B, B, B, B, B],
      [O, X, O, X, O, X, O, O],
      [O, X, O, X, O, X, O, X],
      [O, O, O, O, O, O, O, X],
      [X, O, O, O, O, O, O, O],
      [X, O, X, O, X, O, X, O],
      [O, O, X, O, X, O, X, O],
      [R, R, R, R, R, R, R, R],
      [R, R, R, R, R, R, R, R],
    ],
    rules: [
      {
        name: 'Gauntlet Rush',
        description: 'The first team to move any critter into the enemy base wins instantly! No VP needed — just survive the gauntlet.',
      },
    ],
  },
  {
    id: 'chaos-arena',
    name: 'Chaos Arena',
    grid: [
      [B, B, B, B, B, B, B, B],
      [B, B, B, B, B, B, B, B],
      [O, L, O, X, X, O, L, O],
      [O, O, L, O, O, L, O, O],
      [X, O, O, L, L, O, O, X],
      [X, O, O, L, L, O, O, X],
      [O, O, L, O, O, L, O, O],
      [O, L, O, X, X, O, L, O],
      [R, R, R, R, R, R, R, R],
      [R, R, R, R, R, R, R, R],
    ],
    rules: [
      {
        name: 'Lava Tiles',
        description: 'A critter takes 1 damage whenever it moves onto a lava tile. Ouch!',
      },
      {
        name: 'Sudden Death',
        description: 'All critters start with 2 less HP than normal. Every hit counts!',
      },
    ],
  },
]

export function getMapById(id: string): MapRecord | undefined {
  return MAPS.find(m => m.id === id)
}

/** Terrain cell color classes for rendering */
export const TERRAIN_COLORS: Record<number, string> = {
  0: 'bg-white',
  1: 'bg-gray-700',
  2: 'bg-red-200',
  3: 'bg-sky-200',
  4: 'bg-orange-400',
  5: 'bg-cyan-300',
}

export const TERRAIN_LABELS: Record<number, string> = {
  0: 'Open',
  1: 'Obstacle',
  2: 'Red Base',
  3: 'Blue Base',
  4: 'Lava',
  5: 'Water',
}
