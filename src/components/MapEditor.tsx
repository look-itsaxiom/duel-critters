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
  0: 'bg-white hover:bg-sky-50',
  1: 'bg-gray-700 shadow-inner',
  2: 'bg-red-300',
  3: 'bg-sky-300',
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
        className="w-full px-4 py-3 border-2 border-sky-200 rounded-xl text-lg font-medium
                   focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200
                   placeholder:text-sky-300 transition-all"
      />

      <div className="inline-block border-2 border-gray-700 rounded-xl overflow-hidden shadow-lg">
        {grid.map((row, rowIdx) => (
          <div key={rowIdx} className="flex">
            {row.map((cell, colIdx) => (
              <button
                key={colIdx}
                className={`w-10 h-10 border border-gray-200 ${TERRAIN_COLORS[cell]} transition-colors duration-150`}
                onClick={() => toggleCell(rowIdx, colIdx)}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="flex gap-4 text-sm font-medium text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-5 h-5 bg-white border-2 border-gray-200 rounded inline-block" /> Open
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-5 h-5 bg-gray-700 rounded inline-block" /> Obstacle
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-5 h-5 bg-red-300 rounded inline-block" /> Red Base
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-5 h-5 bg-sky-300 rounded inline-block" /> Blue Base
        </span>
      </div>

      <button
        onClick={handleSave}
        disabled={!name.trim()}
        className="px-8 py-3 bg-gradient-to-r from-sky-400 to-blue-500 text-white font-display font-bold
                   rounded-xl shadow-lg shadow-sky-200 hover:shadow-xl hover:scale-105
                   disabled:opacity-50 disabled:hover:scale-100 transition-all duration-200"
      >
        Save Map
      </button>
    </div>
  )
}
