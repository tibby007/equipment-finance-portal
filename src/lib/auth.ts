import { supabase } from './supabase'
import { Database } from '@/types/database'

type Broker = Database['public']['Tables']['brokers']['Row']
type Vendor = Database['public']['Tables']['vendors']['Row']

export interface AuthUser {
  id: string
  email: string
  userType: 'broker' | 'vendor'
  profile: Broker | Vendor
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export async function signUp(email: string, password: string, userData: Record<string, unknown>) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  })

  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Check if user is a broker
  const { data: broker } = await supabase
    .from('brokers')
    .select('*')
    .eq('id', user.id)
    .single()

  if (broker) {
    return {
      id: user.id,
      email: user.email!,
      userType: 'broker',
      profile: broker
    }
  }

  // Check if user is a vendor
  const { data: vendor } = await supabase
    .from('vendors')
    .select('*')
    .eq('id', user.id)
    .single()

  if (vendor) {
    return {
      id: user.id,
      email: user.email!,
      userType: 'vendor',
      profile: vendor
    }
  }

  return null
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email)
  if (error) throw error
}