import { getCritter } from '@/lib/storage'
import { notFound } from 'next/navigation'
import DicePips from '@/components/DicePips'

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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
        <div className="text-center mb-4">
          <div className="text-xs uppercase tracking-widest text-green-600 font-bold">
            Verified Critter
          </div>
          <h1 className="text-2xl font-bold mt-1">{critter.name}</h1>
          <div className="text-xl text-amber-500">{stars}</div>
        </div>

        {critter.photoUrl && (
          <img
            src={critter.photoUrl}
            alt={critter.name}
            className="w-32 h-32 object-contain mx-auto rounded-lg border mb-4"
          />
        )}

        <div className="space-y-2 font-mono text-sm">
          <div className="flex items-center gap-2">
            <span className="font-bold">HP:</span> {critter.hp}
            <DicePips rolls={critter.hpDice} />
          </div>
          <div>
            <span className="font-bold">ATK:</span> +{critter.atk} &nbsp; 1d6+{critter.atk}
          </div>
          <div>
            <span className="font-bold">SPD:</span> {critter.spd}
          </div>
        </div>

        {critter.hasAbility && critter.ability && (
          <div className="mt-4 border-t pt-3">
            <div className="font-bold">Ability: {critter.ability.name}</div>
            <div className="text-sm text-gray-700">{critter.ability.description}</div>
          </div>
        )}

        <div className="mt-4 text-center text-xs text-gray-400">
          ID: {critter.id} | Registered {new Date(critter.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}
