export function FeaturesSection() {
  const features = [
    {
      name: 'Shared Pipeline Visibility',
      description: 'Both brokers and vendors can track deal progress in real-time with our visual kanban board system.',
      icon: '👁️',
    },
    {
      name: 'Vendor Network Management',
      description: 'Easily invite and manage your vendor network with automated onboarding and credential management.',
      icon: '🤝',
    },
    {
      name: 'Prequalification Tool',
      description: 'Smart prequalification system provides instant green, yellow, or red light decisions.',
      icon: '🚦',
    },
    {
      name: 'Document Management',
      description: 'Secure document upload and organization with deal-specific file management.',
      icon: '📄',
    },
    {
      name: 'Two-Way Communication',
      description: 'Built-in messaging system keeps all deal communications organized and accessible.',
      icon: '💬',
    },
    {
      name: 'Resource Library',
      description: 'Share training materials and resources with your vendor network for better outcomes.',
      icon: '📚',
    },
  ]

  return (
    <section className="py-24 sm:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to manage equipment finance deals
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Our platform eliminates the chaos of email chains and phone calls, 
            providing a centralized hub for all your broker-vendor interactions.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                    <span className="text-white text-lg">{feature.icon}</span>
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}