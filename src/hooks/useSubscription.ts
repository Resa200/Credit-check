import { useCallback } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import {
  PAYSTACK_PUBLIC_KEY,
  PAYSTACK_PLAN_CODE,
  FREE_MONTHLY_LIMIT,
  getFirstOfMonth,
  loadPaystackScript,
} from '@/lib/paystack'
import { createAuditLog } from '@/lib/audit'
import type { SubscriptionRow } from '@/types/supabase.types'

/** Directly activate subscription + record transaction in DB (for demo/test mode without webhook) */
async function activateSubscriptionDirectly(
  userId: string,
  reference: string,
  paystackResponse: Record<string, unknown>
): Promise<SubscriptionRow | null> {
  const now = new Date()
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()).toISOString()

  // Upsert subscription
  const { data: sub } = await supabase
    .from('subscriptions')
    .upsert(
      {
        user_id: userId,
        paystack_customer_code: null,
        paystack_subscription_code: null,
        paystack_plan_code: PAYSTACK_PLAN_CODE,
        status: 'active',
        current_period_start: now.toISOString(),
        current_period_end: periodEnd,
        cancelled_at: null,
        meta: { activated_client_side: true, paystack_response: paystackResponse },
        created_by: userId,
        modified_by: userId,
      },
      { onConflict: 'user_id' }
    )
    .select()
    .maybeSingle()

  // Record transaction
  await supabase.from('payment_transactions').upsert(
    {
      user_id: userId,
      paystack_reference: reference,
      amount: 0, // Actual amount comes from webhook; 0 as placeholder
      currency: 'NGN',
      status: 'success',
      payment_type: 'subscription',
      meta: { activated_client_side: true },
      created_by: userId,
      modified_by: userId,
    },
    { onConflict: 'paystack_reference' }
  )

  // Audit log
  await createAuditLog({
    userId,
    action: 'subscription_activate',
    resourceType: 'subscriptions',
    resourceId: sub?.id,
    details: { reference, client_side: true },
  })

  return sub as SubscriptionRow | null
}

export async function fetchSubscription(userId: string): Promise<SubscriptionRow | null> {
  const { data } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('deleted_flag', false)
    .maybeSingle()
  return data as SubscriptionRow | null
}

export async function fetchMonthlyLookupCount(userId: string): Promise<number> {
  const firstOfMonth = getFirstOfMonth()
  const { count } = await supabase
    .from('data_lookup_requests')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'success')
    .eq('deleted_flag', false)
    .gte('created_on', firstOfMonth)
  return count ?? 0
}

function isSubscriptionActive(sub: SubscriptionRow | null): boolean {
  if (!sub) return false
  if (sub.status === 'active') return true
  // Cancelled but still within the paid period
  if (sub.status === 'cancelled' && sub.current_period_end) {
    return new Date(sub.current_period_end) > new Date()
  }
  return false
}

export function useSubscription() {
  const subscription = useAuthStore((s) => s.subscription)
  const monthlyLookupCount = useAuthStore((s) => s.monthlyLookupCount)
  const profile = useAuthStore((s) => s.profile)
  const setSubscription = useAuthStore((s) => s.setSubscription)
  const setMonthlyLookupCount = useAuthStore((s) => s.setMonthlyLookupCount)

  const isActive = isSubscriptionActive(subscription)

  const hasQuota = isActive || (monthlyLookupCount ?? 0) < FREE_MONTHLY_LIMIT

  const remainingFreeQuota = Math.max(0, FREE_MONTHLY_LIMIT - (monthlyLookupCount ?? 0))

  const refreshSubscription = useCallback(async () => {
    if (!profile) return
    const [sub, count] = await Promise.all([
      fetchSubscription(profile.id),
      fetchMonthlyLookupCount(profile.id),
    ])
    setSubscription(sub)
    setMonthlyLookupCount(count)
  }, [profile, setSubscription, setMonthlyLookupCount])

  const initializePaystack = useCallback(
    async (onSuccess?: () => void) => {
      if (!profile) {
        toast.error('Please sign in first')
        return
      }

      try {
        await loadPaystackScript()

        const PaystackPop = (window as unknown as Record<string, unknown>).PaystackPop as {
          setup: (config: Record<string, unknown>) => { openIframe: () => void }
        }

        const handler = PaystackPop.setup({
          key: PAYSTACK_PUBLIC_KEY,
          email: profile.email,
          plan: PAYSTACK_PLAN_CODE,
          channels: ['card'],
          metadata: {
            user_id: profile.id,
            custom_fields: [
              { display_name: 'Full Name', variable_name: 'full_name', value: profile.full_name },
            ],
          },
          callback: async (response: Record<string, unknown>) => {
            toast.success('Payment successful! Activating subscription...')
            const reference = (response.reference ?? response.trxref ?? '') as string

            // Try webhook-created subscription first
            const existingSub = await fetchSubscription(profile.id)
            if (existingSub && isSubscriptionActive(existingSub)) {
              setSubscription(existingSub)
              const count = await fetchMonthlyLookupCount(profile.id)
              setMonthlyLookupCount(count)
              onSuccess?.()
              return
            }

            // No webhook processed yet — activate directly (demo/test mode)
            const sub = await activateSubscriptionDirectly(profile.id, reference, response)
            if (sub) {
              setSubscription(sub)
              const count = await fetchMonthlyLookupCount(profile.id)
              setMonthlyLookupCount(count)
            }
            toast.success('Subscription activated!')
            onSuccess?.()
          },
          onClose: () => {
            // User closed the popup without completing
          },
        })

        handler.openIframe()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to initialize payment'
        toast.error(message)
      }
    },
    [profile, setSubscription, setMonthlyLookupCount, refreshSubscription]
  )

  const cancelSubscription = useCallback(async () => {
    if (!subscription?.paystack_subscription_code) {
      toast.error('No active subscription found')
      return
    }

    try {
      const { error } = await supabase.functions.invoke('manage-subscription', {
        body: {
          action: 'cancel',
          subscription_code: subscription.paystack_subscription_code,
        },
      })

      if (error) throw error

      toast.success('Subscription cancelled. You will retain access until the end of your billing period.')
      await refreshSubscription()
    } catch {
      toast.error('Unable to cancel subscription. Please try again or contact support.')
    }
  }, [subscription, refreshSubscription])

  return {
    subscription,
    monthlyLookupCount: monthlyLookupCount ?? 0,
    isActive,
    hasQuota,
    remainingFreeQuota,
    freeLimit: FREE_MONTHLY_LIMIT,
    refreshSubscription,
    initializePaystack,
    cancelSubscription,
  }
}
