import type { CritterRecord } from '@/lib/types'
import DicePips from './DicePips'

interface BirthCertificateProps {
  critter: CritterRecord
  qrDataUrl: string
}

function starString(level: number): string {
  return '\u2605'.repeat(level)
}

function damageFormula(atk: number): string {
  if (atk <= 0) return '0'
  if (atk === 1) return '1d3'
  return `${atk}d3`
}

export default function BirthCertificate({ critter, qrDataUrl }: BirthCertificateProps) {
  const registrationDate = new Date(critter.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="border-4 border-double border-amber-700 rounded-lg p-6 bg-amber-50 max-w-lg mx-auto">
      {/* Title */}
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold tracking-wide text-amber-900 uppercase">
          Official Critter Certificate
        </h1>
        <div className="text-amber-600 text-sm tracking-widest">
          Duel Critters Registry
        </div>
        <div className="mt-1 border-b-2 border-amber-300" />
      </div>

      {/* Certification line */}
      <p className="text-center text-gray-700 mb-3 text-sm italic">
        This certifies that
      </p>
      <h2 className="text-center text-3xl font-extrabold text-amber-800 mb-1">
        {critter.name}
      </h2>
      <p className="text-center text-xl text-amber-500 mb-4">
        {starString(critter.starLevel)}
      </p>

      {/* Critter photo */}
      <div className="flex justify-center mb-4">
        <img
          src={critter.photoUrl}
          alt={critter.name}
          className="w-40 h-40 object-cover rounded-lg border-2 border-amber-300 shadow-md"
        />
      </div>

      {/* Creature type and characteristics */}
      <div className="text-center mb-4">
        <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
          {critter.creatureType}
        </span>
        {critter.characteristics.length > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            {critter.characteristics.join(' \u00B7 ')}
          </p>
        )}
      </div>

      {/* Registration date */}
      <p className="text-center text-xs text-gray-500 mb-4">
        Registered on {registrationDate}
      </p>

      {/* Stats block */}
      <div className="bg-white rounded-lg border border-amber-200 p-4 mb-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 text-center">
          Official Stats
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase">HP</div>
            <div className="text-2xl font-extrabold text-red-600">{critter.hp}</div>
            <DicePips rolls={critter.hpDice} className="text-sm text-gray-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase">ATK</div>
            <div className="text-2xl font-extrabold text-orange-600">{critter.atk}</div>
            <div className="text-sm text-gray-400">{damageFormula(critter.atk)}</div>
          </div>
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase">SPD</div>
            <div className="text-2xl font-extrabold text-blue-600">{critter.spd}</div>
          </div>
        </div>
      </div>

      {/* Ability section */}
      {critter.hasAbility && critter.ability && (
        <div className="bg-purple-50 rounded-lg border border-purple-200 p-3 mb-4">
          <h3 className="text-xs font-bold text-purple-500 uppercase tracking-wide mb-1">
            Special Ability
          </h3>
          <div className="font-bold text-purple-800">{critter.ability.name}</div>
          <p className="text-sm text-purple-700 mt-1">{critter.ability.description}</p>
          <div className="text-xs text-purple-400 mt-1">
            Magnitude: {critter.ability.magnitude}
          </div>
        </div>
      )}

      {/* Footer: ID + QR */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-amber-200">
        <div className="text-xs text-gray-400 font-mono">
          ID: {critter.id}
        </div>
        <img
          src={qrDataUrl}
          alt="QR code"
          className="w-16 h-16"
        />
      </div>
    </div>
  )
}
