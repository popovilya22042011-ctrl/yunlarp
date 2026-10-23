import { useEffect, useState } from 'react'
import { getAllPlaylists, putPlaylist, deletePlaylist, getAllTracks } from '../lib/db'
import { uid } from '../lib/utils'
import TrackRow from '../components/TrackRow'
import type { Playlist, Track } from '../types'
import { Plus, Trash2, Music2, Play } from 'lucide-react'
import { usePlayer } from '../store/usePlayer'

export default function Playlists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [tracks, setTracks] = useState<Track[]>([])
  const [active, setActive] = useState<Playlist | null>(null)
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)
  const setQueue = usePlayer(s => s.setQueue)

  const refresh = async () => {
    setPlaylists(await getAllPlaylists())
    setTracks(await getAllTracks())
  }
  useEffect(() => { refresh() }, [])

  const create = async () => {
    if (!newName.trim()) return
    const p: Playlist = { id: uid(), name: newName.trim(), trackIds: [], createdAt: Date.now(), updatedAt: Date.now() }
    await putPlaylist(p)
    setNewName('')
    await refresh()
    setActive(p)
  }

  const remove = async (id: string) => {
    await deletePlaylist(id)
    if (active?.id === id) setActive(null)
    await refresh()
  }

  const toggleTrack = async (pl: Playlist, trackId: string) => {
    const ids = pl.trackIds.includes(trackId)
      ? pl.trackIds.filter(x => x !== trackId)
      : [...pl.trackIds, trackId]
    const updated = { ...pl, trackIds: ids, updatedAt: Date.now() }
    await putPlaylist(updated)
    setActive(updated)
    await refresh()
  }

  const playPlaylist = (pl: Playlist) => {
    const ts = pl.trackIds.map(id => tracks.find(t => t.id === id)).filter(Boolean) as Track[]
    if (ts.length) setQueue(ts, 0)
  }

  const activeTracks = active ? active.trackIds.map(id => tracks.find(t => t.id === id)).filter(Boolean) as Track[] : []

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Playlists</h1>
      </div>

      <div className="flex gap-2">
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && create()}
          placeholder="New playlist name"
          className="flex-1 bg-bg-soft border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500"
        />
        <button onClick={create} className="btn-primary"><Plus size={16} /> Create</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* playlist list */}
        <div className="card p-2">
          {playlists.length === 0 && <div className="p-4 text-sm text-muted text-center">No playlists yet.</div>}
          {playlists.map(pl => (
            <div
              key={pl.id}
              onClick={() => setActive(pl)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition ${
                active?.id === pl.id ? 'bg-brand-600/20' : 'hover:bg-white/5'
              }`}
            >
              <div className="w-9 h-9 rounded bg-brand-600/20 flex items-center justify-center"><Music2 size={16} className="text-brand-400" /></div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{pl.name}</div>
                <div className="text-xs text-muted">{pl.trackIds.length} tracks</div>
              </div>
              <button onClick={e => { e.stopPropagation(); remove(pl.id) }} className="p-1.5 text-muted hover:text-red-400"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>

        {/* active playlist detail */}
        <div className="lg:col-span-2 card p-4">
          {!active ? (
            <div className="text-center text-muted text-sm py-12">Select a playlist to view.</div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold">{active.name}</h2>
                  <div className="text-xs text-muted">{active.trackIds.length} tracks</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => playPlaylist(active)} className="btn-primary"><Play size={14} /> Play</button>
                  <button onClick={() => setAdding(!adding)} className="btn-ghost">{adding ? 'Done' : 'Add tracks'}</button>
                </div>
              </div>

              {adding && (
                <div className="mb-4 max-h-48 overflow-y-auto scrollbar-thin border border-border rounded-lg p-2">
                  {tracks.map(t => {
                    const inPl = active.trackIds.includes(t.id)
                    return (
                      <div
                        key={t.id}
                        onClick={() => toggleTrack(active, t.id)}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer ${inPl ? 'bg-brand-600/20' : 'hover:bg-white/5'}`}
                      >
                        <div className={`w-4 h-4 rounded border ${inPl ? 'bg-brand-600 border-brand-600' : 'border-border'}`} />
                        <div className="flex-1 min-w-0 text-sm truncate">{t.title}</div>
                        <div className="text-xs text-muted truncate">{t.artist}</div>
                      </div>
                    )
                  })}
                  {tracks.length === 0 && <div className="text-xs text-muted p-2">Library empty.</div>}
                </div>
              )}

              <div className="space-y-1">
                {activeTracks.length === 0 && <div className="text-sm text-muted text-center py-6">No tracks in this playlist yet.</div>}
                {activeTracks.map((t, i) => (
                  <TrackRow key={t.id} track={t} index={i} queue={activeTracks} onRemove={id => toggleTrack(active, id)} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
