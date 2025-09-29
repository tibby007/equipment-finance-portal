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
    console.log('AuthContext: Initializing auth state')

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('AuthContext: Initial session check', { session: !!session, error })

      if (error) {
        console.error('AuthContext: Error getting initial session:', error)
        setLoading(false)
        return
      }

      setUser(session?.user ?? null)
      if (session?.user) {
        console.log('AuthContext: Loading auth user for initial session')
        loadAuthUser()
      } else {
        console.log('AuthContext: No initial session, setting loading to false')
        setLoading(false)
      }
    }).catch(error => {
      console.error('AuthContext: Unexpected error getting initial session:', error)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthContext: Auth state changed', { event, session: !!session })

        setUser(session?.user ?? null)

        if (session?.user) {
          console.log('AuthContext: Loading auth user for auth change')
          await loadAuthUser()
        } else {
          console.log('AuthContext: No session in auth change, clearing auth user')
          setAuthUser(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadAuthUser = async () => {
    try {
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise<null>((_, reject) => {
        setTimeout(() => reject(new Error('Auth timeout')), 10000) // 10 second timeout
      })

      const authPromise = getCurrentUser()
      const currentUser = await Promise.race([authPromise, timeoutPromise])

      setAuthUser(currentUser)
    } catch (error) {
      console.error('Error loading auth user:', error)
      setAuthUser(null)
    } finally {
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