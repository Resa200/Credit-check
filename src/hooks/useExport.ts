import { useCallback } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { createAuditLog } from '@/lib/audit'
import { downloadCSV } from '@/lib/exportCSV'
import { downloadJSON, downloadSingleResultJSON } from '@/lib/exportJSON'
import { generateBVNPDF, generateAccountPDF } from '@/lib/exportPDF'
import type { DataLookupRequestRow } from '@/types/supabase.types'
import type { BVNData, AccountData } from '@/types/adjutor.types'

export function useExport() {
  const profile = useAuthStore((s) => s.profile)

  const exportHistoryCSV = useCallback(
    (rows: DataLookupRequestRow[]) => {
      downloadCSV(rows)
      if (profile) {
        createAuditLog({
          userId: profile.id,
          action: 'export_download',
          details: { format: 'csv', count: rows.length },
        })
      }
    },
    [profile]
  )

  const exportHistoryJSON = useCallback(
    (rows: DataLookupRequestRow[]) => {
      downloadJSON(rows)
      if (profile) {
        createAuditLog({
          userId: profile.id,
          action: 'export_download',
          details: { format: 'json', count: rows.length },
        })
      }
    },
    [profile]
  )

  const exportResultJSON = useCallback(
    (serviceType: string, payload: Record<string, unknown>) => {
      downloadSingleResultJSON(serviceType, payload)
      if (profile) {
        createAuditLog({
          userId: profile.id,
          action: 'export_download',
          details: { format: 'json', service_type: serviceType },
        })
      }
    },
    [profile]
  )

  const exportBVNPDF = useCallback(
    (data: BVNData) => {
      generateBVNPDF(data)
      if (profile) {
        createAuditLog({
          userId: profile.id,
          action: 'export_download',
          details: { format: 'pdf', service_type: 'bvn' },
        })
      }
    },
    [profile]
  )

  const exportAccountPDF = useCallback(
    (data: AccountData) => {
      generateAccountPDF(data)
      if (profile) {
        createAuditLog({
          userId: profile.id,
          action: 'export_download',
          details: { format: 'pdf', service_type: 'account' },
        })
      }
    },
    [profile]
  )

  const emailExport = useCallback(
    async (lookupRequestId: string, format: 'pdf' | 'json' | 'csv') => {
      if (!profile) {
        toast.error('Please sign in to email exports')
        return
      }

      try {
        const { error } = await supabase.functions.invoke('send-export-email', {
          body: {
            user_id: profile.id,
            lookup_request_id: lookupRequestId,
            format,
          },
        })

        if (error) throw error
        toast.success('Export sent to your email!')
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to send email'
        toast.error(message)
      }
    },
    [profile]
  )

  const emailResult = useCallback(
    async (
      serviceType: string,
      resultData: Record<string, unknown>,
      format: 'json' | 'csv' = 'json'
    ) => {
      if (!profile) {
        toast.error('Please sign in to email results')
        return
      }

      try {
        const { error } = await supabase.functions.invoke('send-export-email', {
          body: {
            user_id: profile.id,
            service_type: serviceType,
            result_data: resultData,
            format,
          },
        })

        if (error) throw error
        toast.success(`Result sent to ${profile.email}`)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to send email'
        toast.error(message)
      }
    },
    [profile]
  )

  return {
    exportHistoryCSV,
    exportHistoryJSON,
    exportResultJSON,
    exportBVNPDF,
    exportAccountPDF,
    emailExport,
    emailResult,
  }
}
