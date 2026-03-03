import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center bg-zinc-50 px-4 font-sans dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col items-center gap-12 py-20 text-center">
        {/* Hero */}
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
            Got a critter? Make it real.
          </h1>
          <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
            Turn your favorite pet, plushie, or imaginary beast into a
            battle-ready critter card -- then duel your friends!
          </p>
        </div>

        {/* Game Loop Steps */}
        <ol className="grid w-full max-w-lg gap-4 text-left sm:grid-cols-2">
          <li className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <span className="mb-1 block text-2xl">1.</span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-50">
              Upload a photo
            </span>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Snap a pic of your critter and let AI identify its species and
              powers.
            </p>
          </li>
          <li className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <span className="mb-1 block text-2xl">2.</span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-50">
              Roll its stats
            </span>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Toss 3D dice to determine HP, Attack, Defense, and Speed.
            </p>
          </li>
          <li className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <span className="mb-1 block text-2xl">3.</span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-50">
              Print its certificate
            </span>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Get an official critter card you can hold in your hands.
            </p>
          </li>
          <li className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <span className="mb-1 block text-2xl">4.</span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-50">
              Build a team &amp; duel
            </span>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Assemble 3 critters, pick a battlefield, and challenge your
              friends!
            </p>
          </li>
        </ol>

        {/* CTAs */}
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/generate"
            className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-8 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Register Your Critter
          </Link>

          <Link
            href="/maps"
            className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-300 px-8 text-sm font-semibold text-zinc-700 transition-colors hover:border-zinc-400 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
          >
            Build a Battlefield
          </Link>

          <Link
            href="/rules"
            className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-300 px-8 text-sm font-semibold text-zinc-700 transition-colors hover:border-zinc-400 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
          >
            Learn the Rules
          </Link>
        </div>
      </main>
    </div>
  );
}
