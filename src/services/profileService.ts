import { supabase } from '../lib/supabase'
import type { Profile } from '../types/database'

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data as Profile
}

export async function updateProfile(userId: string, updates: Partial<Pick<Profile, 'name'>>) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data as Profile
}
