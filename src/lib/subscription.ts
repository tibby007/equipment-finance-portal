import { supabase } from './supabase'

export type SubscriptionTier = 'starter' | 'professional' | 'premium'

export interface SubscriptionLimits {
  maxVendors: number // -1 for unlimited
  maxDealsPerMonth: number // -1 for unlimited
  documentStorageLimitGB: number
}

export interface SubscriptionFeatures {
  customStages: boolean
  advancedAnalytics: boolean
  whiteLabelBranding: boolean
  apiAccess: boolean
  bulkOperations: boolean
  customIntegrations: boolean
  fullPipelineCustomization: boolean
}

export const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  starter: {
    maxVendors: 3,
    maxDealsPerMonth: 50,
    documentStorageLimitGB: 1
  },
  professional: {
    maxVendors: 10,
    maxDealsPerMonth: 200,
    documentStorageLimitGB: 10
  },
  premium: {
    maxVendors: -1, // unlimited
    maxDealsPerMonth: -1, // unlimited
    documentStorageLimitGB: 100
  }
}

export const SUBSCRIPTION_FEATURES: Record<SubscriptionTier, SubscriptionFeatures> = {
  starter: {
    customStages: false,
    advancedAnalytics: false,
    whiteLabelBranding: false,
    apiAccess: false,
    bulkOperations: false,
    customIntegrations: false,
    fullPipelineCustomization: false
  },
  professional: {
    customStages: true,
    advancedAnalytics: true,
    whiteLabelBranding: true,
    apiAccess: false,
    bulkOperations: true,
    customIntegrations: false,
    fullPipelineCustomization: false
  },
  premium: {
    customStages: true,
    advancedAnalytics: true,
    whiteLabelBranding: true,
    apiAccess: true,
    bulkOperations: true,
    customIntegrations: true,
    fullPipelineCustomization: true
  }
}

export const SUBSCRIPTION_PRICING = {
  starter: {
    price: 39,
    name: 'Starter',
    description: 'Perfect for small brokers getting started',
    popular: false
  },
  professional: {
    price: 99,
    name: 'Professional',
    description: 'Most popular for growing broker teams',
    popular: true
  },
  premium: {
    price: 397,
    name: 'Premium',
    description: 'Enterprise-grade features and unlimited access',
    popular: false
  }
}

export class SubscriptionService {
  static async getBrokerSubscription(brokerId: string) {
    const { data, error } = await supabase
      .from('broker_settings')
      .select('subscription_tier')
      .eq('broker_id', brokerId)
      .single()

    if (error) {
      console.error('Error fetching subscription:', error)
      return 'starter' as SubscriptionTier
    }

    return (data?.subscription_tier || 'starter') as SubscriptionTier
  }

  static async getBrokerUsage(brokerId: string) {
    const { data, error } = await supabase
      .from('brokers')
      .select('current_vendor_count, current_month_deals, storage_used_mb')
      .eq('id', brokerId)
      .single()

    if (error) {
      console.error('Error fetching broker usage:', error)
      return {
        currentVendorCount: 0,
        currentMonthDeals: 0,
        storageUsedMB: 0
      }
    }

    return {
      currentVendorCount: data?.current_vendor_count || 0,
      currentMonthDeals: data?.current_month_deals || 0,
      storageUsedMB: data?.storage_used_mb || 0
    }
  }

  static getLimits(tier: SubscriptionTier): SubscriptionLimits {
    return SUBSCRIPTION_LIMITS[tier]
  }

  static getFeatures(tier: SubscriptionTier): SubscriptionFeatures {
    return SUBSCRIPTION_FEATURES[tier]
  }

  static isFeatureAvailable(tier: SubscriptionTier, feature: keyof SubscriptionFeatures): boolean {
    return SUBSCRIPTION_FEATURES[tier][feature]
  }

  static async canAddVendor(brokerId: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('can_add_vendor', {
      broker_uuid: brokerId
    })

    if (error) {
      console.error('Error checking vendor limit:', error)
      return false
    }

    return data
  }

  static async canAddDeal(brokerId: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('can_add_deal', {
      broker_uuid: brokerId
    })

    if (error) {
      console.error('Error checking deal limit:', error)
      return false
    }

    return data
  }

  static async updateSubscriptionTier(brokerId: string, newTier: SubscriptionTier) {
    const { error } = await supabase
      .from('broker_settings')
      .update({ subscription_tier: newTier })
      .eq('broker_id', brokerId)

    if (error) {
      throw new Error(`Failed to update subscription: ${error.message}`)
    }
  }

  static getUpgradeMessage(currentTier: SubscriptionTier, feature: string): string {
    const requiredTier = currentTier === 'starter' ? 'Professional' : 'Premium'
    return `This feature requires ${requiredTier} plan. Upgrade to unlock ${feature}.`
  }

  static formatLimit(limit: number): string {
    return limit === -1 ? 'Unlimited' : limit.toLocaleString()
  }

  static calculateUsagePercentage(current: number, limit: number): number {
    if (limit === -1) return 0 // Unlimited
    return Math.min((current / limit) * 100, 100)
  }

  static isUsageNearLimit(current: number, limit: number, threshold = 80): boolean {
    if (limit === -1) return false // Unlimited
    return (current / limit) * 100 >= threshold
  }
}