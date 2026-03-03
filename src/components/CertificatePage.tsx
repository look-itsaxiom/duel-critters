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
    <div className="max-w-xl mx-auto py-8 px-4">
      {/* Birth Certificate (top portion) */}
      <BirthCertificate critter={critter} qrDataUrl={qrDataUrl} />

      {/* Cut line */}
      <div className="my-6 flex items-center gap-2 print:my-4">
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
          className="px-8 py-3 bg-amber-500 text-white font-bold rounded-lg
                     hover:bg-amber-600 transition-colors shadow-md"
        >
          Print Certificate
        </button>
      </div>
    </div>
  )
}
