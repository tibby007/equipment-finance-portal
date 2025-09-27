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
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>

interface PasswordChangeFormProps {
  onSuccess?: () => void
  forced?: boolean // If true, user cannot skip this step
}

export function PasswordChangeForm({ onSuccess, forced = false }: PasswordChangeFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { authUser } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema),
  })

  const onSubmit = async (data: PasswordChangeFormData) => {
    try {
      setLoading(true)
      setError('')

      // Update password in Supabase Auth
      const { error: passwordError } = await supabase.auth.updateUser({
        password: data.newPassword
      })

      if (passwordError) throw passwordError

      // Update vendor record to indicate password has been changed
      if (authUser?.userType === 'vendor') {
        const { error: vendorError } = await supabase
          .from('vendors')
          .update({
            must_change_password: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', authUser.id)

        if (vendorError) throw vendorError
      }

      // Success - redirect to dashboard
      onSuccess?.()
      router.push('/dashboard')
    } catch (err: unknown) {
      setError((err as Error).message || 'An error occurred while changing password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="text-center space-y-3 pb-6">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-green-600 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">🔒</span>
            </div>
            <CardTitle className="text-2xl font-bold text-green-600 bg-gradient-to-r from-green-600 to-orange-600 supports-[background-clip:text]:bg-clip-text supports-[background-clip:text]:text-transparent forced-colors:bg-none forced-colors:text-current">
              {forced ? 'Set Your Password' : 'Change Password'}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {forced
                ? 'Welcome to VendorHub OS! Please create a new password to secure your account.'
                : 'Update your password to keep your account secure.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-gray-700 font-medium">
                  Current Password
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="Enter your current password"
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg h-12"
                  {...register('currentPassword')}
                />
                {errors.currentPassword && (
                  <p className="text-sm text-red-600">{errors.currentPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-gray-700 font-medium">
                  New Password
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter your new password"
                  className="border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-lg h-12"
                  {...register('newPassword')}
                />
                {errors.newPassword && (
                  <p className="text-sm text-red-600">{errors.newPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                  Confirm New Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your new password"
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg h-12"
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              {error && (
                <div className="p-4 text-sm text-red-700 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg shadow-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-green-600 to-orange-600 hover:from-green-700 hover:to-orange-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Updating Password...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>🔐</span>
                    <span>{forced ? 'Set Password' : 'Update Password'}</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {!forced && (
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}