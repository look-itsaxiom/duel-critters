import { NextRequest, NextResponse } from 'next/server'
import { getMap } from '@/lib/storage'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const map = await getMap(id)
  if (!map) {
    return NextResponse.json({ error: 'Map not found' }, { status: 404 })
  }
  return NextResponse.json(map)
}
