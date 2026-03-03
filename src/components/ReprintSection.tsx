'use client'

import { useState, useEffect } from 'react'
import CertificatePage from './CertificatePage'
import { generateQRDataUrl } from '@/lib/qr'
import type { CritterRecord } from '@/lib/types'

interface ReprintSectionProps {
  critter: CritterRecord
}

export default function ReprintSection({ critter }: ReprintSectionProps) {
  const [showCertificate, setShowCertificate] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string>('')

  useEffect(() => {
    if (!showCertificate) return
    generateQRDataUrl(`${window.location.origin}/v/${critter.id}`).then(setQrDataUrl)
  }, [showCertificate, critter.id])

  if (!showCertificate) {
    return (
      <div className="flex justify-center print:hidden">
        <button
          onClick={() => setShowCertificate(true)}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500
                     px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200
                     transition-all duration-200 hover:scale-105 hover:shadow-xl"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M5 2.75C5 1.784 5.784 1 6.75 1h6.5c.966 0 1.75.784 1.75 1.75v3.552c.377.046.752.097 1.126.153A2.212 2.212 0 0118 8.653v4.097A2.25 2.25 0 0115.75 15h-.25v.75c0 .966-.784 1.75-1.75 1.75h-7.5A1.75 1.75 0 014.5 15.75V15h-.25A2.25 2.25 0 012 12.75V8.653c0-1.082.775-2.034 1.874-2.198.374-.056.75-.107 1.126-.153V2.75zm1.5 0v3.362a40 40 0 017 0V2.75a.25.25 0 00-.25-.25h-6.5a.25.25 0 00-.25.25zm-1 7.5v5.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-5.5a.25.25 0 00-.25-.25h-7.5a.25.25 0 00-.25.25z" clipRule="evenodd" />
          </svg>
          Reprint Certificate
        </button>
      </div>
    )
  }

  return (
    <div className="animate-fade-up">
      <div className="mb-4 text-center print:hidden">
        <button
          onClick={() => setShowCertificate(false)}
          className="text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
        >
          Hide certificate
        </button>
      </div>
      {qrDataUrl ? (
        <CertificatePage critter={critter} qrDataUrl={qrDataUrl} />
      ) : (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-200 border-t-amber-500" />
        </div>
      )}
    </div>
  )
}
