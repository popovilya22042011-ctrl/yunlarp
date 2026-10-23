import { Play, Pause, Trash2, MoreHorizontal } from 'lucide-react'
import { usePlayer } from '../store/usePlayer'
import { hasAudio } from '../lib/db'
import { formatTime } from '../lib/utils'
import type { Track } from '../types'
import { useEffect, useState } from 'react'

export default function TrackRow({
  track,
  index,
  queue,
  onRemove,
  showIndex = false,
}: {
  track: Track
  index?: number
  queue?: Track[]
  onRemove?: (id: string) => void
  showIndex?: boolean
}) {
  const current = usePlayer(s => s.current)
  const isPlaying = usePlayer(s => s.isPlaying)
  const playTrack = usePlayer(s => s.playTrack)
  const togglePlay = usePlayer(s => s.togglePlay)
  const isActive = current?.id === track.id
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    hasAudio(track.id).then(setOffline)
  }, [track.id])

  const handlePlay = () => {
    if (isActive) togglePlay()
    else playTrack(track, queue)
  }

  return (
    <div
      className={`group flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition ${
        isActive ? 'bg-brand-600/10' : ''
      }`}
    >
      {showIndex && (
        <div className="w-6 text-center text-xs text-muted">{index !== undefined ? index + 1 : ''}</div>
      )}
      <button onClick={handlePlay} className="w-9 h-9 rounded-full bg-brand-600/20 hover:bg-brand-600/40 flex items-center justify-center shrink-0 transition">
        {isActive && isPlaying ? <Pause size={16} className="text-brand-300" /> : <Play size={16} className="text-brand-300 ml-0.5" />}
      </button>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium truncate ${isActive ? 'text-brand-300' : ''}`}>{track.title}</div>
        <div className="text-xs text-muted truncate">{track.artist}{track.album ? ` · ${track.album}` : ''}</div>
      </div>
      <div className="text-xs text-muted tabular-nums w-12 text-right">{formatTime(track.duration)}</div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
        {offline && <span title="Available offline" className="text-emerald-400 text-xs">●</span>}
        {onRemove && (
          <button onClick={() => onRemove(track.id)} className="p-1.5 hover:bg-white/10 rounded text-muted hover:text-red-400">
            <Trash2 size={14} />
          </button>
        )}
        <button className="p-1.5 hover:bg-white/10 rounded text-muted">
          <MoreHorizontal size={14} />
        </button>
      </div>
    </div>
  )
}
