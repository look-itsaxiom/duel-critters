import { NextResponse } from 'next/server'
import { setAdminCookie } from '@/lib/admin-auth'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    if (!process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Admin not configured' }, { status: 500 })
    }

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Wrong password' }, { status: 401 })
    }

    await setAdminCookie()
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
