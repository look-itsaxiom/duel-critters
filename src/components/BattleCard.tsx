import type { CritterRecord } from '@/lib/types'
import DicePips from './DicePips'

interface BattleCardProps {
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

export default function BattleCard({ critter, qrDataUrl }: BattleCardProps) {
  return (
    <div
      className="border-2 border-gray-800 rounded-xl bg-white overflow-hidden flex flex-col mx-auto"
      style={{ width: '2.5in', height: '3.5in' }}
    >
      {/* Header: name + stars */}
      <div className="bg-amber-600 text-white px-2 py-1 flex items-center justify-between">
        <div className="truncate">
          <span className="font-bold text-sm" style={{ fontFamily: 'var(--font-fredoka), sans-serif' }}>{critter.name}</span>
          {critter.nickname && (
            <span className="text-amber-200 text-[9px] italic ml-1">&ldquo;{critter.nickname}&rdquo;</span>
          )}
        </div>
        <span className="text-yellow-200 text-xs whitespace-nowrap ml-1">
          {starString(critter.starLevel)}
        </span>
      </div>

      {/* Photo */}
      <div className="flex justify-center py-1 px-2">
        <img
          src={critter.photoUrl}
          alt={critter.name}
          className="w-24 h-24 object-cover rounded border border-gray-300"
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-1 px-2 py-1 text-center border-y border-gray-200">
        <div>
          <div className="text-[9px] font-bold text-gray-500 uppercase">HP</div>
          <div className="text-lg font-extrabold text-red-600 leading-tight">{critter.hp}</div>
          <DicePips rolls={critter.hpDice} className="text-[10px] text-gray-400" />
        </div>
        <div>
          <div className="text-[9px] font-bold text-gray-500 uppercase">ATK</div>
          <div className="text-lg font-extrabold text-orange-600 leading-tight">{critter.atk}</div>
          <div className="text-[10px] text-gray-400">{damageFormula(critter.atk)}</div>
        </div>
        <div>
          <div className="text-[9px] font-bold text-gray-500 uppercase">SPD</div>
          <div className="text-lg font-extrabold text-blue-600 leading-tight">{critter.spd}</div>
        </div>
      </div>

      {/* Ability (if present) */}
      {critter.hasAbility && critter.ability && (
        <div className="px-2 py-1 flex-1 min-h-0">
          <div className="text-[9px] font-bold text-purple-600 uppercase">{critter.ability.name}</div>
          <p className="text-[8px] text-gray-600 leading-tight line-clamp-3">
            {critter.ability.description}
          </p>
        </div>
      )}

      {/* Spacer when no ability */}
      {!critter.hasAbility && <div className="flex-1" />}

      {/* Footer: type + QR */}
      <div className="flex items-end justify-between px-2 py-1 mt-auto">
        <div>
          <div className="text-[8px] text-gray-400 font-mono">{critter.id}</div>
          <div className="text-[9px] text-gray-500">{critter.creatureType}</div>
        </div>
        <img
          src={qrDataUrl}
          alt="QR"
          className="w-8 h-8"
        />
      </div>
    </div>
  )
}
