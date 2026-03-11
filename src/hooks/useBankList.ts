import { useState, useEffect } from 'react'
import type { Bank } from '@/types/adjutor.types'
import { adjutor } from '@/lib/adjutor'

let cachedBanks: Bank[] | null = null

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normaliseBank(raw: any, index: number): Bank {
  return {
    id: raw.id ?? raw.bankId ?? index,
    // short_code is the value Adjutor uses in verification requests
    code:
      raw.shortcode ??
      raw.bank_code ??
      raw.bankCode ??
      raw.code ??
      String(raw.id ?? index),
    name: raw.name ?? raw.bank_name ?? raw.bankName ?? 'Unknown Bank',
  }
}

export function useBankList() {
  const [banks, setBanks] = useState<Bank[]>(cachedBanks || [])
  const [loading, setLoading] = useState(!cachedBanks)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (cachedBanks) return

    adjutor
      .get<{ status: string; data: unknown }>('/banks')
      .then((res) => {
        const raw = Array.isArray(res.data) ? res.data : []
        const list = raw.map(normaliseBank)
        cachedBanks = list
        setBanks(list)
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : 'Failed to load bank list'
        setError(message)
      })
      .finally(() => setLoading(false))
  }, [])

  return { banks, loading, error }
}
