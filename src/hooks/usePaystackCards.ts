import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { PaymentCardRow } from '@/types/supabase.types'

export function usePaystackCards() {
  const profile = useAuthStore((s) => s.profile)
  const [cards, setCards] = useState<PaymentCardRow[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCards = useCallback(async () => {
    if (!profile) return
    setLoading(true)
    const { data } = await supabase
      .from('payment_cards')
      .select('*')
      .eq('user_id', profile.id)
      .eq('deleted_flag', false)
      .order('created_on', { ascending: false })
    setCards((data as PaymentCardRow[]) ?? [])
    setLoading(false)
  }, [profile])

  useEffect(() => {
    fetchCards()
  }, [fetchCards])

  const removeCard = useCallback(
    async (cardId: string) => {
      if (!profile) return
      await supabase
        .from('payment_cards')
        .update({
          deleted_flag: true,
          deleted_on: new Date().toISOString(),
          deleted_by: profile.id,
        })
        .eq('id', cardId)
        .eq('user_id', profile.id)
      await fetchCards()
    },
    [profile, fetchCards]
  )

  const setDefaultCard = useCallback(
    async (cardId: string) => {
      if (!profile) return
      // Unset all defaults
      await supabase
        .from('payment_cards')
        .update({ is_default: false, modified_by: profile.id })
        .eq('user_id', profile.id)
        .eq('deleted_flag', false)
      // Set new default
      await supabase
        .from('payment_cards')
        .update({ is_default: true, modified_by: profile.id })
        .eq('id', cardId)
        .eq('user_id', profile.id)
      await fetchCards()
    },
    [profile, fetchCards]
  )

  return { cards, loading, fetchCards, removeCard, setDefaultCard }
}
