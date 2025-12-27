'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

const pricingPlans = [
  {
    name: 'Free',
    price: '$0',
    period: '',
    features: [
      'Submit unlimited pitches',
      'Community voting and comments',
      'Unlimited backlink monitoring with weekly alerts',
      '2 reciprocal DOFOLLOW backlinks'
    ],
    highlighted: true,
    comingSoon: false,
  },
  {
    name: 'Basic',
    price: '$5',
    period: '/month',
    features: [
      'Everything in the FREE plan, plus',
      'Daily backlink monitoring and alerts',
      'Bulk upload (CSV) of backlinks to monitor',
      '10 extra DOFOLLOW backlinks'
    ],
    highlighted: false,
    comingSoon: true,
  },
  {
    name: 'Power',
    price: '$29',
    period: '/month',
    features: [
      'Everything in the BASIC plan, plus',
      'Hourly backlink monitoring and alerts',
      'Auto-submit pitches on schedule',
      'Unlimited DOFOLLOW backlinks',
      'Priority support'
    ],
    highlighted: false,
    comingSoon: true,
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
}

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 60,
    scale: 0.9,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
      duration: 0.6,
    },
  },
}

const titleVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 12,
    },
  },
}

function AnimatedPricingCard({ 
  plan, 
  index 
}: { 
  plan: typeof pricingPlans[0]
  index: number 
}) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{
        y: -10,
        scale: 1.02,
        transition: {
          type: 'spring' as const,
          stiffness: 300,
          damping: 20,
        },
      }}
      className={`relative ${plan.highlighted ? 'lg:scale-105 z-10' : ''}`}
    >
      {/* Glow effect for highlighted card */}
      {plan.highlighted && (
        <motion.div
          className="absolute -inset-1 bg-gradient-to-r from-primary-500 via-accent-blazeOrange to-primary-500 rounded-2xl blur-xl opacity-75"
          animate={{
            opacity: [0.5, 0.8, 0.5],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      <div
        className={`relative bg-white rounded-2xl shadow-xl border-2 p-8 h-full ${
          plan.highlighted
            ? 'border-primary-500 shadow-2xl'
            : 'border-gray-200'
        }`}
      >
        {/* Popular badge */}
        {plan.highlighted && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute -top-4 left-1/2 transform -translate-x-1/2"
          >
            <span className="bg-gradient-to-r from-primary-500 to-accent-blazeOrange text-white px-4 py-1 rounded-full text-sm font-bold">
              POPULAR
            </span>
          </motion.div>
        )}

        <div className="text-center mb-8">
          <motion.h3
            className="text-2xl font-bold text-gray-900 mb-2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {plan.name}
          </motion.h3>
          <motion.div
            className="flex items-baseline justify-center gap-1"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ 
              delay: 0.3,
              type: 'spring' as const,
              stiffness: 200,
            }}
          >
            <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
            {plan.period && (
              <span className="text-gray-600 text-lg">{plan.period}</span>
            )}
          </motion.div>
        </div>

        <ul className="space-y-4 mb-8">
          {plan.features.map((feature, i) => (
            <motion.li
              key={i}
              className="flex items-start gap-3"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
            >
              <CheckCircle className="w-6 h-6 text-primary-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">{feature}</span>
            </motion.li>
          ))}
        </ul>

        {plan.comingSoon ? (
          <motion.button
            disabled
            className="block w-full text-center py-3 px-4 rounded-lg font-semibold transition bg-gray-200 text-gray-500 cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            COMING SOON
          </motion.button>
        ) : (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/auth/signup"
              className={`block text-center py-3 px-4 rounded-lg font-semibold transition ${
                plan.highlighted
                  ? 'bg-gradient-to-r from-primary-500 to-primary-400 text-white hover:from-primary-400 hover:to-primary-300 shadow-lg'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              Get Started
            </Link>
          </motion.div>
        )}

        {/* Decorative gradient corner */}
        <motion.div
          className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${
            plan.highlighted 
              ? 'from-primary-500/10 to-accent-blazeOrange/10' 
              : 'from-gray-200/20 to-gray-300/20'
          } rounded-bl-full`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>
    </motion.div>
  )
}

export default function AnimatedPricingSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section 
      id="pricing"
      ref={ref}
      className="relative py-24 bg-gray-50 overflow-hidden"
    >
      {/* Animated background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20"
          animate={{
            background: [
              'linear-gradient(135deg, #f9fafb 0%, #eff6ff 50%, #faf5ff 100%)',
              'linear-gradient(135deg, #faf5ff 0%, #f9fafb 50%, #eff6ff 100%)',
              'linear-gradient(135deg, #f9fafb 0%, #eff6ff 50%, #faf5ff 100%)',
            ],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      {/* Floating orbs */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl opacity-10"
          style={{
            width: `${150 + Math.random() * 100}px`,
            height: `${150 + Math.random() * 100}px`,
            background: i % 2 === 0 
              ? 'linear-gradient(135deg, #2274A5, #F75C03)' 
              : 'linear-gradient(135deg, #F1C40F, #2274A5)',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            x: [0, Math.random() * 50 - 25, 0],
            y: [0, Math.random() * 50 - 25, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8 + Math.random() * 5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: Math.random() * 3,
          }}
        />
      ))}

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          variants={titleVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-center mb-16"
        >
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
          >
            Simple, Affordable Pricing
          </motion.h2>
          <motion.p
            className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.3 }}
          >
            Start free, upgrade when you see value. No pay-to-win mechanics—just transparent pricing.
          </motion.p>
          <motion.div
            className="w-24 h-1 bg-gradient-to-r from-primary-500 to-accent-blazeOrange mx-auto rounded-full"
            initial={{ width: 0 }}
            animate={isInView ? { width: 96 } : { width: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          />
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {pricingPlans.map((plan, index) => (
            <AnimatedPricingCard key={plan.name} plan={plan} index={index} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

