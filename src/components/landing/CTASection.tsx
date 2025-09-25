'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function CTASection() {
  return (
    <section className="relative bg-gradient-to-r from-green-600 via-emerald-600 to-orange-600 py-16 sm:py-24 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full"
        />
        <motion.div
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0]
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full"
        />
        <motion.div
          animate={{ 
            y: [-20, 20, -20],
            x: [-10, 10, -10]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/2 left-1/4 w-6 h-6 bg-white/20 rounded-full"
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <motion.h2 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            viewport={{ once: true }}
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            Ready to streamline your equipment finance operations?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            viewport={{ once: true }}
            className="mx-auto mt-6 max-w-xl text-lg leading-8 text-green-100"
          >
            Join hundreds of brokers who have transformed their vendor relationships 
            and accelerated their deal closures with our platform.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            viewport={{ once: true }}
            className="mt-10 flex items-center justify-center gap-x-6"
          >
            <Button 
              asChild 
              size="lg" 
              className="bg-white text-green-600 hover:bg-gray-50 hover:text-green-700 shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300 font-semibold"
            >
              <Link href="/signup">Get Started Today</Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="lg" 
              className="border-2 border-white text-white hover:bg-white hover:text-green-600 transition-all duration-300 backdrop-blur-sm bg-white/10"
            >
              <Link href="/contact">Schedule Demo</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}