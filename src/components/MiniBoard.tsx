import { useMemo } from 'react'
import { GRID_ROWS, GRID_COLS, BASE_ROWS } from '@/lib/constants'

export interface MiniBoardCritter {
  row: number
  col: number
  team: 'blue' | 'red'
  label: string
  hp?: number
  atk?: number
  spd?: number
}

export interface CellHighlight {
  row: number
  col: number
  type: 'move' | 'attack' | 'los-clear' | 'los-blocked' | 'path' | 'base-highlight'
}

export interface MiniBoardProps {
  rows?: number
  cols?: number
  obstacles?: [number, number][]
  critters?: MiniBoardCritter[]
  highlights?: CellHighlight[]
  cellSize?: number
  className?: string
}

function highlightClass(type: CellHighlight['type']): string {
  switch (type) {
    case 'move':
      return 'bg-green-300/40'
    case 'attack':
      return 'bg-red-300/40 border-2 border-red-400/60'
    case 'los-clear':
      return 'bg-emerald-300/40 border border-dashed border-emerald-500/60'
    case 'los-blocked':
      return 'bg-red-200/50 border-2 border-dashed border-red-500/60'
    case 'path':
      return 'bg-amber-300/50'
    case 'base-highlight':
      return 'bg-yellow-300/40 animate-pulse'
    default:
      return ''
  }
}

function CritterToken({ critter, cellSize }: { critter: MiniBoardCritter; cellSize: number }) {
  const size = Math.round(cellSize * 0.78)
  const offset = Math.round((cellSize - size) / 2)

  return (
    <div
      className={`absolute flex items-center justify-center rounded-full font-display font-bold shadow-sm ${
        critter.team === 'blue'
          ? 'bg-sky-500 text-white'
          : 'bg-red-500 text-white'
      }`}
      style={{
        width: size,
        height: size,
        top: offset,
        left: offset,
        fontSize: size * 0.52,
        lineHeight: 1,
      }}
      title={[
        critter.label,
        critter.hp != null && `HP: ${critter.hp}`,
        critter.atk != null && `ATK: ${critter.atk}`,
        critter.spd != null && `SPD: ${critter.spd}`,
      ]
        .filter(Boolean)
        .join(' | ')}
    >
      {critter.label}
    </div>
  )
}

export default function MiniBoard({
  rows = GRID_ROWS,
  cols = GRID_COLS,
  obstacles = [],
  critters = [],
  highlights = [],
  cellSize = 32,
  className,
}: MiniBoardProps) {
  const obstacleSet = useMemo(() => {
    const set = new Set<string>()
    obstacles.forEach(([r, c]) => set.add(`${r},${c}`))
    return set
  }, [obstacles])

  const critterMap = useMemo(() => {
    const map = new Map<string, MiniBoardCritter>()
    critters.forEach((c) => map.set(`${c.row},${c.col}`, c))
    return map
  }, [critters])

  const highlightMap = useMemo(() => {
    const map = new Map<string, CellHighlight>()
    highlights.forEach((h) => map.set(`${h.row},${h.col}`, h))
    return map
  }, [highlights])

  return (
    <div className={className}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
          border: '2px solid #374151',
          borderRadius: '0.5rem',
          overflow: 'hidden',
        }}
      >
        {Array.from({ length: rows }, (_, row) =>
          Array.from({ length: cols }, (_, col) => {
            const key = `${row},${col}`
            const isObstacle = obstacleSet.has(key)
            const critter = critterMap.get(key)
            const highlight = highlightMap.get(key)
            const isBlueBase = row < BASE_ROWS
            const isRedBase = row >= rows - BASE_ROWS

            return (
              <div
                key={key}
                className="relative"
                style={{
                  width: cellSize,
                  height: cellSize,
                  borderRight: col < cols - 1 ? '1px solid #e5e7eb' : undefined,
                  borderBottom: row < rows - 1 ? '1px solid #e5e7eb' : undefined,
                }}
              >
                {/* Cell background */}
                <div
                  className={`absolute inset-0 ${
                    isObstacle
                      ? 'bg-gray-600'
                      : isBlueBase
                      ? 'bg-sky-100'
                      : isRedBase
                      ? 'bg-red-100'
                      : 'bg-white'
                  }`}
                />

                {/* Highlight overlay */}
                {highlight && (
                  <div
                    className={`absolute inset-0 ${highlightClass(highlight.type)}`}
                  />
                )}

                {/* Critter token */}
                {critter && (
                  <CritterToken critter={critter} cellSize={cellSize} />
                )}
              </div>
            )
          }),
        )}
      </div>
    </div>
  )
}
