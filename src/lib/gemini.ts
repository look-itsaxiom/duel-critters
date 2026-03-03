import { GoogleGenerativeAI } from '@google/generative-ai'
import type { CreatureIdentification, Ability } from './types'

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
      text: `You are looking at a small resin or plastic critter figurine.

Identify what creature this is and respond with ONLY valid JSON in this exact format:
{
  "name": "A short unique proper name, 1-2 words max (e.g., 'Blitz', 'Fangsworth', 'Clover', 'Spike', 'Nimbus')",
  "creatureType": "the animal type in lowercase (e.g., 'triceratops', 'chicken', 'capybara')",
  "characteristics": ["3-5 physical traits like 'horned', 'winged', 'four-legged', 'translucent', 'small']
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
  return JSON.parse(jsonMatch[0]) as CreatureIdentification
}

// --- Ability Generation ---

const ABILITY_SYSTEM_PROMPT = `You are a game designer for Duel Critters, a tactical grid battle game for kids ages 6-12.

GAME RULES:
- 3v3 on an 8x10 grid. First 2 rows on each side are team bases.
- Each turn, each critter can: move (up to SPD squares, diagonals OK), attack (adjacent enemy, damage = 1d6 + ATK), and use ability.
- Obstacles block movement AND line of sight (straight unobstructed line).
- Defeat a critter = 1 VP. Enter empty enemy base + spend attack action = 1 VP. First to 3 VP wins.

ABILITY DESIGN RULES:
You are generating an ability for a critter. The ability MUST:
1. Be thematically tied to the creature (a turtle gets defensive, a hawk gets mobility, a fox gets trickery)
2. Be explainable in 2 kid-friendly sentences MAX
3. Only reference game concepts: grid squares, HP, ATK, SPD, adjacency, line of sight, obstacles, bases, turns
4. Respect the magnitude number (higher = more powerful)
5. Be trackable by kids on a physical board with no extra tokens

ALLOWED MECHANICS (easy for kids to track):
- Flat number bonuses/penalties ("+2 damage", "-1 damage taken")
- This-turn-only effects
- Adjacent/nearby critter targeting
- Straight line movement/targeting
- Once-per-game effects
- Single target or "all adjacent"

FORBIDDEN MECHANICS (too hard for kids):
- Multi-turn durations
- Stacking/counting effects
- Triggers on opponent's turn
- Hidden information
- Rule-changing effects
- Extra tokens or bookkeeping

EXAMPLE ABILITIES:
- Unbothered (Capybara, magnitude 4): "Critter friends 1 space away take -1 damage."
- Trick (Fox, magnitude 5): "Swap spaces with any critter on the board that this critter can see."
- Big Chomp (Dinosaurns, magnitude 4): "Once per game, you can choose to do 2 attacks this turn."
- Horn Charge (Triceratops, magnitude 5): "Move any spaces in a straight line then attack. Deals bonus damage equal to spaces moved."

Respond with ONLY valid JSON in this exact format:
{
  "name": "Ability Name",
  "description": "1-2 kid-friendly sentences describing what the ability does."
}`

export async function generateAbility(
  creatureType: string,
  characteristics: string[],
  starLevel: number,
  magnitude: number
): Promise<Ability> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const result = await model.generateContent([
    { text: ABILITY_SYSTEM_PROMPT },
    {
      text: `Generate an ability for this critter:
- Creature: ${creatureType}
- Characteristics: ${characteristics.join(', ')}
- Star Level: ${starLevel}
- Ability Magnitude: ${magnitude} (out of 5, where 5 is extremely powerful)

Create a unique, fun ability that fits this creature's identity.`,
    },
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
