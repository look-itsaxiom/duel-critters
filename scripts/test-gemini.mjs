import { GoogleGenerativeAI } from '@google/generative-ai'
import { readFileSync } from 'fs'
import { readFileSync as readFs, existsSync } from 'fs'
// Load .env manually (no dotenv dependency)
import { fileURLToPath } from 'url'
const envPath = fileURLToPath(new URL('../.env', import.meta.url))
if (existsSync(envPath)) {
  const envFile = readFs(envPath, 'utf8')
  for (const line of envFile.split('\n')) {
    const m = line.match(/^(\w+)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
  }
}
// Also accept key as CLI arg: node test-gemini.mjs YOUR_KEY
if (process.argv[2] && !process.env.GEMINI_API_KEY) {
  process.env.GEMINI_API_KEY = process.argv[2]
}
if (!process.env.GEMINI_API_KEY) {
  console.error('ERROR: Set GEMINI_API_KEY in .env or pass as argument')
  process.exit(1)
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

// Import the actual prompt from the codebase
const ABILITY_SYSTEM_PROMPT = readFileSync(new URL('../src/lib/gemini.ts', import.meta.url), 'utf8')
  .match(/export const ABILITY_SYSTEM_PROMPT = `([\s\S]*?)`/)?.[1]

function buildAbilityUserPrompt(creatureType, characteristics, starLevel, magnitude) {
  return `Generate an ability for this critter:
- Creature: ${creatureType}
- Characteristics: ${characteristics.join(', ')}
- Star Level: ${starLevel}
- Ability Magnitude: ${magnitude} (out of 5, where 5 is extremely powerful)
- Suggested usage type: ${magnitude <= 2 ? 'Passive (always-on, weak bonus) or Attack Replacement' : magnitude <= 4 ? 'Attack Replacement or Defensive Trade' : 'Once Per Game (powerful enough to warrant it)'}

Create a unique, fun ability that fits this creature's identity. Remember: the description MUST state the cost.`
}

// Test cases: variety of creatures with different star levels
const testCases = [
  // GREEN creatures - testing for "Clover" bias
  { type: 'frog', chars: ['green', 'small', 'smooth', 'four-legged'], star: 2, mag: 4 },
  { type: 'lizard', chars: ['green', 'scaly', 'long-tailed', 'small'], star: 3, mag: 3 },
  { type: 'turtle', chars: ['green', 'shelled', 'four-legged', 'slow'], star: 1, mag: 5 },
  // Non-green for comparison
  { type: 'dragon', chars: ['winged', 'horned', 'red', 'fierce'], star: 5, mag: 1 },
  { type: 'rabbit', chars: ['fluffy', 'white', 'long-eared', 'small'], star: 4, mag: 2 },
  { type: 'wolf', chars: ['gray', 'four-legged', 'fanged', 'furry'], star: 3, mag: 3 },
  // Edge cases
  { type: 'spider', chars: ['eight-legged', 'black', 'small', 'translucent'], star: 1, mag: 5 },
  { type: 'cat', chars: ['orange', 'fluffy', 'four-legged', 'small'], star: 6, mag: 0 },
  { type: 'owl', chars: ['brown', 'winged', 'large-eyed', 'feathered'], star: 2, mag: 4 },
  { type: 'shark', chars: ['gray', 'finned', 'sleek', 'large'], star: 4, mag: 2 },
]

// --- Test 1: Name generation ---
console.log('=== NAME GENERATION TEST ===\n')

const IDENTIFY_PROMPT = `You are the registration clerk for Critter Arena, a tabletop tactics game played with small figurines on a grid board.

You are naming a figurine critter. Respond with ONLY valid JSON:
{
  "valid": true,
  "name": "A creative proper name (see naming rules below)",
  "creatureType": "the animal type provided",
  "characteristics": ["the characteristics provided"]
}

NAMING RULES — READ CAREFULLY:
- The name is a PROPER NAME for this individual critter, NOT a description.
- Maximum 12 characters. One or two words only.
- NEVER pick obvious color-based or species-based names. Be surprising and creative!
- BANNED predictable names: Clover, Fern, Ivy (for green), Blaze, Ember, Flame (for red/fire), Shadow, Midnight, Onyx (for dark), Frost, Crystal, Snowflake (for white/ice), Spike, Fang (for spiky things). These are boring.
- Draw from diverse styles: mythological (Korra, Theron, Odin), playful (Wobbles, Biscuit, Gumbo), fierce (Vex, Razak, Grit), cute (Mochi, Pip, Noodle), regal (Duchess, Baron, Czar), mysterious (Hex, Vesper, Riddle), silly (Nugget, Pickle, Kazoo)
- The name should feel like a CHARACTER, not a category. Two identical-looking green frogs should get completely different names.
- Bad: "Sparkly Pink Spider", "Big Fluffy Bear" (descriptions, not names)`

const names = []
for (const tc of testCases) {
  try {
    const result = await model.generateContent([
      { text: IDENTIFY_PROMPT },
      { text: `Name this critter: a ${tc.type} figurine that is ${tc.chars.join(', ')}` },
    ])
    const text = result.response.text()
    const json = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0])
    names.push({ type: tc.type, chars: tc.chars.filter(c => ['green', 'red', 'white', 'gray', 'black', 'orange', 'brown'].includes(c)), name: json.name })
    console.log(`  ${tc.type.padEnd(10)} (${tc.chars[0].padEnd(8)}) → ${json.name}`)
  } catch (e) {
    console.log(`  ${tc.type.padEnd(10)} → ERROR: ${e.message}`)
  }
}

// Check for duplicates
const nameSet = new Set(names.map(n => n.name))
console.log(`\n  Unique names: ${nameSet.size}/${names.length}`)
const greenNames = names.filter(n => n.chars.includes('green'))
console.log(`  Green critter names: ${greenNames.map(n => n.name).join(', ')}`)
console.log(`  All names: ${names.map(n => n.name).join(', ')}`)

// --- Test 2: Ability generation ---
console.log('\n=== ABILITY GENERATION TEST ===\n')
console.log('Testing balance across magnitude levels...\n')

for (const tc of testCases) {
  if (tc.mag === 0) {
    console.log(`  ${tc.type.padEnd(10)} SL${tc.star} mag${tc.mag} → (no ability)`)
    continue
  }
  try {
    const result = await model.generateContent([
      { text: ABILITY_SYSTEM_PROMPT },
      { text: buildAbilityUserPrompt(tc.type, tc.chars, tc.star, tc.mag) },
    ])
    const text = result.response.text()
    const json = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0])
    console.log(`  ${tc.type.padEnd(10)} SL${tc.star} mag${tc.mag} → ${json.name}`)
    console.log(`             ${json.description}`)
    console.log()
  } catch (e) {
    console.log(`  ${tc.type.padEnd(10)} → ERROR: ${e.message}\n`)
  }
}
