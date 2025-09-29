import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-24 sm:py-32">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-8">
              Terms of Service
            </h1>

            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-gray-600 mb-8">
                <strong>Effective Date:</strong> {new Date().toLocaleDateString()}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-600 mb-4">
                  By accessing and using VendorHub OS ("the Platform"), you accept and agree to be bound by these
                  Terms of Service. If you do not agree to these terms, you may not use our services.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
                <p className="text-gray-600 mb-4">
                  VendorHub OS is an equipment finance portal platform that connects vendors with brokers and lenders
                  to facilitate equipment financing applications and transactions.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts and Registration</h2>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li>You must provide accurate, current, and complete information during registration</li>
                  <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                  <li>You are responsible for all activities that occur under your account</li>
                  <li>You must notify us immediately of any unauthorized use of your account</li>
                  <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Acceptable Use</h2>
                <p className="text-gray-600 mb-4">You agree to use the Platform only for lawful purposes and in accordance with these Terms. You agree not to:</p>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Impersonate any person or entity or misrepresent your identity</li>
                  <li>Upload malicious code, viruses, or harmful content</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Use the Platform for fraudulent or deceptive purposes</li>
                  <li>Interfere with or disrupt the Platform's operation</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Financial Applications and Information</h2>
                <p className="text-gray-600 mb-4">
                  By submitting financial applications through our Platform:
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li>You warrant that all information provided is accurate and truthful</li>
                  <li>You authorize us to share your information with lenders and credit agencies</li>
                  <li>You understand that credit checks may be performed</li>
                  <li>You acknowledge that financing decisions are made by third-party lenders</li>
                  <li>We do not guarantee approval or specific terms for any financing</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Subscription and Payment Terms</h2>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li>Subscription fees are billed in advance on a recurring basis</li>
                  <li>All fees are non-refundable unless otherwise stated</li>
                  <li>We may change subscription pricing with 30 days notice</li>
                  <li>Failure to pay may result in service suspension or termination</li>
                  <li>You are responsible for all applicable taxes</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Intellectual Property</h2>
                <p className="text-gray-600 mb-4">
                  The Platform and its content are owned by VendorHub OS and protected by copyright, trademark,
                  and other intellectual property laws. You may not copy, modify, distribute, or create derivative
                  works without our express written permission.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Data and Privacy</h2>
                <p className="text-gray-600 mb-4">
                  Your privacy is important to us. Please review our Privacy Policy to understand how we collect,
                  use, and protect your information. By using our Platform, you consent to our data practices
                  as described in our Privacy Policy.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Disclaimers and Limitation of Liability</h2>
                <p className="text-gray-600 mb-4">
                  THE PLATFORM IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL WARRANTIES,
                  EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.
                </p>
                <p className="text-gray-600 mb-4">
                  IN NO EVENT SHALL VENDORHUB OS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
                  OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS, ARISING FROM YOUR USE OF THE PLATFORM.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Indemnification</h2>
                <p className="text-gray-600 mb-4">
                  You agree to indemnify and hold harmless VendorHub OS from any claims, damages, losses, or expenses
                  arising from your use of the Platform or violation of these Terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Termination</h2>
                <p className="text-gray-600 mb-4">
                  We may terminate or suspend your account at any time for violation of these Terms. Upon termination,
                  your right to use the Platform will cease immediately, but these Terms will remain in effect.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Changes to Terms</h2>
                <p className="text-gray-600 mb-4">
                  We reserve the right to modify these Terms at any time. We will notify users of material changes
                  by posting the updated Terms on our website. Continued use of the Platform constitutes acceptance
                  of the modified Terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Governing Law</h2>
                <p className="text-gray-600 mb-4">
                  These Terms are governed by the laws of the State of Georgia, United States, without regard to
                  conflict of law principles. Any disputes will be resolved in the courts of Georgia.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact Information</h2>
                <p className="text-gray-600 mb-4">
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 mb-2">📧 Email: support@emergestack.dev</p>
                  <p className="text-gray-600 mb-2">📞 Phone: (555) 123-4567</p>
                  <p className="text-gray-600">📍 Address: 3379 Bill Arp, Douglasville GA 30135</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}