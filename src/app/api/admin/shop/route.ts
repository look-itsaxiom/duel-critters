import { NextResponse } from 'next/server'
import { validateAdmin } from '@/lib/admin-auth'
import { listShopItems, saveShopItem } from '@/lib/storage'
import { customAlphabet } from 'nanoid'
import type { ShopItem } from '@/lib/types'

const generateId = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8)

export async function GET() {
  const isAdmin = await validateAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const items = await listShopItems()
  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  return NextResponse.json(items)
}

export async function POST(request: Request) {
  const isAdmin = await validateAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()

    const item: ShopItem = {
      id: `shop-${generateId()}`,
      name: body.name,
      description: body.description,
      imageUrl: body.imageUrl,
      affiliateUrl: body.affiliateUrl,
      source: body.source,
      price: body.price || undefined,
      featured: body.featured ?? false,
      createdAt: new Date().toISOString(),
    }

    await saveShopItem(item)
    return NextResponse.json(item, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
