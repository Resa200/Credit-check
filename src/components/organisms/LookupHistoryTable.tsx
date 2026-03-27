import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, Search } from 'lucide-react'
import { useLookupHistory } from '@/hooks/useLookupHistory'
import type { HistoryFilters } from '@/hooks/useLookupHistory'
import { cn } from '@/lib/utils'
import Button from '@/components/atoms/Button'
import Spinner from '@/components/atoms/Spinner'
import ExportMenu from '@/components/molecules/ExportMenu'

const serviceLabels: Record<string, string> = {
  bvn: 'BVN Lookup',
  account: 'Account Verification',
  credit: 'Credit Report',
}

const statusColors: Record<string, string> = {
  success: 'bg-[#D1FAE5] text-[#059669]',
  error: 'bg-[#FFE4E6] text-[#F43F5E]',
  pending: 'bg-[#FEF9C3] text-[#CA8A04]',
}

interface LookupHistoryTableProps {
  initialFilters?: HistoryFilters
}

export default function LookupHistoryTable({ initialFilters }: LookupHistoryTableProps) {
  const {
    rows, loading, page, totalPages, setPage, filters, setFilters,
  } = useLookupHistory()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Apply initial filters from URL params (set by command bar)
  useEffect(() => {
    if (initialFilters && Object.keys(initialFilters).length > 0) {
      setFilters(initialFilters)
      setPage(0)
    }
  // Only apply on mount or when initialFilters reference changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFilters])

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#94A3B8]">Service</label>
          <select
            value={filters.serviceType ?? ''}
            onChange={(e) => {
              setFilters({ ...filters, serviceType: e.target.value || undefined })
              setPage(0)
            }}
            className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#1E293B] outline-none focus:border-[#7C3AED]"
          >
            <option value="">All</option>
            <option value="bvn">BVN</option>
            <option value="account">Account</option>
            <option value="credit">Credit</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#94A3B8]">Status</label>
          <select
            value={filters.status ?? ''}
            onChange={(e) => {
              setFilters({ ...filters, status: e.target.value || undefined })
              setPage(0)
            }}
            className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#1E293B] outline-none focus:border-[#7C3AED]"
          >
            <option value="">All</option>
            <option value="success">Success</option>
            <option value="error">Error</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#94A3B8]">From</label>
          <input
            type="date"
            value={filters.dateFrom ?? ''}
            onChange={(e) => {
              setFilters({ ...filters, dateFrom: e.target.value || undefined })
              setPage(0)
            }}
            className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#1E293B] outline-none focus:border-[#7C3AED]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#94A3B8]">To</label>
          <input
            type="date"
            value={filters.dateTo ?? ''}
            onChange={(e) => {
              setFilters({ ...filters, dateTo: e.target.value || undefined })
              setPage(0)
            }}
            className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#1E293B] outline-none focus:border-[#7C3AED]"
          />
        </div>
        <div className="ml-auto">
          <ExportMenu rows={rows} />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <Search size={32} className="text-[#94A3B8]" />
          <p className="text-sm text-[#94A3B8]">No lookup history found</p>
        </div>
      ) : (
        <div className="rounded-xl border border-[#E2E8F0] bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#FAFAFA] border-b border-[#E2E8F0] text-left">
                <th className="px-4 py-3 font-medium text-[#94A3B8] w-8"></th>
                <th className="px-4 py-3 font-medium text-[#94A3B8]">Date</th>
                <th className="px-4 py-3 font-medium text-[#94A3B8]">Service</th>
                <th className="px-4 py-3 font-medium text-[#94A3B8]">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <TableRow
                  key={row.id}
                  row={row}
                  expanded={expandedId === row.id}
                  onToggle={() =>
                    setExpandedId(expandedId === row.id ? null : row.id)
                  }
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            size="sm"
            variant="outline"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="text-xs text-[#94A3B8]">
            Page {page + 1} of {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}

function TableRow({
  row,
  expanded,
  onToggle,
}: {
  row: import('@/types/supabase.types').DataLookupRequestRow
  expanded: boolean
  onToggle: () => void
}) {
  const date = new Date(row.created_on).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <>
      <tr
        onClick={onToggle}
        className="border-b border-[#E2E8F0] hover:bg-[#FAFAFA] cursor-pointer transition-colors"
      >
        <td className="px-4 py-3">
          {expanded ? (
            <ChevronDown size={14} className="text-[#94A3B8]" />
          ) : (
            <ChevronRight size={14} className="text-[#94A3B8]" />
          )}
        </td>
        <td className="px-4 py-3 text-[#1E293B]">{date}</td>
        <td className="px-4 py-3 text-[#1E293B]">
          {serviceLabels[row.service_type] ?? row.service_type}
        </td>
        <td className="px-4 py-3">
          <span
            className={cn(
              'text-xs font-medium px-2 py-0.5 rounded-full',
              statusColors[row.status] ?? 'bg-[#F1F5F9] text-[#64748B]'
            )}
          >
            {row.status}
          </span>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-[#FAFAFA]">
          <td colSpan={4} className="px-4 py-4">
            <div className="flex flex-col gap-3">
              <div>
                <h4 className="text-xs font-semibold text-[#94A3B8] uppercase mb-1">
                  Request
                </h4>
                <pre className="text-xs text-[#1E293B] bg-white rounded-lg border border-[#E2E8F0] p-3 overflow-x-auto max-h-40">
                  {JSON.stringify(row.request_payload, null, 2)}
                </pre>
              </div>
              {row.response_payload && (
                <div>
                  <h4 className="text-xs font-semibold text-[#94A3B8] uppercase mb-1">
                    Response
                  </h4>
                  <pre className="text-xs text-[#1E293B] bg-white rounded-lg border border-[#E2E8F0] p-3 overflow-x-auto max-h-60">
                    {JSON.stringify(row.response_payload, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
