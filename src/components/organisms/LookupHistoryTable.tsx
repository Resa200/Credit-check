import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, Search, X } from 'lucide-react'
import { useLookupHistory } from '@/hooks/useLookupHistory'
import type { HistoryFilters } from '@/hooks/useLookupHistory'
import type { DataLookupRequestRow } from '@/types/supabase.types'
import type { BVNData, AccountData, CreditReportData } from '@/types/adjutor.types'
import { cn } from '@/lib/utils'
import Button from '@/components/atoms/Button'
import Spinner from '@/components/atoms/Spinner'
import ExportMenu from '@/components/molecules/ExportMenu'
import BVNResult from '@/components/organisms/BVNResult'
import AccountResult from '@/components/organisms/AccountResult'
import CreditReportResult from '@/components/organisms/CreditReportResult'

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
  const [viewingResult, setViewingResult] = useState<DataLookupRequestRow | null>(null)

  // Apply initial filters from URL params (set by command bar)
  useEffect(() => {
    if (initialFilters && Object.keys(initialFilters).length > 0) {
      setFilters(initialFilters)
      setPage(0)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFilters])

  // Full result view modal
  if (viewingResult && viewingResult.response_payload && viewingResult.status === 'success') {
    return (
      <div className="flex flex-col gap-4">
        {/* Back button */}
        <button
          type="button"
          onClick={() => setViewingResult(null)}
          className="flex items-center gap-2 text-sm font-medium text-[#7C3AED] hover:text-[#6D28D9] transition-colors self-start"
        >
          <X size={16} />
          Back to History
        </button>

        {/* Result card */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
          <ResultView row={viewingResult} onClose={() => setViewingResult(null)} />
        </div>
      </div>
    )
  }

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
                <th className="px-4 py-3 font-medium text-[#94A3B8]"></th>
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
                  onViewResult={() => setViewingResult(row)}
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
  onViewResult,
}: {
  row: DataLookupRequestRow
  expanded: boolean
  onToggle: () => void
  onViewResult: () => void
}) {
  const date = new Date(row.created_on).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const canView = row.status === 'success' && row.response_payload

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
        <td className="px-4 py-3">
          {canView && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onViewResult()
              }}
              className="text-xs font-medium text-[#7C3AED] hover:text-[#6D28D9] transition-colors"
            >
              View
            </button>
          )}
        </td>
      </tr>
      {expanded && (
        <tr className="bg-[#FAFAFA]">
          <td colSpan={5} className="px-4 py-4">
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
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-[#94A3B8] uppercase">
                    Response available
                  </h4>
                  <button
                    type="button"
                    onClick={onViewResult}
                    className="text-xs font-medium text-[#7C3AED] hover:text-[#6D28D9] bg-[#EDE9FE] px-3 py-1.5 rounded-lg transition-colors"
                  >
                    View Full Result
                  </button>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

/** Renders the response using the same result components as the live lookup flow */
function ResultView({
  row,
  onClose,
}: {
  row: DataLookupRequestRow
  onClose: () => void
}) {
  const data = row.response_payload

  if (!data) return null

  const noop = () => {} // No-op for actions not applicable in history view

  switch (row.service_type) {
    case 'bvn':
      return (
        <BVNResult
          data={data as unknown as BVNData}
          onCheckAnother={onClose}
          onBackToServices={onClose}
        />
      )
    case 'account':
      return (
        <AccountResult
          data={data as unknown as AccountData}
          onCheckAnother={onClose}
          onBackToServices={onClose}
        />
      )
    case 'credit': {
      const bureau = (row.request_payload as Record<string, string>)?.bureau ?? 'crc'
      return (
        <CreditReportResult
          data={data as unknown as CreditReportData}
          bureau={bureau}
          onCheckAnother={onClose}
          onBackToServices={onClose}
        />
      )
    }
    default:
      return (
        <pre className="text-xs text-[#1E293B] bg-white rounded-lg border border-[#E2E8F0] p-3 overflow-x-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      )
  }
}
