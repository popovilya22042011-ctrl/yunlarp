import { useEffect, useRef } from 'react'
import { usePlayer } from '../store/usePlayer'
import { getAudio } from '../lib/db'
import type { Track } from '../types'

function resolveSrc(track: Track): string | null {
  if (track.blobKey) return null // handled async
  if (track.audioUrl) return track.audioUrl
  return null
}

export function AudioEngine() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const current = usePlayer(s => s.current)
  const isPlaying = usePlayer(s => s.isPlaying)
  const volume = usePlayer(s => s.volume)
  const muted = usePlayer(s => s.muted)
  const seekTime = usePlayer(s => s.currentTime)
  const setCT = usePlayer(s => s.setCurrentTime)
  const setDur = usePlayer(s => s.setDuration)
  const setIsPlaying = usePlayer(s => s.setIsPlaying)
  const next = usePlayer(s => s.next)

  // create audio element once
  useEffect(() => {
    const a = new Audio()
    a.preload = 'auto'
    audioRef.current = a
    const onTime = () => setCT(a.currentTime)
    const onDur = () => setDur(a.duration || 0)
    const onEnd = () => {
      const repeat = usePlayer.getState().repeat
      if (repeat === 'one') {
        a.currentTime = 0
        a.play().catch(() => {})
      } else {
        next()
      }
    }
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    a.addEventListener('timeupdate', onTime)
    a.addEventListener('loadedmetadata', onDur)
    a.addEventListener('ended', onEnd)
    a.addEventListener('play', onPlay)
    a.addEventListener('pause', onPause)
    return () => {
      a.pause()
      a.removeEventListener('timeupdate', onTime)
      a.removeEventListener('loadedmetadata', onDur)
      a.removeEventListener('ended', onEnd)
      a.removeEventListener('play', onPlay)
      a.removeEventListener('pause', onPause)
      audioRef.current = null
    }
  }, [setCT, setDur, setIsPlaying, next])

  // load source when current changes
  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    if (!current) { a.pause(); a.src = ''; return }
    let cancelled = false
    ;(async () => {
      let src: string | null = resolveSrc(current)
      if (current.blobKey || current.id) {
        // try offline blob
        try {
          const blob = await getAudio(current.id)
          if (blob && !cancelled) {
            src = URL.createObjectURL(blob)
          }
        } catch {}
      }
      if (cancelled) return
      if (src) {
        if (a.src !== src) {
          a.src = src
          a.load()
        }
        if (isPlaying) a.play().catch(() => {})
      }
    })()
    return () => { cancelled = true }
  }, [current])

  // play/pause sync
  useEffect(() => {
    const a = audioRef.current
    if (!a || !a.src) return
    if (isPlaying) a.play().catch(() => setIsPlaying(false))
    else a.pause()
  }, [isPlaying, setIsPlaying])

  // volume/mute
  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    a.volume = muted ? 0 : volume
  }, [volume, muted])

  // seek (only when large diff to avoid loops)
  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    if (Math.abs(a.currentTime - seekTime) > 1.2) {
      a.currentTime = seekTime
    }
  }, [seekTime])

  return null
}
