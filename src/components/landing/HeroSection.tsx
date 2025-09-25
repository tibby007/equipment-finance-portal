'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-orange-50 py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl"
          >
            Streamline Your Equipment Finance{' '}
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="bg-gradient-to-r from-green-600 to-orange-600 bg-clip-text text-transparent"
            >
              Workflows
            </motion.span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mt-6 text-lg leading-8 text-gray-600"
          >
            The comprehensive platform that connects brokers and vendors, 
            eliminating communication gaps and accelerating deal closures 
            with intelligent pipeline management.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-10 flex items-center justify-center gap-x-6"
          >
            <Button asChild size="lg" className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
              <Link href="/signup">Get Started Now</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-2 border-orange-500 text-orange-600 hover:bg-orange-50 hover:border-orange-600 transition-all duration-200">
              <Link href="/login">Sign In</Link>
            </Button>
          </motion.div>
        </div>

        {/* Floating elements animation */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ 
              y: [-20, 20, -20],
              rotate: [0, 5, 0]
            }}
            transition={{ 
              duration: 6, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-20 left-10 w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full opacity-20"
          />
          <motion.div
            animate={{ 
              y: [20, -20, 20],
              rotate: [0, -5, 0]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-32 right-20 w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-full opacity-20"
          />
          <motion.div
            animate={{ 
              y: [-15, 15, -15],
              x: [0, 10, 0]
            }}
            transition={{ 
              duration: 7, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute bottom-20 left-1/4 w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full opacity-20"
          />
        </div>
      </div>

      {/* Enhanced background decoration */}
      <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
        <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-orange-400 via-green-400 to-emerald-500 opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"></div>
      </div>
      <div className="absolute inset-x-0 top-0 -z-10 flex transform-gpu justify-center overflow-hidden blur-3xl">
        <div className="aspect-[1108/632] w-[69.25rem] flex-none bg-gradient-to-r from-green-300 via-emerald-400 to-orange-300 opacity-15"></div>
      </div>
    </section>
  )
}