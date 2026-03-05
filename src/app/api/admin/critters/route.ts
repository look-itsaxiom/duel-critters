import { NextResponse } from 'next/server'
import { validateAdmin } from '@/lib/admin-auth'
import { listAllCritters } from '@/lib/storage'

export async function GET() {
  const isAdmin = await validateAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const critters = await listAllCritters()
  // Sort newest first
  critters.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return NextResponse.json(critters)
}
