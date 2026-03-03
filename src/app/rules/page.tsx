'use client'

function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-green-200 transition-all duration-200 hover:scale-105 hover:shadow-lg print:hidden"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-4 w-4"
      >
        <path
          fillRule="evenodd"
          d="M5 2.75C5 1.784 5.784 1 6.75 1h6.5c.966 0 1.75.784 1.75 1.75v3.552c.377.046.752.097 1.126.153A2.212 2.212 0 0118 8.653v4.097A2.25 2.25 0 0115.75 15h-.25v.75c0 .966-.784 1.75-1.75 1.75h-7.5A1.75 1.75 0 014.5 15.75V15h-.25A2.25 2.25 0 012 12.75V8.653c0-1.082.775-2.034 1.874-2.198.374-.056.75-.107 1.126-.153V2.75zm1.5 0v3.362a40 40 0 017 0V2.75a.25.25 0 00-.25-.25h-6.5a.25.25 0 00-.25.25zm-1 7.5v5.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-5.5a.25.25 0 00-.25-.25h-7.5a.25.25 0 00-.25.25z"
          clipRule="evenodd"
        />
      </svg>
      Print Rules
    </button>
  )
}

function BackLink() {
  return (
    <a
      href="/"
      className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 transition-colors hover:text-emerald-800 print:hidden"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-4 w-4"
      >
        <path
          fillRule="evenodd"
          d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
          clipRule="evenodd"
        />
      </svg>
      Back to Home
    </a>
  )
}

function SectionCard({
  icon,
  title,
  color,
  children,
}: {
  icon: string
  title: string
  color: string
  children: React.ReactNode
}) {
  return (
    <section className={`rounded-2xl border-2 ${color} bg-white p-6 shadow-sm transition-transform duration-200 hover:shadow-md print:border-gray-300 print:shadow-none print:break-inside-avoid`}>
      <h2 className="font-display mb-3 flex items-center gap-2 text-xl font-bold text-gray-900">
        <span className="text-2xl" role="img" aria-hidden="true">
          {icon}
        </span>
        {title}
      </h2>
      {children}
    </section>
  )
}

function RuleList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5 text-gray-700">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="mt-1.5 block h-2 w-2 flex-shrink-0 rounded-full bg-emerald-400" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export default function RulesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-green-50 to-teal-50 bg-dots print:bg-white">
      {/* Header */}
      <header className="border-b-2 border-emerald-200 bg-white/80 backdrop-blur print:border-b-2 print:border-gray-900">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
          <div className="flex items-center justify-between">
            <BackLink />
            <PrintButton />
          </div>
          <div className="mt-4">
            <h1 className="font-display text-4xl font-bold tracking-tight text-emerald-800 sm:text-5xl">
              Duel Critters Rules
            </h1>
            <p className="mt-2 text-lg text-emerald-600/70 font-medium print:text-gray-700">
              The official rulebook -- your creatures, your battlefield, your strategy!
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 print:py-4">
        {/* Quick Reference Card */}
        <div className="mb-8 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-6 shadow-sm print:border-emerald-400 print:bg-white print:break-inside-avoid">
          <h2 className="font-display mb-3 text-lg font-bold text-emerald-900">
            Quick Reference
          </h2>
          <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div>
              <p className="font-bold text-emerald-800">Goal</p>
              <p className="text-emerald-700">First to 3 Victory Points wins!</p>
            </div>
            <div>
              <p className="font-bold text-emerald-800">Team Size</p>
              <p className="text-emerald-700">3 critters per player on an 8x10 grid</p>
            </div>
            <div>
              <p className="font-bold text-emerald-800">Turn Actions</p>
              <p className="text-emerald-700">Each critter can Move + Attack + Use Ability</p>
            </div>
            <div>
              <p className="font-bold text-emerald-800">Scoring</p>
              <p className="text-emerald-700">
                Defeat a critter = 1 VP | Raid enemy base = 1 VP
              </p>
            </div>
          </div>
        </div>

        {/* Rules Sections */}
        <div className="stagger-children space-y-6">
          {/* Setup */}
          <SectionCard icon="🎲" title="Setup" color="border-amber-200">
            <RuleList
              items={[
                'Each player picks a team of 3 critters.',
                'The battlefield is an 8-wide by 10-tall grid.',
                'The first 2 rows on each side are that team\'s base (colored red or blue).',
                'Obstacles are placed on the grid -- they block movement AND line of sight.',
                'Both players place their 3 critters anywhere inside their own base.',
                'Both players roll a 6-sided die (d6) for initiative. Highest roll chooses to go first or second. Re-roll ties!',
              ]}
            />
          </SectionCard>

          {/* Turn Structure */}
          <SectionCard icon="🔄" title="Turn Structure" color="border-sky-200">
            <RuleList
              items={[
                'Players take full team turns: you activate ALL 3 of your critters, then your opponent takes their turn.',
                'Each critter can move, attack, AND use an ability on its turn (unless an ability says otherwise).',
                'You can activate your critters in any order you want.',
              ]}
            />
          </SectionCard>

          {/* Movement */}
          <SectionCard icon="🏃" title="Movement" color="border-green-200">
            <RuleList
              items={[
                'A critter can move up to its SPD (speed) stat in grid squares.',
                'Moving diagonally counts as 1 square -- same as moving straight.',
                'You cannot move through obstacles.',
                'You cannot move through other critters (friendly or enemy).',
                'You do not have to use all of your movement.',
              ]}
            />
          </SectionCard>

          {/* Combat */}
          <SectionCard icon="⚔️" title="Combat" color="border-red-200">
            <RuleList
              items={[
                'A critter can attack any enemy that is adjacent (1 square away, including diagonals).',
                'To deal damage: roll 1d6 + your critter\'s ATK stat.',
                'Subtract the damage from the target\'s HP.',
                'When a critter\'s HP reaches 0, it is defeated!',
                'Defeating a critter earns you 1 Victory Point.',
              ]}
            />
            <div className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 border border-amber-200 print:border print:border-amber-300">
              <span className="font-bold">Example:</span> Your critter has
              3 ATK. You roll a 4 on the d6. That is 4 + 3 = 7 damage to the
              enemy critter!
            </div>
          </SectionCard>

          {/* Line of Sight */}
          <SectionCard icon="👁️" title="Line of Sight" color="border-violet-200">
            <RuleList
              items={[
                'Line of sight (LoS) is a straight, unobstructed line between two critters.',
                'Obstacles block line of sight.',
                'Other critters (friendly or enemy) also block line of sight.',
                'Some abilities require line of sight to a target -- if something is in the way, you can\'t use the ability on that target.',
              ]}
            />
          </SectionCard>

          {/* Abilities */}
          <SectionCard icon="✨" title="Abilities" color="border-purple-200">
            <RuleList
              items={[
                'Each critter has a unique ability.',
                'By default, a critter can use its ability once per turn.',
                'Some abilities have special rules, like "once per game" or "can\'t use if you attacked this turn."',
                'Always read the ability card carefully -- it will tell you exactly when and how you can use it.',
              ]}
            />
          </SectionCard>

          {/* Scoring & Winning */}
          <SectionCard icon="🏆" title="Scoring & Winning" color="border-amber-200">
            <div className="space-y-3">
              <p className="font-medium text-gray-800">
                There are two ways to earn Victory Points (VP):
              </p>
              <div className="space-y-2">
                <div className="flex items-start gap-3 rounded-xl bg-green-50 px-4 py-3 border border-green-200 print:border print:border-green-300">
                  <span className="font-display text-lg font-bold text-green-600">1 VP</span>
                  <p className="text-sm text-green-800">
                    <span className="font-bold">Defeat a critter.</span>{' '}
                    Knock an enemy critter down to 0 HP.
                  </p>
                </div>
                <div className="flex items-start gap-3 rounded-xl bg-green-50 px-4 py-3 border border-green-200 print:border print:border-green-300">
                  <span className="font-display text-lg font-bold text-green-600">1 VP</span>
                  <p className="text-sm text-green-800">
                    <span className="font-bold">Raid the enemy base.</span>{' '}
                    Move into the enemy base when no defenders are inside, then spend your attack action to score.
                  </p>
                </div>
              </div>
              <p className="font-display mt-2 text-center text-lg font-bold text-emerald-600 print:text-gray-900">
                First player to reach 3 Victory Points wins the game!
              </p>
            </div>
          </SectionCard>
        </div>

        {/* Footer */}
        <div className="mt-10 border-t-2 border-emerald-200 pt-6 text-center print:mt-6 print:pt-4">
          <p className="text-sm text-emerald-400 font-medium print:text-gray-600">
            Duel Critters -- Have fun, play fair, and may the best critters win!
          </p>
        </div>
      </main>
    </div>
  )
}
