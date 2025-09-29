'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const contactSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  company: z.string().min(2, 'Company name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

type ContactFormData = z.infer<typeof contactSchema>

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data: ContactFormData) => {
    try {
      setLoading(true)
      setError('')
      setSuccess(false)

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send message')
      }

      setSuccess(true)
      reset()
    } catch (err) {
      setError((err as Error).message || 'Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Contact Sales
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Ready to transform your equipment finance operations? 
              Get in touch with our team to schedule a personalized demo.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-xl">
            <Card>
              <CardHeader>
                <CardTitle>Schedule Your Demo</CardTitle>
                <CardDescription>
                  Fill out the form below and we&apos;ll get back to you within 24 hours.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {success ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-green-600 text-2xl">✓</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Message Sent!</h3>
                    <p className="text-gray-600 mb-4">
                      Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setSuccess(false)}
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          placeholder="John"
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
                          placeholder="Doe"
                          {...register('lastName')}
                        />
                        {errors.lastName && (
                          <p className="text-sm text-red-600">{errors.lastName.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@company.com"
                        {...register('email')}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-600">{errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company">Company Name</Label>
                      <Input
                        id="company"
                        placeholder="Your Company"
                        {...register('company')}
                      />
                      {errors.company && (
                        <p className="text-sm text-red-600">{errors.company.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        {...register('phone')}
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-600">{errors.phone.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <textarea
                        id="message"
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Tell us about your current process and what you're looking to improve..."
                        {...register('message')}
                      />
                      {errors.message && (
                        <p className="text-sm text-red-600">{errors.message.message}</p>
                      )}
                    </div>

                    {error && (
                      <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                        {error}
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Sending...</span>
                        </div>
                      ) : (
                        'Send Message'
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="mx-auto mt-16 max-w-4xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="text-center lg:text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Or reach out directly
                </h2>
                <div className="space-y-4">
                  <p className="text-lg text-gray-600">
                    📧 support@emergestack.dev
                  </p>
                  <p className="text-lg text-gray-600">
                    📍 3379 Bill Arp, Douglasville GA 30135
                  </p>
                </div>
              </div>

              <div className="bg-gray-100 rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3336.2!2d-84.7468!3d33.7537!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzPCsDQ1JzEzLjMiTiA4NMKwNDQnNDguNSJX!5e0!3m2!1sen!2sus!4v1640000000000!5m2!1sen!2sus&q=3379+Bill+Arp,+Douglasville+GA+30135"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="VendorHub OS Office Location"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}