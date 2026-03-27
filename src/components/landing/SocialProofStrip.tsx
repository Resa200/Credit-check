import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Users, Activity, ShieldCheck, Clock } from 'lucide-react'

const stats = [
  { icon: Activity, value: 10000, suffix: '+', label: 'Verifications', prefix: '' },
  { icon: Users, value: 5000, suffix: '+', label: 'Users Trusted', prefix: '' },
  { icon: Clock, value: 99.9, suffix: '%', label: 'Uptime', prefix: '' },
  { icon: ShieldCheck, value: 0, suffix: '', label: 'Data Stored', prefix: 'Zero' },
]

function AnimatedCounter({ target, suffix, prefix }: { target: number; suffix: string; prefix: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView || target === 0) return

    const duration = 2000
    const startTime = performance.now()
    const isFloat = !Number.isInteger(target)

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = eased * target

      setCount(isFloat ? Math.round(current * 10) / 10 : Math.floor(current))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [inView, target])

  return (
    <span ref={ref} className="text-2xl sm:text-3xl font-bold text-[#1E293B]">
      {prefix || (target === 0 ? 'Zero' : count.toLocaleString())}
      {suffix}
    </span>
  )
}

export default function SocialProofStrip() {
  return (
    <section className="bg-white border-y border-[#E2E8F0]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="flex flex-col items-center text-center gap-2"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EDE9FE] mb-1">
                <stat.icon size={18} className="text-[#7C3AED]" />
              </div>
              <AnimatedCounter
                target={stat.value}
                suffix={stat.suffix}
                prefix={stat.prefix}
              />
              <span className="text-sm text-[#64748B]">{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
