import { motion } from 'framer-motion'
import { Check, X, Crown, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/atoms/Button'

interface PlanFeature {
  label: string
  free: boolean
  pro: boolean
}

const features: PlanFeature[] = [
  { label: 'BVN Lookup', free: true, pro: true },
  { label: 'Account Verification', free: true, pro: true },
  { label: 'Credit Reports', free: true, pro: true },
  { label: 'Email Support', free: true, pro: true },
  { label: 'PDF Export', free: false, pro: true },
  { label: 'Priority Support', free: false, pro: true },
  { label: 'Lookup History', free: false, pro: true },
]

function FeatureRow({ label, included }: { label: string; included: boolean | 'coming' }) {
  return (
    <li className="flex items-center gap-3 py-1.5">
      {included === true ? (
        <div className="h-5 w-5 rounded-full bg-[#D1FAE5] flex items-center justify-center flex-shrink-0">
          <Check size={12} className="text-[#059669]" />
        </div>
      ) : included === 'coming' ? (
        <div className="h-5 w-5 rounded-full bg-[#FEF3C7] flex items-center justify-center flex-shrink-0">
          <Sparkles size={12} className="text-[#D97706]" />
        </div>
      ) : (
        <div className="h-5 w-5 rounded-full bg-[#F1F5F9] flex items-center justify-center flex-shrink-0">
          <X size={12} className="text-[#94A3B8]" />
        </div>
      )}
      <span className={`text-sm ${included ? 'text-[#1E293B]' : 'text-[#94A3B8]'}`}>
        {label}
        {included === 'coming' && (
          <span className="ml-1.5 text-xs text-[#D97706]">(Coming soon)</span>
        )}
      </span>
    </li>
  )
}

export default function PricingSection() {
  const navigate = useNavigate()

  return (
    <section id="pricing" className="py-24 lg:py-32 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-[#7C3AED] tracking-wide uppercase mb-3 block">
            Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1E293B] tracking-tight mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-[#64748B] text-lg max-w-2xl mx-auto">
            Start free with 5 lookups per month. Upgrade when you need more.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -4, transition: { duration: 0.3 } }}
            className="bg-white border border-[#E2E8F0] rounded-2xl p-8 flex flex-col"
          >
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-[#1E293B] mb-1">Free</h3>
              <p className="text-sm text-[#64748B] mb-4">
                Perfect for personal use
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-[#1E293B]">₦0</span>
                <span className="text-[#94A3B8] text-sm">/month</span>
              </div>
              <p className="text-xs text-[#94A3B8] mt-1">5 lookups per month</p>
            </div>

            <ul className="flex flex-col gap-0.5 mb-8 flex-1">
              {features.map((f) => (
                <FeatureRow
                  key={f.label}
                  label={f.label}
                  included={
                    f.label === 'API Access' ? 'coming' : f.free
                  }
                />
              ))}
            </ul>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => navigate('/verify')}
              >
                Get Started Free
              </Button>
            </motion.div>
          </motion.div>

          {/* Pro Plan */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{
              delay: 0.15,
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={{ y: -4, transition: { duration: 0.3 } }}
            className="relative bg-white border-2 border-[#7C3AED] rounded-2xl p-8 flex flex-col shadow-xl shadow-[#7C3AED]/10"
          >
            {/* Popular Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1.5 bg-[#7C3AED] text-white text-xs font-medium px-4 py-1.5 rounded-full shadow-lg shadow-[#7C3AED]/30">
                <Crown size={12} />
                Most Popular
              </span>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-[#1E293B] mb-1">Pro</h3>
              <p className="text-sm text-[#64748B] mb-4">
                For professionals and businesses
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-[#1E293B]">₦2,500</span>
                <span className="text-[#94A3B8] text-sm">/month</span>
              </div>
              <p className="text-xs text-[#94A3B8] mt-1">Unlimited lookups</p>
            </div>

            <ul className="flex flex-col gap-0.5 mb-8 flex-1">
              {features.map((f) => (
                <FeatureRow
                  key={f.label}
                  label={f.label}
                  included={
                    f.label === 'API Access' ? 'coming' : f.pro
                  }
                />
              ))}
            </ul>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                className="w-full shadow-lg shadow-[#7C3AED]/20"
                onClick={() => navigate('/signup')}
              >
                Upgrade to Pro
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
