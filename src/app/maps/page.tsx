'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MapEditor from '@/components/MapEditor'

export default function MapsPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async (name: string, grid: number[][]) => {
    setSaving(true)
    setError(null)

    try {
      const res = await fetch('/api/maps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, grid }),
      })

      if (!res.ok) {
        throw new Error('Failed to save map')
      }

      const map = await res.json()
      router.push(`/maps/${map.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Map Builder</h1>
        <p className="text-gray-600 mb-6">
          Design your battlefield! Click squares to toggle obstacles.
          Blue and red bases are fixed at the top and bottom.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <MapEditor onSave={handleSave} />

        {saving && (
          <div className="mt-4 text-center text-gray-500">
            Saving map...
          </div>
        )}
      </div>
    </div>
  )
}
