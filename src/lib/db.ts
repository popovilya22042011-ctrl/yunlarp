import { openDB, type IDBPDatabase } from 'idb'
import type { Track, Playlist } from '../types'

const DB_NAME = 'yunlarp'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase> | null = null

export function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('tracks')) {
          const s = db.createObjectStore('tracks', { keyPath: 'id' })
          s.createIndex('by-added', 'addedAt')
          s.createIndex('by-source', 'source')
        }
        if (!db.objectStoreNames.contains('audio')) {
          db.createObjectStore('audio') // key: trackId, value: Blob
        }
        if (!db.objectStoreNames.contains('playlists')) {
          db.createObjectStore('playlists', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('kv')) {
          db.createObjectStore('kv')
        }
      },
    })
  }
  return dbPromise
}

// Tracks
export async function getAllTracks(): Promise<Track[]> {
  const db = await getDb()
  return db.getAll('tracks')
}
export async function getTrack(id: string): Promise<Track | undefined> {
  const db = await getDb()
  return db.get('tracks', id)
}
export async function putTrack(t: Track): Promise<void> {
  const db = await getDb()
  await db.put('tracks', t)
}
export async function deleteTrack(id: string): Promise<void> {
  const db = await getDb()
  await db.delete('tracks', id)
  await db.delete('audio', id)
}

// Audio blobs
export async function saveAudio(id: string, blob: Blob): Promise<void> {
  const db = await getDb()
  await db.put('audio', blob, id)
}
export async function getAudio(id: string): Promise<Blob | undefined> {
  const db = await getDb()
  return db.get('audio', id)
}
export async function hasAudio(id: string): Promise<boolean> {
  const db = await getDb()
  const k = await db.getKey('audio', id)
  return k !== undefined
}
export async function deleteAudio(id: string): Promise<void> {
  const db = await getDb()
  await db.delete('audio', id)
}

// Playlists
export async function getAllPlaylists(): Promise<Playlist[]> {
  const db = await getDb()
  return db.getAll('playlists')
}
export async function putPlaylist(p: Playlist): Promise<void> {
  const db = await getDb()
  await db.put('playlists', p)
}
export async function deletePlaylist(id: string): Promise<void> {
  const db = await getDb()
  await db.delete('playlists', id)
}

// KV
export async function kvGet<T = any>(key: string): Promise<T | undefined> {
  const db = await getDb()
  return db.get('kv', key)
}
export async function kvSet(key: string, value: any): Promise<void> {
  const db = await getDb()
  await db.put('kv', value, key)
}
export async function kvDel(key: string): Promise<void> {
  const db = await getDb()
  await db.delete('kv', key)
}
