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
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-blue-50 to-cyan-50 bg-dots py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-4xl font-bold mb-2 text-sky-800 animate-fade-up">
          Map Builder
        </h1>
        <p className="text-sky-600/70 font-medium mb-6 animate-fade-up" style={{ animationDelay: '100ms' }}>
          Design your battlefield! Click squares to toggle obstacles.
          Blue and red bases are fixed at the top and bottom.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-2xl border-2 border-red-200 font-medium animate-pop">
            {error}
          </div>
        )}

        <div className="animate-fade-up" style={{ animationDelay: '200ms' }}>
          <MapEditor onSave={handleSave} />
        </div>

        {saving && (
          <div className="mt-4 text-center text-sky-500 font-medium">
            Saving map...
          </div>
        )}
      </div>
    </div>
  )
}
