import { NextRequest, NextResponse } from 'next/server'
import { getCritter } from '@/lib/storage'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const critter = await getCritter(id)
  if (!critter) {
    return NextResponse.json({ error: 'Critter not found' }, { status: 404 })
  }
  return NextResponse.json(critter)
}
