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
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError) {
      console.error('Error getting user:', userError)
      return null
    }

    if (!user) return null

    // Check if user is a broker
    const { data: broker, error: brokerError } = await supabase
      .from('brokers')
      .select('*')
      .eq('id', user.id)
      .single()

    if (brokerError && brokerError.code !== 'PGRST116') { // PGRST116 = No rows returned
      console.error('Error fetching broker:', brokerError)
    }

    if (broker) {
      return {
        id: user.id,
        email: user.email!,
        userType: 'broker',
        profile: broker
      }
    }

    // Check if user is a vendor
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', user.id)
      .single()

    if (vendorError && vendorError.code !== 'PGRST116') { // PGRST116 = No rows returned
      console.error('Error fetching vendor:', vendorError)
    }

    if (vendor) {
      return {
        id: user.id,
        email: user.email!,
        userType: 'vendor',
        profile: vendor
      }
    }

    console.warn('User found in auth but not in brokers or vendors table:', user.id)
    return null
  } catch (error) {
    console.error('Unexpected error in getCurrentUser:', error)
    return null
  }
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email)
  if (error) throw error
}