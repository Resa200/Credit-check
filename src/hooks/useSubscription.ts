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
import type { SubscriptionRow } from '@/types/supabase.types'

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
          callback: async () => {
            toast.success('Payment successful! Activating subscription...')
            // Poll for webhook to process (up to 3 retries)
            for (let i = 0; i < 3; i++) {
              await new Promise((r) => setTimeout(r, 1500))
              const sub = await fetchSubscription(profile.id)
              if (sub && isSubscriptionActive(sub)) {
                setSubscription(sub)
                const count = await fetchMonthlyLookupCount(profile.id)
                setMonthlyLookupCount(count)
                onSuccess?.()
                return
              }
            }
            // If webhook hasn't processed yet, still refresh
            await refreshSubscription()
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
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel subscription'
      toast.error(message)
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
