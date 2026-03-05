import { NextResponse } from 'next/server'
import { validateAdmin } from '@/lib/admin-auth'
import { updateCritter, deleteCritter } from '@/lib/storage'

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
    const body = await request.json()

    // Allow updating any critter field except id
    const allowedFields = [
      'name', 'nickname', 'creatureType', 'characteristics',
      'starLevel', 'hp', 'atk', 'spd',
      'hasAbility', 'ability', 'photoUrl',
    ]

    const updates: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
    }

    const updated = await updateCritter(id, updates)
    if (!updated) {
      return NextResponse.json({ error: 'Critter not found' }, { status: 404 })
    }

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
  await deleteCritter(id)
  return NextResponse.json({ ok: true })
}
