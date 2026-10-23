import { useState } from 'react'
import { Music2 } from 'lucide-react'
import { login, register } from '../lib/auth'
import type { User } from '../types'

export default function Login({ onAuth }: { onAuth: (u: User) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const u = mode === 'login'
        ? await login(email, password)
        : await register(email, password, name)
      onAuth(u)
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="h-full w-full flex items-center justify-center bg-[#0f0f14] p-4">
      <div className="w-full max-w-md card p-8">
        <div className="flex items-center gap-2 mb-6">
          <Music2 className="text-brand-400" size={28} />
          <span className="text-2xl font-bold">yunlarp</span>
        </div>
        <h1 className="text-xl font-semibold mb-1">{mode === 'login' ? 'Welcome back' : 'Create account'}</h1>
        <p className="text-sm text-muted mb-6">
          {mode === 'login' ? 'Sign in to your library.' : 'One account, all your devices.'}
        </p>
        <form onSubmit={submit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="text-xs text-muted block mb-1">Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="w-full bg-bg-soft border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500" />
            </div>
          )}
          <div>
            <label className="text-xs text-muted block mb-1">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full bg-bg-soft border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500" />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-bg-soft border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500" />
          </div>
          {error && <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{error}</div>}
          <button disabled={busy} className="btn-primary w-full">{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
        </form>
        <div className="mt-4 text-sm text-muted text-center">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-brand-400 hover:underline">
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </div>
        <p className="mt-6 text-xs text-muted/70 text-center">
          Demo app: account is stored locally in your browser. For cross-device sync, connect a backend.
        </p>
      </div>
    </div>
  )
}
