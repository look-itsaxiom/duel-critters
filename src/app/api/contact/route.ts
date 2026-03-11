import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  try {
    const { name, message } = await request.json()

    if (!name?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Name and message are required' }, { status: 400 })
    }

    if (name.length > 50 || message.length > 1000) {
      return NextResponse.json({ error: 'Message too long' }, { status: 400 })
    }

    const id = nanoid(10)
    const entry = {
      id,
      name: name.trim(),
      message: message.trim(),
      createdAt: new Date().toISOString(),
      read: false,
    }

    await kv.set(`contact:${id}`, entry)

    // Also send email notification via mailto-style redirect isn't possible from API,
    // so we use a simple fetch to a free email API if configured
    const notifyEmail = process.env.CONTACT_NOTIFY_EMAIL
    if (notifyEmail) {
      // Future: integrate with Resend, SendGrid, etc.
      // For now, messages are stored in KV and viewable in admin
      console.log(`New contact message from ${name}: ${message.substring(0, 100)}`)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Contact API error:', err)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
