'use client'

import type { CritterRecord } from '@/lib/types'
import BirthCertificate from './BirthCertificate'
import BattleCard from './BattleCard'

interface CertificatePageProps {
  critter: CritterRecord
  qrDataUrl: string
}

export default function CertificatePage({ critter, qrDataUrl }: CertificatePageProps) {
  return (
    <div className="certificate-print-page max-w-xl mx-auto py-8 px-4 print:py-0 print:px-0 print:max-w-none">
      {/* Birth Certificate (top portion) */}
      <BirthCertificate critter={critter} qrDataUrl={qrDataUrl} />

      {/* Cut line */}
      <div className="my-6 flex items-center gap-2 print:my-2">
        <div className="flex-1 border-t-2 border-dashed border-gray-400" />
        <span className="text-sm text-gray-400 whitespace-nowrap select-none">
          &#9986; CUT HERE
        </span>
        <div className="flex-1 border-t-2 border-dashed border-gray-400" />
      </div>

      {/* Battle Card (bottom cuttable portion) */}
      <div className="flex justify-center">
        <BattleCard critter={critter} qrDataUrl={qrDataUrl} />
      </div>

      {/* Print button (hidden when printing) */}
      <div className="mt-8 text-center print:hidden">
        <button
          onClick={() => window.print()}
          className="px-8 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white
                     font-display font-bold rounded-xl shadow-lg shadow-orange-200
                     hover:shadow-xl hover:scale-105 transition-all duration-200"
        >
          Print Certificate
        </button>
      </div>
    </div>
  )
}
