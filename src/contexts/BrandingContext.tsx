'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '@/lib/supabase'
import { SubscriptionService, SubscriptionFeatures } from '@/lib/subscription'

interface BrandingSettings {
  id?: string
  broker_id: string
  subscription_tier: 'starter' | 'professional' | 'premium'
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

  const loadBranding = useCallback(async () => {
    if (!authUser || authUser.userType !== 'broker') {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('broker_settings')
        .select(`
          id,
          broker_id,
          subscription_tier,
          company_logo_url,
          company_name,
          tagline,
          primary_color,
          secondary_color,
          accent_color,
          contact_phone,
          contact_email,
          support_email,
          website_url,
          custom_domain,
          custom_css
        `)
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
          subscription_tier: 'starter',
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
  }, [authUser])

  const refreshBranding = async () => {
    await loadBranding()
  }

  const isFeatureAvailable = (feature: string): boolean => {
    if (!branding) return false

    // Map legacy feature names to new subscription features
    const featureMap: Record<string, keyof SubscriptionFeatures> = {
      'branding': 'whiteLabelBranding',
      'logo': 'whiteLabelBranding',
      'colors': 'whiteLabelBranding',
      'domain': 'fullPipelineCustomization',
      'css': 'fullPipelineCustomization',
      'emails': 'fullPipelineCustomization'
    }

    const subscriptionFeature = featureMap[feature]
    if (subscriptionFeature) {
      return SubscriptionService.isFeatureAvailable(branding.subscription_tier, subscriptionFeature)
    }

    return true // Default to available for unmapped features
  }

  useEffect(() => {
    loadBranding()
  }, [loadBranding])

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