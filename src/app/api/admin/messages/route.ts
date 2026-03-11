import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { validateAdmin } from '@/lib/admin-auth'

interface ContactMessage {
  id: string
  name: string
  message: string
  createdAt: string
  read: boolean
}

export async function GET() {
  const isAdmin = await validateAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const keys: string[] = []
    let cursor = 0
    do {
      const [nextCursor, batch] = await kv.scan(cursor, { match: 'contact:*', count: 100 })
      cursor = nextCursor as unknown as number
      keys.push(...(batch as string[]))
    } while (cursor !== 0)

    if (keys.length === 0) {
      return NextResponse.json([])
    }

    const messages = await Promise.all(keys.map(k => kv.get<ContactMessage>(k)))
    const valid = messages
      .filter((m): m is ContactMessage => m !== null)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json(valid)
  } catch (err) {
    console.error('Messages API error:', err)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const isAdmin = await validateAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id, read } = await request.json()
    const msg = await kv.get<ContactMessage>(`contact:${id}`)
    if (!msg) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    msg.read = read
    await kv.set(`contact:${id}`, msg)
    return NextResponse.json(msg)
  } catch (err) {
    console.error('Messages PATCH error:', err)
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const isAdmin = await validateAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await request.json()
    await kv.del(`contact:${id}`)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Messages DELETE error:', err)
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 })
  }
}
