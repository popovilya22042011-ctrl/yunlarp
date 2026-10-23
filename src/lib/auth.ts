import { kvGet, kvSet } from './db'
import type { User } from '../types'
import { v4 as uuid } from 'uuid'

const SESSION_KEY = 'yunlarp_session'
const USERS_KEY = 'yunlarp_users'

type StoredUser = User & { passwordHash: string }

async function getUsers(): Promise<StoredUser[]> {
  return (await kvGet<StoredUser[]>(USERS_KEY)) ?? []
}
async function saveUsers(u: StoredUser[]): Promise<void> {
  await kvSet(USERS_KEY, u)
}

// simple hash (not cryptographically secure; fine for local demo)
async function hash(pw: string): Promise<string> {
  const enc = new TextEncoder().encode(pw + '::yunlarp')
  const buf = await crypto.subtle.digest('SHA-256', enc)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function register(email: string, password: string, name: string): Promise<User> {
  const users = await getUsers()
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('Email already registered')
  }
  const user: StoredUser = {
    id: uuid(),
    email,
    name: name || email.split('@')[0],
    createdAt: Date.now(),
    passwordHash: await hash(password),
  }
  users.push(user)
  await saveUsers(users)
  await setSession(user.id)
  const { passwordHash, ...pub } = user
  return pub
}

export async function login(email: string, password: string): Promise<User> {
  const users = await getUsers()
  const u = users.find(x => x.email.toLowerCase() === email.toLowerCase())
  if (!u) throw new Error('No account with that email')
  if (u.passwordHash !== await hash(password)) throw new Error('Wrong password')
  await setSession(u.id)
  const { passwordHash, ...pub } = u
  return pub
}

export async function logout(): Promise<void> {
  localStorage.removeItem(SESSION_KEY)
}

export async function getSessionUser(): Promise<User | null> {
  const id = localStorage.getItem(SESSION_KEY)
  if (!id) return null
  const users = await getUsers()
  const u = users.find(x => x.id === id)
  if (!u) return null
  const { passwordHash, ...pub } = u
  return pub
}

async function setSession(id: string) {
  localStorage.setItem(SESSION_KEY, id)
}

export function isAuthed(): boolean {
  return !!localStorage.getItem(SESSION_KEY)
}
