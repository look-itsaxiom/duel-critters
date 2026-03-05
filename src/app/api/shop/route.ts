import { NextResponse } from 'next/server'
import { listShopItems } from '@/lib/storage'

export async function GET() {
  const items = await listShopItems()
  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  return NextResponse.json(items)
}
