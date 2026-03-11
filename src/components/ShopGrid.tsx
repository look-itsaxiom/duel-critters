'use client'

import { useState } from 'react'
import type { ShopItem } from '@/lib/types'

const SOURCE_COLORS = {
  amazon: {
    pill: 'bg-orange-100 text-orange-700 border-orange-200',
    label: 'Amazon',
  },
} as const

type Filter = 'all' | 'amazon'

export default function ShopGrid({ items }: { items: ShopItem[] }) {
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = filter === 'all' ? items : items.filter((i) => i.source === filter)

  return (
    <>
      {/* Product grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🔍</div>
          <p className="font-display text-xl font-bold text-gray-400">
            No critters here yet!
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Check back soon — we&apos;re always scouting for cool figurines.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item, i) => (
            <a
              key={item.id}
              href={item.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative bg-white rounded-2xl border-2 border-gray-100 shadow-sm
                         overflow-hidden transition-all duration-300
                         hover:scale-[1.03] hover:shadow-xl hover:border-rose-200
                         animate-fade-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* Featured badge */}
              {item.featured && (
                <div className="absolute top-3 left-3 z-10 bg-amber-400 text-amber-900 text-[10px]
                                font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
                  Featured
                </div>
              )}

              {/* Image container */}
              <div className="relative h-48 bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="max-h-40 max-w-[80%] object-contain transition-transform duration-300
                             group-hover:scale-110"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-rose-500/10 to-transparent
                                opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Info */}
              <div className="p-4">
                {/* Source badge + price */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5
                                    rounded-full border ${SOURCE_COLORS[item.source as keyof typeof SOURCE_COLORS]?.pill ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                    {SOURCE_COLORS[item.source as keyof typeof SOURCE_COLORS]?.label ?? item.source}
                  </span>
                  {item.price && (
                    <span className="text-sm font-bold text-gray-700">{item.price}</span>
                  )}
                </div>

                <h3 className="font-display font-bold text-gray-900 text-lg leading-tight mb-1
                               group-hover:text-rose-600 transition-colors">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                  {item.description}
                </p>

                {/* CTA */}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-bold text-rose-500 group-hover:text-rose-600 transition-colors">
                    Shop Now &rarr;
                  </span>
                  <div className="h-8 w-8 rounded-full bg-rose-50 flex items-center justify-center
                                  group-hover:bg-rose-100 transition-colors">
                    <svg className="w-4 h-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </>
  )
}
