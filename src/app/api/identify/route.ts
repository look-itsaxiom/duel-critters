import { NextRequest, NextResponse } from 'next/server'
import { identifyCreature } from '@/lib/gemini'
import { uploadPhoto } from '@/lib/storage'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('photo') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No photo provided' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const mimeType = file.type || 'image/jpeg'

    const filename = `${nanoid()}.jpg`
    const photoUrl = await uploadPhoto(buffer, filename)

    const identification = await identifyCreature(base64, mimeType)

    return NextResponse.json({
      ...identification,
      photoUrl,
    })
  } catch (err) {
    console.error('Identify API error:', err)
    const message = err instanceof Error ? err.message : 'Failed to identify creature'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
