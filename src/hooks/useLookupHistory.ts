import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { DataLookupRequestRow } from '@/types/supabase.types'

const PAGE_SIZE = 10

export interface HistoryFilters {
  serviceType?: string
  status?: string
  dateFrom?: string
  dateTo?: string
}

export function useLookupHistory() {
  const profile = useAuthStore((s) => s.profile)
  const [rows, setRows] = useState<DataLookupRequestRow[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [filters, setFilters] = useState<HistoryFilters>({})

  const fetchHistory = useCallback(async () => {
    if (!profile) return
    setLoading(true)

    let query = supabase
      .from('data_lookup_requests')
      .select('*', { count: 'exact' })
      .eq('user_id', profile.id)
      .eq('deleted_flag', false)
      .order('created_on', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (filters.serviceType) {
      query = query.eq('service_type', filters.serviceType)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.dateFrom) {
      query = query.gte('created_on', filters.dateFrom)
    }
    if (filters.dateTo) {
      query = query.lte('created_on', filters.dateTo + 'T23:59:59')
    }

    const { data, count, error } = await query

    if (!error && data) {
      setRows(data as DataLookupRequestRow[])
      setTotal(count ?? 0)
    }
    setLoading(false)
  }, [profile, page, filters])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return {
    rows,
    loading,
    total,
    page,
    totalPages,
    setPage,
    filters,
    setFilters,
    refetch: fetchHistory,
  }
}
