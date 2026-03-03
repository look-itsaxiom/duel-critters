import Link from 'next/link'
import { MAPS } from '@/lib/maps'
import MapThumbnail from '@/components/MapThumbnail'
import DownloadAllMaps from '@/components/DownloadAllMaps'

function obstacleCount(grid: number[][]): number {
  return grid.flat().filter(c => c === 1).length
}

function hasSpecialTerrain(grid: number[][]): boolean {
  return grid.flat().some(c => c === 4 || c === 5)
}

export default function MapsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-teal-50 to-cyan-50 bg-dots">
      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-up">
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-emerald-900 tracking-tight">
            Battlefields
          </h1>
          <p className="mt-2 text-emerald-700/70 font-medium text-base sm:text-lg max-w-md mx-auto">
            Pick a battlefield, print it out, and duel! Some maps have special rules that
            change how the game plays.
          </p>
          <div className="mt-4">
            <DownloadAllMaps />
          </div>
        </div>

        {/* Map gallery */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {MAPS.map((map) => {
            const obstacles = obstacleCount(map.grid)
            const hasTerrain = hasSpecialTerrain(map.grid)
            const hasRules = map.rules && map.rules.length > 0

            return (
              <Link
                key={map.id}
                href={`/maps/${map.id}`}
                className="group block rounded-2xl bg-white border-2 border-emerald-200
                           p-4 shadow-sm transition-all duration-200
                           hover:scale-[1.03] hover:shadow-lg hover:border-emerald-400
                           active:scale-[0.98]"
              >
                {/* Thumbnail */}
                <div className="flex justify-center mb-3">
                  <MapThumbnail grid={map.grid} />
                </div>

                {/* Map name */}
                <h2 className="font-display font-bold text-lg text-gray-900 group-hover:text-emerald-700 transition-colors">
                  {map.name}
                </h2>

                {/* Stats line */}
                <div className="text-xs text-gray-400 font-medium mt-0.5">
                  {obstacles === 0 ? 'No obstacles' : `${obstacles} obstacle${obstacles > 1 ? 's' : ''}`}
                </div>

                {/* Rule badges */}
                {(hasRules || hasTerrain) && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {map.rules?.map((rule) => {
                      // Pick badge color by rule type
                      const isLava = rule.name.toLowerCase().includes('lava')
                      const isWater = rule.name.toLowerCase().includes('water')
                      const isDeath = rule.name.toLowerCase().includes('sudden')
                      const badgeColor = isLava
                        ? 'bg-orange-100 text-orange-700 border-orange-200'
                        : isWater
                        ? 'bg-cyan-100 text-cyan-700 border-cyan-200'
                        : isDeath
                        ? 'bg-red-100 text-red-700 border-red-200'
                        : 'bg-violet-100 text-violet-700 border-violet-200'

                      return (
                        <span
                          key={rule.name}
                          className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badgeColor}`}
                        >
                          {rule.name}
                        </span>
                      )
                    })}
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
