import { NextRequest, NextResponse } from 'next/server'
import { identifyCreature, ValidationError } from '@/lib/gemini'
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

    // Identify first — only upload the photo if identification succeeds
    const identification = await identifyCreature(base64, mimeType)

    const filename = `${nanoid()}.jpg`
    const photoUrl = await uploadPhoto(buffer, filename)

    return NextResponse.json({
      ...identification,
      photoUrl,
    })
  } catch (err) {
    console.error('Identify API error:', err)
    const message = err instanceof Error ? err.message : 'Failed to identify creature'
    const status = err instanceof ValidationError ? 400 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
