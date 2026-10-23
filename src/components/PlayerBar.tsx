import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Repeat1, Shuffle, Heart } from 'lucide-react'
import { usePlayer } from '../store/usePlayer'
import { formatTime } from '../lib/utils'

export default function PlayerBar() {
  const current = usePlayer(s => s.current)
  const isPlaying = usePlayer(s => s.isPlaying)
  const currentTime = usePlayer(s => s.currentTime)
  const duration = usePlayer(s => s.duration)
  const volume = usePlayer(s => s.volume)
  const muted = usePlayer(s => s.muted)
  const shuffle = usePlayer(s => s.shuffle)
  const repeat = usePlayer(s => s.repeat)
  const togglePlay = usePlayer(s => s.togglePlay)
  const next = usePlayer(s => s.next)
  const prev = usePlayer(s => s.prev)
  const seek = usePlayer(s => s.seek)
  const setVolume = usePlayer(s => s.setVolume)
  const toggleMute = usePlayer(s => s.toggleMute)
  const toggleShuffle = usePlayer(s => s.toggleShuffle)
  const cycleRepeat = usePlayer(s => s.cycleRepeat)

  if (!current) {
    return (
      <div className="h-20 bg-[#0b0b12] border-t border-border flex items-center justify-center text-muted text-sm">
        Nothing playing — pick a track
      </div>
    )
  }

  return (
    <div className="h-24 bg-[#0b0b12] border-t border-border px-4 flex items-center gap-4">
      {/* track info */}
      <div className="flex items-center gap-3 w-64 min-w-0">
        <div className="w-12 h-12 rounded bg-brand-600/20 flex items-center justify-center shrink-0 overflow-hidden">
          {current.coverUrl ? <img src={current.coverUrl} alt="" className="w-full h-full object-cover" /> : <MusicIcon />}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">{current.title}</div>
          <div className="text-xs text-muted truncate">{current.artist}</div>
        </div>
        <button className="text-muted hover:text-pink-400 ml-auto shrink-0"><Heart size={16} /></button>
      </div>

      {/* controls */}
      <div className="flex-1 flex flex-col items-center gap-1.5">
        <div className="flex items-center gap-3">
          <button onClick={toggleShuffle} className={`p-1.5 rounded hover:bg-white/10 ${shuffle ? 'text-brand-400' : 'text-muted'}`}><Shuffle size={16} /></button>
          <button onClick={prev} className="p-1.5 rounded hover:bg-white/10 text-white"><SkipBack size={18} /></button>
          <button onClick={togglePlay} className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition">
            {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
          </button>
          <button onClick={next} className="p-1.5 rounded hover:bg-white/10 text-white"><SkipForward size={18} /></button>
          <button onClick={cycleRepeat} className={`p-1.5 rounded hover:bg-white/10 ${repeat !== 'off' ? 'text-brand-400' : 'text-muted'}`}>
            {repeat === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
          </button>
        </div>
        <div className="w-full flex items-center gap-2 text-xs text-muted">
          <span className="tabular-nums w-10 text-right">{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={e => seek(parseFloat(e.target.value))}
            className="flex-1 accent-brand-500 h-1"
          />
          <span className="tabular-nums w-10">{formatTime(duration)}</span>
        </div>
      </div>

      {/* volume */}
      <div className="flex items-center gap-2 w-40 justify-end">
        <button onClick={toggleMute} className="text-muted hover:text-white">
          {muted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={muted ? 0 : volume}
          onChange={e => setVolume(parseFloat(e.target.value))}
          className="w-24 accent-brand-500 h-1"
        />
      </div>
    </div>
  )
}

function MusicIcon() {
  return <span className="text-brand-400 text-lg">♪</span>
}
