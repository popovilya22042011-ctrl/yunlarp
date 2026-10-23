# yunlarp

Free, offline-first music player. Works on PC and phones (installable PWA). One account, your library everywhere you sign in.

## Features

- Play audio (mp3, wav, ogg, flac, m4a, …)
- Import your own audio files (drag & drop) — stored locally for offline playback
- Search music (demo CC tracks + SoundCloud with your own client_id)
- Playlists
- Offline playback via IndexedDB + Service Worker
- Account (local demo auth; swappable for a real backend)
- Installable PWA (PC + mobile, "Add to Home Screen")

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm run build
npm run preview
```

## SoundCloud (optional)

1. Create an app at https://soundcloud.com/you/apps
2. Copy the client_id
3. Set `VITE_SC_CLIENT_ID=...` in `.env` (or paste in Settings → SoundCloud)
4. Search uses SoundCloud's public API. Tracks are streamed, not downloaded (SoundCloud ToS).

## Spotify / VK

Spotify and VK are exposed as metadata-only providers. Downloading from them violates their Terms of Service and copyright law, so yunlarp does not download from them. Use their official APIs for licensed streaming if you have the rights.

## Cross-device accounts (optional)

The demo auth is local to each browser. For real cross-device sync, replace `src/lib/auth.ts` with a backend (Supabase/Firebase free tier works). Track metadata + playlists sync; audio blobs stay local for offline playback (re-downloaded per device).

## Legal

yunlarp plays music you own or have rights to. Do not use it to pirate copyrighted content.

## Stack

React + Vite + TypeScript + Tailwind + Zustand + idb + vite-plugin-pwa.
