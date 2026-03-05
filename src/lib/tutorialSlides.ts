import type { MiniBoardCritter, CellHighlight } from '@/components/MiniBoard'

export interface TutorialStep {
  obstacles?: [number, number][]
  critters?: MiniBoardCritter[]
  highlights?: CellHighlight[]
  caption: string
}

export interface TutorialSlide {
  id: string
  title: string
  icon: string
  steps: TutorialStep[]
}

/* ─── Shared obstacle layout used across slides ─── */
const OBSTACLES: [number, number][] = [
  [4, 2],
  [4, 5],
  [5, 2],
  [5, 5],
]

/* ─── Helper: generate base highlight cells ─── */
function baseHighlights(
  startRow: number,
  rowCount: number,
  cols: number,
): CellHighlight[] {
  const result: CellHighlight[] = []
  for (let r = startRow; r < startRow + rowCount; r++) {
    for (let c = 0; c < cols; c++) {
      result.push({ row: r, col: c, type: 'base-highlight' })
    }
  }
  return result
}

export const TUTORIAL_SLIDES: TutorialSlide[] = [
  /* ── Slide 1: Welcome ── */
  {
    id: 'welcome',
    title: 'Learn to Play!',
    icon: '🎮',
    steps: [
      {
        obstacles: OBSTACLES,
        critters: [
          { row: 1, col: 1, team: 'blue', label: '🦊' },
          { row: 3, col: 4, team: 'blue', label: '🐢' },
          { row: 2, col: 6, team: 'blue', label: '🦅' },
          { row: 8, col: 2, team: 'red', label: '🐺' },
          { row: 7, col: 5, team: 'red', label: '🦎' },
          { row: 9, col: 7, team: 'red', label: '🐍' },
        ],
        caption: 'Critter Arena is a 3v3 tactics game on a grid battlefield!',
      },
    ],
  },

  /* ── Slide 2: The Battlefield ── */
  {
    id: 'battlefield',
    title: 'The Battlefield',
    icon: '🗺️',
    steps: [
      {
        caption: 'The battlefield is an 8-wide by 10-tall grid.',
      },
      {
        highlights: [...baseHighlights(0, 2, 8), ...baseHighlights(8, 2, 8)],
        caption: 'Each side has a 2-row base — blue at top, red at bottom.',
      },
      {
        obstacles: OBSTACLES,
        highlights: [...baseHighlights(0, 2, 8), ...baseHighlights(8, 2, 8)],
        caption: 'Obstacles (dark squares) block movement AND line of sight!',
      },
    ],
  },

  /* ── Slide 3: Your Team ── */
  {
    id: 'your-team',
    title: 'Your Team',
    icon: '👥',
    steps: [
      {
        obstacles: OBSTACLES,
        caption: 'Each player picks 3 critters for their team.',
      },
      {
        obstacles: OBSTACLES,
        critters: [
          { row: 0, col: 1, team: 'blue', label: '🦊', hp: 10, atk: 3, spd: 2 },
          { row: 0, col: 4, team: 'blue', label: '🐢', hp: 18, atk: 1, spd: 1 },
          { row: 1, col: 6, team: 'blue', label: '🦅', hp: 8, atk: 2, spd: 3 },
        ],
        caption: 'Blue places 3 critters anywhere in their base.',
      },
      {
        obstacles: OBSTACLES,
        critters: [
          { row: 0, col: 1, team: 'blue', label: '🦊', hp: 10, atk: 3, spd: 2 },
          { row: 0, col: 4, team: 'blue', label: '🐢', hp: 18, atk: 1, spd: 1 },
          { row: 1, col: 6, team: 'blue', label: '🦅', hp: 8, atk: 2, spd: 3 },
          { row: 8, col: 2, team: 'red', label: '🐺', hp: 14, atk: 2, spd: 2 },
          { row: 9, col: 4, team: 'red', label: '🦎', hp: 12, atk: 3, spd: 1 },
          { row: 9, col: 7, team: 'red', label: '🐍', hp: 9, atk: 4, spd: 2 },
        ],
        caption: 'Red places their 3 critters. Ready to duel!',
      },
    ],
  },

  /* ── Slide 4: Movement ── */
  {
    id: 'movement',
    title: 'Movement',
    icon: '🏃',
    steps: [
      {
        obstacles: OBSTACLES,
        critters: [{ row: 3, col: 3, team: 'blue', label: '🦊', spd: 2 }],
        caption: '🦊 Fox has SPD 2 — it can move up to 2 squares.',
      },
      {
        obstacles: OBSTACLES,
        critters: [{ row: 3, col: 3, team: 'blue', label: '🦊', spd: 2 }],
        highlights: [
          // Chebyshev distance <= 2 from (3,3), excluding obstacles and origin
          { row: 1, col: 1, type: 'move' },
          { row: 1, col: 2, type: 'move' },
          { row: 1, col: 3, type: 'move' },
          { row: 1, col: 4, type: 'move' },
          { row: 1, col: 5, type: 'move' },
          { row: 2, col: 1, type: 'move' },
          { row: 2, col: 2, type: 'move' },
          { row: 2, col: 3, type: 'move' },
          { row: 2, col: 4, type: 'move' },
          { row: 2, col: 5, type: 'move' },
          { row: 3, col: 1, type: 'move' },
          { row: 3, col: 2, type: 'move' },
          { row: 3, col: 4, type: 'move' },
          { row: 3, col: 5, type: 'move' },
          { row: 4, col: 1, type: 'move' },
          { row: 4, col: 3, type: 'move' },
          { row: 4, col: 4, type: 'move' },
          { row: 5, col: 1, type: 'move' },
          { row: 5, col: 3, type: 'move' },
          { row: 5, col: 4, type: 'move' },
        ],
        caption: 'Green squares show everywhere Fox can reach. Diagonals count as 1!',
      },
      {
        obstacles: OBSTACLES,
        critters: [{ row: 3, col: 5, team: 'blue', label: '🦊', spd: 2 }],
        highlights: [
          { row: 3, col: 3, type: 'path' },
          { row: 3, col: 4, type: 'path' },
        ],
        caption: 'Fox moved 2 squares to the right! You don\'t have to use all your movement.',
      },
    ],
  },

  /* ── Slide 5: Combat ── */
  {
    id: 'combat',
    title: 'Combat',
    icon: '⚔️',
    steps: [
      {
        obstacles: OBSTACLES,
        critters: [
          { row: 5, col: 3, team: 'blue', label: '🦊', atk: 3, hp: 10 },
          { row: 5, col: 4, team: 'red', label: '🐺', hp: 14 },
        ],
        highlights: [{ row: 5, col: 4, type: 'attack' }],
        caption: '🦊 Fox is adjacent to 🐺 Wolf — it can attack!',
      },
      {
        obstacles: OBSTACLES,
        critters: [
          { row: 5, col: 3, team: 'blue', label: '🦊', atk: 3, hp: 10 },
          { row: 5, col: 4, team: 'red', label: '🐺', hp: 14 },
        ],
        highlights: [{ row: 5, col: 4, type: 'attack' }],
        caption: 'Roll 1d6 + ATK. Fox rolls a 4 + 3 ATK = 7 damage!',
      },
      {
        obstacles: OBSTACLES,
        critters: [
          { row: 5, col: 3, team: 'blue', label: '🦊', atk: 3, hp: 10 },
          { row: 5, col: 4, team: 'red', label: '🐺', hp: 7 },
        ],
        caption: '🐺 Wolf takes 7 damage! HP: 14 → 7',
      },
    ],
  },

  /* ── Slide 6: Line of Sight ── */
  {
    id: 'line-of-sight',
    title: 'Line of Sight',
    icon: '👁️',
    steps: [
      {
        obstacles: [[4, 3], [4, 4]],
        critters: [
          { row: 3, col: 3, team: 'blue', label: '🦅' },
          { row: 5, col: 4, team: 'red', label: '🐺' },
          { row: 3, col: 6, team: 'red', label: '🦎' },
        ],
        caption: 'Some abilities need line of sight (LoS) to a target.',
      },
      {
        obstacles: [[4, 3], [4, 4]],
        critters: [
          { row: 3, col: 3, team: 'blue', label: '🦅' },
          { row: 5, col: 4, team: 'red', label: '🐺' },
          { row: 3, col: 6, team: 'red', label: '🦎' },
        ],
        highlights: [
          { row: 4, col: 3, type: 'los-blocked' },
          { row: 4, col: 4, type: 'los-blocked' },
        ],
        caption: '🦅 Eagle CANNOT see 🐺 Wolf — the obstacle blocks the line!',
      },
      {
        obstacles: [[4, 3], [4, 4]],
        critters: [
          { row: 3, col: 3, team: 'blue', label: '🦅' },
          { row: 5, col: 4, team: 'red', label: '🐺' },
          { row: 3, col: 6, team: 'red', label: '🦎' },
        ],
        highlights: [
          { row: 4, col: 3, type: 'los-blocked' },
          { row: 4, col: 4, type: 'los-blocked' },
          { row: 3, col: 4, type: 'los-clear' },
          { row: 3, col: 5, type: 'los-clear' },
        ],
        caption: '🦅 Eagle CAN see 🦎 Lizard — nothing is in the way!',
      },
    ],
  },

  /* ── Slide 7: Abilities ── */
  {
    id: 'abilities',
    title: 'Abilities',
    icon: '✨',
    steps: [
      {
        obstacles: [[4, 3], [4, 4]],
        critters: [
          { row: 3, col: 3, team: 'blue', label: '🦊' },
          { row: 6, col: 5, team: 'red', label: '🐺' },
        ],
        caption: 'Each critter has a unique ability! Fox knows "Trick."',
      },
      {
        obstacles: [[4, 3], [4, 4]],
        critters: [
          { row: 3, col: 3, team: 'blue', label: '🦊' },
          { row: 6, col: 5, team: 'red', label: '🐺' },
        ],
        highlights: [
          { row: 3, col: 4, type: 'los-clear' },
          { row: 3, col: 5, type: 'los-clear' },
          { row: 4, col: 5, type: 'los-clear' },
          { row: 5, col: 5, type: 'los-clear' },
        ],
        caption: '🦊 Fox uses "Trick" — swap places with any critter it can see!',
      },
      {
        obstacles: [[4, 3], [4, 4]],
        critters: [
          { row: 6, col: 5, team: 'blue', label: '🦊' },
          { row: 3, col: 3, team: 'red', label: '🐺' },
        ],
        caption: '🦊 and 🐺 swapped places! Read each ability card carefully.',
      },
    ],
  },

  /* ── Slide 8: Scoring & Winning ── */
  {
    id: 'scoring',
    title: 'Scoring & Winning',
    icon: '🏆',
    steps: [
      {
        caption: 'First player to 3 Victory Points (VP) wins!',
      },
      {
        obstacles: OBSTACLES,
        critters: [
          { row: 5, col: 3, team: 'blue', label: '🦊', atk: 3 },
          { row: 5, col: 4, team: 'red', label: '🐺', hp: 0 },
        ],
        caption: 'Defeat a critter (HP reaches 0) = 1 VP!',
      },
      {
        critters: [{ row: 9, col: 3, team: 'blue', label: '🦅' }],
        highlights: baseHighlights(8, 2, 8),
        caption: 'Sneak into the enemy base with no defenders inside = 1 VP!',
      },
      {
        caption: 'First player to reach 3 VP wins the game! 🎉',
      },
    ],
  },
]
