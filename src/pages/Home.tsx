import { useEffect, useState } from 'react'
import { getAllTracks } from '../lib/db'
import { demoProvider } from '../lib/providers'
import { usePlayer } from '../store/usePlayer'
import TrackRow from '../components/TrackRow'
import type { Track } from '../types'
import { Music2, Upload, Search as SearchIcon, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Home({ user }: { user: any }) {
  const [tracks, setTracks] = useState<Track[]>([])
  const [demo, setDemo] = useState<Track[]>([])
  const setQueue = usePlayer(s => s.setQueue)

  useEffect(() => {
    getAllTracks().then(setTracks)
    demoProvider.search('').then(async res => {
      const ts: Track[] = []
      for (const r of res) {
        const t = await demoProvider.resolve(r)
        if (t) ts.push(t)
      }
      setDemo(ts)
    })
  }, [])

  const playAllDemo = () => {
    if (demo.length) setQueue(demo, 0)
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Good to see you, {user.name} 👋</h1>
        <p className="text-muted mt-1">Your personal music, anywhere, even offline.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/search" className="card p-5 hover:bg-white/5 transition flex items-center gap-3">
          <SearchIcon className="text-brand-400" />
          <div>
            <div className="font-medium">Search music</div>
            <div className="text-xs text-muted">Find tracks to play</div>
          </div>
        </Link>
        <Link to="/library" className="card p-5 hover:bg-white/5 transition flex items-center gap-3">
          <Upload className="text-brand-400" />
          <div>
            <div className="font-medium">Import files</div>
            <div className="text-xs text-muted">Add your own music</div>
          </div>
        </Link>
        <button onClick={playAllDemo} className="card p-5 hover:bg-white/5 transition flex items-center gap-3 text-left">
          <Sparkles className="text-brand-400" />
          <div>
            <div className="font-medium">Play demo tracks</div>
            <div className="text-xs text-muted">CC-licensed samples</div>
          </div>
        </button>
      </div>

      {tracks.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Recently added</h2>
          <div className="card p-2">
            {tracks.slice(0, 8).map((t, i) => (
              <TrackRow key={t.id} track={t} index={i} queue={tracks} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Demo tracks</h2>
          <button onClick={playAllDemo} className="text-sm text-brand-400 hover:underline">Play all</button>
        </div>
        <div className="card p-2">
          {demo.map((t, i) => (
            <TrackRow key={t.id} track={t} index={i} queue={demo} />
          ))}
        </div>
      </section>

      {tracks.length === 0 && (
        <div className="card p-8 text-center">
          <Music2 className="mx-auto text-muted mb-3" size={40} />
          <div className="font-medium">Your library is empty</div>
          <p className="text-sm text-muted mt-1">Import audio files or search for music to get started.</p>
          <Link to="/library" className="btn-primary inline-flex mt-4">Go to Library</Link>
        </div>
      )}
    </div>
  )
}
