import { NextResponse } from 'next/server'
import { validateAdmin } from '@/lib/admin-auth'
import { buildAbilityUserPrompt } from '@/lib/gemini'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')

export async function POST(req: Request) {
  const isAdmin = await validateAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { systemPrompt, creatureType, characteristics, starLevel, magnitude } = body

  if (!systemPrompt || !creatureType || !characteristics || !starLevel || !magnitude) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const userPrompt = buildAbilityUserPrompt(creatureType, characteristics, starLevel, magnitude)

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
  const result = await model.generateContent([
    { text: systemPrompt },
    { text: userPrompt },
  ])

  const rawResponse = result.response.text()
  const jsonMatch = rawResponse.match(/\{[\s\S]*\}/)

  if (!jsonMatch) {
    return NextResponse.json({ ability: null, rawResponse, error: 'Could not parse JSON from response' })
  }

  try {
    const parsed = JSON.parse(jsonMatch[0])
    return NextResponse.json({
      ability: { name: parsed.name, description: parsed.description, magnitude },
      rawResponse,
    })
  } catch {
    return NextResponse.json({ ability: null, rawResponse, error: 'Invalid JSON in response' })
  }
}
