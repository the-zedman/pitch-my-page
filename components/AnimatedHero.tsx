'use client'

import { motion } from 'framer-motion'
import HeroCTA from './HeroCTA'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
}

const titleVariants = {
  hidden: { 
    opacity: 0, 
    y: 50,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12,
      duration: 0.8,
    },
  },
}

const subtitleVariants = {
  hidden: { 
    opacity: 0, 
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
      duration: 0.6,
      delay: 0.3,
    },
  },
}

const wordVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      type: 'spring',
      stiffness: 100,
    },
  }),
}

const titleWords = [
  { text: 'Pitch', highlight: false },
  { text: 'Your', highlight: false },
  { text: 'Page,', highlight: false },
  { text: 'Get', highlight: false },
  { text: 'Discovered,', highlight: true },
  { text: 'Rank', highlight: false },
  { text: 'Higher', highlight: true },
]

export default function AnimatedHero() {
  return (
    <section className="container mx-auto px-4 py-20 text-center relative overflow-hidden">
      {/* Animated background gradient particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/10"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 30 - 15, 0],
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10"
      >
        <motion.h1
          variants={titleVariants}
          className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 text-balance font-space-grotesk leading-tight"
          style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
        >
          <span className="inline-block">
            {titleWords.map((word, i) => (
              <motion.span
                key={i}
                custom={i}
                variants={wordVariants}
                className={`inline-block mr-3 ${
                  word.highlight
                    ? 'bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-300 bg-clip-text text-transparent drop-shadow-lg'
                    : ''
                }`}
                whileHover={{
                  scale: 1.1,
                  rotate: word.highlight ? [0, -5, 5, -5, 0] : 0,
                  transition: { duration: 0.3 },
                }}
              >
                {word.text}
              </motion.span>
            ))}
          </span>
        </motion.h1>

        <motion.p
          variants={subtitleVariants}
          className="text-xl md:text-2xl lg:text-3xl text-white/95 mb-8 max-w-4xl mx-auto text-balance font-medium leading-relaxed"
          style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="inline-block"
          >
            Pitch your page to an engaged community.
          </motion.span>
          {' '}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="inline-block"
          >
            Transparent voting, genuine feedback, and authentic rankings surface quality content.
          </motion.span>
          {' '}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="inline-block font-semibold text-yellow-200"
          >
            No bots, no pay-to-win, just real value for indie developers and content creators.
          </motion.span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.1, type: 'spring', stiffness: 100 }}
        >
          <HeroCTA />
        </motion.div>
      </motion.div>
    </section>
  )
}

