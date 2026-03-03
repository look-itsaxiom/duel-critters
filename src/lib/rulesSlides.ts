export interface RuleSlide {
  id: string
  icon: string
  title: string
  accentColor: string
  rules?: string[]
  /** Sentinel for slides that need custom JSX instead of (or in addition to) a rule list */
  custom?: 'quick-reference' | 'combat-example' | 'scoring'
}

export const SLIDES: RuleSlide[] = [
  {
    id: 'quick-reference',
    icon: '📋',
    title: 'Quick Reference',
    accentColor: 'emerald',
    custom: 'quick-reference',
  },
  {
    id: 'setup',
    icon: '🎲',
    title: 'Setup',
    accentColor: 'amber',
    rules: [
      'Each player picks a team of 3 critters.',
      'The battlefield is an 8-wide by 10-tall grid.',
      "The first 2 rows on each side are that team's base (colored red or blue).",
      'Obstacles are placed on the grid -- they block movement AND line of sight.',
      'Both players place their 3 critters anywhere inside their own base.',
      'Both players roll a 6-sided die (d6) for initiative. Highest roll chooses to go first or second. Re-roll ties!',
    ],
  },
  {
    id: 'turn-structure',
    icon: '🔄',
    title: 'Turn Structure',
    accentColor: 'sky',
    rules: [
      'Players take full team turns: you activate ALL 3 of your critters, then your opponent takes their turn.',
      'Each critter can move, attack, AND use an ability on its turn (unless an ability says otherwise).',
      'You can activate your critters in any order you want.',
    ],
  },
  {
    id: 'movement',
    icon: '🏃',
    title: 'Movement',
    accentColor: 'green',
    rules: [
      'A critter can move up to its SPD (speed) stat in grid squares.',
      'Moving diagonally counts as 1 square -- same as moving straight.',
      'You cannot move through obstacles.',
      'You cannot move through other critters (friendly or enemy).',
      'You do not have to use all of your movement.',
    ],
  },
  {
    id: 'combat',
    icon: '⚔️',
    title: 'Combat',
    accentColor: 'red',
    rules: [
      "A critter can attack any enemy that is adjacent (1 square away, including diagonals).",
      "To deal damage: roll 1d6 + your critter's ATK stat.",
      "Subtract the damage from the target's HP.",
      "When a critter's HP reaches 0, it is defeated!",
      'Defeating a critter earns you 1 Victory Point.',
    ],
    custom: 'combat-example',
  },
  {
    id: 'line-of-sight',
    icon: '👁️',
    title: 'Line of Sight',
    accentColor: 'violet',
    rules: [
      'Line of sight (LoS) is a straight, unobstructed line between two critters.',
      'Obstacles block line of sight.',
      'Other critters (friendly or enemy) also block line of sight.',
      "Some abilities require line of sight to a target -- if something is in the way, you can't use the ability on that target.",
    ],
  },
  {
    id: 'abilities',
    icon: '✨',
    title: 'Abilities',
    accentColor: 'purple',
    rules: [
      'Each critter has a unique ability.',
      'By default, a critter can use its ability once per turn.',
      'Some abilities have special rules, like "once per game" or "can\'t use if you attacked this turn."',
      'Always read the ability card carefully -- it will tell you exactly when and how you can use it.',
    ],
  },
  {
    id: 'scoring',
    icon: '🏆',
    title: 'Scoring & Winning',
    accentColor: 'amber',
    custom: 'scoring',
  },
]

/** Pre-built Tailwind class strings so the JIT scanner picks them up */
export interface AccentClasses {
  border: string
  bgLight: string
  dot: string
  dotActive: string
  dotHover: string
  text: string
  textDark: string
}

export const ACCENT_CLASSES: Record<string, AccentClasses> = {
  emerald: {
    border: 'border-emerald-300',
    bgLight: 'bg-emerald-50',
    dot: 'bg-emerald-200',
    dotActive: 'bg-emerald-500',
    dotHover: 'hover:bg-emerald-300',
    text: 'text-emerald-600',
    textDark: 'text-emerald-800',
  },
  amber: {
    border: 'border-amber-300',
    bgLight: 'bg-amber-50',
    dot: 'bg-amber-200',
    dotActive: 'bg-amber-500',
    dotHover: 'hover:bg-amber-300',
    text: 'text-amber-600',
    textDark: 'text-amber-800',
  },
  sky: {
    border: 'border-sky-300',
    bgLight: 'bg-sky-50',
    dot: 'bg-sky-200',
    dotActive: 'bg-sky-500',
    dotHover: 'hover:bg-sky-300',
    text: 'text-sky-600',
    textDark: 'text-sky-800',
  },
  green: {
    border: 'border-green-300',
    bgLight: 'bg-green-50',
    dot: 'bg-green-200',
    dotActive: 'bg-green-500',
    dotHover: 'hover:bg-green-300',
    text: 'text-green-600',
    textDark: 'text-green-800',
  },
  red: {
    border: 'border-red-300',
    bgLight: 'bg-red-50',
    dot: 'bg-red-200',
    dotActive: 'bg-red-500',
    dotHover: 'hover:bg-red-300',
    text: 'text-red-600',
    textDark: 'text-red-800',
  },
  violet: {
    border: 'border-violet-300',
    bgLight: 'bg-violet-50',
    dot: 'bg-violet-200',
    dotActive: 'bg-violet-500',
    dotHover: 'hover:bg-violet-300',
    text: 'text-violet-600',
    textDark: 'text-violet-800',
  },
  purple: {
    border: 'border-purple-300',
    bgLight: 'bg-purple-50',
    dot: 'bg-purple-200',
    dotActive: 'bg-purple-500',
    dotHover: 'hover:bg-purple-300',
    text: 'text-purple-600',
    textDark: 'text-purple-800',
  },
}
