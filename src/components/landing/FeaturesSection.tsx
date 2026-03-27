import { motion } from 'framer-motion'
import { Fingerprint, Building2, FileBarChart, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const features = [
  {
    icon: Fingerprint,
    title: 'BVN Lookup',
    description:
      'Verify identity via BVN with OTP-based consent. Instant, secure, and fully NDPR compliant.',
    gradient: 'from-[#7C3AED] to-[#6D28D9]',
    shadowColor: 'shadow-[#7C3AED]/10',
  },
  {
    icon: Building2,
    title: 'Account Verification',
    description:
      'Confirm bank account ownership and details in real time. Supports all Nigerian banks.',
    gradient: 'from-[#F59E0B] to-[#D97706]',
    shadowColor: 'shadow-[#F59E0B]/10',
  },
  {
    icon: FileBarChart,
    title: 'Credit Report',
    description:
      'Pull comprehensive credit bureau reports with score breakdown. Download as PDF instantly.',
    gradient: 'from-[#10B981] to-[#059669]',
    shadowColor: 'shadow-[#10B981]/10',
  },
]

export default function FeaturesSection() {
  const navigate = useNavigate()

  return (
    <section id="features" className="py-24 lg:py-32 scroll-mt-20">
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
            Services
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1E293B] tracking-tight mb-4">
            Everything you need to verify trust
          </h2>
          <p className="text-[#64748B] text-lg max-w-2xl mx-auto">
            Three powerful verification services, all accessible from one simple platform.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{
                delay: i * 0.15,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{
                y: -8,
                transition: { duration: 0.3 },
              }}
              className={`group relative bg-white/80 backdrop-blur-sm border border-[#E2E8F0] rounded-2xl p-7 cursor-pointer transition-shadow duration-300 hover:shadow-xl ${feature.shadowColor} hover:border-[#7C3AED]/20`}
              onClick={() => navigate('/verify')}
            >
              {/* Icon */}
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} mb-5 shadow-lg ${feature.shadowColor}`}
              >
                <feature.icon size={26} className="text-white" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-[#1E293B] mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-[#64748B] leading-relaxed mb-4">
                {feature.description}
              </p>

              {/* Link */}
              <div className="flex items-center gap-1.5 text-sm font-medium text-[#7C3AED]">
                <span>Learn more</span>
                <ArrowRight
                  size={14}
                  className="transform transition-transform duration-200 group-hover:translate-x-1"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
