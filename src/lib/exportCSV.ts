import type { DataLookupRequestRow } from '@/types/supabase.types'

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function generateCSV(rows: DataLookupRequestRow[]): string {
  const headers = ['Date', 'Service Type', 'Status', 'Reference', 'Request', 'Response']
  const lines = [headers.map(escapeCSV).join(',')]

  for (const row of rows) {
    const date = new Date(row.created_on).toISOString()
    const line = [
      date,
      row.service_type,
      row.status,
      row.adjutor_reference ?? '',
      JSON.stringify(row.request_payload),
      row.response_payload ? JSON.stringify(row.response_payload) : '',
    ]
    lines.push(line.map(escapeCSV).join(','))
  }

  return lines.join('\n')
}

export function downloadCSV(rows: DataLookupRequestRow[]): void {
  const csv = generateCSV(rows)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const date = new Date().toISOString().split('T')[0]
  link.href = url
  link.download = `CreditCheck_History_${date}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
