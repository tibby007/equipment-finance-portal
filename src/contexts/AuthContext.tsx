'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { AuthUser, getCurrentUser } from '@/lib/auth'

interface AuthContextType {
  user: User | null
  authUser: AuthUser | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!isMounted) return

      if (error) {
        console.error('AuthContext: Error getting initial session:', error)
        setLoading(false)
        return
      }

      console.log('AuthContext: Initial session loaded', session?.user?.email)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadAuthUser()
      } else {
        setLoading(false)
      }
    }).catch(error => {
      if (!isMounted) return
      console.error('AuthContext: Unexpected error getting initial session:', error)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return

        // Don't trigger on token refresh events
        if (event === 'TOKEN_REFRESHED') return

        setUser(session?.user ?? null)

        if (session?.user) {
          await loadAuthUser()
        } else {
          setAuthUser(null)
          setLoading(false)
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const loadAuthUser = async () => {
    try {
      console.log('AuthContext: Loading auth user...')
      const currentUser = await getCurrentUser()
      console.log('AuthContext: Auth user loaded', currentUser?.email, currentUser?.userType)
      setAuthUser(currentUser)
    } catch (error) {
      console.error('AuthContext: Error loading auth user:', error)
      setAuthUser(null)
    } finally {
      console.log('AuthContext: Loading complete, setting loading = false')
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      // Clear state immediately
      setUser(null)
      setAuthUser(null)

      // Clear local storage
      localStorage.clear()

      // Force redirect to home
      window.location.href = '/'
    } catch (error) {
      console.error('Error signing out:', error)
      alert('Error signing out. Please try again.')
    }
  }

  const value = {
    user,
    authUser,
    loading,
    signOut: handleSignOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}