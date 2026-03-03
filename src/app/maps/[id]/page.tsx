import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getMapById, TERRAIN_COLORS, TERRAIN_LABELS } from '@/lib/maps'
import PrintButton from '@/components/PrintButton'

interface MapDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function MapDetailPage({ params }: MapDetailPageProps) {
  const { id } = await params
  const map = getMapById(id)

  if (!map) {
    notFound()
  }

  // Determine which terrain types are present for the legend
  const terrainPresent = new Set(map.grid.flat())
  const legendEntries = [0, 1, 2, 3, 4, 5].filter(t => terrainPresent.has(t))

  const obstacleCount = map.grid.flat().filter(c => c === 1).length

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-teal-50 to-cyan-50 bg-dots py-8 px-4 print:bg-white print:py-2">
      <div className="mx-auto max-w-xl">
        {/* Back link */}
        <Link
          href="/maps"
          className="inline-flex items-center gap-1 text-sm font-bold text-emerald-600 hover:text-emerald-800 transition-colors mb-4 print:hidden"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
          </svg>
          All Battlefields
        </Link>

        {/* Map card */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-emerald-200 p-5 sm:p-6 animate-pop">
          {/* Title */}
          <div className="text-center mb-4">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-gray-900">
              {map.name}
            </h1>
            <div className="text-sm text-gray-400 font-medium mt-1">
              {obstacleCount === 0 ? 'No obstacles' : `${obstacleCount} obstacle${obstacleCount > 1 ? 's' : ''}`}
              {map.rules && map.rules.length > 0 && (
                <span> &middot; {map.rules.length} special rule{map.rules.length > 1 ? 's' : ''}</span>
              )}
            </div>
          </div>

          {/* Grid — responsive cell sizing */}
          <div className="flex justify-center mb-4">
            <div className="inline-block border-2 border-gray-800 rounded-lg overflow-hidden">
              {map.grid.map((row, rowIdx) => (
                <div key={rowIdx} className="flex">
                  {row.map((cell, colIdx) => (
                    <div
                      key={colIdx}
                      className={`w-8 h-8 sm:w-10 sm:h-10 border border-gray-300/60 ${TERRAIN_COLORS[cell] ?? 'bg-white'}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-3 text-xs font-medium text-gray-500 mb-4">
            {legendEntries.map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <span className={`w-4 h-4 rounded-sm border border-gray-300 inline-block ${TERRAIN_COLORS[t]}`} />
                {TERRAIN_LABELS[t]}
              </span>
            ))}
          </div>

          {/* Rules section */}
          {map.rules && map.rules.length > 0 && (
            <div className="space-y-2 mb-4">
              <h2 className="font-display font-bold text-sm uppercase tracking-wide text-gray-400 text-center">
                Special Rules
              </h2>
              {map.rules.map((rule) => {
                const isLava = rule.name.toLowerCase().includes('lava')
                const isWater = rule.name.toLowerCase().includes('water')
                const isDeath = rule.name.toLowerCase().includes('sudden')
                const accent = isLava
                  ? 'border-orange-300 bg-orange-50'
                  : isWater
                  ? 'border-cyan-300 bg-cyan-50'
                  : isDeath
                  ? 'border-red-300 bg-red-50'
                  : 'border-violet-300 bg-violet-50'
                const titleColor = isLava
                  ? 'text-orange-700'
                  : isWater
                  ? 'text-cyan-700'
                  : isDeath
                  ? 'text-red-700'
                  : 'text-violet-700'

                return (
                  <div
                    key={rule.name}
                    className={`rounded-xl border-2 ${accent} p-3`}
                  >
                    <div className={`font-display font-bold ${titleColor}`}>
                      {rule.name}
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {rule.description}
                    </p>
                  </div>
                )
              })}
            </div>
          )}

          {/* Print button */}
          <div className="flex justify-center">
            <PrintButton />
          </div>
        </div>
      </div>
    </div>
  )
}
