import { GoogleGenerativeAI } from '@google/generative-ai'
import type { CreatureIdentification, Ability } from './types'

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// --- Creature Identification ---

export async function identifyCreature(
  imageBase64: string,
  mimeType: string
): Promise<CreatureIdentification> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const result = await model.generateContent([
    {
      inlineData: { data: imageBase64, mimeType },
    },
    {
      text: `You are the registration clerk for Critter Arena, a tabletop tactics game played with small figurines on a grid board.

FIRST, decide if this image shows a valid critter. A valid critter is:
- A small figurine, toy, or statue of a creature (animal, monster, fantasy beast, etc.)
- Small enough to fit on a single chessboard square (roughly 2 inches / 5 cm or smaller)
- Made of resin, plastic, rubber, clay, wood, glass, metal, or similar craft material
- It can be a real animal type OR a fantasy/mythical creature — as long as it's a figurine

REJECT the image if it is:
- A real live animal or person (not a figurine)
- Something that isn't a creature at all (a car, food, building, phone, etc.)
- Way too large to fit on a chessboard square (a stuffed animal the size of a pillow, a full action figure, etc.)
- A blurry or unrecognizable image

Respond with ONLY valid JSON. If the image is NOT a valid critter:
{
  "valid": false,
  "reason": "A short kid-friendly reason why this can't be registered (1 sentence)"
}

If the image IS a valid critter:
{
  "valid": true,
  "name": "A short unique proper name, 1-2 words max (e.g., 'Blitz', 'Fangsworth', 'Clover')",
  "creatureType": "the animal type in lowercase (e.g., 'triceratops', 'chicken', 'capybara')",
  "characteristics": ["3-5 physical traits like 'horned', 'winged', 'four-legged', 'translucent', 'small"]
}

IMPORTANT name rules:
- The name is a PROPER NAME for this individual critter, NOT a description of what it is.
- Maximum 12 characters. One or two words only.
- Think pet names, RPG character names, or mythical creature names.
- Good: "Blitz", "Fangsworth", "Clover", "Spike", "Nimbus", "Rex", "Zara"
- Bad: "Sparkly Pink Spider", "Big Fluffy Bear", "Small Green Frog" (these are descriptions, not names)`,
    },
  ])

  const text = result.response.text()
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Failed to parse creature identification from AI response')
  }

  const parsed = JSON.parse(jsonMatch[0])

  if (parsed.valid === false) {
    throw new ValidationError(parsed.reason || 'That doesn\u2019t look like a critter figurine!')
  }

  return {
    name: parsed.name,
    creatureType: parsed.creatureType,
    characteristics: parsed.characteristics,
  } as CreatureIdentification
}

// --- Ability Generation ---

export const ABILITY_SYSTEM_PROMPT = `You are a game designer for Critter Arena, a tactical grid battle game for kids ages 6-12.

GAME RULES:
- 3v3 on an 8x10 grid. First 2 rows on each side are team bases.
- Each turn, each critter can: move (up to SPD squares, diagonals OK) AND either attack OR use ability — NOT both.
- Normal attack: target adjacent enemy, damage = 1d6 + ATK.
- Obstacles block movement AND line of sight (straight unobstructed line).
- Defeat a critter = 1 VP. Enter empty enemy base + spend attack action = 1 VP. First to 3 VP wins.

CRITICAL — ACTION ECONOMY:
A critter gets ONE action per turn: attack OR ability. Using an ability means giving up the attack. This is the core balance lever. Every ability description MUST make clear what it costs.

ABILITY USAGE TYPES (pick exactly one):
1. **Attack Replacement** — "Instead of attacking, [effect]." The critter does this instead of dealing normal damage.
2. **Defensive Trade** — "Instead of attacking, [defensive effect] until your next turn." Gives up offense for defense.
3. **Once Per Game** — "Once per game: [powerful effect]." Flip the card face-down to mark as used. Can be used AND attack on the same turn since it's a one-shot.
4. **Passive (weak, always-on)** — ONLY for magnitude 1-2. Must be a small flat bonus like "+1 damage" or "+1 SPD". No defensive passives.

ABILITY DESIGN RULES:
1. Be thematically tied to the creature (turtle = defensive, hawk = mobility, fox = trickery)
2. Explainable in 2 kid-friendly sentences MAX
3. Only reference game concepts: grid squares, HP, ATK, SPD, adjacency, line of sight, obstacles, bases, turns
4. Respect the magnitude number (higher = more powerful)
5. Trackable by kids on a physical board with no extra tokens
6. The description MUST state the cost ("Instead of attacking..." or "Once per game..." or state the passive bonus)

ALLOWED MECHANICS:
- Flat number bonuses/penalties ("+2 damage", "-1 damage taken this turn")
- This-turn-only effects that replace the attack action
- Adjacent/nearby critter targeting
- Straight line movement/targeting
- Once-per-game powerful effects
- Single target or "all adjacent"
- Pushing/pulling a target 1-2 squares

FORBIDDEN MECHANICS:
- Full damage immunity or dodge ("takes no damage", "attacks miss this critter")
- Negating an opponent's turn or action entirely
- Multi-turn durations or lingering effects
- Stacking/counting effects
- Triggers on opponent's turn
- Hidden information or rule-changing effects
- Extra tokens or bookkeeping
- Any free-every-turn ability that doesn't cost the attack action (except weak passives at magnitude 1-2)

EXAMPLES BY USAGE TYPE:

Attack Replacement:
- Flame Breath (Dragon, mag 4): "Instead of attacking, deal 3 damage to all adjacent enemies."
- Horn Charge (Triceratops, mag 5): "Instead of attacking, move up to 4 squares in a straight line. Deal damage equal to squares moved to the first enemy hit."

Defensive Trade:
- Shell Up (Turtle, mag 3): "Instead of attacking, take 3 less damage from all attacks until your next turn."
- Camouflage (Chameleon, mag 3): "Instead of attacking, enemies must be adjacent to target this critter until your next turn."

Once Per Game:
- Trick (Fox, mag 5): "Once per game, flip card face-down: swap spaces with any critter you can see."
- Big Chomp (Dinosaur, mag 4): "Once per game, flip card face-down: make 2 attacks this turn instead of 1."

Passive (magnitude 1-2 only):
- Tough Hide (Rhino, mag 1): "This critter always takes 1 less damage from attacks (minimum 1)."
- Swift Paws (Cat, mag 2): "This critter has +1 SPD."

Respond with ONLY valid JSON in this exact format:
{
  "name": "Ability Name",
  "description": "1-2 kid-friendly sentences. MUST include the cost (Instead of attacking / Once per game / passive bonus)."
}`

export function buildAbilityUserPrompt(
  creatureType: string,
  characteristics: string[],
  starLevel: number,
  magnitude: number
): string {
  return `Generate an ability for this critter:
- Creature: ${creatureType}
- Characteristics: ${characteristics.join(', ')}
- Star Level: ${starLevel}
- Ability Magnitude: ${magnitude} (out of 5, where 5 is extremely powerful)
- Suggested usage type: ${magnitude <= 2 ? 'Passive (always-on, weak bonus) or Attack Replacement' : magnitude <= 4 ? 'Attack Replacement or Defensive Trade' : 'Once Per Game (powerful enough to warrant it)'}

Create a unique, fun ability that fits this creature's identity. Remember: the description MUST state the cost.`
}

export async function generateAbility(
  creatureType: string,
  characteristics: string[],
  starLevel: number,
  magnitude: number
): Promise<Ability> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const result = await model.generateContent([
    { text: ABILITY_SYSTEM_PROMPT },
    { text: buildAbilityUserPrompt(creatureType, characteristics, starLevel, magnitude) },
  ])

  const text = result.response.text()
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Failed to parse ability from AI response')
  }

  const parsed = JSON.parse(jsonMatch[0])
  return {
    name: parsed.name,
    description: parsed.description,
    magnitude,
  }
}
