import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { MousePointerClick, FileEdit, Sparkles } from 'lucide-react'

const steps = [
  {
    icon: MousePointerClick,
    title: 'Choose a Service',
    description:
      'Select BVN Lookup, Account Verification, or Credit Report based on what you need.',
  },
  {
    icon: FileEdit,
    title: 'Enter Details',
    description:
      'Provide the required information. BVN lookups include a secure OTP consent step.',
  },
  {
    icon: Sparkles,
    title: 'Get Results',
    description:
      'Receive verified data in seconds. Export as PDF, share securely, or save to your account.',
  },
]

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 80%', 'end 60%'],
  })
  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="py-24 lg:py-32 bg-white scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16 lg:mb-20"
        >
          <span className="text-sm font-medium text-[#7C3AED] tracking-wide uppercase mb-3 block">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1E293B] tracking-tight mb-4">
            Three steps to verified trust
          </h2>
          <p className="text-[#64748B] text-lg max-w-2xl mx-auto">
            Get verified data in under a minute. No complicated processes.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative max-w-3xl mx-auto">
          {/* Animated vertical line */}
          <div className="absolute left-6 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-0.5 bg-[#E2E8F0]">
            <motion.div
              className="w-full bg-gradient-to-b from-[#7C3AED] to-[#F59E0B] origin-top"
              style={{ height: lineHeight }}
            />
          </div>

          <div className="flex flex-col gap-16 lg:gap-20">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{
                  delay: i * 0.2,
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`relative flex items-start gap-6 pl-16 md:pl-0 ${
                  i % 2 === 0
                    ? 'md:flex-row md:text-right'
                    : 'md:flex-row-reverse md:text-left'
                }`}
              >
                {/* Content */}
                <div className="flex-1 md:w-5/12">
                  <div
                    className={`${
                      i % 2 === 0 ? 'md:ml-auto md:mr-12' : 'md:mr-auto md:ml-12'
                    } max-w-sm`}
                  >
                    <h3 className="text-lg font-semibold text-[#1E293B] mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-[#64748B] leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Number circle - centered on line */}
                <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-[#7C3AED] text-white font-bold shadow-lg shadow-[#7C3AED]/20 z-10">
                  <step.icon size={20} />
                </div>

                {/* Spacer for the other side */}
                <div className="hidden md:block flex-1 md:w-5/12" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
