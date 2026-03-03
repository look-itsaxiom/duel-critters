import { TERRAIN_COLORS } from '@/lib/maps'

interface MapThumbnailProps {
  grid: number[][]
}

export default function MapThumbnail({ grid }: MapThumbnailProps) {
  return (
    <div className="inline-block rounded-lg overflow-hidden border-2 border-gray-300 shadow-sm">
      {grid.map((row, rowIdx) => (
        <div key={rowIdx} className="flex">
          {row.map((cell, colIdx) => (
            <div
              key={colIdx}
              className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${TERRAIN_COLORS[cell] ?? 'bg-white'} border-[0.5px] border-gray-200/50`}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
