import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Button from '@/components/atoms/Button'
import HeroScene from './HeroScene'

const wordVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.4 + i * 0.08,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
}

export default function HeroSection() {
  const navigate = useNavigate()

  const headlineWords = ['Know', 'your']
  const gradientWords = ['financial', 'standing.']
  const trailingWords = ['Instantly.']

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden pt-16"
      style={{
        background:
          'radial-gradient(ellipse at 70% 40%, rgba(124,58,237,0.07) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(245,158,11,0.04) 0%, transparent 50%), #FAFAFA',
      }}
    >
      {/* Decorative blurred shapes */}
      <div className="absolute top-20 right-1/4 w-72 h-72 bg-[#7C3AED]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-56 h-56 bg-[#F59E0B]/5 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Text Content */}
          <div className="flex flex-col gap-6 text-center lg:text-left">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-4 py-1.5 text-xs text-[#64748B] shadow-sm self-center lg:self-start"
            >
              <div className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
              Live bureau data · Powered by Adjutor
            </motion.div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1E293B] leading-[1.1] tracking-tight">
              {headlineWords.map((word, i) => (
                <motion.span
                  key={word}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={wordVariants}
                  className="inline-block mr-[0.3em]"
                >
                  {word}
                </motion.span>
              ))}
              <br className="hidden sm:block" />
              {gradientWords.map((word, i) => (
                <motion.span
                  key={word}
                  custom={i + headlineWords.length}
                  initial="hidden"
                  animate="visible"
                  variants={wordVariants}
                  className="inline-block mr-[0.3em] bg-gradient-to-r from-[#7C3AED] to-[#F59E0B] bg-clip-text text-transparent"
                >
                  {word}
                </motion.span>
              ))}
              <br className="hidden sm:block" />
              {trailingWords.map((word, i) => (
                <motion.span
                  key={word}
                  custom={i + headlineWords.length + gradientWords.length}
                  initial="hidden"
                  animate="visible"
                  variants={wordVariants}
                  className="inline-block mr-[0.3em]"
                >
                  {word}
                </motion.span>
              ))}
            </h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="text-[#64748B] text-lg sm:text-xl max-w-lg leading-relaxed mx-auto lg:mx-0"
            >
              Verify your BVN, confirm bank accounts, and pull your full credit
              report — all in one place.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
            >
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="lg"
                  onClick={() => navigate('/verify')}
                  className="px-8 shadow-lg shadow-[#7C3AED]/20"
                  style={{
                    animation: 'pulse-glow 3s ease-in-out infinite',
                  }}
                >
                  Get Started Free
                  <ArrowRight size={18} />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <a href="#how-it-works">
                  <Button size="lg" variant="outline" className="px-8">
                    See How It Works
                  </Button>
                </a>
              </motion.div>
            </motion.div>

            {/* Trust text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="text-xs text-[#94A3B8]"
            >
              No credit card required · 5 free lookups per month
            </motion.p>
          </div>

          {/* 3D Scene */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative h-[350px] sm:h-[400px] lg:h-[500px] rounded-3xl"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(124,58,237,0.06) 0%, transparent 70%)',
            }}
          >
            <HeroScene />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
