import Link from "next/link";

const steps = [
  {
    num: "1",
    title: "Upload a photo",
    desc: "Snap a pic of your critter and let AI identify its species and powers.",
    color: "border-critter-pink",
    bg: "bg-pink-50",
    emoji: "📸",
  },
  {
    num: "2",
    title: "Roll its stats",
    desc: "Toss 3D dice to determine HP, Attack, Defense, and Speed.",
    color: "border-critter-orange",
    bg: "bg-orange-50",
    emoji: "🎲",
  },
  {
    num: "3",
    title: "Print its certificate",
    desc: "Get an official critter card you can hold in your hands.",
    color: "bg-green-50",
    color2: "border-critter-green",
    emoji: "📜",
  },
  {
    num: "4",
    title: "Build a team & duel",
    desc: "Assemble 3 critters, pick a battlefield, and challenge your friends!",
    color: "border-critter-violet",
    bg: "bg-violet-50",
    emoji: "⚔️",
  },
];

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-fuchsia-50 via-amber-50 to-sky-50 bg-dots">
      <main className="mx-auto flex w-full max-w-2xl flex-col items-center gap-14 px-4 py-20 text-center">
        {/* Decorative floating shapes */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="animate-float absolute top-32 left-[10%] h-6 w-6 rounded-full bg-critter-pink/20" />
          <div className="animate-float absolute top-48 right-[15%] h-4 w-4 rounded-full bg-critter-sky/25" style={{ animationDelay: "1s" }} />
          <div className="animate-float absolute top-72 left-[80%] h-5 w-5 rounded-full bg-critter-amber/20" style={{ animationDelay: "2s" }} />
          <div className="animate-float absolute top-96 left-[20%] h-3 w-3 rounded-full bg-critter-green/25" style={{ animationDelay: "0.5s" }} />
          <div className="animate-float absolute top-60 left-[50%] h-4 w-4 rounded-full bg-critter-violet/20" style={{ animationDelay: "1.5s" }} />
        </div>

        {/* Hero */}
        <div className="relative flex flex-col items-center gap-4 animate-fade-up">
          <h1 className="font-display text-5xl font-bold tracking-tight text-rainbow sm:text-6xl">
            Got a critter? Make it real.
          </h1>
          <p className="max-w-md text-lg font-medium text-amber-900/70">
            Snap a photo of your little resin critter figurine, roll its
            stats, print its card -- then duel your friends!
          </p>
        </div>

        {/* Game Loop Steps */}
        <ol className="stagger-children grid w-full max-w-lg gap-4 text-left sm:grid-cols-2">
          {steps.map((s) => (
            <li
              key={s.num}
              className={`rounded-2xl border-2 border-l-4 border-white/80 ${s.color} ${s.bg ?? "bg-green-50"} p-5 shadow-sm transition-transform duration-200 hover:scale-[1.03] hover:shadow-md`}
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="text-2xl">{s.emoji}</span>
                <span className="font-display text-lg font-bold text-gray-800">
                  {s.title}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {s.desc}
              </p>
            </li>
          ))}
        </ol>

        {/* CTAs */}
        <div className="flex flex-col items-center gap-4 sm:flex-row animate-fade-up" style={{ animationDelay: "400ms" }}>
          <Link
            href="/generate"
            className="inline-flex h-14 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-10 text-base font-bold text-white shadow-lg shadow-orange-200 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-orange-300"
          >
            Register Your Critter
          </Link>

          <Link
            href="/maps"
            className="inline-flex h-14 items-center justify-center rounded-full border-2 border-sky-300 bg-white px-10 text-base font-bold text-sky-600 shadow-sm transition-all duration-200 hover:scale-105 hover:border-sky-400 hover:bg-sky-50"
          >
            Pick a Battlefield
          </Link>

          <Link
            href="/rules"
            className="inline-flex h-14 items-center justify-center rounded-full border-2 border-emerald-300 bg-white px-10 text-base font-bold text-emerald-600 shadow-sm transition-all duration-200 hover:scale-105 hover:border-emerald-400 hover:bg-emerald-50"
          >
            Learn the Rules
          </Link>
        </div>
      </main>
    </div>
  );
}
