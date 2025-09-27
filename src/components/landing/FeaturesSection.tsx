'use client'

import { motion } from 'framer-motion'

export function FeaturesSection() {
  const features = [
    {
      name: 'Shared Pipeline Visibility',
      description: 'Both brokers and vendors can track deal progress in real-time with our visual kanban board system.',
      icon: '👁️',
      gradient: 'from-green-500 to-emerald-600',
    },
    {
      name: 'Vendor Network Management',
      description: 'Easily invite and manage your vendor network with automated onboarding and credential management.',
      icon: '🤝',
      gradient: 'from-orange-500 to-red-600',
    },
    {
      name: 'Prequalification Tool',
      description: 'Smart prequalification system provides instant green, yellow, or red light decisions.',
      icon: '🚦',
      gradient: 'from-emerald-500 to-green-600',
    },
    {
      name: 'Document Management',
      description: 'Secure document upload and organization with deal-specific file management.',
      icon: '📄',
      gradient: 'from-orange-600 to-amber-600',
    },
    {
      name: 'Two-Way Communication',
      description: 'Built-in messaging system keeps all deal communications organized and accessible.',
      icon: '💬',
      gradient: 'from-green-600 to-teal-600',
    },
    {
      name: 'Resource Library',
      description: 'Share training materials and resources with your vendor network for better outcomes.',
      icon: '📚',
      gradient: 'from-orange-500 to-yellow-600',
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  }

  return (
    <section className="py-24 sm:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to manage equipment finance deals
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Our platform eliminates the chaos of email chains and phone calls, 
            providing a centralized hub for all your broker-vendor interactions.
          </p>
        </motion.div>
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl"
        >
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {features.map((feature) => (
              <motion.div 
                key={feature.name} 
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                className="relative pl-16 group cursor-pointer"
              >
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className={`absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r ${feature.gradient} shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                    <span className="text-white text-xl">{feature.icon}</span>
                  </div>
                  <span className="group-hover:text-green-600 transition-colors duration-300">
                    {feature.name}
                  </span>
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                  {feature.description}
                </dd>
              </motion.div>
            ))}
          </dl>
        </motion.div>
      </div>
    </section>
  )
}