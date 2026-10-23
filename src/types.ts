export type Track = {
  id: string
  title: string
  artist: string
  album: string
  duration: number // seconds
  source: 'local' | 'soundcloud' | 'spotify' | 'vk' | 'url'
  sourceId?: string
  coverUrl?: string
  audioUrl?: string // remote or blob url
  blobKey?: string // IndexedDB key for offline audio
  addedAt: number
  size?: number
}

export type Playlist = {
  id: string
  name: string
  trackIds: string[]
  createdAt: number
  updatedAt: number
}

export type User = {
  id: string
  email: string
  name: string
  createdAt: number
}

export type SearchProvider = 'soundcloud' | 'spotify' | 'vk' | 'all'

export type SearchResult = {
  id: string
  title: string
  artist: string
  album?: string
  duration?: number
  coverUrl?: string
  source: Track['source']
  playable: boolean
  downloadable: boolean
}
