'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'

type UserRole = 'admin' | 'basic'

type AuthContextValue = {
  user: User | null
  role: UserRole
  isAdmin: boolean
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const role = useMemo<UserRole>(() => {
    const appMeta = user?.app_metadata as Record<string, unknown> | undefined
    const userMeta = user?.user_metadata as Record<string, unknown> | undefined
    const derivedRole =
      appMeta?.role === 'admin' || userMeta?.role === 'admin'
        ? 'admin'
        : 'basic'
    return derivedRole
  }, [user])

  const isAdmin = role === 'admin'

  const syncSession = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    setUser(session?.user ?? null)
    setLoading(false)
  }, [])

  useEffect(() => {
    syncSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [syncSession])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      throw error
    }
    await syncSession()
  }, [syncSession])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
    setUser(null)
  }, [])

  const value: AuthContextValue = {
    user,
    role,
    isAdmin,
    loading,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
