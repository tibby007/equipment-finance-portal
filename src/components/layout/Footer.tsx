import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-6 md:order-2">
          <Link href="/privacy" className="text-gray-400 hover:text-gray-300">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-gray-400 hover:text-gray-300">
            Terms of Service
          </Link>
          <Link href="/contact" className="text-gray-400 hover:text-gray-300">
            Contact
          </Link>
        </div>
        <div className="mt-8 md:order-1 md:mt-0">
          <div className="flex items-center justify-center md:justify-start">
            <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-orange-400 bg-clip-text text-transparent mr-3">VendorHub OS</span>
          </div>
          <p className="text-center text-xs leading-5 text-gray-400 md:text-left mt-2">
            &copy; 2024 VendorHub OS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}