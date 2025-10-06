'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  companyName: z.string().min(2, 'Company name is required'),
})

type InviteFormData = z.infer<typeof inviteSchema>

interface VendorInviteFormProps {
  onSuccess?: () => void
}

export function VendorInviteForm({ onSuccess }: VendorInviteFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { authUser } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
  })

  const generateTemporaryPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const sendInvitationEmail = async (vendorData: InviteFormData, tempPassword: string) => {
    const emailContent = {
      to: vendorData.email,
      subject: `Welcome to ${authUser?.profile.company_name} VendorHub OS Network`,
      vendorName: `${vendorData.firstName} ${vendorData.lastName}`,
      brokerCompany: authUser?.profile.company_name,
      loginUrl: `${window.location.origin}/login`,
      email: vendorData.email,
      temporaryPassword: tempPassword,
    }

    try {
      const response = await fetch('/api/send-invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailContent)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send invitation email')
      }

      console.log('📧 Invitation email sent successfully:', result)

      // Also store in localStorage for backup/demo purposes
      const invitations = JSON.parse(localStorage.getItem('vendor_invitations') || '[]')
      invitations.push({
        ...emailContent,
        sentAt: new Date().toISOString(),
        emailId: result.data?.id
      })
      localStorage.setItem('vendor_invitations', JSON.stringify(invitations))

      return result
    } catch (error) {
      console.error('Failed to send invitation email:', error)
      throw error
    }
  }

  const onSubmit = async (data: InviteFormData) => {
    if (!authUser || authUser.userType !== 'broker') {
      setError('Only brokers can invite vendors')
      return
    }

    try {
      setLoading(true)
      setError('')
      setSuccess('')

      // Call API to create vendor and send invitation
      const response = await fetch('/api/invite-vendor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brokerId: authUser.id,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          companyName: data.companyName,
          brokerCompanyName: authUser.profile.company_name,
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to invite vendor')
      }

      if (result.emailSent) {
        setSuccess(`✅ Vendor account created! ${data.email} will receive login credentials via email.`)
      } else {
        setSuccess(`✅ Vendor account created! Share these credentials with ${data.email}:\nEmail: ${data.email}\nTemporary Password: ${result.tempPassword}`)
      }

      reset()
      onSuccess?.()
    } catch (err: unknown) {
      setError((err as Error).message || 'An error occurred while sending the invitation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="space-y-3 pb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">+</span>
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-gray-900">Invite New Vendor</CardTitle>
            <CardDescription className="text-gray-600">
              Send an invitation to a vendor to join your VendorHub OS network
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-gray-700 font-medium">First Name</Label>
              <Input
                id="firstName"
                placeholder="Enter first name"
                className="border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg h-11"
                {...register('firstName')}
              />
              {errors.firstName && (
                <p className="text-sm text-red-600">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-gray-700 font-medium">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Enter last name"
                className="border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-lg h-11"
                {...register('lastName')}
              />
              {errors.lastName && (
                <p className="text-sm text-red-600">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-gray-700 font-medium">Company Name</Label>
            <Input
              id="companyName"
              placeholder="Enter company name"
              className="border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg h-11"
              {...register('companyName')}
            />
            {errors.companyName && (
              <p className="text-sm text-red-600">{errors.companyName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              className="border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-lg h-11"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
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

          {success && (
            <div className="p-4 text-sm text-green-700 bg-gradient-to-r from-green-50 to-emerald-100 border border-green-200 rounded-lg shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{success}</span>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-green-600 to-orange-600 hover:from-green-700 hover:to-orange-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Sending Invitation...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span>📧</span>
                <span>Send Invitation</span>
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}