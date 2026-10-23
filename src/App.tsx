import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { getSessionUser, logout } from './lib/auth'
import type { User } from './types'
import Sidebar from './components/Sidebar'
import PlayerBar from './components/PlayerBar'
import Login from './pages/Login'
import Home from './pages/Home'
import Library from './pages/Library'
import Search from './pages/Search'
import Playlists from './pages/Playlists'
import Settings from './pages/Settings'

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSessionUser().then(u => { setUser(u); setLoading(false) })
  }, [])

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#0f0f14]">
        <div className="text-brand-400 text-xl animate-pulse">yunlarp loading…</div>
      </div>
    )
  }

  if (!user) {
    return <Login onAuth={setUser} />
  }

  return (
    <div className="h-full w-full flex flex-col bg-[#0f0f14]">
      <div className="flex-1 flex overflow-hidden">
        <Sidebar user={user} onLogout={async () => { await logout(); setUser(null) }} />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/search" element={<Search />} />
            <Route path="/library" element={<Library />} />
            <Route path="/playlists" element={<Playlists />} />
            <Route path="/settings" element={<Settings user={user} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      <PlayerBar />
    </div>
  )
}
