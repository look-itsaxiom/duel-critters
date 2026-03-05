import { cookies } from 'next/headers'

const COOKIE_NAME = 'dc-admin'
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000 // 24 hours

async function sign(payload: string): Promise<string> {
  const secret = process.env.ADMIN_PASSWORD!
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  return Buffer.from(signature).toString('hex')
}

async function verify(payload: string, signature: string): Promise<boolean> {
  const expected = await sign(payload)
  return expected === signature
}

export async function createAdminToken(): Promise<string> {
  const payload = JSON.stringify({ role: 'admin', exp: Date.now() + TOKEN_EXPIRY_MS })
  const sig = await sign(payload)
  return `${Buffer.from(payload).toString('base64')}.${sig}`
}

export async function setAdminCookie(): Promise<void> {
  const token = await createAdminToken()
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: TOKEN_EXPIRY_MS / 1000,
    path: '/',
  })
}

export async function validateAdmin(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return false

  const [payloadB64, sig] = token.split('.')
  if (!payloadB64 || !sig) return false

  try {
    const payload = Buffer.from(payloadB64, 'base64').toString()
    const valid = await verify(payload, sig)
    if (!valid) return false

    const data = JSON.parse(payload)
    if (data.exp < Date.now()) return false

    return data.role === 'admin'
  } catch {
    return false
  }
}
