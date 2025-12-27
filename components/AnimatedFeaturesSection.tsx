'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Shield, Users, TrendingUp, Link2, CheckCircle, Star } from 'lucide-react'

const features = [
  {
    icon: Shield,
    title: 'Community-Driven Rankings',
    description: 'Your content rises based on real votes from real people. No pay-to-play, no hidden algorithms—just genuine community engagement that determines what gets seen.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Star,
    title: 'Transparent Voting System',
    description: 'Every vote is public and authentic. See what the community loves, engage with comments, and watch your content climb the rankings organically—no shortcuts, just real engagement.',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Users,
    title: 'Genuine Community',
    description: 'Real feedback, networking opportunities, and collaboration tools. No spam, no scams—just authentic community engagement.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: CheckCircle,
    title: 'For All Content Creators',
    description: 'Whether you\'re an indie developer launching a product, a writer sharing your latest article, or a marketer promoting content—our platform gives everyone an equal chance to be discovered.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: TrendingUp,
    title: 'Perfect for Writers & Bloggers',
    description: "Get your articles, blog posts, and content discovered by an engaged audience. Whether you're a solo blogger or part of a content team, showcase your best work and build real readership.",
    color: 'from-indigo-500 to-blue-500',
  },
  {
    icon: Link2,
    title: 'Ethical Dofollow Backlinks',
    description: 'Build valuable SEO backlinks the right way. Get 2 free dofollow backlinks with reciprocal linking, or unlock unlimited backlinks with our affordable plans starting at $5/month.',
    color: 'from-red-500 to-rose-500',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 60,
    scale: 0.8,
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

function AnimatedFeatureCard({ 
  feature, 
  index 
}: { 
  feature: typeof features[0]
  index: number 
}) {
  const Icon = feature.icon
  
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
      className="relative group"
    >
      {/* Animated gradient border */}
      <motion.div
        className="absolute -inset-0.5 bg-gradient-to-r opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"
        style={{
          background: `linear-gradient(to right, ${feature.color.split(' ')[1]}, ${feature.color.split(' ')[3]})`,
        }}
      />
      
      <div className="relative bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-100 h-full">
        {/* Icon with animated background */}
        <motion.div
          className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} mb-6 relative overflow-hidden`}
          whileHover={{
            rotate: [0, -5, 5, -5, 0],
            scale: 1.1,
          }}
          transition={{
            type: 'spring' as const,
            stiffness: 200,
          }}
        >
          {/* Animated shine effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
              ease: 'linear',
            }}
          />
          <Icon className="w-8 h-8 text-white relative z-10" />
        </motion.div>

        <h3 className="text-xl font-bold mb-4 text-gray-900 group-hover:text-primary-500 transition-colors">
          {feature.title}
        </h3>
        
        <motion.p
          className="text-gray-600 leading-relaxed"
          initial={{ opacity: 0.8 }}
          whileHover={{ opacity: 1 }}
        >
          {feature.description}
        </motion.p>

        {/* Decorative gradient corner */}
        <motion.div
          className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-5 rounded-bl-full`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.1, 0.05],
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

export default function AnimatedFeaturesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section 
      ref={ref}
      className="relative py-24 overflow-hidden"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
        {/* Animated mesh gradient */}
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(34, 116, 165, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 50%, rgba(247, 92, 3, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 50% 80%, rgba(241, 196, 15, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 50%, rgba(34, 116, 165, 0.3) 0%, transparent 50%)',
            ],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      {/* Floating orbs */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl opacity-20"
          style={{
            width: `${100 + Math.random() * 200}px`,
            height: `${100 + Math.random() * 200}px`,
            background: i % 2 === 0 
              ? 'linear-gradient(135deg, #2274A5, #F75C03)' 
              : 'linear-gradient(135deg, #F1C40F, #F75C03)',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: Math.random() * 5,
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
            <span className="bg-gradient-to-r from-primary-500 via-accent-blazeOrange to-accent-brightAmber bg-clip-text text-transparent">
              Why Choose Pitch My Page?
            </span>
          </motion.h2>
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
        >
          {features.map((feature, index) => (
            <AnimatedFeatureCard 
              key={feature.title} 
              feature={feature} 
              index={index}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

