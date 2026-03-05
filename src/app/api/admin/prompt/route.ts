import { NextResponse } from 'next/server'
import { validateAdmin } from '@/lib/admin-auth'
import { ABILITY_SYSTEM_PROMPT } from '@/lib/gemini'

export async function GET() {
  const isAdmin = await validateAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({ prompt: ABILITY_SYSTEM_PROMPT })
}
