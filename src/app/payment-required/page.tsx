'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const SUBSCRIPTION_PLANS = [
  {
    tier: 'starter',
    name: 'Starter',
    price: 199,
    description: 'Perfect for small brokers getting started',
    features: [
      'Up to 10 vendors',
      '50 deals per month',
      '1GB document storage',
      'Email support',
      'Basic analytics',
    ],
  },
  {
    tier: 'professional',
    name: 'Professional',
    price: 499,
    description: 'Most popular for growing broker teams',
    features: [
      'Up to 50 vendors',
      '200 deals per month',
      '10GB document storage',
      'Priority support',
      'Advanced analytics',
      'White-label branding',
      'Custom pipeline stages',
    ],
    popular: true,
  },
  {
    tier: 'premium',
    name: 'Premium',
    price: 999,
    description: 'Enterprise-grade features and unlimited access',
    features: [
      'Unlimited vendors',
      'Unlimited deals',
      '100GB document storage',
      '24/7 priority support',
      'Advanced analytics',
      'Full white-label branding',
      'API access',
      'Custom integrations',
      'Full pipeline customization',
    ],
  },
]

export default function PaymentRequiredPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Check if user is admin
    if (user?.profile && 'is_admin' in user.profile && user.profile.is_admin) {
      router.push('/dashboard')
    }
  }, [user, router])

  const handleSubscribe = async (tier: string) => {
    try {
      setLoading(tier)
      setError('')

      if (!user) {
        setError('Please log in to subscribe')
        return
      }

      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          tier,
          email: user.email,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to start checkout')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600">
            Select a subscription plan to access VendorHub OS
          </p>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <Card
              key={plan.tier}
              className={`relative ${
                plan.popular
                  ? 'border-green-500 border-2 shadow-lg scale-105'
                  : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-green-600 to-orange-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">
                    ${plan.price}
                  </span>
                  <span className="text-gray-600">/month</span>
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSubscribe(plan.tier)}
                  disabled={loading !== null}
                  className={`w-full ${
                    plan.popular
                      ? 'bg-gradient-to-r from-green-600 to-orange-600 hover:from-green-700 hover:to-orange-700'
                      : ''
                  }`}
                >
                  {loading === plan.tier ? 'Processing...' : 'Subscribe Now'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Need help choosing the right plan?
          </p>
          <a
            href="/contact"
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Contact our sales team →
          </a>
        </div>
      </div>
    </div>
  )
}
