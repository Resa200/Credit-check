import { useAuthStore } from '@/store/authStore'
import { useAuth } from '@/hooks/useAuth'
import {
  resolvePlanTier,
  hasFeatureAccess,
  minimumPlanFor,
  PLAN_CONFIG,
  FEATURE_LABELS,
  type Feature,
  type PlanTier,
} from '@/lib/plans'
import type { SubscriptionRow } from '@/types/supabase.types'

function isSubscriptionActive(sub: SubscriptionRow | null): boolean {
  if (!sub) return false
  if (sub.status === 'active') return true
  if (sub.status === 'cancelled' && sub.current_period_end) {
    return new Date(sub.current_period_end) > new Date()
  }
  return false
}

export function useFeatureAccess() {
  const subscription = useAuthStore((s) => s.subscription)
  const { isAuthenticated } = useAuth()

  const tier: PlanTier =
    isAuthenticated && isSubscriptionActive(subscription)
      ? resolvePlanTier(subscription?.paystack_plan_code)
      : 'free'

  const planLabel = PLAN_CONFIG[tier].label

  function canAccess(feature: Feature): boolean {
    return hasFeatureAccess(tier, feature)
  }

  function requiredPlanLabel(feature: Feature): string {
    const required = minimumPlanFor(feature)
    return PLAN_CONFIG[required].label
  }

  function featureLabel(feature: Feature): string {
    return FEATURE_LABELS[feature]
  }

  return {
    tier,
    planLabel,
    canAccess,
    requiredPlanLabel,
    featureLabel,
    isAuthenticated,
  }
}
