import { useNavigate } from 'react-router-dom'
import { Shield, Zap, Lock } from 'lucide-react'
import Button from '@/components/atoms/Button'

const features = [
  {
    icon: Zap,
    title: 'Instant results',
    description: 'Verifications complete in seconds, powered by live bureau data.',
  },
  {
    icon: Shield,
    title: 'Secure by design',
    description: 'Your data is never stored or shared. All checks are read-only.',
  },
  {
    icon: Lock,
    title: 'Consent-based',
    description: 'BVN lookups use OTP consent — your data is never accessed without permission.',
  },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center">
      {/* Hero */}
      <section className="w-full max-w-3xl mx-auto px-4 sm:px-6 pt-16 pb-12 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-4 py-1.5 text-xs text-[#64748B] mb-6">
          <div className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
          Live bureau data · Powered by Adjutor
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-[#1E293B] leading-tight text-balance mb-5">
          Know your{' '}
          <span className="text-[#7C3AED]">financial standing</span>.{' '}
          Instantly.
        </h1>

        <p className="text-[#64748B] text-lg max-w-xl mx-auto leading-relaxed mb-8">
          Verify your BVN, confirm bank accounts, and pull your full credit report —
          all in one place. No login required.
        </p>

        <Button size="lg" onClick={() => navigate('/verify')} className="px-8">
          Get Started →
        </Button>

        <p className="text-xs text-[#94A3B8] mt-4">
          Your data is never stored or shared.
        </p>
      </section>

      {/* Feature cards */}
      <section className="w-full max-w-3xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-[#E2E8F0] bg-white p-5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EDE9FE] mb-4">
                <f.icon size={18} className="text-[#7C3AED]" />
              </div>
              <h3 className="font-semibold text-[#1E293B] text-sm mb-1">
                {f.title}
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
