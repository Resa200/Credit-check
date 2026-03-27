import { Search } from 'lucide-react'
import { useAuditLog } from '@/hooks/useAuditLog'
import Button from '@/components/atoms/Button'
import Spinner from '@/components/atoms/Spinner'

const actionLabels: Record<string, string> = {
  login: 'Signed In',
  logout: 'Signed Out',
  bvn_lookup: 'BVN Lookup',
  account_lookup: 'Account Verification',
  credit_lookup: 'Credit Report',
  profile_update: 'Profile Updated',
  account_delete: 'Account Deleted',
  export_email: 'Export Emailed',
  export_download: 'Export Downloaded',
}

export default function AuditLogTable() {
  const {
    rows, loading, page, totalPages, setPage, filters, setFilters,
  } = useAuditLog()

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#94A3B8]">Action</label>
          <select
            value={filters.action ?? ''}
            onChange={(e) => {
              setFilters({ ...filters, action: e.target.value || undefined })
              setPage(0)
            }}
            className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#1E293B] outline-none focus:border-[#7C3AED]"
          >
            <option value="">All</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
            <option value="bvn_lookup">BVN Lookup</option>
            <option value="account_lookup">Account Verification</option>
            <option value="credit_lookup">Credit Report</option>
            <option value="profile_update">Profile Update</option>
            <option value="account_delete">Account Delete</option>
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
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <Search size={32} className="text-[#94A3B8]" />
          <p className="text-sm text-[#94A3B8]">No audit logs found</p>
        </div>
      ) : (
        <div className="rounded-xl border border-[#E2E8F0] bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#FAFAFA] border-b border-[#E2E8F0] text-left">
                <th className="px-4 py-3 font-medium text-[#94A3B8]">Date</th>
                <th className="px-4 py-3 font-medium text-[#94A3B8]">Action</th>
                <th className="px-4 py-3 font-medium text-[#94A3B8] hidden sm:table-cell">Resource</th>
                <th className="px-4 py-3 font-medium text-[#94A3B8] hidden md:table-cell">Details</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const date = new Date(row.created_on).toLocaleDateString('en-NG', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
                return (
                  <tr
                    key={row.id}
                    className="border-b border-[#E2E8F0] hover:bg-[#FAFAFA] transition-colors"
                  >
                    <td className="px-4 py-3 text-[#1E293B]">{date}</td>
                    <td className="px-4 py-3 text-[#1E293B]">
                      {actionLabels[row.action] ?? row.action}
                    </td>
                    <td className="px-4 py-3 text-[#64748B] hidden sm:table-cell">
                      {row.resource_type ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-[#64748B] hidden md:table-cell max-w-[200px] truncate">
                      {row.details ? JSON.stringify(row.details) : '—'}
                    </td>
                  </tr>
                )
              })}
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
