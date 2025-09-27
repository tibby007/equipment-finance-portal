'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export function PricingSection() {
  const plans = [
    {
      name: 'Starter',
      price: 39,
      description: 'Perfect for small brokers just getting started',
      features: [
        'Up to 3 vendors',
        'Basic kanban pipeline',
        '50 deals per month',
        'Email support',
        'Document storage (1GB)',
        'Basic reporting',
      ],
      cta: 'Get Started',
      popular: false,
      gradient: 'from-green-500 to-emerald-600',
      hoverGradient: 'hover:from-green-600 hover:to-emerald-700',
    },
    {
      name: 'Professional',
      price: 99,
      description: 'Ideal for growing broker operations',
      features: [
        'Up to 10 vendors',
        'Advanced pipeline management',
        '200 deals per month',
        'Priority support',
        'Document storage (10GB)',
        'Advanced analytics',
        'Custom deal stages',
        'Bulk vendor invitations',
      ],
      cta: 'Get Started',
      popular: true,
      gradient: 'from-orange-500 to-red-600',
      hoverGradient: 'hover:from-orange-600 hover:to-red-700',
    },
    {
      name: 'Premium',
      price: 397,
      description: 'For large broker operations',
      features: [
        'Unlimited vendors',
        'Full pipeline customization',
        'Unlimited deals',
        'Dedicated support',
        'Document storage (100GB)',
        'White-label options',
        'API access',
        'Custom integrations',
        'SLA guarantee',
      ],
      cta: 'Contact Sales',
      popular: false,
      gradient: 'from-emerald-600 to-green-700',
      hoverGradient: 'hover:from-emerald-700 hover:to-green-800',
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

  const cardVariants = {
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
    <section className="py-24 sm:py-32 bg-gradient-to-br from-green-50 via-white to-orange-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mx-auto max-w-4xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Choose the plan that fits your business size. Start today and scale as you grow.
          </p>
        </motion.div>
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-8 lg:max-w-4xl lg:grid-cols-3"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={cardVariants}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
              }}
              className={`relative ${plan.popular ? 'lg:scale-110' : ''}`}
            >
              <Card className={`relative h-full ${plan.popular ? 'border-2 border-orange-500 shadow-xl' : 'border border-gray-200 hover:border-green-300'} bg-white/80 backdrop-blur transition-all duration-300`}>
                {plan.popular && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 500 }}
                  >
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg">
                      Most Popular
                    </Badge>
                  </motion.div>
                )}
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 supports-[background-clip:text]:bg-clip-text supports-[background-clip:text]:text-transparent">
                      ${plan.price}
                    </span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <CardDescription className="mt-4 text-base">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4 text-sm mb-8">
                    {plan.features.map((feature, index) => (
                      <motion.li 
                        key={index} 
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="flex items-center"
                      >
                        <svg
                          className="h-5 w-5 text-green-500 mr-3 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    <Button 
                      asChild 
                      className={`w-full bg-gradient-to-r ${plan.gradient} ${plan.hoverGradient} text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200`}
                    >
                      <Link href={plan.cta === 'Contact Sales' ? '/contact' : '/signup'}>
                        {plan.cta}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-gray-600">
            All plans include full access to features. Cancel anytime.
          </p>
        </motion.div>
      </div>
    </section>
  )
}