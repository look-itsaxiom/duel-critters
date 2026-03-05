import { NextResponse } from 'next/server'
import { validateAdmin } from '@/lib/admin-auth'
import { getShopItem, saveShopItem, deleteShopItem } from '@/lib/storage'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await validateAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const existing = await getShopItem(id)
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const body = await request.json()
    const updated = {
      ...existing,
      ...body,
      id: existing.id, // prevent ID override
      createdAt: existing.createdAt, // preserve original date
    }

    await saveShopItem(updated)
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await validateAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const existing = await getShopItem(id)
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await deleteShopItem(id)
  return NextResponse.json({ ok: true })
}
