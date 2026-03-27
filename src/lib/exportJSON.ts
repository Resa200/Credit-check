import type { DataLookupRequestRow } from '@/types/supabase.types'

export function generateExportJSON(rows: DataLookupRequestRow[]): string {
  const exportData = rows.map((row) => ({
    date: row.created_on,
    service_type: row.service_type,
    status: row.status,
    reference: row.adjutor_reference,
    request: row.request_payload,
    response: row.response_payload,
  }))
  return JSON.stringify(exportData, null, 2)
}

export function downloadJSON(rows: DataLookupRequestRow[]): void {
  const json = generateExportJSON(rows)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const date = new Date().toISOString().split('T')[0]
  link.href = url
  link.download = `CreditCheck_History_${date}.json`
  link.click()
  URL.revokeObjectURL(url)
}

export function downloadSingleResultJSON(
  serviceType: string,
  payload: Record<string, unknown>
): void {
  const json = JSON.stringify(payload, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `CreditCheck_${serviceType}_${Date.now()}.json`
  link.click()
  URL.revokeObjectURL(url)
}
