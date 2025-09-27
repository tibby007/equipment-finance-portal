'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '@/lib/supabase'

interface BrandingSettings {
  id?: string
  broker_id: string
  subscription_tier: 'basic' | 'pro' | 'premium'
  company_logo_url?: string
  company_name?: string
  tagline?: string
  primary_color: string
  secondary_color: string
  accent_color: string
  contact_phone?: string
  contact_email?: string
  support_email?: string
  website_url?: string
  custom_domain?: string
  custom_css?: string
}

interface BrandingContextType {
  branding: BrandingSettings | null
  loading: boolean
  refreshBranding: () => Promise<void>
  isFeatureAvailable: (feature: string) => boolean
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined)

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const [branding, setBranding] = useState<BrandingSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const { authUser } = useAuth()

  const loadBranding = async () => {
    if (!authUser || authUser.userType !== 'broker') {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('broker_settings')
        .select('*')
        .eq('broker_id', authUser.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading branding:', error)
        setLoading(false)
        return
      }

      if (data) {
        setBranding(data)
      } else {
        // Create default branding for broker
        const defaultBranding: BrandingSettings = {
          broker_id: authUser.id,
          subscription_tier: 'basic',
          company_name: authUser.profile.company_name || 'VendorHub OS',
          primary_color: '#16a34a',
          secondary_color: '#ea580c',
          accent_color: '#f3f4f6',
          contact_email: authUser.email,
        }
        setBranding(defaultBranding)
      }
    } catch (error) {
      console.error('Error loading branding:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshBranding = async () => {
    await loadBranding()
  }

  const isFeatureAvailable = (feature: string): boolean => {
    if (!branding) return false
    const tier = branding.subscription_tier

    const proFeatures = ['branding', 'logo', 'colors']
    const premiumFeatures = ['domain', 'css', 'emails']

    if (proFeatures.includes(feature)) {
      return tier === 'pro' || tier === 'premium'
    }
    if (premiumFeatures.includes(feature)) {
      return tier === 'premium'
    }
    return true
  }

  useEffect(() => {
    loadBranding()
  }, [authUser])

  const value: BrandingContextType = {
    branding,
    loading,
    refreshBranding,
    isFeatureAvailable,
  }

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  )
}

export function useBranding() {
  const context = useContext(BrandingContext)
  if (context === undefined) {
    throw new Error('useBranding must be used within a BrandingProvider')
  }
  return context
}