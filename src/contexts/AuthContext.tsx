import React, { createContext, useContext, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { fetchProfile } from '../services/profileService'
import type { Profile } from '../types/database'

interface AuthContextType {
  session: Session | null
  profile: Profile | null
  loading: boolean
  isBrand: boolean
  isUser: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      if (session?.user?.id) {
        try {
          const p = await Promise.race([
            fetchProfile(session.user.id),
            new Promise<null>((_, reject) =>
              setTimeout(() => reject(new Error('Profile load timeout')), 8000)
            )
          ])
          setProfile(p)
        } catch {
          setProfile(null)
        }
      } else {
        setProfile(null)
      }
      setLoading(false)
    }
    loadSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        setSession(session)
        if (session?.user?.id) {
          try {
            const p = await Promise.race([
              fetchProfile(session.user.id),
              new Promise<null>((_, reject) =>
                setTimeout(() => reject(new Error('Timeout')), 8000)
              )
            ])
            setProfile(p)
          } catch {
            setProfile(null)
          }
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const value: AuthContextType = {
    session,
    profile,
    loading,
    isBrand: profile?.role === 'brand',
    isUser: profile?.role === 'user'
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
