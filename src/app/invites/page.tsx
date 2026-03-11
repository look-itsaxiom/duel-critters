'use client'

import { useEffect, useState } from 'react'
import { generateQRDataUrl } from '@/lib/qr'

const SITE_URL = 'https://critter-arena.com'

export default function InvitesPage() {
  const [qrDataUrl, setQrDataUrl] = useState<string>('')

  useEffect(() => {
    generateQRDataUrl(SITE_URL).then(setQrDataUrl)
  }, [])

  if (!qrDataUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-violet-400 border-t-transparent" />
      </div>
    )
  }

  // 8 cards: 2 columns x 4 rows on letter paper
  const cards = Array.from({ length: 8 })

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-fuchsia-50 to-amber-50 bg-dots print:bg-white">
      {/* Screen header */}
      <div className="max-w-2xl mx-auto px-4 py-8 print:hidden">
        <h1 className="font-display text-3xl font-bold text-center text-violet-900 mb-2">
          Invitation Cards
        </h1>
        <p className="text-center text-violet-600/70 mb-6">
          Print this page, cut along the lines, and hand them out!
          Each card has a QR code that goes straight to the site.
        </p>
        <div className="flex justify-center">
          <button
            onClick={() => window.print()}
            className="px-8 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white
                       font-display font-bold rounded-xl shadow-lg shadow-violet-200
                       hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            Print Invite Cards
          </button>
        </div>
      </div>

      {/* Print sheet: 2x4 grid of cards */}
      <div className="invite-sheet hidden print:block">
        <div className="grid grid-cols-2 grid-rows-4" style={{ width: '7.5in', height: '10in', margin: '0 auto' }}>
          {cards.map((_, i) => (
            <div
              key={i}
              className="invite-card flex flex-col items-center justify-center text-center px-3 py-2"
              style={{
                width: '3.5in',
                height: '2in',
                border: '1px dashed #ccc',
                overflow: 'hidden',
              }}
            >
              {/* Top: Logo + tagline */}
              <div style={{ marginBottom: '4px' }}>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#5b21b6', letterSpacing: '-0.3px', fontFamily: 'var(--font-fredoka), sans-serif' }}>
                  Critter Arena
                </div>
                <div style={{ fontSize: '7px', color: '#7c3aed', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600 }}>
                  Turn your figurine into a battle card
                </div>
              </div>

              {/* Middle: QR + instructions side by side */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <img
                  src={qrDataUrl}
                  alt="QR code"
                  style={{ width: '64px', height: '64px' }}
                />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '8px', fontWeight: 700, color: '#1f2937', marginBottom: '3px' }}>
                    HOW TO PLAY:
                  </div>
                  <div style={{ fontSize: '7.5px', color: '#4b5563', lineHeight: 1.4 }}>
                    1. Get a critter figurine<br />
                    2. Scan the QR code<br />
                    3. Upload a photo &amp; roll stats<br />
                    4. Print your battle card &amp; duel!
                  </div>
                </div>
              </div>

              {/* Bottom: URL */}
              <div style={{ fontSize: '8px', color: '#9ca3af', fontWeight: 600 }}>
                critter-arena.com
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* On-screen preview: show one card large */}
      <div className="max-w-sm mx-auto px-4 pb-8 print:hidden">
        <h2 className="font-display font-bold text-gray-500 text-sm uppercase tracking-wide text-center mb-3">
          Preview
        </h2>
        <div
          className="bg-white rounded-2xl shadow-xl border-2 border-violet-200 flex flex-col items-center justify-center text-center p-6"
          style={{ aspectRatio: '3.5 / 2' }}
        >
          <div className="mb-2">
            <div className="font-display text-2xl font-bold text-violet-700 tracking-tight">
              Critter Arena
            </div>
            <div className="text-[10px] text-violet-500 uppercase tracking-widest font-semibold">
              Turn your figurine into a battle card
            </div>
          </div>

          <div className="flex items-center gap-4 mb-2">
            <img src={qrDataUrl} alt="QR code" className="w-20 h-20" />
            <div className="text-left">
              <div className="text-xs font-bold text-gray-800 mb-1">HOW TO PLAY:</div>
              <div className="text-[11px] text-gray-600 leading-relaxed">
                1. Get a critter figurine<br />
                2. Scan the QR code<br />
                3. Upload a photo &amp; roll stats<br />
                4. Print your battle card &amp; duel!
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-400 font-semibold">critter-arena.com</div>
        </div>
      </div>
    </div>
  )
}
