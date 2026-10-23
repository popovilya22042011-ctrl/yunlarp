import type { SearchResult, Track } from '../types'

export interface MusicProvider {
  id: string
  name: string
  search(query: string): Promise<SearchResult[]>
  // returns a playable/downloadable track handle
  resolve(result: SearchResult): Promise<Track | null>
  canDownload: boolean
}

// Freely usable sample tracks (public domain / CC). Used so the app works out of the box.
const DEMO_TRACKS: SearchResult[] = [
  { id: 'demo-1', title: 'Acoustic Breeze', artist: 'Benjamin Tissot', album: 'Bensound', duration: 159, coverUrl: 'https://www.bensound.com/bensound-img/acousticbreeze.jpg', source: 'url', playable: true, downloadable: true },
  { id: 'demo-2', title: 'Creative Minds', artist: 'Benjamin Tissot', album: 'Bensound', duration: 146, coverUrl: 'https://www.bensound.com/bensound-img/creativeminds.jpg', source: 'url', playable: true, downloadable: true },
  { id: 'demo-3', title: 'Sunny', artist: 'Benjamin Tissot', album: 'Bensound', duration: 132, coverUrl: 'https://www.bensound.com/bensound-img/sunny.jpg', source: 'url', playable: true, downloadable: true },
  { id: 'demo-4', title: 'Ukulele', artist: 'Benjamin Tissot', album: 'Bensound', duration: 134, coverUrl: 'https://www.bensound.com/bensound-img/ukulele.jpg', source: 'url', playable: true, downloadable: true },
  { id: 'demo-5', title: 'Happy Rock', artist: 'Benjamin Tissot', album: 'Bensound', duration: 98, coverUrl: 'https://www.bensound.com/bensound-img/happyrock.jpg', source: 'url', playable: true, downloadable: true },
]

const DEMO_URLS: Record<string, string> = {
  'demo-1': 'https://www.bensound.com/bensound-music/bensound-acousticbreeze.mp3',
  'demo-2': 'https://www.bensound.com/bensound-music/bensound-creativeminds.mp3',
  'demo-3': 'https://www.bensound.com/bensound-music/bensound-sunny.mp3',
  'demo-4': 'https://www.bensound.com/bensound-music/bensound-ukulele.mp3',
  'demo-5': 'https://www.bensound.com/bensound-music/bensound-happyrock.mp3',
}

export const demoProvider: MusicProvider = {
  id: 'demo',
  name: 'Demo (CC music)',
  canDownload: true,
  async search(q: string) {
    if (!q.trim()) return DEMO_TRACKS
    const l = q.toLowerCase()
    return DEMO_TRACKS.filter(t => t.title.toLowerCase().includes(l) || t.artist.toLowerCase().includes(l))
  },
  async resolve(r) {
    const url = DEMO_URLS[r.id]
    if (!url) return null
    return {
      id: r.id,
      title: r.title,
      artist: r.artist,
      album: r.album ?? '',
      duration: r.duration ?? 0,
      source: 'url',
      coverUrl: r.coverUrl,
      audioUrl: url,
      addedAt: Date.now(),
    }
  },
}

// SoundCloud: requires a client_id. We expose search only if key present.
export function makeSoundCloudProvider(clientId: string): MusicProvider {
  return {
    id: 'soundcloud',
    name: 'SoundCloud',
    canDownload: false, // SC ToS: no bulk download; stream only
    async search(q) {
      if (!clientId) return []
      const url = `https://api.soundcloud.com/tracks?q=${encodeURIComponent(q)}&client_id=${clientId}&limit=20`
      const res = await fetch(url)
      if (!res.ok) return []
      const data = await res.json()
      return (data || []).map((t: any) => ({
        id: `sc-${t.id}`,
        title: t.title,
        artist: t.user?.username ?? 'Unknown',
        album: '',
        duration: Math.round((t.duration ?? 0) / 1000),
        coverUrl: t.artwork_url?.replace('large', 't500x500'),
        source: 'soundcloud' as const,
        playable: !!t.stream_url || !!t.permalink_url,
        downloadable: false,
      }))
    },
    async resolve(r) {
      // streaming url requires client_id; not a downloadable file
      return {
        id: r.id,
        title: r.title,
        artist: r.artist,
        album: r.album ?? '',
        duration: r.duration ?? 0,
        source: 'soundcloud',
        coverUrl: r.coverUrl,
        audioUrl: undefined,
        addedAt: Date.now(),
      }
    },
  }
}

// Spotify & VK: official APIs exist but downloading is not permitted.
// We expose them as "info only" providers (search metadata, no audio).
export const spotifyProvider: MusicProvider = {
  id: 'spotify',
  name: 'Spotify (metadata only)',
  canDownload: false,
  async search() {
    // Requires Spotify Web API OAuth + Premium for playback; no download.
    return []
  },
  async resolve() { return null },
}

export const vkProvider: MusicProvider = {
  id: 'vk',
  name: 'VK Music (metadata only)',
  canDownload: false,
  async search() {
    // VK API access is restricted; downloading violates ToS.
    return []
  },
  async resolve() { return null },
}

export const PROVIDERS = {
  demo: demoProvider,
  soundcloud: null as MusicProvider | null, // set at runtime with key
  spotify: spotifyProvider,
  vk: vkProvider,
}
