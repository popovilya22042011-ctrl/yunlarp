import { NavLink } from 'react-router-dom'
import { Home, Search, Library, ListMusic, Settings, LogOut, Music2 } from 'lucide-react'
import type { User } from '../types'

const nav = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/library', label: 'Library', icon: Library },
  { to: '/playlists', label: 'Playlists', icon: ListMusic },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ user, onLogout }: { user: User; onLogout: () => void }) {
  return (
    <aside className="w-60 shrink-0 bg-[#0b0b12] border-r border-border flex flex-col">
      <div className="px-5 py-6 flex items-center gap-2">
        <Music2 className="text-brand-400" size={26} />
        <span className="text-xl font-bold tracking-tight">yunlarp</span>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive ? 'bg-brand-600/20 text-brand-300' : 'text-muted hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center text-sm font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{user.name}</div>
            <div className="text-xs text-muted truncate">{user.email}</div>
          </div>
        </div>
        <button onClick={onLogout} className="btn-ghost w-full justify-start text-sm text-muted hover:text-white">
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </aside>
  )
}
