'use client'

import { useState, useEffect, useCallback } from 'react'
import type { CritterRecord, ShopItem } from '@/lib/types'

function starString(level: number): string {
  return '\u2605'.repeat(level)
}

interface EditingAbility {
  name: string
  description: string
  magnitude: number
}

type Tab = 'critters' | 'shop' | 'promptlab'

interface AbilityResult {
  ability: { name: string; description: string; magnitude: number } | null
  rawResponse: string
  error?: string
  params: { creatureType: string; characteristics: string; starLevel: number; magnitude: number }
  timestamp: string
}

const EMPTY_SHOP_FORM: {
  name: string
  description: string
  imageUrl: string
  affiliateUrl: string
  source: 'amazon' | 'etsy'
  price: string
  featured: boolean
} = {
  name: '',
  description: '',
  imageUrl: '',
  affiliateUrl: '',
  source: 'amazon',
  price: '',
  featured: false,
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [tab, setTab] = useState<Tab>('critters')

  // Critter state
  const [critters, setCritters] = useState<CritterRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editAbility, setEditAbility] = useState<EditingAbility>({ name: '', description: '', magnitude: 1 })
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  // Shop state
  const [shopItems, setShopItems] = useState<ShopItem[]>([])
  const [shopLoading, setShopLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [shopForm, setShopForm] = useState(EMPTY_SHOP_FORM)
  const [editingShopId, setEditingShopId] = useState<string | null>(null)
  const [shopSaving, setShopSaving] = useState(false)

  // Prompt Lab state
  const [promptText, setPromptText] = useState('')
  const [promptLoading, setPromptLoading] = useState(false)
  const [labCreature, setLabCreature] = useState('Dragon')
  const [labChars, setLabChars] = useState('winged, fire-breathing, fierce')
  const [labStar, setLabStar] = useState(3)
  const [labMag, setLabMag] = useState(3)
  const [labGenerating, setLabGenerating] = useState(false)
  const [labHistory, setLabHistory] = useState<AbilityResult[]>([])

  const fetchDefaultPrompt = useCallback(async () => {
    setPromptLoading(true)
    try {
      const res = await fetch('/api/admin/prompt')
      if (res.status === 401) { setAuthed(false); return }
      const data = await res.json()
      setPromptText(data.prompt)
    } catch {
      // ignore
    } finally {
      setPromptLoading(false)
    }
  }, [])

  async function generateTestAbility() {
    setLabGenerating(true)
    try {
      const res = await fetch('/api/admin/test-ability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: promptText,
          creatureType: labCreature,
          characteristics: labChars.split(',').map((s) => s.trim()).filter(Boolean),
          starLevel: labStar,
          magnitude: labMag,
        }),
      })
      if (res.status === 401) { setAuthed(false); return }
      const data = await res.json()
      const result: AbilityResult = {
        ability: data.ability,
        rawResponse: data.rawResponse,
        error: data.error,
        params: { creatureType: labCreature, characteristics: labChars, starLevel: labStar, magnitude: labMag },
        timestamp: new Date().toLocaleTimeString(),
      }
      setLabHistory((prev) => [result, ...prev].slice(0, 10))
    } catch (err) {
      setLabHistory((prev) => [{
        ability: null,
        rawResponse: '',
        error: String(err),
        params: { creatureType: labCreature, characteristics: labChars, starLevel: labStar, magnitude: labMag },
        timestamp: new Date().toLocaleTimeString(),
      }, ...prev].slice(0, 10))
    } finally {
      setLabGenerating(false)
    }
  }

  const fetchCritters = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/critters')
      if (res.status === 401) {
        setAuthed(false)
        return
      }
      const data = await res.json()
      setCritters(data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchShopItems = useCallback(async () => {
    setShopLoading(true)
    try {
      const res = await fetch('/api/admin/shop')
      if (res.status === 401) {
        setAuthed(false)
        return
      }
      const data = await res.json()
      setShopItems(data)
    } catch {
      // ignore
    } finally {
      setShopLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authed) {
      fetchCritters()
      fetchShopItems()
      fetchDefaultPrompt()
    }
  }, [authed, fetchCritters, fetchShopItems, fetchDefaultPrompt])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setAuthError('')
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        setAuthed(true)
      } else {
        setAuthError('Wrong password')
      }
    } catch {
      setAuthError('Connection error')
    }
  }

  function startEdit(critter: CritterRecord) {
    setEditingId(critter.id)
    setEditAbility(
      critter.ability
        ? { name: critter.ability.name, description: critter.ability.description, magnitude: critter.ability.magnitude }
        : { name: '', description: '', magnitude: 1 }
    )
  }

  async function saveAbility(id: string) {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/critters/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ability: editAbility }),
      })
      if (res.ok) {
        const updated = await res.json()
        setCritters((prev) => prev.map((c) => (c.id === id ? updated : c)))
        setEditingId(null)
      }
    } catch {
      // ignore
    } finally {
      setSaving(false)
    }
  }

  function copyOwnerLink(id: string) {
    const url = `${window.location.origin}/v/${id}`
    navigator.clipboard.writeText(url)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  // Shop helpers
  async function saveShopItem() {
    setShopSaving(true)
    try {
      if (editingShopId) {
        const res = await fetch(`/api/admin/shop/${editingShopId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(shopForm),
        })
        if (res.ok) {
          const updated = await res.json()
          setShopItems((prev) => prev.map((i) => (i.id === editingShopId ? updated : i)))
          setEditingShopId(null)
          setShopForm(EMPTY_SHOP_FORM)
        }
      } else {
        const res = await fetch('/api/admin/shop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(shopForm),
        })
        if (res.ok) {
          const created = await res.json()
          setShopItems((prev) => [created, ...prev])
          setShowAddForm(false)
          setShopForm(EMPTY_SHOP_FORM)
        }
      }
    } catch {
      // ignore
    } finally {
      setShopSaving(false)
    }
  }

  async function deleteShopItem(id: string) {
    if (!confirm('Delete this shop item?')) return
    try {
      const res = await fetch(`/api/admin/shop/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setShopItems((prev) => prev.filter((i) => i.id !== id))
      }
    } catch {
      // ignore
    }
  }

  function startEditShop(item: ShopItem) {
    setEditingShopId(item.id)
    setShopForm({
      name: item.name,
      description: item.description,
      imageUrl: item.imageUrl,
      affiliateUrl: item.affiliateUrl,
      source: item.source,
      price: item.price || '',
      featured: item.featured,
    })
    setShowAddForm(true)
  }

  // Auth gate
  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <form onSubmit={handleLogin} className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm">
          <h1 className="font-display text-2xl font-bold text-gray-900 mb-6 text-center">Admin Access</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-lg focus:border-violet-400 focus:outline-none"
            autoFocus
          />
          {authError && <p className="text-red-500 text-sm mt-2">{authError}</p>}
          <button
            type="submit"
            className="w-full mt-4 px-4 py-3 bg-violet-600 text-white font-bold rounded-lg hover:bg-violet-700 transition-colors"
          >
            Enter
          </button>
        </form>
      </div>
    )
  }

  // Shop form component
  const shopFormUI = (showAddForm || editingShopId) && (
    <div className="bg-rose-50 rounded-xl border border-rose-200 p-4 mb-6 space-y-3">
      <h3 className="font-bold text-rose-800">{editingShopId ? 'Edit Product' : 'Add Product'}</h3>
      <input
        type="text" placeholder="Product name"
        value={shopForm.name} onChange={(e) => setShopForm((f) => ({ ...f, name: e.target.value }))}
        className="w-full px-3 py-2 border border-rose-200 rounded-lg text-sm focus:outline-none focus:border-rose-400"
      />
      <textarea
        placeholder="Short description (1-2 sentences)"
        value={shopForm.description} onChange={(e) => setShopForm((f) => ({ ...f, description: e.target.value }))}
        rows={2}
        className="w-full px-3 py-2 border border-rose-200 rounded-lg text-sm focus:outline-none focus:border-rose-400"
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          type="url" placeholder="Image URL"
          value={shopForm.imageUrl} onChange={(e) => setShopForm((f) => ({ ...f, imageUrl: e.target.value }))}
          className="px-3 py-2 border border-rose-200 rounded-lg text-sm focus:outline-none focus:border-rose-400"
        />
        <input
          type="url" placeholder="Affiliate URL"
          value={shopForm.affiliateUrl} onChange={(e) => setShopForm((f) => ({ ...f, affiliateUrl: e.target.value }))}
          className="px-3 py-2 border border-rose-200 rounded-lg text-sm focus:outline-none focus:border-rose-400"
        />
      </div>
      <div className="flex items-center gap-4">
        <select
          value={shopForm.source} onChange={(e) => setShopForm((f) => ({ ...f, source: e.target.value as 'amazon' | 'etsy' }))}
          className="px-3 py-2 border border-rose-200 rounded-lg text-sm"
        >
          <option value="amazon">Amazon</option>
          <option value="etsy">Etsy</option>
        </select>
        <input
          type="text" placeholder="Price (e.g. $8.99)"
          value={shopForm.price} onChange={(e) => setShopForm((f) => ({ ...f, price: e.target.value }))}
          className="w-28 px-3 py-2 border border-rose-200 rounded-lg text-sm focus:outline-none focus:border-rose-400"
        />
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox" checked={shopForm.featured}
            onChange={(e) => setShopForm((f) => ({ ...f, featured: e.target.checked }))}
            className="rounded border-rose-300 text-rose-500 focus:ring-rose-400"
          />
          Featured
        </label>
      </div>
      <div className="flex gap-2">
        <button
          onClick={saveShopItem} disabled={shopSaving || !shopForm.name || !shopForm.affiliateUrl}
          className="px-4 py-2 bg-rose-500 text-white text-sm font-bold rounded-lg hover:bg-rose-600 disabled:opacity-50"
        >
          {shopSaving ? 'Saving...' : editingShopId ? 'Update' : 'Add Product'}
        </button>
        <button
          onClick={() => { setShowAddForm(false); setEditingShopId(null); setShopForm(EMPTY_SHOP_FORM) }}
          className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </div>
  )

  // Admin dashboard
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-4">Admin</h1>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-gray-200">
          <button
            onClick={() => setTab('critters')}
            className={`px-5 py-2.5 text-sm font-bold rounded-t-lg transition-colors ${
              tab === 'critters'
                ? 'bg-white border-2 border-b-0 border-gray-200 text-violet-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Critters ({critters.length})
          </button>
          <button
            onClick={() => setTab('shop')}
            className={`px-5 py-2.5 text-sm font-bold rounded-t-lg transition-colors ${
              tab === 'shop'
                ? 'bg-white border-2 border-b-0 border-gray-200 text-rose-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Shop ({shopItems.length})
          </button>
          <button
            onClick={() => setTab('promptlab')}
            className={`px-5 py-2.5 text-sm font-bold rounded-t-lg transition-colors ${
              tab === 'promptlab'
                ? 'bg-white border-2 border-b-0 border-gray-200 text-amber-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Prompt Lab
          </button>
        </div>

        {/* Critters tab */}
        {tab === 'critters' && (
          <>
            {loading && <p className="text-gray-400">Loading...</p>}
            <div className="space-y-4">
          {critters.map((critter) => (
            <div key={critter.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-start gap-4">
                {/* Photo */}
                {critter.photoUrl && (
                  <img
                    src={critter.photoUrl}
                    alt={critter.name}
                    className="w-16 h-16 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                  />
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display font-bold text-lg text-gray-900">{critter.name}</span>
                    {critter.nickname && (
                      <span className="text-sm text-gray-500 italic">&ldquo;{critter.nickname}&rdquo;</span>
                    )}
                    <span className="text-amber-500">{starString(critter.starLevel)}</span>
                    <span className="text-xs text-gray-400 font-mono">{critter.id}</span>
                  </div>

                  <div className="flex gap-4 mt-1 text-sm">
                    <span><span className="font-bold text-red-600">HP</span> {critter.hp}</span>
                    <span><span className="font-bold text-orange-600">ATK</span> {critter.atk}</span>
                    <span><span className="font-bold text-blue-600">SPD</span> {critter.spd}</span>
                    <span className="text-gray-400">{critter.creatureType}</span>
                  </div>

                  {/* Ability display / edit */}
                  {editingId === critter.id ? (
                    <div className="mt-3 bg-purple-50 rounded-lg p-3 space-y-2">
                      <input
                        type="text"
                        value={editAbility.name}
                        onChange={(e) => setEditAbility((a) => ({ ...a, name: e.target.value }))}
                        placeholder="Ability name"
                        className="w-full px-3 py-1.5 border border-purple-200 rounded text-sm focus:outline-none focus:border-purple-400"
                      />
                      <textarea
                        value={editAbility.description}
                        onChange={(e) => setEditAbility((a) => ({ ...a, description: e.target.value }))}
                        placeholder="Ability description"
                        rows={2}
                        className="w-full px-3 py-1.5 border border-purple-200 rounded text-sm focus:outline-none focus:border-purple-400"
                      />
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-500">Magnitude:</label>
                        <input
                          type="number"
                          min={1}
                          max={5}
                          value={editAbility.magnitude}
                          onChange={(e) => setEditAbility((a) => ({ ...a, magnitude: Number(e.target.value) }))}
                          className="w-16 px-2 py-1 border border-purple-200 rounded text-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveAbility(critter.id)}
                          disabled={saving}
                          className="px-3 py-1 bg-purple-600 text-white text-sm font-bold rounded hover:bg-purple-700 disabled:opacity-50"
                        >
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : critter.hasAbility && critter.ability ? (
                    <div className="mt-2 text-sm">
                      <span className="font-bold text-purple-700">{critter.ability.name}</span>
                      <span className="text-purple-500 ml-1">(mag {critter.ability.magnitude})</span>
                      <span className="text-gray-600 ml-2">{critter.ability.description}</span>
                    </div>
                  ) : (
                    <div className="mt-2 text-sm text-gray-400 italic">No ability</div>
                  )}

                  {critter.updatedAt && critter.updatedAt !== critter.createdAt && (
                    <div className="mt-1 text-xs text-amber-600 font-medium">
                      Edited {new Date(critter.updatedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button
                    onClick={() => copyOwnerLink(critter.id)}
                    className="px-3 py-1.5 bg-green-100 text-green-700 text-xs font-bold rounded-lg hover:bg-green-200 transition-colors"
                  >
                    {copied === critter.id ? 'Copied!' : 'Owner Link'}
                  </button>
                  <button
                    onClick={() => startEdit(critter)}
                    className="px-3 py-1.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-lg hover:bg-purple-200 transition-colors"
                  >
                    Edit Ability
                  </button>
                </div>
              </div>
            </div>
          ))}
            </div>
          </>
        )}

        {/* Shop tab */}
        {tab === 'shop' && (
          <>
            {!showAddForm && !editingShopId && (
              <button
                onClick={() => { setShowAddForm(true); setShopForm(EMPTY_SHOP_FORM) }}
                className="mb-6 px-5 py-2.5 bg-rose-500 text-white text-sm font-bold rounded-lg hover:bg-rose-600 transition-colors"
              >
                + Add Product
              </button>
            )}

            {shopFormUI}

            {shopLoading && <p className="text-gray-400">Loading...</p>}

            <div className="space-y-3">
              {shopItems.map((item) => (
                <div key={item.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                  <div className="flex items-start gap-4">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl} alt={item.name}
                        className="w-16 h-16 rounded-lg object-contain border border-gray-200 bg-gray-50 flex-shrink-0"
                      />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display font-bold text-gray-900">{item.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.source === 'amazon'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {item.source === 'amazon' ? 'Amazon' : 'Etsy'}
                        </span>
                        {item.featured && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-amber-900">
                            Featured
                          </span>
                        )}
                        {item.price && <span className="text-sm text-gray-500">{item.price}</span>}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                      <a href={item.affiliateUrl} target="_blank" rel="noopener noreferrer"
                         className="text-xs text-rose-500 hover:text-rose-600 mt-1 inline-block">
                        View link &rarr;
                      </a>
                    </div>

                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <button
                        onClick={() => startEditShop(item)}
                        className="px-3 py-1.5 bg-rose-100 text-rose-700 text-xs font-bold rounded-lg hover:bg-rose-200 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteShopItem(item.id)}
                        className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-bold rounded-lg hover:bg-red-200 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {shopItems.length === 0 && !shopLoading && (
                <p className="text-gray-400 text-center py-8">No shop items yet. Add your first product above.</p>
              )}
            </div>
          </>
        )}

        {/* Prompt Lab tab */}
        {tab === 'promptlab' && (
          <>
            {promptLoading ? (
              <p className="text-gray-400">Loading prompt...</p>
            ) : (
              <div className="space-y-6">
                {/* System prompt editor */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-bold text-gray-700">System Prompt</label>
                    <button
                      onClick={fetchDefaultPrompt}
                      className="text-xs text-amber-600 hover:text-amber-700 font-bold"
                    >
                      Reset to Default
                    </button>
                  </div>
                  <textarea
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    rows={16}
                    className="w-full rounded-xl border-2 border-gray-200 p-3 text-xs font-mono
                               focus:border-amber-400 focus:ring-0 focus:outline-none resize-y"
                  />
                </div>

                {/* Parameters */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <h3 className="text-sm font-bold text-gray-700 mb-3">Test Parameters</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Creature Type</label>
                      <input
                        type="text"
                        value={labCreature}
                        onChange={(e) => setLabCreature(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm
                                   focus:border-amber-400 focus:ring-0 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Characteristics (comma-separated)</label>
                      <input
                        type="text"
                        value={labChars}
                        onChange={(e) => setLabChars(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm
                                   focus:border-amber-400 focus:ring-0 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Star Level (1-6)</label>
                      <input
                        type="number"
                        min={1}
                        max={6}
                        value={labStar}
                        onChange={(e) => setLabStar(Number(e.target.value))}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm
                                   focus:border-amber-400 focus:ring-0 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Ability Magnitude (1-5)</label>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={labMag}
                        onChange={(e) => setLabMag(Number(e.target.value))}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm
                                   focus:border-amber-400 focus:ring-0 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={generateTestAbility}
                    disabled={labGenerating || !promptText.trim()}
                    className="mt-4 w-full py-2.5 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500
                               text-white font-bold text-sm shadow-md hover:shadow-lg transition-all
                               disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {labGenerating ? 'Generating...' : 'Generate Test Ability'}
                  </button>
                </div>

                {/* Results history */}
                {labHistory.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-700 mb-3">Results ({labHistory.length})</h3>
                    <div className="space-y-3">
                      {labHistory.map((result, i) => (
                        <div key={i} className={`rounded-xl border-2 p-4 ${
                          result.error ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500">
                              {result.timestamp} &mdash; {result.params.creatureType} ({result.params.characteristics})
                              &mdash; &#9733;{result.params.starLevel} mag {result.params.magnitude}
                            </span>
                          </div>

                          {result.error && (
                            <p className="text-sm text-red-600 font-medium">{result.error}</p>
                          )}

                          {result.ability && (
                            <div className="bg-white rounded-lg p-3 border border-amber-200">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-display font-bold text-gray-900">{result.ability.name}</span>
                                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                                  Mag {result.ability.magnitude}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">{result.ability.description}</p>
                            </div>
                          )}

                          <details className="mt-2">
                            <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                              Raw response
                            </summary>
                            <pre className="mt-1 text-xs text-gray-600 bg-gray-100 rounded-lg p-2 overflow-x-auto whitespace-pre-wrap">
                              {result.rawResponse || 'No response'}
                            </pre>
                          </details>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
