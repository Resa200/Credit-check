// ─── Scalable Plan & Feature Access System ──────────────────────────────────
//
// To add a new plan:
//   1. Add it to the PlanTier type
//   2. Add its config to PLAN_CONFIG
//   3. Add its feature access to FEATURE_ACCESS
//   4. Map its Paystack plan code in PLAN_CODE_MAP
//
// To add a new gated feature:
//   1. Add its key to the Feature type
//   2. Add access rules to FEATURE_ACCESS for each plan tier

export type PlanTier = 'free' | 'pro' // | 'business' | 'enterprise' — add tiers here

export type Feature =
  | 'pdf_export'
  | 'json_export'
  | 'email_export'
  | 'ai_advisor'
  | 'lookup_history'
  | 'history_export'
  | 'share_result'
  | 'audit_log'

// ─── Plan configuration ─────────────────────────────────────────────────────

export interface PlanConfig {
  label: string
  monthlyLookups: number | null // null = unlimited
  price: number // in kobo (Naira * 100), 0 = free
}

export const PLAN_CONFIG: Record<PlanTier, PlanConfig> = {
  free: {
    label: 'Free',
    monthlyLookups: 5,
    price: 0,
  },
  pro: {
    label: 'Pro',
    monthlyLookups: null,
    price: 250000, // ₦2,500
  },
}

// ─── Feature access matrix ──────────────────────────────────────────────────

const FEATURE_ACCESS: Record<Feature, PlanTier[]> = {
  pdf_export:     ['pro'],
  json_export:    ['pro'],
  email_export:   ['pro'],
  ai_advisor:     ['pro'],
  lookup_history: ['pro'],
  history_export: ['pro'],
  share_result:   ['free', 'pro'],
  audit_log:      ['pro'],
}

// Human-readable labels shown in the lock tooltip
export const FEATURE_LABELS: Record<Feature, string> = {
  pdf_export:     'PDF Export',
  json_export:    'JSON Export',
  email_export:   'Email Export',
  ai_advisor:     'AI Credit Advisor',
  lookup_history: 'Lookup History',
  history_export: 'History Export',
  share_result:   'Share Result',
  audit_log:      'Audit Log',
}

// ─── Paystack plan code → tier mapping ──────────────────────────────────────

const PAYSTACK_PLAN_CODE = import.meta.env.VITE_PAYSTACK_PLAN_CODE ?? ''

const PLAN_CODE_MAP: Record<string, PlanTier> = {
  [PAYSTACK_PLAN_CODE]: 'pro',
  // Add more: { 'PLN_business_xyz': 'business' }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Resolve the user's plan tier from their subscription's Paystack plan code */
export function resolvePlanTier(planCode: string | null | undefined): PlanTier {
  if (!planCode) return 'free'
  return PLAN_CODE_MAP[planCode] ?? 'free'
}

/** Check if a plan tier has access to a feature */
export function hasFeatureAccess(tier: PlanTier, feature: Feature): boolean {
  return FEATURE_ACCESS[feature].includes(tier)
}

/** Get the minimum plan tier required for a feature */
export function minimumPlanFor(feature: Feature): PlanTier {
  const allowed = FEATURE_ACCESS[feature]
  // Return the lowest tier that has access (order matters in PlanTier)
  const tierOrder: PlanTier[] = ['free', 'pro']
  return tierOrder.find((t) => allowed.includes(t)) ?? 'pro'
}
