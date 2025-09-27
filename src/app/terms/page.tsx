'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-gray-900">Terms of Service</CardTitle>
            <p className="text-gray-600">Last updated: January 2024</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Acceptance of Terms</h2>
              <p className="text-gray-700">
                By accessing and using VendorHub OS, you accept and agree to be bound by the terms
                and provision of this agreement.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Use License</h2>
              <p className="text-gray-700">
                Permission is granted to temporarily use VendorHub OS for personal, non-commercial
                transitory viewing and equipment finance application purposes only.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">User Responsibilities</h2>
              <p className="text-gray-700">
                Users are responsible for maintaining the confidentiality of their account information
                and for all activities that occur under their account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Limitation of Liability</h2>
              <p className="text-gray-700">
                VendorHub OS shall not be liable for any direct, indirect, incidental, consequential,
                or special damages resulting from the use or inability to use our service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact Information</h2>
              <p className="text-gray-700">
                If you have any questions about these Terms of Service, please contact us at
                legal@vendorhubos.com
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}