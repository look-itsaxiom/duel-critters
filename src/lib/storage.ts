import { kv } from '@vercel/kv'
import { put } from '@vercel/blob'
import type { CritterRecord, ShopItem } from './types'

// --- Critter Storage ---

export async function saveCritter(critter: CritterRecord): Promise<void> {
  await kv.set(`critter:${critter.id}`, critter)
}

export async function getCritter(id: string): Promise<CritterRecord | null> {
  return await kv.get<CritterRecord>(`critter:${id}`)
}

export async function listAllCritters(): Promise<CritterRecord[]> {
  const keys: string[] = []
  let done = false
  let scanCursor = 0
  while (!done) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await kv.scan(scanCursor, { match: 'critter:*', count: 100 })
    const nextCursor = Number(result[0])
    const batch = result[1] as string[]
    keys.push(...batch)
    if (nextCursor === 0) {
      done = true
    } else {
      scanCursor = nextCursor
    }
  }

  if (keys.length === 0) return []

  const values = await kv.mget<CritterRecord[]>(...keys)
  return values.filter((v): v is CritterRecord => v !== null)
}

export async function updateCritter(
  id: string,
  updates: Partial<CritterRecord>
): Promise<CritterRecord | null> {
  const existing = await getCritter(id)
  if (!existing) return null

  const updated: CritterRecord = {
    ...existing,
    ...updates,
    id: existing.id, // prevent ID override
    updatedAt: new Date().toISOString(),
  }
  await kv.set(`critter:${id}`, updated)
  return updated
}

// --- Shop Item Storage ---

export async function saveShopItem(item: ShopItem): Promise<void> {
  await kv.set(`shop:${item.id}`, item)
}

export async function getShopItem(id: string): Promise<ShopItem | null> {
  return await kv.get<ShopItem>(`shop:${id}`)
}

export async function listShopItems(): Promise<ShopItem[]> {
  const keys: string[] = []
  let done = false
  let scanCursor = 0
  while (!done) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await kv.scan(scanCursor, { match: 'shop:*', count: 100 })
    const nextCursor = Number(result[0])
    const batch = result[1] as string[]
    keys.push(...batch)
    if (nextCursor === 0) {
      done = true
    } else {
      scanCursor = nextCursor
    }
  }

  if (keys.length === 0) return []

  const values = await kv.mget<ShopItem[]>(...keys)
  return values.filter((v): v is ShopItem => v !== null)
}

export async function deleteShopItem(id: string): Promise<void> {
  await kv.del(`shop:${id}`)
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
