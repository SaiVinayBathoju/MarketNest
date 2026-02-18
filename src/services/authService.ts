import { supabase } from '../lib/supabase'
import type { UserRole } from '../types/database'

export interface SignUpData {
  email: string
  password: string
  name: string
  role: UserRole
}

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  name: string
}

export async function signUp({ email, password, name, role }: SignUpData) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role }
    }
  })
  if (error) throw error
  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  await supabase.auth.signOut({ scope: 'local' })
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export function onAuthStateChange(callback: (event: string, session: unknown) => void) {
  return supabase.auth.onAuthStateChange(callback)
}
