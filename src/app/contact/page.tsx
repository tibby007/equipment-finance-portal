import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ContactPage() {
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
                <form className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="John" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Doe" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="john@company.com" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name</Label>
                    <Input id="company" placeholder="Your Company" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" placeholder="(555) 123-4567" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <textarea
                      id="message"
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Tell us about your current process and what you're looking to improve..."
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Schedule Demo
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="mx-auto mt-16 max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Or reach out directly
            </h2>
            <div className="mt-6 space-y-4">
              <p className="text-lg text-gray-600">
                📧 sales@equipfinance.com
              </p>
              <p className="text-lg text-gray-600">
                📞 (555) 123-4567
              </p>
              <p className="text-sm text-gray-500">
                Available Monday - Friday, 9 AM - 6 PM EST
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}