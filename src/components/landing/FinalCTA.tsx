import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Button from '@/components/atoms/Button'

export default function FinalCTA() {
  const navigate = useNavigate()

  return (
    <section
      className="py-24 lg:py-32 relative overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(245,158,11,0.04) 50%, rgba(124,58,237,0.06) 100%)',
      }}
    >
      {/* Decorative blurred shapes */}
      <div className="absolute top-10 left-1/4 w-64 h-64 bg-[#7C3AED]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-1/4 w-48 h-48 bg-[#F59E0B]/5 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1E293B] tracking-tight mb-5">
            Ready to verify with{' '}
            <span className="bg-gradient-to-r from-[#7C3AED] to-[#F59E0B] bg-clip-text text-transparent">
              confidence
            </span>
            ?
          </h2>
          <p className="text-[#64748B] text-lg mb-8 max-w-lg mx-auto">
            Join thousands of Nigerians taking control of their financial
            identity. Start verifying in seconds.
          </p>

          <motion.div
            className="flex flex-col sm:flex-row gap-3 justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                size="lg"
                onClick={() => navigate('/verify')}
                className="px-8 shadow-lg shadow-[#7C3AED]/20"
              >
                Start Verifying Free
                <ArrowRight size={18} />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <a href="#pricing">
                <Button size="lg" variant="outline" className="px-8">
                  View Pricing
                </Button>
              </a>
            </motion.div>
          </motion.div>

          <p className="text-xs text-[#94A3B8] mt-6">
            No credit card required · Set up in under 60 seconds
          </p>
        </motion.div>
      </div>
    </section>
  )
}
