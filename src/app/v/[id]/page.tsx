import { getCritter } from '@/lib/storage'
import { notFound } from 'next/navigation'
import DicePips from '@/components/DicePips'
import ReprintSection from '@/components/ReprintSection'

interface VerifyPageProps {
  params: Promise<{ id: string }>
}

export default async function VerifyPage({ params }: VerifyPageProps) {
  const { id } = await params
  const critter = await getCritter(id)

  if (!critter) {
    notFound()
  }

  const stars = '\u2605'.repeat(critter.starLevel) + '\u2606'.repeat(6 - critter.starLevel)
  const isOutdated = critter.updatedAt && critter.updatedAt !== critter.createdAt

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-emerald-50 to-teal-50 bg-dots py-8 px-4 print:bg-white print:py-0">
      {/* Outdated card warning */}
      {isOutdated && (
        <div className="max-w-md mx-auto mb-4 bg-orange-100 border-2 border-orange-400 rounded-2xl p-4 print:hidden">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">&#9888;</span>
            <span className="font-display font-bold text-orange-800 text-lg">Card Outdated</span>
          </div>
          <p className="text-orange-700 text-sm">
            This critter&apos;s stats have been updated since your card was printed.
            The information below is current &mdash; please reprint your certificate.
          </p>
          <a
            href="#reprint"
            className="inline-block mt-3 px-5 py-2 bg-orange-500 text-white font-bold rounded-xl
                       hover:bg-orange-600 transition-colors text-sm"
          >
            Reprint Certificate
          </a>
        </div>
      )}

      {/* Verify card — hidden when printing */}
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg border-2 border-green-200 p-6 animate-pop print:hidden">
        <div className="text-center mb-4">
          <div className="inline-block rounded-full bg-green-100 px-4 py-1 text-xs uppercase tracking-widest text-green-700 font-bold mb-2">
            Verified Critter
          </div>
          <h1 className="font-display text-3xl font-bold text-gray-900">{critter.name}</h1>
          {critter.nickname && (
            <div className="text-sm text-gray-500 italic">&ldquo;{critter.nickname}&rdquo;</div>
          )}
          <div className="text-xl text-amber-500">{stars}</div>
        </div>

        {critter.photoUrl && (
          <img
            src={critter.photoUrl}
            alt={critter.name}
            className="w-32 h-32 object-contain mx-auto rounded-xl border-2 border-amber-200 mb-4 shadow-sm"
          />
        )}

        <div className="bg-gray-50 rounded-xl p-4 space-y-3 font-mono text-sm">
          <div className="flex items-center gap-2">
            <span className="font-bold text-red-600">HP:</span>
            <span className="font-bold">{critter.hp}</span>
            <DicePips rolls={critter.hpDice} />
          </div>
          <div>
            <span className="font-bold text-orange-600">ATK:</span>
            <span className="font-bold"> +{critter.atk}</span>
            <span className="text-gray-400"> &nbsp; 1d6+{critter.atk}</span>
          </div>
          <div>
            <span className="font-bold text-sky-600">SPD:</span>
            <span className="font-bold"> {critter.spd}</span>
          </div>
        </div>

        {critter.hasAbility && critter.ability && (
          <div className="mt-4 bg-purple-50 rounded-xl border border-purple-200 p-3">
            <div className="font-display font-bold text-purple-700">Ability: {critter.ability.name}</div>
            <div className="text-sm text-purple-600 mt-1">{critter.ability.description}</div>
          </div>
        )}

        <div className="mt-4 text-center text-xs text-gray-400 font-mono">
          ID: {critter.id} | Registered {new Date(critter.createdAt).toLocaleDateString()}
        </div>
      </div>

      {/* Reprint section — outside the card so certificate has full width */}
      <div id="reprint" className="mt-6 max-w-xl mx-auto print:mt-0">
        <ReprintSection critter={critter} />
      </div>
    </div>
  )
}
