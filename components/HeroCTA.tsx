'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function HeroCTA() {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
      {/* Submit Pitch Button */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          delay: 1.2,
          type: 'spring' as const,
          stiffness: 200,
          damping: 15,
        }}
        whileHover={{
          scale: 1.05,
          y: -5,
          transition: {
            type: 'spring' as const,
            stiffness: 400,
            damping: 10,
          },
        }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{
            boxShadow: [
              '0 10px 40px rgba(34, 116, 165, 0.3)',
              '0 15px 50px rgba(247, 92, 3, 0.4)',
              '0 10px 40px rgba(34, 116, 165, 0.3)',
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Link
            href="/submit"
            className="relative inline-flex items-center gap-3 bg-gradient-to-r from-primary-500 via-primary-400 to-accent-blazeOrange text-white px-8 py-4 rounded-full font-bold text-lg hover:from-primary-400 hover:via-primary-300 hover:to-accent-blazeOrange transition-all duration-300 overflow-hidden group"
          >
            {/* Animated background gradient */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-accent-blazeOrange via-primary-500 to-accent-brightAmber opacity-0 group-hover:opacity-100"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
            
            {/* Sparkle effects */}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.6, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1,
              }}
            >
              <Sparkles className="absolute top-2 left-4 w-4 h-4 text-yellow-300" />
              <Sparkles className="absolute bottom-2 right-6 w-3 h-3 text-yellow-200" />
              <Sparkles className="absolute top-1/2 right-8 w-2 h-2 text-yellow-100" />
            </motion.div>
            
            <span className="relative z-10 flex items-center gap-2">
              Submit Pitch
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.span>
            </span>
          </Link>
        </motion.div>
      </motion.div>

      {/* Explore Gallery Button */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          delay: 1.4,
          type: 'spring' as const,
          stiffness: 200,
          damping: 15,
        }}
        whileHover={{
          scale: 1.05,
          y: -5,
          rotate: [0, -2, 2, -2, 0],
          transition: {
            type: 'spring' as const,
            stiffness: 400,
            damping: 10,
          },
        }}
        whileTap={{ scale: 0.95 }}
      >
        <Link
          href="/gallery"
          className="relative inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 hover:border-white/50 transition-all duration-300 overflow-hidden group"
        >
          {/* Animated shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
              repeatDelay: 1,
            }}
          />
          
          {/* Pulsing border */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-white/50"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          
          <span className="relative z-10 flex items-center gap-2">
            Explore Gallery
            <motion.span
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <ArrowRight className="w-5 h-5" />
            </motion.span>
          </span>
        </Link>
      </motion.div>
    </div>
  )
}
