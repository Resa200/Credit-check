import { useState, useEffect, useCallback } from 'react'
import { Crown, CreditCard, Trash2, Star, AlertTriangle } from 'lucide-react'
import { useSubscription } from '@/hooks/useSubscription'
import { usePaystackCards } from '@/hooks/usePaystackCards'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { formatNaira } from '@/lib/utils'
import PaystackButton from '@/components/molecules/PaystackButton'
import Button from '@/components/atoms/Button'
import Spinner from '@/components/atoms/Spinner'
import { cn } from '@/lib/utils'
import type { PaymentTransactionRow } from '@/types/supabase.types'

const cardIcons: Record<string, string> = {
  visa: 'V',
  mastercard: 'M',
  verve: 'Ve',
}

export default function SubscriptionPanel() {
  const {
    subscription,
    isActive,
    monthlyLookupCount,
    remainingFreeQuota,
    freeLimit,
    cancelSubscription,
    refreshSubscription,
    initializePaystack,
  } = useSubscription()
  const { cards, loading: cardsLoading, fetchCards, removeCard, setDefaultCard } = usePaystackCards()
  const profile = useAuthStore((s) => s.profile)

  const [transactions, setTransactions] = useState<PaymentTransactionRow[]>([])
  const [txLoading, setTxLoading] = useState(true)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const fetchTransactions = useCallback(() => {
    if (!profile) return
    setTxLoading(true)
    supabase
      .from('payment_transactions')
      .select('*')
      .eq('user_id', profile.id)
      .eq('deleted_flag', false)
      .order('created_on', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setTransactions((data as PaymentTransactionRow[]) ?? [])
        setTxLoading(false)
      })
  }, [profile])

  // Fetch billing history on mount
  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  /** Refresh all panel data after a successful upgrade */
  function handleUpgradeSuccess() {
    refreshSubscription()
    fetchCards()
    fetchTransactions()
  }

  async function handleCancel() {
    setCancelling(true)
    await cancelSubscription()
    setCancelling(false)
    setShowCancelConfirm(false)
  }

  const periodEnd = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString('en-NG', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <div className="flex flex-col gap-6">
      {/* Current Plan */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
        <h2 className="text-sm font-semibold text-[#1E293B] mb-4 flex items-center gap-2">
          <Crown size={16} className="text-[#7C3AED]" />
          Current Plan
        </h2>

        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-lg font-bold text-[#1E293B]">
              {isActive ? 'Pro Plan' : 'Free Plan'}
            </p>
            <p className="text-sm text-[#64748B]">
              {isActive
                ? 'Unlimited lookups per month'
                : `${freeLimit} lookups per month`}
            </p>
          </div>
          <span
            className={cn(
              'text-xs font-medium px-3 py-1 rounded-full',
              isActive
                ? 'bg-[#D1FAE5] text-[#059669]'
                : 'bg-[#F1F5F9] text-[#64748B]'
            )}
          >
            {isActive ? 'Active' : 'Free'}
          </span>
        </div>

        {!isActive && (
          <div className="mb-4">
            <p className="text-xs text-[#94A3B8] mb-1">
              {monthlyLookupCount} of {freeLimit} used this month ({remainingFreeQuota} remaining)
            </p>
            <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#7C3AED] rounded-full transition-all"
                style={{ width: `${Math.min((monthlyLookupCount / freeLimit) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {subscription?.status === 'cancelled' && periodEnd && (
          <p className="text-sm text-[#F59E0B] mb-4">
            Cancelled — access until {periodEnd}
          </p>
        )}

        {isActive && subscription?.status === 'active' && periodEnd && (
          <p className="text-xs text-[#94A3B8] mb-4">
            Next billing date: {periodEnd}
          </p>
        )}

        {isActive && subscription?.status === 'active' ? (
          showCancelConfirm ? (
            <div className="flex flex-col gap-3 bg-[#FFF1F2] rounded-xl border border-[#F43F5E]/30 p-4">
              <div className="flex items-center gap-2 text-sm text-[#1E293B]">
                <AlertTriangle size={16} className="text-[#F43F5E]" />
                Cancel subscription? You'll retain access until {periodEnd}.
              </div>
              <div className="flex gap-2">
                <Button
                  variant="danger"
                  size="sm"
                  loading={cancelling}
                  onClick={handleCancel}
                >
                  Yes, Cancel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCancelConfirm(false)}
                >
                  Keep Plan
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCancelConfirm(true)}
            >
              Cancel Subscription
            </Button>
          )
        ) : (
          <PaystackButton size="md" onSuccess={handleUpgradeSuccess}>
            Upgrade to Pro
          </PaystackButton>
        )}
      </div>

      {/* Saved Cards */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
        <h2 className="text-sm font-semibold text-[#1E293B] mb-4 flex items-center gap-2">
          <CreditCard size={16} className="text-[#7C3AED]" />
          Saved Cards
        </h2>

        {cardsLoading ? (
          <div className="flex justify-center py-6"><Spinner /></div>
        ) : cards.length === 0 ? (
          <p className="text-sm text-[#94A3B8] text-center py-6">
            No saved cards. Cards are saved automatically when you subscribe.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {cards.map((card) => (
              <div
                key={card.id}
                className="flex items-center justify-between rounded-xl border border-[#E2E8F0] p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-14 rounded-lg bg-[#F1F5F9] flex items-center justify-center text-xs font-bold text-[#64748B] uppercase">
                    {cardIcons[card.card_type?.toLowerCase() ?? ''] ?? card.card_type?.[0] ?? '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1E293B]">
                      •••• •••• •••• {card.card_last4 ?? '????'}
                      {card.is_default && (
                        <span className="ml-2 text-xs bg-[#EDE9FE] text-[#7C3AED] px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-[#94A3B8]">
                      {card.bank ?? 'Unknown bank'} · Expires {card.card_exp_month}/{card.card_exp_year}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {!card.is_default && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDefaultCard(card.id)}
                      title="Set as default"
                    >
                      <Star size={14} />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCard(card.id)}
                    title="Remove card"
                    className="text-[#F43F5E] hover:bg-[#FFF1F2]"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Billing History */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
        <h2 className="text-sm font-semibold text-[#1E293B] mb-4">
          Billing History
        </h2>

        {txLoading ? (
          <div className="flex justify-center py-6"><Spinner /></div>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-[#94A3B8] text-center py-6">
            No transactions yet
          </p>
        ) : (
          <div className="rounded-xl border border-[#E2E8F0] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#FAFAFA] border-b border-[#E2E8F0] text-left">
                  <th className="px-4 py-3 font-medium text-[#94A3B8]">Date</th>
                  <th className="px-4 py-3 font-medium text-[#94A3B8]">Amount</th>
                  <th className="px-4 py-3 font-medium text-[#94A3B8]">Status</th>
                  <th className="px-4 py-3 font-medium text-[#94A3B8] hidden sm:table-cell">Reference</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-[#E2E8F0]">
                    <td className="px-4 py-3 text-[#1E293B]">
                      {new Date(tx.created_on).toLocaleDateString('en-NG', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 text-[#1E293B] font-medium">
                      {formatNaira(tx.amount / 100)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'text-xs font-medium px-2 py-0.5 rounded-full',
                          tx.status === 'success'
                            ? 'bg-[#D1FAE5] text-[#059669]'
                            : 'bg-[#FFE4E6] text-[#F43F5E]'
                        )}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#94A3B8] text-xs hidden sm:table-cell truncate max-w-[150px]">
                      {tx.paystack_reference ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
