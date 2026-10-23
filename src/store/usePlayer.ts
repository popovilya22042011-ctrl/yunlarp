import { create } from 'zustand'
import type { Track } from '../types'

type RepeatMode = 'off' | 'all' | 'one'

interface PlayerState {
  queue: Track[]
  currentIndex: number
  current: Track | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  muted: boolean
  shuffle: boolean
  repeat: RepeatMode
  // actions
  setQueue: (tracks: Track[], startIndex?: number) => void
  playTrack: (track: Track, queue?: Track[]) => void
  togglePlay: () => void
  play: () => void
  pause: () => void
  next: () => void
  prev: () => void
  seek: (t: number) => void
  setVolume: (v: number) => void
  toggleMute: () => void
  toggleShuffle: () => void
  cycleRepeat: () => void
  setCurrentTime: (t: number) => void
  setDuration: (d: number) => void
  setIsPlaying: (b: boolean) => void
  removeFromQueue: (index: number) => void
  clearQueue: () => void
}

export const usePlayer = create<PlayerState>((set, get) => ({
  queue: [],
  currentIndex: -1,
  current: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  muted: false,
  shuffle: false,
  repeat: 'off',

  setQueue: (tracks, startIndex = 0) => {
    set({ queue: tracks, currentIndex: startIndex, current: tracks[startIndex] ?? null })
  },
  playTrack: (track, queue) => {
    if (queue) {
      const idx = queue.findIndex(t => t.id === track.id)
      set({ queue, currentIndex: idx >= 0 ? idx : 0, current: track })
    } else {
      const q = get().queue
      const idx = q.findIndex(t => t.id === track.id)
      if (idx >= 0) set({ currentIndex: idx, current: track })
      else set({ queue: [...q, track], currentIndex: q.length, current: track })
    }
  },
  togglePlay: () => set(s => ({ isPlaying: !s.isPlaying })),
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  next: () => {
    const s = get()
    if (!s.queue.length) return
    let nextIdx = s.currentIndex + 1
    if (s.shuffle) {
      nextIdx = Math.floor(Math.random() * s.queue.length)
    }
    if (nextIdx >= s.queue.length) {
      if (s.repeat === 'all') nextIdx = 0
      else { set({ isPlaying: false }); return }
    }
    set({ currentIndex: nextIdx, current: s.queue[nextIdx], currentTime: 0 })
  },
  prev: () => {
    const s = get()
    if (!s.queue.length) return
    if (s.currentTime > 3) { set({ currentTime: 0 }); return }
    let prevIdx = s.currentIndex - 1
    if (prevIdx < 0) {
      if (s.repeat === 'all') prevIdx = s.queue.length - 1
      else prevIdx = 0
    }
    set({ currentIndex: prevIdx, current: s.queue[prevIdx], currentTime: 0 })
  },
  seek: (t) => set({ currentTime: t }),
  setVolume: (v) => set({ volume: Math.max(0, Math.min(1, v)) }),
  toggleMute: () => set(s => ({ muted: !s.muted })),
  toggleShuffle: () => set(s => ({ shuffle: !s.shuffle })),
  cycleRepeat: () => set(s => ({ repeat: s.repeat === 'off' ? 'all' : s.repeat === 'all' ? 'one' : 'off' })),
  setCurrentTime: (t) => set({ currentTime: t }),
  setDuration: (d) => set({ duration: d }),
  setIsPlaying: (b) => set({ isPlaying: b }),
  removeFromQueue: (index) => {
    const s = get()
    const q = s.queue.filter((_, i) => i !== index)
    let ci = s.currentIndex
    if (index < ci) ci -= 1
    if (ci >= q.length) ci = q.length - 1
    set({ queue: q, currentIndex: ci, current: q[ci] ?? null })
  },
  clearQueue: () => set({ queue: [], currentIndex: -1, current: null, isPlaying: false, currentTime: 0 }),
}))
