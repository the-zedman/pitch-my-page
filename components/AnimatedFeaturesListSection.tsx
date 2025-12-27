'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { CheckCircle } from 'lucide-react'

const features = [
  {
    title: 'Unlimited Pitch Submissions',
    description: 'Submit as many pitches as you want, completely free',
  },
  {
    title: 'Community Voting',
    description: 'Real votes from real people drive authentic rankings',
  },
  {
    title: 'Public Comments & Feedback',
    description: 'Engage with your audience and receive genuine feedback',
  },
  {
    title: 'Free Dofollow Backlinks',
    description: 'Get 2 reciprocal dofollow backlinks',
  },
  {
    title: 'Backlink Monitoring',
    description: 'Track your backlinks with weekly monitoring alerts',
  },
  {
    title: 'Transparent Rankings',
    description: "All ranking factors (upvotes, comments) are publicly visible, so you can see what drives each pitch's position",
  },
  {
    title: 'No Pay-to-Win',
    description: 'Rankings based solely on community engagement, not payments',
  },
  {
    title: 'SEO Tools & Resources',
    description: 'Access our blog and resources to improve your SEO strategy',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { 
    opacity: 0, 
    x: -30,
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
      duration: 0.5,
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

export default function AnimatedFeaturesListSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <section 
      id="features"
      ref={ref}
      className="relative bg-white py-24 overflow-hidden"
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgb(34, 116, 165) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
          animate={{
            backgroundPosition: ['0 0', '40px 40px'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

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
            Features
          </motion.h2>
          <motion.div
            className="w-24 h-1 bg-gradient-to-r from-primary-500 to-accent-blazeOrange mx-auto rounded-full"
            initial={{ width: 0 }}
            animate={isInView ? { width: 96 } : { width: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          />
        </motion.div>

        <motion.ul
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="max-w-4xl mx-auto space-y-6"
        >
          {features.map((feature, index) => (
            <motion.li
              key={feature.title}
              variants={itemVariants}
              whileHover={{
                x: 10,
                transition: {
                  type: 'spring' as const,
                  stiffness: 300,
                  damping: 20,
                },
              }}
              className="flex items-start gap-4 group"
            >
              <motion.div
                className="flex-shrink-0 mt-1"
                whileHover={{
                  scale: 1.2,
                  rotate: [0, -10, 10, -10, 0],
                }}
                transition={{
                  type: 'spring' as const,
                  stiffness: 300,
                }}
              >
                <CheckCircle className="w-7 h-7 text-primary-500" />
              </motion.div>
              <div className="flex-1">
                <motion.span
                  className="text-lg md:text-xl text-gray-700 group-hover:text-gray-900 transition-colors"
                  initial={{ opacity: 0.8 }}
                  whileHover={{ opacity: 1 }}
                >
                  <strong className="font-semibold text-gray-900">{feature.title}</strong>
                  {' - '}
                  {feature.description}
                </motion.span>
              </div>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  )
}

