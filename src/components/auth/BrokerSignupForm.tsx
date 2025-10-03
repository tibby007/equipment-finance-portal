'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { signUp, signInWithEmail } from '@/lib/auth'

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  companyName: z.string().min(2, 'Company name is required'),
  subscriptionTier: z.enum(['starter', 'pro', 'premium']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type SignupFormData = z.infer<typeof signupSchema>

export function BrokerSignupForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      subscriptionTier: 'starter'
    }
  })

  const onSubmit = async (data: SignupFormData) => {
    try {
      setLoading(true)
      setError('')

      // Check if Supabase is configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'placeholder-url') {
        setError('Authentication system is not configured. Please contact support.')
        return
      }

      // Sign up the user
      const authResult = await signUp(data.email, data.password, {
        userType: 'broker'
      })

      if (authResult.user) {
        // Create broker profile via API route (uses service role to bypass RLS)
        const response = await fetch('/api/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: authResult.user.id,
            email: data.email,
            companyName: data.companyName,
            subscriptionTier: data.subscriptionTier,
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to create broker profile')
        }

        // Check if user has an active session
        if (authResult.session) {
          // User is automatically logged in, redirect to dashboard
          router.push('/dashboard')
        } else {
          // Email confirmation required, try to sign in manually
          try {
            await signInWithEmail(data.email, data.password)
            router.push('/dashboard')
          } catch {
            // If sign in fails, email confirmation is required
            setError('Account created! Please check your email to confirm your account before logging in.')
            setTimeout(() => {
              router.push('/login')
            }, 3000)
          }
        }
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'An error occurred during signup')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create Broker Account</CardTitle>
        <CardDescription>
          Sign up to start managing your vendor network
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              placeholder="Enter your company name"
              {...register('companyName')}
            />
            {errors.companyName && (
              <p className="text-sm text-red-600">{errors.companyName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subscriptionTier">Subscription Tier</Label>
            <select
              id="subscriptionTier"
              className="w-full p-2 border border-gray-300 rounded-md"
              {...register('subscriptionTier')}
            >
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
              <option value="premium">Premium</option>
            </select>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}