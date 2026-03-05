import { listShopItems } from '@/lib/storage'
import ShopGrid from '@/components/ShopGrid'

export const dynamic = 'force-dynamic'

export default async function ShopPage() {
  const items = await listShopItems()
  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-rose-50 via-amber-50 to-fuchsia-50 bg-dots">
      <main className="mx-auto max-w-5xl px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-up">
          <div className="inline-block mb-3">
            <span className="text-5xl">🧸</span>
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Need a Critter?
          </h1>
          <p className="mt-3 max-w-md mx-auto text-lg text-gray-500">
            Don&apos;t have a figurine yet? We picked out some of our favorites
            from Amazon and Etsy.
          </p>
        </div>

        {/* Grid with filters */}
        <ShopGrid items={items} />

        {/* FTC Disclosure */}
        <div className="mt-16 text-center">
          <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
            As an Amazon Associate and Etsy affiliate, we earn from qualifying
            purchases. Prices shown are approximate and may vary.
          </p>
        </div>
      </main>
    </div>
  )
}
