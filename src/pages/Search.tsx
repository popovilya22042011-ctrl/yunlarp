import { useState, useEffect } from 'react'
import { Search as SearchIcon, Play, Plus, Cloud, AlertCircle } from 'lucide-react'
import { demoProvider, makeSoundCloudProvider } from '../lib/providers'
import { putTrack, saveAudio, kvGet } from '../lib/db'
import { uid } from '../lib/utils'
import { usePlayer } from '../store/usePlayer'
import type { SearchResult, Track } from '../types'

export default function Search() {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [provider, setProvider] = useState<'demo' | 'soundcloud'>('demo')
  const [added, setAdded] = useState<Set<string>>(new Set())
  const [scKey, setScKey] = useState((import.meta as any).env?.VITE_SC_CLIENT_ID || '')
  useEffect(() => { kvGet<string>('sc_client_id').then(v => { if (v) setScKey(v) }) }, [])
  const setQueue = usePlayer(s => s.setQueue)
  const playTrack = usePlayer(s => s.playTrack)

  const run = async () => {
    setLoading(true)
    try {
      const p = provider === 'soundcloud' ? makeSoundCloudProvider(scKey) : demoProvider
      const r = await p.search(q)
      setResults(r)
    } finally {
      setLoading(false)
    }
  }

  const playResult = async (r: SearchResult) => {
    const p = provider === 'soundcloud' ? makeSoundCloudProvider(scKey) : demoProvider
    const t = await p.resolve(r)
    if (t) playTrack(t)
  }

  const playAll = async () => {
    const p = provider === 'soundcloud' ? makeSoundCloudProvider(scKey) : demoProvider
    const ts: Track[] = []
    for (const r of results) {
      const t = await p.resolve(r)
      if (t) ts.push(t)
    }
    if (ts.length) setQueue(ts, 0)
  }

  const addToLibrary = async (r: SearchResult) => {
    const p = provider === 'soundcloud' ? makeSoundCloudProvider(scKey) : demoProvider
    const t = await p.resolve(r)
    if (!t) return
    // download if possible & allowed
    if (t.audioUrl && p.canDownload) {
      try {
        const res = await fetch(t.audioUrl)
        const blob = await res.blob()
        const id = uid()
        const nt: Track = { ...t, id, blobKey: id, addedAt: Date.now() }
        await putTrack(nt)
        await saveAudio(id, blob)
        setAdded(s => new Set(s).add(r.id))
      } catch {
        await putTrack({ ...t, id: uid(), addedAt: Date.now() })
        setAdded(s => new Set(s).add(r.id))
      }
    } else {
      await putTrack({ ...t, id: uid(), addedAt: Date.now() })
      setAdded(s => new Set(s).add(r.id))
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Search</h1>

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && run()}
            placeholder="Search tracks, artists…"
            className="w-full bg-bg-soft border border-border rounded-lg pl-10 pr-3 py-2.5 text-sm outline-none focus:border-brand-500"
          />
        </div>
        <select
          value={provider}
          onChange={e => setProvider(e.target.value as any)}
          className="bg-bg-soft border border-border rounded-lg px-3 py-2.5 text-sm outline-none"
        >
          <option value="demo">Demo (CC)</option>
          <option value="soundcloud">SoundCloud</option>
        </select>
        <button onClick={run} className="btn-primary">Search</button>
      </div>

      {provider === 'soundcloud' && !scKey && (
        <div className="flex items-start gap-2 text-sm text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <div>
            SoundCloud requires a client_id. Set <code>VITE_SC_CLIENT_ID</code> in <code>.env</code>. Without it, search returns nothing.
            SoundCloud tracks are streamed, not downloaded (ToS).
          </div>
        </div>
      )}

      {loading && <div className="text-muted text-sm">Searching…</div>}

      {results.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted">{results.length} results</span>
            <button onClick={playAll} className="text-sm text-brand-400 hover:underline">Play all</button>
          </div>
          <div className="card p-2">
            {results.map(r => (
              <div key={r.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 group">
                <div className="w-10 h-10 rounded bg-brand-600/20 overflow-hidden shrink-0">
                  {r.coverUrl ? <img src={r.coverUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-brand-400">♪</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{r.title}</div>
                  <div className="text-xs text-muted truncate">{r.artist}</div>
                </div>
                <span className="text-xs text-muted">{r.duration ? `${Math.floor(r.duration/60)}:${String(r.duration%60).padStart(2,'0')}` : ''}</span>
                <button onClick={() => playResult(r)} className="p-2 hover:bg-white/10 rounded text-muted hover:text-white"><Play size={16} /></button>
                <button
                  onClick={() => addToLibrary(r)}
                  disabled={added.has(r.id)}
                  className={`p-2 rounded ${added.has(r.id) ? 'text-emerald-400' : 'text-muted hover:text-brand-400 hover:bg-white/10'}`}
                  title="Add to library"
                >
                  <Plus size={16} />
                </button>
                {r.source === 'soundcloud' && <Cloud size={14} className="text-muted" />}
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && results.length === 0 && q && (
        <div className="text-muted text-sm">No results. Try a different query or provider.</div>
      )}
    </div>
  )
}
