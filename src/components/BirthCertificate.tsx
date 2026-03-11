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
  if (atk <= 0) return '1d6'
  return `1d6+${atk}`
}

export default function BirthCertificate({ critter, qrDataUrl }: BirthCertificateProps) {
  const registrationDate = new Date(critter.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="birth-cert border-4 border-double border-amber-700 rounded-2xl p-6 bg-amber-50 max-w-lg mx-auto print:p-2 print:max-w-md">
      {/* Title */}
      <div className="text-center mb-4 print:mb-1">
        <h1 className="font-display text-2xl font-bold tracking-wide text-amber-900 uppercase print:text-sm">
          Official Critter Certificate
        </h1>
        <div className="text-amber-600 text-sm tracking-widest font-medium">
          Critter Arena Registry
        </div>
        <div className="mt-1 border-b-2 border-amber-300" />
      </div>

      {/* Critter name + stars */}
      <h2 className="font-display text-center text-3xl font-bold text-amber-800 mb-1 print:text-lg">
        {critter.nickname || critter.name}
      </h2>
      <p className="text-center text-gray-600 mb-1 text-sm italic print:text-xs">
        {critter.nickname
          ? `${critter.starLevel}-Star ${critter.creatureType} \u2014 \u201C${critter.name}\u201D`
          : `${critter.starLevel}-Star ${critter.creatureType}`
        }
      </p>
      <p className="text-center text-xl text-amber-500 mb-4 print:mb-1 print:text-base">
        {starString(critter.starLevel)}
      </p>

      {/* Critter photo */}
      <div className="flex justify-center mb-4 print:mb-0.5">
        <img
          src={critter.photoUrl}
          alt={critter.name}
          className="critter-photo w-40 h-40 object-cover rounded-lg border-2 border-amber-300 shadow-md print:w-16 print:h-16"
        />
      </div>

      {/* Creature type and characteristics */}
      <div className="text-center mb-4 print:mb-0.5">
        <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide print:text-xs">
          {critter.creatureType}
        </span>
        {critter.characteristics.length > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            {critter.characteristics.join(' \u00B7 ')}
          </p>
        )}
      </div>

      {/* Registration date */}
      <p className="text-center text-xs text-gray-500 mb-4 print:mb-0.5">
        Registered on {registrationDate}
      </p>

      {/* Stats block */}
      <div className="bg-white rounded-lg border border-amber-200 p-4 mb-4 print:p-1 print:mb-1">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 text-center print:mb-1">
          Official Stats
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center print:gap-2">
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase">HP</div>
            <div className="text-2xl font-extrabold text-red-600 print:text-xl">{critter.hp}</div>
            <DicePips rolls={critter.hpDice} className="text-sm text-gray-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase">ATK</div>
            <div className="text-2xl font-extrabold text-orange-600 print:text-xl">{critter.atk}</div>
            <div className="text-sm text-gray-400">{damageFormula(critter.atk)}</div>
          </div>
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase">SPD</div>
            <div className="text-2xl font-extrabold text-blue-600 print:text-xl">{critter.spd}</div>
          </div>
        </div>
      </div>

      {/* Ability section */}
      {critter.hasAbility && critter.ability && (
        <div className="bg-purple-50 rounded-lg border border-purple-200 p-3 mb-4 print:p-1 print:mb-1">
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
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-amber-200 print:mt-1 print:pt-1">
        <div className="text-xs text-gray-400 font-mono">
          ID: {critter.id}
        </div>
        <img
          src={qrDataUrl}
          alt="QR code"
          className="w-16 h-16 print:w-10 print:h-10"
        />
      </div>
    </div>
  )
}
