'use client'

import { useCallback, useRef, useState } from 'react'
import { MAPS, TERRAIN_COLORS, TERRAIN_LABELS } from '@/lib/maps'

export default function DownloadAllMaps() {
  const [generating, setGenerating] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleDownload = useCallback(async () => {
    setGenerating(true)

    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ])

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'in', format: 'letter' })

      const container = containerRef.current
      if (!container) return

      // Make the hidden container visible for rendering
      container.style.position = 'absolute'
      container.style.left = '-9999px'
      container.style.top = '0'
      container.style.display = 'block'

      for (let i = 0; i < MAPS.length; i++) {
        if (i > 0) pdf.addPage()

        const page = container.children[i] as HTMLElement
        if (!page) continue

        const canvas = await html2canvas(page, {
          scale: 2,
          backgroundColor: '#ffffff',
          logging: false,
        })

        const imgData = canvas.toDataURL('image/png')
        const pageWidth = 8.5
        const pageHeight = 11
        const margin = 0.5
        const contentWidth = pageWidth - margin * 2
        const aspectRatio = canvas.height / canvas.width
        const contentHeight = Math.min(contentWidth * aspectRatio, pageHeight - margin * 2)

        pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, contentHeight)
      }

      container.style.display = 'none'
      pdf.save('duel-critters-battlefields.pdf')
    } catch (err) {
      console.error('PDF generation failed:', err)
    } finally {
      setGenerating(false)
    }
  }, [])

  return (
    <>
      <button
        onClick={handleDownload}
        disabled={generating}
        className="inline-flex items-center gap-2 rounded-full border-2 border-emerald-300 bg-white
                   px-6 py-2.5 text-sm font-bold text-emerald-700 shadow-sm
                   transition-all duration-200 hover:scale-105 hover:border-emerald-400 hover:bg-emerald-50
                   disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
          <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
        </svg>
        {generating ? 'Generating PDF...' : 'Download All as PDF'}
      </button>

      {/* Hidden render container for PDF pages */}
      <div ref={containerRef} style={{ display: 'none' }}>
        {MAPS.map((map) => {
          const terrainPresent = new Set(map.grid.flat())
          const legendEntries = [0, 1, 2, 3, 4, 5].filter(t => terrainPresent.has(t))

          return (
            <div
              key={map.id}
              style={{
                width: '7.5in',
                padding: '0.5in',
                fontFamily: 'sans-serif',
                background: 'white',
              }}
            >
              {/* Title */}
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#111' }}>
                  {map.name}
                </div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                  Duel Critters Battlefield
                </div>
              </div>

              {/* Grid */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'inline-block', border: '2px solid #333', borderRadius: '4px', overflow: 'hidden' }}>
                  {map.grid.map((row, rowIdx) => (
                    <div key={rowIdx} style={{ display: 'flex' }}>
                      {row.map((cell, colIdx) => {
                        const colors: Record<number, string> = {
                          0: '#ffffff', 1: '#4b5563', 2: '#fecaca', 3: '#bae6fd',
                          4: '#fb923c', 5: '#67e8f9',
                        }
                        return (
                          <div
                            key={colIdx}
                            style={{
                              width: '40px',
                              height: '40px',
                              backgroundColor: colors[cell] ?? '#fff',
                              border: '1px solid #e5e7eb',
                            }}
                          />
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '11px', color: '#888', marginBottom: '16px' }}>
                {legendEntries.map((t) => {
                  const colors: Record<number, string> = {
                    0: '#ffffff', 1: '#4b5563', 2: '#fecaca', 3: '#bae6fd',
                    4: '#fb923c', 5: '#67e8f9',
                  }
                  return (
                    <span key={t} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{
                        width: '14px', height: '14px', borderRadius: '2px',
                        border: '1px solid #ccc', backgroundColor: colors[t],
                        display: 'inline-block',
                      }} />
                      {TERRAIN_LABELS[t]}
                    </span>
                  )
                })}
              </div>

              {/* Rules */}
              {map.rules && map.rules.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#888', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                    Special Rules
                  </div>
                  {map.rules.map((rule) => (
                    <div key={rule.name} style={{ border: '1px solid #d1d5db', borderRadius: '8px', padding: '10px', marginBottom: '6px' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{rule.name}</div>
                      <div style={{ fontSize: '12px', color: '#555', marginTop: '2px' }}>{rule.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
