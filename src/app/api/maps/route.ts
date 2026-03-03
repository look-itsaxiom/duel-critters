import { NextRequest, NextResponse } from 'next/server'
import { saveMap } from '@/lib/storage'
import { generateMapId } from '@/lib/ids'
import type { MapRecord } from '@/lib/types'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { name, grid } = body

  const map: MapRecord = {
    id: generateMapId(),
    name,
    grid,
    createdAt: new Date().toISOString(),
  }

  await saveMap(map)
  return NextResponse.json(map)
}
