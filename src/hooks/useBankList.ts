import { useState, useEffect } from 'react'
import type { Bank, BankListResponse } from '@/types/adjutor.types'
import { adjutor } from '@/lib/adjutor'

let cachedBanks: Bank[] | null = null

export function useBankList() {
  const [banks, setBanks] = useState<Bank[]>(cachedBanks || [])
  const [loading, setLoading] = useState(!cachedBanks)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (cachedBanks) return

    adjutor
      .get<BankListResponse>('/banks')
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : []
        cachedBanks = list
        setBanks(list)
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Failed to load bank list'
        setError(message)
      })
      .finally(() => setLoading(false))
  }, [])

  return { banks, loading, error }
}
