'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase, createServiceRoleClient } from '@/lib/supabase'
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
    // In a real application, you would use an email service like SendGrid, Resend, or n8n workflow
    // For now, we'll just log the invitation details
    console.log('Sending invitation email to:', vendorData.email)
    console.log('Temporary password:', tempPassword)
    
    // TODO: Implement actual email sending via n8n webhook
    // This would trigger an n8n workflow that sends the invitation email
    /*
    const emailData = {
      to: vendorData.email,
      subject: `Invitation to ${authUser?.profile.company_name} Equipment Finance Portal`,
      template: 'vendor-invitation',
      variables: {
        vendorName: `${vendorData.firstName} ${vendorData.lastName}`,
        brokerCompany: authUser?.profile.company_name,
        loginUrl: `${window.location.origin}/`,
        email: vendorData.email,
        temporaryPassword: tempPassword,
      }
    }
    
    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData)
    })
    */
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

      const tempPassword = generateTemporaryPassword()
      const serviceRoleClient = createServiceRoleClient()

      // Create auth user
      const { data: authData, error: authError } = await serviceRoleClient.auth.admin.createUser({
        email: data.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          userType: 'vendor'
        }
      })

      if (authError) throw authError

      if (authData.user) {
        // Create vendor profile
        const { error: vendorError } = await supabase
          .from('vendors')
          .insert({
            id: authData.user.id,
            broker_id: authUser.id,
            email: data.email,
            first_name: data.firstName,
            last_name: data.lastName,
            company_name: data.companyName,
            password_hash: '', // This will be handled by Supabase Auth
            must_change_password: true,
          })

        if (vendorError) throw vendorError

        // Send invitation email
        await sendInvitationEmail(data, tempPassword)

        setSuccess(`Invitation sent to ${data.email}! They will receive login credentials via email.`)
        reset()
        onSuccess?.()
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while sending the invitation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite New Vendor</CardTitle>
        <CardDescription>
          Send an invitation to a vendor to join your network
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="Enter first name"
                {...register('firstName')}
              />
              {errors.firstName && (
                <p className="text-sm text-red-600">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Enter last name"
                {...register('lastName')}
              />
              {errors.lastName && (
                <p className="text-sm text-red-600">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              placeholder="Enter company name"
              {...register('companyName')}
            />
            {errors.companyName && (
              <p className="text-sm text-red-600">{errors.companyName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded">
              {success}
            </div>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? 'Sending Invitation...' : 'Send Invitation'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}