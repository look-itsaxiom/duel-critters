import { NextResponse } from 'next/server'
import { validateAdmin } from '@/lib/admin-auth'
import { updateCritter } from '@/lib/storage'

interface PatchBody {
  ability?: {
    name: string
    description: string
    magnitude: number
  }
}

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
    const body: PatchBody = await request.json()

    const updates: Record<string, unknown> = {}
    if (body.ability) {
      updates.ability = body.ability
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
