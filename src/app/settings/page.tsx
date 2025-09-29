'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { useBranding } from '@/contexts/BrandingContext'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase'
import { SubscriptionService, SUBSCRIPTION_PRICING, SUBSCRIPTION_LIMITS, type SubscriptionTier } from '@/lib/subscription'

interface BrokerSettings {
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
  email_header_color?: string
  email_footer_text?: string
}

export default function SettingsPage() {
  const { authUser, loading } = useAuth()
  const { refreshBranding } = useBranding()
  const router = useRouter()
  const [settings, setSettings] = useState<BrokerSettings | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [upgrading, setUpgrading] = useState(false)
  const [usage, setUsage] = useState({ currentVendorCount: 0, currentMonthDeals: 0, storageUsedMB: 0 })

  useEffect(() => {
    if (!loading) {
      if (!authUser) {
        router.push('/login')
        return
      }

      // Only brokers can access this page
      if (authUser.userType !== 'broker') {
        router.push('/dashboard')
        return
      }

      loadBrokerSettings()
      loadUsageData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser, loading, router])

  const loadBrokerSettings = async () => {
    if (!authUser) return

    try {
      const { data, error } = await supabase
        .from('broker_settings')
        .select('*')
        .eq('broker_id', authUser.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading settings:', error)
        return
      }

      if (data) {
        setSettings(data)
      } else {
        // Create default settings
        const defaultSettings: BrokerSettings = {
          broker_id: authUser.id,
          subscription_tier: 'starter',
          company_name: authUser.profile.company_name || '',
          primary_color: '#16a34a',
          secondary_color: '#ea580c',
          accent_color: '#f3f4f6',
          contact_email: authUser.email,
        }
        setSettings(defaultSettings)
      }
    } catch (error) {
      console.error('Error loading broker settings:', error)
    }
  }

  const loadUsageData = async () => {
    if (!authUser) return

    try {
      const usageData = await SubscriptionService.getBrokerUsage(authUser.id)
      setUsage(usageData)
    } catch (error) {
      console.error('Error loading usage data:', error)
    }
  }

  const saveSettings = async () => {
    if (!settings || !authUser) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('broker_settings')
        .upsert(settings, { onConflict: 'broker_id' })

      if (error) throw error

      // Refresh branding context to apply changes immediately
      await refreshBranding()
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Error saving settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !authUser) return

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${authUser.id}/logo.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('broker-logos')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('broker-logos')
        .getPublicUrl(fileName)

      setSettings(prev => prev ? {
        ...prev,
        company_logo_url: urlData.publicUrl
      } : null)

    } catch (error) {
      console.error('Error uploading logo:', error)
      alert('Error uploading logo. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const getSubscriptionFeatures = (tier: 'starter' | 'professional' | 'premium') => {
    const features = SubscriptionService.getFeatures(tier)
    const limits = SubscriptionService.getLimits(tier)

    const featureList = [
      `${SubscriptionService.formatLimit(limits.maxVendors)} vendors`,
      `${SubscriptionService.formatLimit(limits.maxDealsPerMonth)} deals/month`,
      `${limits.documentStorageLimitGB}GB storage`
    ]

    if (features.whiteLabelBranding) featureList.push('White-label branding')
    if (features.customStages) featureList.push('Custom deal stages')
    if (features.advancedAnalytics) featureList.push('Advanced analytics')
    if (features.bulkOperations) featureList.push('Bulk operations')
    if (features.apiAccess) featureList.push('API access')
    if (features.customIntegrations) featureList.push('Custom integrations')
    if (features.fullPipelineCustomization) featureList.push('Full pipeline customization')

    return featureList
  }

  const isFeatureAvailable = (feature: string) => {
    if (!settings) return false
    const tier = settings.subscription_tier

    const proFeatures = ['branding', 'logo', 'colors']
    const premiumFeatures = ['domain', 'css', 'emails']

    if (proFeatures.includes(feature)) {
      return tier === 'professional' || tier === 'premium'
    }
    if (premiumFeatures.includes(feature)) {
      return tier === 'premium'
    }
    return true
  }

  const handleUpgrade = async (newTier: SubscriptionTier) => {
    if (!authUser || !settings) return

    setUpgrading(true)
    try {
      await SubscriptionService.updateSubscriptionTier(authUser.id, newTier)

      setSettings(prev => prev ? { ...prev, subscription_tier: newTier } : null)
      await refreshBranding()

      alert(`Successfully upgraded to ${newTier} plan!`)
    } catch (error) {
      console.error('Error upgrading subscription:', error)
      alert('Error upgrading subscription. Please try again.')
    } finally {
      setUpgrading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!authUser || authUser.userType !== 'broker' || !settings) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Settings</h2>
          <p className="text-gray-600 mt-2">
            Manage your broker portal settings and white-label customization
          </p>
        </div>

        <Tabs defaultValue="branding" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
          </TabsList>

          <TabsContent value="branding" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Brand Customization</CardTitle>
                    <CardDescription>
                      Customize your portal&apos;s appearance and branding
                    </CardDescription>
                  </div>
                  <Badge variant={isFeatureAvailable('branding') ? 'default' : 'secondary'}>
                    {isFeatureAvailable('branding') ? 'Available' : 'Pro Feature'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Company Logo */}
                <div className="space-y-2">
                  <Label htmlFor="logo">Company Logo</Label>
                  <div className="flex items-center space-x-4">
                    {settings.company_logo_url && (
                      <Image
                        src={settings.company_logo_url}
                        alt="Company Logo"
                        width={64}
                        height={64}
                        className="w-16 h-16 object-contain border rounded"
                      />
                    )}
                    <div>
                      <Input
                        id="logo"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={!isFeatureAvailable('logo') || uploading}
                        className="w-auto"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {!isFeatureAvailable('logo') ? 'Available in Pro plan' : 'PNG, JPG up to 2MB'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Company Name */}
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    value={settings.company_name || ''}
                    onChange={(e) => setSettings(prev => prev ? {...prev, company_name: e.target.value} : null)}
                    disabled={!isFeatureAvailable('branding')}
                    placeholder="Your Company Name"
                  />
                </div>

                {/* Tagline */}
                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    value={settings.tagline || ''}
                    onChange={(e) => setSettings(prev => prev ? {...prev, tagline: e.target.value} : null)}
                    disabled={!isFeatureAvailable('branding')}
                    placeholder="Your company tagline"
                  />
                </div>

                <Separator />

                {/* Brand Colors */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Brand Colors</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primary_color">Primary Color</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="primary_color"
                          type="color"
                          value={settings.primary_color}
                          onChange={(e) => setSettings(prev => prev ? {...prev, primary_color: e.target.value} : null)}
                          disabled={!isFeatureAvailable('colors')}
                          className="w-16 h-10"
                        />
                        <Input
                          value={settings.primary_color}
                          onChange={(e) => setSettings(prev => prev ? {...prev, primary_color: e.target.value} : null)}
                          disabled={!isFeatureAvailable('colors')}
                          placeholder="#16a34a"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="secondary_color">Secondary Color</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="secondary_color"
                          type="color"
                          value={settings.secondary_color}
                          onChange={(e) => setSettings(prev => prev ? {...prev, secondary_color: e.target.value} : null)}
                          disabled={!isFeatureAvailable('colors')}
                          className="w-16 h-10"
                        />
                        <Input
                          value={settings.secondary_color}
                          onChange={(e) => setSettings(prev => prev ? {...prev, secondary_color: e.target.value} : null)}
                          disabled={!isFeatureAvailable('colors')}
                          placeholder="#ea580c"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="accent_color">Accent Color</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="accent_color"
                          type="color"
                          value={settings.accent_color}
                          onChange={(e) => setSettings(prev => prev ? {...prev, accent_color: e.target.value} : null)}
                          disabled={!isFeatureAvailable('colors')}
                          className="w-16 h-10"
                        />
                        <Input
                          value={settings.accent_color}
                          onChange={(e) => setSettings(prev => prev ? {...prev, accent_color: e.target.value} : null)}
                          disabled={!isFeatureAvailable('colors')}
                          placeholder="#f3f4f6"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Update your contact details shown to vendors
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_email">Contact Email</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={settings.contact_email || ''}
                      onChange={(e) => setSettings(prev => prev ? {...prev, contact_email: e.target.value} : null)}
                      placeholder="contact@yourcompany.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_phone">Phone Number</Label>
                    <Input
                      id="contact_phone"
                      type="tel"
                      value={settings.contact_phone || ''}
                      onChange={(e) => setSettings(prev => prev ? {...prev, contact_phone: e.target.value} : null)}
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="support_email">Support Email</Label>
                    <Input
                      id="support_email"
                      type="email"
                      value={settings.support_email || ''}
                      onChange={(e) => setSettings(prev => prev ? {...prev, support_email: e.target.value} : null)}
                      placeholder="support@yourcompany.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website_url">Website URL</Label>
                    <Input
                      id="website_url"
                      type="url"
                      value={settings.website_url || ''}
                      onChange={(e) => setSettings(prev => prev ? {...prev, website_url: e.target.value} : null)}
                      placeholder="https://yourcompany.com"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Advanced Settings</CardTitle>
                    <CardDescription>
                      Premium features for complete white-label customization
                    </CardDescription>
                  </div>
                  <Badge variant={isFeatureAvailable('domain') ? 'default' : 'secondary'}>
                    {isFeatureAvailable('domain') ? 'Available' : 'Premium Feature'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="custom_domain">Custom Domain</Label>
                  <Input
                    id="custom_domain"
                    value={settings.custom_domain || ''}
                    onChange={(e) => setSettings(prev => prev ? {...prev, custom_domain: e.target.value} : null)}
                    disabled={!isFeatureAvailable('domain')}
                    placeholder="portal.yourcompany.com"
                  />
                  <p className="text-xs text-gray-500">
                    {!isFeatureAvailable('domain') ? 'Available in Premium plan' : 'Configure your custom domain'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom_css">Custom CSS</Label>
                  <textarea
                    id="custom_css"
                    value={settings.custom_css || ''}
                    onChange={(e) => setSettings(prev => prev ? {...prev, custom_css: e.target.value} : null)}
                    disabled={!isFeatureAvailable('css')}
                    placeholder="/* Your custom CSS styles */"
                    className="w-full h-32 p-3 border rounded-md disabled:opacity-50"
                  />
                  <p className="text-xs text-gray-500">
                    {!isFeatureAvailable('css') ? 'Available in Premium plan' : 'Add custom CSS for advanced styling'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-6">
            {/* Current Plan */}
            <Card>
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>
                  Your active subscription and usage details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold capitalize">{settings.subscription_tier} Plan</h3>
                    <p className="text-sm text-gray-500">${SUBSCRIPTION_PRICING[settings.subscription_tier].price}/month</p>
                  </div>
                  <Badge
                    variant={settings.subscription_tier === 'premium' ? 'default' : 'secondary'}
                    className="text-sm px-3 py-1"
                  >
                    {settings.subscription_tier.toUpperCase()}
                  </Badge>
                </div>

                {/* Usage Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-sm text-gray-700">Vendors</h4>
                    <div className="text-2xl font-bold text-gray-900">
                      {usage.currentVendorCount} / {SubscriptionService.formatLimit(SUBSCRIPTION_LIMITS[settings.subscription_tier].maxVendors)}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${SubscriptionService.calculateUsagePercentage(usage.currentVendorCount, SUBSCRIPTION_LIMITS[settings.subscription_tier].maxVendors)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-sm text-gray-700">Deals This Month</h4>
                    <div className="text-2xl font-bold text-gray-900">
                      {usage.currentMonthDeals} / {SubscriptionService.formatLimit(SUBSCRIPTION_LIMITS[settings.subscription_tier].maxDealsPerMonth)}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-orange-600 h-2 rounded-full"
                        style={{ width: `${SubscriptionService.calculateUsagePercentage(usage.currentMonthDeals, SUBSCRIPTION_LIMITS[settings.subscription_tier].maxDealsPerMonth)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-sm text-gray-700">Storage</h4>
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.round(usage.storageUsedMB / 1024 * 100) / 100}GB / {SUBSCRIPTION_LIMITS[settings.subscription_tier].documentStorageLimitGB}GB
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${SubscriptionService.calculateUsagePercentage(usage.storageUsedMB / 1024, SUBSCRIPTION_LIMITS[settings.subscription_tier].documentStorageLimitGB)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upgrade Options */}
            {settings.subscription_tier !== 'premium' && (
              <Card>
                <CardHeader>
                  <CardTitle>Upgrade Your Plan</CardTitle>
                  <CardDescription>
                    Unlock more features and higher limits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(Object.keys(SUBSCRIPTION_PRICING) as SubscriptionTier[]).map((tier) => {
                      const isCurrentTier = tier === settings.subscription_tier
                      const isPremiumTier = tier === 'premium'
                      const pricing = SUBSCRIPTION_PRICING[tier]
                      const features = getSubscriptionFeatures(tier)

                      return (
                        <div
                          key={tier}
                          className={`p-6 border rounded-lg relative ${
                            isCurrentTier ? 'border-green-500 bg-green-50' :
                            isPremiumTier ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-yellow-50' :
                            'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {pricing.popular && (
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                              <Badge className="bg-gradient-to-r from-green-600 to-orange-600 text-white">
                                Most Popular
                              </Badge>
                            </div>
                          )}

                          <div className="text-center mb-4">
                            <h3 className="text-xl font-semibold capitalize">{tier}</h3>
                            <div className="text-3xl font-bold text-gray-900 mt-2">
                              ${pricing.price}
                              <span className="text-sm font-normal text-gray-500">/month</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{pricing.description}</p>
                          </div>

                          <ul className="space-y-2 mb-6">
                            {features.slice(0, 5).map((feature, index) => (
                              <li key={index} className="flex items-center space-x-2 text-sm">
                                <span className="text-green-500">✓</span>
                                <span>{feature}</span>
                              </li>
                            ))}
                            {features.length > 5 && (
                              <li className="text-sm text-gray-500">
                                +{features.length - 5} more features
                              </li>
                            )}
                          </ul>

                          {isCurrentTier ? (
                            <Button disabled className="w-full">
                              Current Plan
                            </Button>
                          ) : (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  className={`w-full ${
                                    isPremiumTier
                                      ? 'bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700'
                                      : 'bg-gradient-to-r from-green-600 to-orange-600 hover:from-green-700 hover:to-orange-700'
                                  }`}
                                >
                                  Upgrade to {pricing.name}
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Upgrade to {pricing.name} Plan</DialogTitle>
                                  <DialogDescription>
                                    Confirm your upgrade to unlock additional features and higher limits.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="p-4 bg-gray-50 rounded-lg">
                                    <h4 className="font-semibold">What you&apos;ll get:</h4>
                                    <ul className="mt-2 space-y-1">
                                      {features.map((feature, index) => (
                                        <li key={index} className="flex items-center space-x-2 text-sm">
                                          <span className="text-green-500">✓</span>
                                          <span>{feature}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div className="flex justify-between text-lg font-semibold">
                                    <span>Monthly Cost:</span>
                                    <span>${pricing.price}/month</span>
                                  </div>
                                  <div className="flex gap-3">
                                    <Button
                                      onClick={() => handleUpgrade(tier)}
                                      disabled={upgrading}
                                      className="flex-1 bg-gradient-to-r from-green-600 to-orange-600 hover:from-green-700 hover:to-orange-700"
                                    >
                                      {upgrading ? 'Upgrading...' : `Upgrade Now`}
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button
            onClick={saveSettings}
            disabled={saving}
            className="bg-gradient-to-r from-green-600 to-orange-600 hover:from-green-700 hover:to-orange-700"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}