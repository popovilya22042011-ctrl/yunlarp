import { useState, useEffect } from 'react'
import { kvGet, kvSet } from '../lib/db'
import { formatBytes } from '../lib/utils'
import { Settings as SettingsIcon, Trash2, HardDrive } from 'lucide-react'
import type { User } from '../types'

export default function Settings({ user }: { user: User }) {
  const [scKey, setScKey] = useState('')
  const [saved, setSaved] = useState(false)
  const [storageEst, setStorageEst] = useState<{ used: number; quota: number } | null>(null)

  useEffect(() => {
    kvGet<string>('sc_client_id').then(v => { if (v) setScKey(v) })
    if (navigator.storage?.estimate) {
      navigator.storage.estimate().then(e => setStorageEst({ used: e.usage ?? 0, quota: e.quota ?? 0 }))
    }
  }, [])

  const saveKey = async () => {
    await kvSet('sc_client_id', scKey.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const clearAll = async () => {
    if (!confirm('Delete all local data (tracks, audio, playlists, settings)?')) return
    const db = await (await import('../lib/db')).getDb()
    for (const name of ['tracks', 'audio', 'playlists', 'kv']) {
      try { await db.clear(name as any) } catch {}
    }
    alert('Cleared. Reload the page.')
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Settings</h1>

      <section className="card p-5 space-y-3">
        <h2 className="font-semibold flex items-center gap-2"><SettingsIcon size={16} /> Account</h2>
        <div className="text-sm"><span className="text-muted">Name:</span> {user.name}</div>
        <div className="text-sm"><span className="text-muted">Email:</span> {user.email}</div>
      </section>

      <section className="card p-5 space-y-3">
        <h2 className="font-semibold">SoundCloud integration</h2>
        <p className="text-xs text-muted">
          SoundCloud requires a client_id for search. Get one at soundcloud.com/you/apps. Tracks are streamed, not downloaded (ToS).
        </p>
        <div className="flex gap-2">
          <input
            value={scKey}
            onChange={e => setScKey(e.target.value)}
            placeholder="SoundCloud client_id"
            className="flex-1 bg-bg-soft border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
          <button onClick={saveKey} className="btn-primary">{saved ? 'Saved ✓' : 'Save'}</button>
        </div>
      </section>

      <section className="card p-5 space-y-3">
        <h2 className="font-semibold flex items-center gap-2"><HardDrive size={16} /> Storage</h2>
        {storageEst ? (
          <div className="text-sm">
            <div className="text-muted">Used: {formatBytes(storageEst.used)} / {formatBytes(storageEst.quota)}</div>
            <div className="mt-2 h-2 bg-bg-soft rounded-full overflow-hidden">
              <div className="h-full bg-brand-500" style={{ width: `${(storageEst.used / storageEst.quota) * 100}%` }} />
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted">Estimate unavailable.</div>
        )}
      </section>

      <section className="card p-5 space-y-3 border-red-500/30">
        <h2 className="font-semibold text-red-400 flex items-center gap-2"><Trash2 size={16} /> Danger zone</h2>
        <p className="text-xs text-muted">Deletes all tracks, audio, playlists and settings from this browser.</p>
        <button onClick={clearAll} className="btn-danger">Clear all data</button>
      </section>

      <section className="card p-5 space-y-2 text-xs text-muted">
        <h2 className="font-semibold text-white text-sm">Legal note</h2>
        <p>
          yunlarp plays music you own or have rights to. Downloading copyrighted content from Spotify, SoundCloud, VK or other services without authorization may violate their Terms of Service and copyright law. Use official APIs and respect licensing.
        </p>
      </section>
    </div>
  )
}
