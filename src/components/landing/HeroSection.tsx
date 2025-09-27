'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  const features = [
    'Vendor Quotation',
    'Contract Management',
    'Purchase Order Generation',
    'Inventory Control',
    'Payment Flexibility',
    'Online Payment Integration',
    'Invoicing Simplified'
  ]

  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left Content */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
                Streamlined Procurement Workflow with{' '}
                <span className="text-green-600 bg-gradient-to-r from-green-600 to-orange-600 supports-[background-clip:text]:bg-clip-text supports-[background-clip:text]:text-transparent forced-colors:bg-none forced-colors:text-current">
                  VendorHub OS
                </span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-lg lg:text-xl text-gray-600 leading-relaxed"
            >
              Our Vendor Portal streamlines the procurement workflow, ensuring every step, from product
              requests to invoicing, is optimized for efficiency. The portal offers an array of features to
              facilitate a smooth procurement process
            </motion.p>

            {/* Feature List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="space-y-3"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-orange-500 rounded-full"></div>
                  <span className="text-gray-700 font-medium">{feature}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="pt-4"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">V</span>
                </div>
                <span className="text-2xl font-bold text-green-600 bg-gradient-to-r from-green-600 to-orange-600 supports-[background-clip:text]:bg-clip-text supports-[background-clip:text]:text-transparent forced-colors:bg-none forced-colors:text-current">
                  VendorHub OS
                </span>
              </div>
            </motion.div>
          </div>

          {/* Right Content - Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="relative"
          >
            {/* Main Dashboard Mockup */}
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden" role="img" aria-label="Dashboard interface preview showing vendor management features">
              {/* Browser Header */}
              <div className="bg-gray-100 px-4 py-3 border-b flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>

              {/* Dashboard Content */}
              <div className="p-6 bg-gradient-to-br from-indigo-600 to-blue-700">
                {/* Sidebar */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="col-span-1 space-y-2">
                    <div className="text-white font-semibold text-sm mb-3">MANAGE VENDORS</div>
                    <div className="space-y-1">
                      {['Admin Panel', 'Plans & Pricing', 'Manage Vendors', 'Request for Quote', 'Quotation', 'Purchase Order', 'Contracts', 'Invoice', 'Products'].map((item, i) => (
                        <div key={i} className="text-white text-xs py-1 px-2 rounded opacity-80" aria-hidden="true">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Main Content Area */}
                  <div className="col-span-3 bg-white rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-gray-900">MANAGE VENDORS</h3>
                      <Button
                        size="sm"
                        className="bg-blue-600 cursor-default"
                        disabled
                        aria-hidden="true"
                        tabIndex={-1}
                      >
                        Create Vendor
                      </Button>
                    </div>

                    {/* Table Headers */}
                    <div className="grid grid-cols-6 gap-2 text-xs font-semibold text-gray-600 border-b pb-2 mb-2">
                      <div>VENDOR ID</div>
                      <div>COMPANY NAME</div>
                      <div>EMAIL</div>
                      <div>CREDIT LIMIT</div>
                      <div>PHONE</div>
                      <div>REASON</div>
                    </div>

                    {/* Sample Rows */}
                    {[1,2,3,4,5].map((i) => (
                      <div key={i} className="grid grid-cols-6 gap-2 text-xs text-gray-700 py-1 border-b border-gray-100">
                        <div>104{i}</div>
                        <div>Company {i}</div>
                        <div>vendor{i}@gmail.com</div>
                        <div>0.00</div>
                        <div>+9232340{i}</div>
                        <div>67145{i}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating geometric shapes */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full opacity-20"></div>
            <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-r from-orange-400 to-red-500 rounded-full opacity-20"></div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}