import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Shield, CheckCircle2, AlertTriangle } from 'lucide-react'
import Button from '@/components/atoms/Button'

export default function ShareView() {
  const [searchParams] = useSearchParams()

  const payload = useMemo(() => {
    try {
      const encoded = searchParams.get('d')
      if (!encoded) return null
      return JSON.parse(atob(encoded)) as Record<string, string>
    } catch {
      return null
    }
  }, [searchParams])

  if (!payload) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-4">
        <div className="w-full max-w-md text-center flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFE4E6]">
            <AlertTriangle size={24} className="text-[#F43F5E]" />
          </div>
          <h1 className="text-xl font-bold text-[#1E293B]">Invalid Share Link</h1>
          <p className="text-sm text-[#94A3B8]">
            This link is invalid or has expired.
          </p>
          <Link to="/">
            <Button>Go to CreditCheck</Button>
          </Link>
        </div>
      </div>
    )
  }

  const entries = Object.entries(payload).filter(
    ([key]) => key !== 'type'
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7C3AED]">
              <Shield size={20} className="text-white" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-[#1E293B]">Verification Result</h1>
          <p className="text-sm text-[#94A3B8]">Shared via CreditCheck</p>
        </div>

        {/* Result card */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm">
          {/* Type header */}
          <div className="px-5 py-4 bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] flex items-center gap-3">
            <CheckCircle2 size={20} className="text-white" />
            <span className="text-white font-semibold">{payload.type}</span>
          </div>

          {/* Details */}
          <div className="px-5 divide-y divide-[#F1F5F9]">
            {entries.map(([key, value]) => (
              <div key={key} className="flex justify-between items-center py-3.5">
                <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wide">
                  {key.replace(/_/g, ' ')}
                </span>
                <span className="text-sm font-medium text-[#1E293B]">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-6 text-center flex flex-col gap-3">
          <p className="text-xs text-[#94A3B8]">
            Want to verify your own identity or credit?
          </p>
          <Link to="/services">
            <Button size="lg" className="w-full">
              Try CreditCheck Free
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
