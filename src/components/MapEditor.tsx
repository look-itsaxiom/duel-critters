'use client'

import { useState, useCallback } from 'react'
import { GRID_COLS, GRID_ROWS, BASE_ROWS } from '@/lib/constants'

interface MapEditorProps {
  onSave: (name: string, grid: number[][]) => void
}

function createEmptyGrid(): number[][] {
  const grid: number[][] = []
  for (let row = 0; row < GRID_ROWS; row++) {
    const cells: number[] = []
    for (let col = 0; col < GRID_COLS; col++) {
      if (row < BASE_ROWS) {
        cells.push(3) // base-blue (top)
      } else if (row >= GRID_ROWS - BASE_ROWS) {
        cells.push(2) // base-red (bottom)
      } else {
        cells.push(0) // open
      }
    }
    grid.push(cells)
  }
  return grid
}

const TERRAIN_COLORS: Record<number, string> = {
  0: 'bg-white hover:bg-gray-100',
  1: 'bg-gray-700',
  2: 'bg-red-200',
  3: 'bg-blue-200',
}

export default function MapEditor({ onSave }: MapEditorProps) {
  const [grid, setGrid] = useState<number[][]>(createEmptyGrid)
  const [name, setName] = useState('')

  const toggleCell = useCallback((row: number, col: number) => {
    if (row < BASE_ROWS || row >= GRID_ROWS - BASE_ROWS) return

    setGrid(prev => {
      const next = prev.map(r => [...r])
      next[row][col] = next[row][col] === 0 ? 1 : 0
      return next
    })
  }, [])

  const handleSave = () => {
    if (!name.trim()) return
    onSave(name.trim(), grid)
  }

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Map name (e.g., Crystal Cavern)"
        className="w-full px-4 py-2 border rounded-lg text-lg"
      />

      <div className="inline-block border-2 border-gray-800">
        {grid.map((row, rowIdx) => (
          <div key={rowIdx} className="flex">
            {row.map((cell, colIdx) => (
              <button
                key={colIdx}
                className={`w-10 h-10 border border-gray-300 ${TERRAIN_COLORS[cell]} transition-colors`}
                onClick={() => toggleCell(rowIdx, colIdx)}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="flex gap-4 text-sm text-gray-500">
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

      <button
        onClick={handleSave}
        disabled={!name.trim()}
        className="px-6 py-2 bg-amber-500 text-white font-bold rounded-lg
                   hover:bg-amber-600 disabled:opacity-50 transition-colors"
      >
        Save Map
      </button>
    </div>
  )
}
