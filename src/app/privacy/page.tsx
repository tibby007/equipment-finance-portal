import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-24 sm:py-32">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-8">
              Privacy Policy
            </h1>

            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-gray-600 mb-8">
                <strong>Effective Date:</strong> {new Date().toLocaleDateString()}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
                <p className="text-gray-600 mb-4">
                  VendorHub OS (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) respects your privacy and is committed to protecting your personal information.
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our
                  equipment finance portal platform.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
                <h3 className="text-xl font-medium text-gray-800 mb-3">Personal Information</h3>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li>Name, email address, phone number</li>
                  <li>Company information and business details</li>
                  <li>Financial information for credit applications</li>
                  <li>Social Security Number and Date of Birth for credit authorization</li>
                  <li>Business documents and financial statements</li>
                </ul>

                <h3 className="text-xl font-medium text-gray-800 mb-3">Usage Information</h3>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li>Log data, IP addresses, and device information</li>
                  <li>Browser type and version</li>
                  <li>Pages visited and time spent on our platform</li>
                  <li>Referring websites and search terms</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li>Process equipment finance applications and credit checks</li>
                  <li>Facilitate communication between brokers and vendors</li>
                  <li>Provide customer support and respond to inquiries</li>
                  <li>Improve our platform and develop new features</li>
                  <li>Send important notifications about your account</li>
                  <li>Comply with legal and regulatory requirements</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Information Sharing and Disclosure</h2>
                <p className="text-gray-600 mb-4">
                  We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li><strong>With Lenders:</strong> To process equipment finance applications</li>
                  <li><strong>Service Providers:</strong> Third-party vendors who assist in platform operations</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                  <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
                <p className="text-gray-600 mb-4">
                  We implement appropriate technical and organizational security measures to protect your personal information against
                  unauthorized access, alteration, disclosure, or destruction. These measures include:
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security assessments and updates</li>
                  <li>Access controls and authentication mechanisms</li>
                  <li>Employee training on data protection practices</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights and Choices</h2>
                <p className="text-gray-600 mb-4">You have the right to:</p>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li>Access and review your personal information</li>
                  <li>Request corrections to inaccurate information</li>
                  <li>Delete your account and associated data</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Request data portability where applicable</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Cookies and Tracking</h2>
                <p className="text-gray-600 mb-4">
                  We use cookies and similar technologies to enhance your experience, analyze usage patterns, and provide
                  personalized content. You can control cookie settings through your browser preferences.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Children&apos;s Privacy</h2>
                <p className="text-gray-600 mb-4">
                  Our platform is not intended for use by individuals under the age of 18. We do not knowingly collect
                  personal information from children under 18.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Changes to This Policy</h2>
                <p className="text-gray-600 mb-4">
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by
                  posting the new policy on our website and updating the effective date.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact Us</h2>
                <p className="text-gray-600 mb-4">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
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