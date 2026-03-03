import { kv } from '@vercel/kv'
import { put } from '@vercel/blob'
import type { CritterRecord, MapRecord } from './types'

// --- Critter Storage ---

export async function saveCritter(critter: CritterRecord): Promise<void> {
  await kv.set(`critter:${critter.id}`, critter)
}

export async function getCritter(id: string): Promise<CritterRecord | null> {
  return await kv.get<CritterRecord>(`critter:${id}`)
}

// --- Photo Storage ---

export async function uploadPhoto(
  file: Buffer,
  filename: string
): Promise<string> {
  const blob = await put(`critters/${filename}`, file, {
    access: 'public',
    contentType: 'image/jpeg',
  })
  return blob.url
}

// --- Map Storage ---

export async function saveMap(map: MapRecord): Promise<void> {
  await kv.set(`map:${map.id}`, map)
}

export async function getMap(id: string): Promise<MapRecord | null> {
  return await kv.get<MapRecord>(`map:${id}`)
}
