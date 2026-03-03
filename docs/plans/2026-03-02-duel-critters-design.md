# Duel Critters — Design Document

**Date:** 2026-03-02
**Status:** Approved
**Author:** Chase Skibeness + Claude

## Concept

Duel Critters is a physical-digital hybrid tactics game. Players take real toy critter
figurines (small resin animals), photograph them, and upload the photo to the site. The
system identifies the creature via AI, rolls stats using D&D-style 3D dice, and generates
a printable "Critter Certificate" with official stats and an AI-generated ability.

Players build teams of 3 critters, print battlefield maps, and duel in fast tactical grid
battles. Every critter is unique. High-star critters are raw power. Low-star critters get
wild abilities. Online generation and verification keeps battles fair and playground-proof.

## MVP Scope

- Generate critters online (upload photo, AI identify, 3D dice roll, printable certificate)
- Physical play support (printed certificates, printed maps, rules reference page)
- Map builder (in-browser grid editor)
- No accounts, no digital battles, no social features

---

## Game Rules

### Setup

- 3v3 on an 8x10 grid
- First 2 rows on each side = team base (red/blue)
- Obstacles on the grid block movement AND line of sight
- Both players place 3 critters in their base however they want
- Both roll d6 for initiative — highest chooses to go first or second

### Turn Structure

- Full team turns: activate all 3 critters, then opponent goes
- Each critter can move, attack, AND use ability per turn (unless an ability restricts this)

### Movement

- Move up to SPD grid squares (diagonals count as 1)
- Cannot move through obstacles or other critters

### Combat

- Attack any adjacent enemy (1 grid space, including diagonals)
- Damage = roll 1d6 + ATK, subtract from target HP
- HP reaches 0 = critter defeated = 1 VP

### Line of Sight

- Straight unobstructed line from critter A to critter B
- Obstacles and other critters block LoS

### Abilities

- Usable once per turn by default
- Individual abilities can override (e.g., "once per game", "can't use if you attacked")
- Must be thematic to the creature type

### Scoring

- Defeat a critter = 1 VP
- Enter enemy base with no defenders + spend attack action = 1 VP
- First to 3 VP wins

---

## Critter Generation

### Formulas

| Stat | Formula |
|------|---------|
| Star Level (SL) | 1d6 |
| HP | (SL)d6 + 6 |
| ATK | (1d6 + SL) / 2 |
| Damage | 1d6 + ATK |
| SPD | 1d3 |
| Ability Check | Roll 1d6; if result <= abs(SL - 6), critter gets an ability |
| Ability Magnitude | 6 - SL |

### Generation Flow

1. User uploads a photo of their critter
2. Server sends photo to Gemini vision API to identify creature type and characteristics
3. Client renders 3D physics dice rolls using @3d-dice/dice-box
4. Stats are calculated from the dice results using the formulas above
5. If ability check passes, Gemini generates a thematic ability scaled to the magnitude
6. Server stores critter record (stats, photo, ability) and returns a unique ID
7. Client renders the birth certificate with QR code for verification

---

## AI Ability Generation

### Approach

Open-ended generation with guardrails. The AI is given the full game rules and example
abilities as demonstrations, but is not restricted to a fixed archetype list. It can invent
any ability as long as it passes the constraints.

### Constraints (hard rules for the AI)

1. Must be thematically tied to the creature (turtle = defensive, hawk = mobility, fox = trickery)
2. Must be explainable in 2 kid-friendly sentences
3. Must reference only concepts that exist in the game (grid squares, HP, ATK, SPD, adjacency, LoS, obstacles, bases, turns)
4. Power must respect the magnitude number (6 - SL)
5. Cannot require tracking complex hidden state — kids ages 6-12 are playing on paper

### Kid-Friendly Mechanic Constraints

**Allowed (easy to track):**
- Flat number bonuses/penalties ("+2 damage", "-1 damage taken")
- This-turn-only effects ("this turn, move twice as far")
- Adjacent/nearby critter targeting (visible on the board)
- Straight line movement/targeting on the grid
- Once-per-game effects (binary: used it or haven't)
- Targeting a single critter or "all adjacent"

**Avoided (hard to track for ages 6-12):**
- Multi-turn durations ("for the next 3 turns...") — kids forget
- Stacking effects ("+1 each time X happens" — lose count)
- Conditional triggers on the opponent's turn ("when an enemy moves near you...")
- Hidden information ("secretly choose a target")
- Effects that change base rules ("attacks now work differently")
- Anything requiring extra tokens, counters, or bookkeeping beyond HP dice

### Example Abilities (for few-shot prompting)

| Ability | Critter | Stars | Magnitude | Description |
|---------|---------|-------|-----------|-------------|
| Unbothered | Capybara | 2 | 4 | Critter friends 1 space away take -1 damage |
| Trick | Fox | 1 | 5 | Swap spaces with any critter on the board that Fox can see |
| Big Chomp | Dinosaurns | 2 | 4 | Once per game, you can choose to do 2 attacks this turn |
| Horn Charge | Triceratops | 1 | 5 | Move any spaces in a straight line then attack. Deals bonus damage equal to spaces moved |

---

## Certificate Design

### Two-Part Printable

**Top: Birth Certificate**
- Silly official-looking document: "This certifies that [CRITTER NAME] has been officially
  registered as a Duel Critter on [date]."
- Full-size critter photo
- All stats displayed
- Full ability description
- Critter ID and QR code
- Designed to be fun to keep, pin on a wall, or put in a binder

**Bottom: Cuttable Battle Card**
- Standard playing card size (2.5" x 3.5" / 63.5mm x 88.5mm)
- Compact layout: name, stars, small photo, stats, ability, mini QR code
- Cut line between certificate and card
- Fits in standard card sleeves and deck boxes
- This is the game piece players bring to the battlefield

### HP Pip Dice

HP display shows individual d6 results as pip icons (e.g., HP: 15 with dice showing 5, 4, 3, 3)
so kids know which physical dice to lay out for HP tracking during play.

---

## Map Builder

### MVP Scope

- In-browser 8x10 grid editor
- Click squares to toggle obstacle placement
- First 2 rows on each side pre-marked as bases (red/blue)
- Save → stored in Vercel KV with unique ID
- Shareable URL for each map
- Print → generates a printable PDF of the battlefield

### Terrain Types (MVP)

| Terrain | Effect |
|---------|--------|
| Open | Normal movement |
| Obstacle | Blocks movement AND line of sight |
| Base (red) | Player 1 starting zone / direct attack target |
| Base (blue) | Player 2 starting zone / direct attack target |

### Future Terrain (post-MVP)

Extensible architecture for special squares like stairs, level-up zones, hazards, etc.
Each terrain type will have a name, visual icon, and effect description.

---

## Architecture

### Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Framework | Next.js 15 (App Router) | Fullstack, SSR for verification pages, API routes |
| Styling | Tailwind CSS | Fast, utility-first, print-friendly media queries |
| 3D Dice | @3d-dice/dice-box | MIT, self-contained physics, standard dice notation |
| AI | Gemini API (gemini-2.0-flash) | Free tier, vision + text generation |
| Data Store | Vercel KV | Critter records + map JSON, 256MB free |
| Photo Storage | Vercel Blob | Uploaded critter photos, 250MB free |
| QR Codes | qrcode (npm) | QR generation for certificates |
| Certificate PDF | jspdf + html2canvas | Client-side PDF generation |
| Hosting | Vercel | Zero-config Next.js deployment, free tier |

### Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing page with upload CTA |
| `/generate` | Generation flow: upload, identify, dice roll, certificate |
| `/v/[id]` | Verification page (QR target) |
| `/maps` | Map builder |
| `/maps/[id]` | View/print a specific map |
| `/rules` | Complete rules reference for physical play |

### Data Model

**Critter Record (Vercel KV)**
```json
{
  "id": "DC-7X3K",
  "name": "Triceratops",
  "creatureType": "triceratops",
  "characteristics": ["horned", "sturdy", "four-legged"],
  "starLevel": 1,
  "hp": 8,
  "hpDice": [3, 5],
  "atk": 2,
  "spd": 2,
  "hasAbility": true,
  "ability": {
    "name": "Horn Charge",
    "description": "Move any spaces in a straight line, then attack. Deals bonus damage equal to spaces moved.",
    "magnitude": 5
  },
  "photoUrl": "https://blob.vercel-storage.com/...",
  "createdAt": "2026-03-02T..."
}
```

**Map Record (Vercel KV)**
```json
{
  "id": "MAP-A3X9",
  "name": "Crystal Cavern",
  "grid": [[0,0,0,1,0,0,0,0], ...],
  "createdAt": "2026-03-02T..."
}
```

Where grid values: 0 = open, 1 = obstacle, 2 = base-red, 3 = base-blue.

### Key Design Decisions

1. **Dice rolls are client-side** for the visual experience, but stats are **recorded server-side**
   when certified. Prevents re-rolling for perfect stats.
2. **No accounts** — zero friction. Generate → print → play.
3. **QR verification** provides legitimacy without requiring accounts or login.
4. **AI ability generation is open-ended** with guardrails, not restricted to fixed archetypes.
5. **Certificate is a two-part printable** — birth certificate for fun + cuttable card for play.
