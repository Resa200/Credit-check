import { Link } from 'react-router-dom'
import { Zap, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuotaBannerProps {
  used: number
  limit: number
  hasSubscription: boolean
}

export default function QuotaBanner({ used, limit, hasSubscription }: QuotaBannerProps) {
  if (hasSubscription) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-[#D1FAE5] bg-[#D1FAE5]/30 p-4 mb-8">
        <Crown size={18} className="text-[#059669] shrink-0" />
        <p className="text-sm text-[#059669] font-medium">
          Unlimited lookups — Pro plan active
        </p>
      </div>
    )
  }

  const pct = Math.min((used / limit) * 100, 100)
  const exhausted = used >= limit

  return (
    <div
      className={cn(
        'rounded-xl border p-4 mb-8',
        exhausted
          ? 'border-[#F43F5E]/30 bg-[#FFF1F2]/30'
          : 'border-[#E2E8F0] bg-white'
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Zap size={16} className={exhausted ? 'text-[#F43F5E]' : 'text-[#7C3AED]'} />
          <span className="text-sm font-medium text-[#1E293B]">
            {exhausted
              ? 'Free lookups exhausted'
              : `${used} of ${limit} free lookups used this month`}
          </span>
        </div>
        <Link
          to="/profile?tab=subscription"
          className="text-xs text-[#7C3AED] font-medium hover:underline"
        >
          {exhausted ? 'Upgrade now' : 'Upgrade'}
        </Link>
      </div>
      <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            exhausted ? 'bg-[#F43F5E]' : pct >= 80 ? 'bg-[#F59E0B]' : 'bg-[#7C3AED]'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
