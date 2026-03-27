import { useState } from 'react'
import { Lock, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useFeatureAccess } from '@/hooks/useFeatureAccess'
import type { Feature } from '@/lib/plans'
import { cn } from '@/lib/utils'

interface FeatureGateProps {
  feature: Feature
  children: React.ReactNode
  /** Render style: 'overlay' dims and locks the child, 'replace' swaps it entirely */
  mode?: 'overlay' | 'replace'
  className?: string
}

/**
 * Wraps a feature with plan-based access control.
 * If the user's plan doesn't include the feature, shows a padlock with tooltip.
 * Scalable — works with any number of plan tiers.
 */
export default function FeatureGate({
  feature,
  children,
  mode = 'overlay',
  className,
}: FeatureGateProps) {
  const { canAccess, requiredPlanLabel, featureLabel, isAuthenticated } = useFeatureAccess()
  const [showTooltip, setShowTooltip] = useState(false)
  const navigate = useNavigate()

  if (canAccess(feature)) {
    return <>{children}</>
  }

  const label = featureLabel(feature)
  const requiredPlan = requiredPlanLabel(feature)
  const tooltipText = isAuthenticated
    ? `${label} is available on the ${requiredPlan} plan. Upgrade to unlock.`
    : `Sign in and upgrade to ${requiredPlan} to access ${label}.`

  const ctaAction = () => navigate(isAuthenticated ? '/profile' : '/login')

  if (mode === 'replace') {
    return (
      <div
        className={cn(
          'relative flex items-center gap-3 px-4 py-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] cursor-pointer',
          className
        )}
        onClick={ctaAction}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F1F5F9]">
          <Lock size={16} className="text-[#94A3B8]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#64748B]">{label}</p>
          <p className="text-xs text-[#94A3B8]">{requiredPlan} plan feature</p>
        </div>
        <span className="flex items-center gap-1 text-xs font-medium text-[#7C3AED] bg-[#EDE9FE] px-2.5 py-1 rounded-full whitespace-nowrap">
          Upgrade
          <ArrowRight size={12} />
        </span>

        {showTooltip && <GateTooltip text={tooltipText} />}
      </div>
    )
  }

  // overlay mode — dim the child and show a small lock badge
  return (
    <div
      className={cn('relative', className)}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Dimmed child */}
      <div className="opacity-35 pointer-events-none select-none" aria-hidden>
        {children}
      </div>

      {/* Small lock badge */}
      <div
        className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
        onClick={ctaAction}
      >
        <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm border border-[#E2E8F0] shadow-sm rounded-full px-2.5 py-1.5">
          <Lock size={12} className="text-[#94A3B8]" />
          <span className="text-[11px] font-medium text-[#7C3AED]">
            {requiredPlan}
          </span>
        </div>
      </div>

      {showTooltip && <GateTooltip text={tooltipText} />}
    </div>
  )
}

function GateTooltip({ text }: { text: string }) {
  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-56 rounded-xl border border-[#E2E8F0] bg-white p-3 text-xs text-[#1E293B] shadow-xl leading-relaxed pointer-events-none">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-2 h-2 bg-white border-b border-r border-[#E2E8F0] rotate-45" />
    </div>
  )
}
