import { useEffect, useState, useRef, useCallback } from 'react'
import { getAllTracks, putTrack, deleteTrack, saveAudio } from '../lib/db'
import { uid } from '../lib/utils'
import TrackRow from '../components/TrackRow'
import type { Track } from '../types'
import { Upload, FolderOpen, Download } from 'lucide-react'

const AUDIO_EXTS = ['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac', '.opus', '.webm']

export default function Library() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [dragging, setDragging] = useState(false)
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const refresh = useCallback(async () => {
    setTracks(await getAllTracks())
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const importFiles = async (files: FileList | File[]) => {
    setImporting(true)
    const arr = Array.from(files)
    for (const f of arr) {
      const ext = f.name.toLowerCase().slice(f.name.lastIndexOf('.'))
      if (!AUDIO_EXTS.includes(ext)) continue
      const id = uid()
      // read metadata via audio element
      const url = URL.createObjectURL(f)
      const dur = await getDuration(url)
      URL.revokeObjectURL(url)
      const track: Track = {
        id,
        title: f.name.replace(/\.[^.]+$/, ''),
        artist: 'Unknown',
        album: '',
        duration: dur,
        source: 'local',
        blobKey: id,
        addedAt: Date.now(),
        size: f.size,
      }
      await putTrack(track)
      await saveAudio(id, f)
    }
    await refresh()
    setImporting(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files?.length) importFiles(e.dataTransfer.files)
  }

  const handleRemove = async (id: string) => {
    await deleteTrack(id)
    await refresh()
  }

  const downloadRemote = async (t: Track) => {
    if (!t.audioUrl) return
    try {
      const res = await fetch(t.audioUrl)
      const blob = await res.blob()
      await saveAudio(t.id, blob)
      await putTrack({ ...t, blobKey: t.id })
      await refresh()
    } catch (e) {
      alert('Download failed: ' + (e as Error).message)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Library</h1>
        <span className="text-sm text-muted">{tracks.length} tracks</span>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
          dragging ? 'border-brand-500 bg-brand-500/10' : 'border-border hover:border-brand-500/50'
        }`}
      >
        <Upload className="mx-auto text-brand-400 mb-2" size={32} />
        <div className="font-medium">{importing ? 'Importing…' : 'Drop audio files here'}</div>
        <div className="text-xs text-muted mt-1">or click to browse · mp3, wav, ogg, flac, m4a…</div>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          multiple
          className="hidden"
          onChange={e => e.target.files && importFiles(e.target.files)}
        />
      </div>

      {/* Track list */}
      {tracks.length === 0 ? (
        <div className="card p-8 text-center text-muted text-sm">No tracks yet. Import some audio files above.</div>
      ) : (
        <div className="card p-2">
          {tracks.map((t, i) => (
            <div key={t.id} className="flex items-center">
              <div className="flex-1">
                <TrackRow track={t} index={i} queue={tracks} onRemove={handleRemove} />
              </div>
              {t.source !== 'local' && !t.blobKey && t.audioUrl && (
                <button onClick={() => downloadRemote(t)} className="mr-2 p-2 text-muted hover:text-brand-400" title="Download for offline">
                  <Download size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="text-xs text-muted">
        <FolderOpen size={12} className="inline mr-1" />
        Files are stored in your browser (IndexedDB) for offline playback. Clearing browser data removes them.
      </div>
    </div>
  )
}

function getDuration(url: string): Promise<number> {
  return new Promise(resolve => {
    const a = new Audio()
    a.preload = 'metadata'
    a.onloadedmetadata = () => { resolve(isFinite(a.duration) ? a.duration : 0); URL.revokeObjectURL(url) }
    a.onerror = () => resolve(0)
    a.src = url
  })
}
