import { getMap } from '@/lib/storage'
import { notFound } from 'next/navigation'
import { GRID_ROWS, BASE_ROWS } from '@/lib/constants'
import PrintButton from '@/components/PrintButton'

interface MapViewPageProps {
  params: Promise<{ id: string }>
}

const TERRAIN_COLORS: Record<number, string> = {
  0: 'bg-white',
  1: 'bg-gray-700',
  2: 'bg-red-200',
  3: 'bg-blue-200',
}

function terrainLabel(value: number): string {
  switch (value) {
    case 0: return 'Open'
    case 1: return 'Obstacle'
    case 2: return 'Red Base'
    case 3: return 'Blue Base'
    default: return 'Unknown'
  }
}

export default async function MapViewPage({ params }: MapViewPageProps) {
  const { id } = await params
  const map = await getMap(id)

  if (!map) {
    notFound()
  }

  const obstacleCount = map.grid
    .flat()
    .filter(cell => cell === 1).length

  const openCount = map.grid
    .slice(BASE_ROWS, GRID_ROWS - BASE_ROWS)
    .flat()
    .filter(cell => cell === 0).length

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold">{map.name}</h1>
            <div className="text-sm text-gray-500">
              {obstacleCount} obstacles &middot; {openCount} open spaces
            </div>
          </div>

          <div className="inline-block border-2 border-gray-800 mx-auto">
            {map.grid.map((row, rowIdx) => (
              <div key={rowIdx} className="flex">
                {row.map((cell, colIdx) => (
                  <div
                    key={colIdx}
                    className={`w-10 h-10 border border-gray-300 ${TERRAIN_COLORS[cell]}`}
                    title={terrainLabel(cell)}
                  />
                ))}
              </div>
            ))}
          </div>

          <div className="flex gap-4 text-sm text-gray-500 mt-4">
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 bg-white border inline-block" /> Open
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 bg-gray-700 inline-block" /> Obstacle
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 bg-red-200 inline-block" /> Red Base
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 bg-blue-200 inline-block" /> Blue Base
            </span>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="text-xs text-gray-400">
              ID: {map.id} | Created {new Date(map.createdAt).toLocaleDateString()}
            </div>
            <PrintButton />
          </div>
        </div>
      </div>
    </div>
  )
}
