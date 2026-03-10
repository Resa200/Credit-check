import type { LoanRecord } from '@/types/adjutor.types'
import { formatNaira, formatDate, capitalise } from '@/lib/utils'
import Badge from '@/components/atoms/Badge'

interface LoanHistoryTableProps {
  loans: LoanRecord[]
}

function statusVariant(status?: string): 'success' | 'error' | 'warning' | 'default' {
  const s = (status || '').toLowerCase()
  if (s.includes('settled') || s.includes('closed')) return 'success'
  if (s.includes('due') || s.includes('default')) return 'error'
  if (s.includes('active') || s.includes('running')) return 'warning'
  return 'default'
}

export default function LoanHistoryTable({ loans }: LoanHistoryTableProps) {
  if (!loans || loans.length === 0) {
    return (
      <p className="text-sm text-[#94A3B8] py-4 text-center">
        No loan history found.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[#E2E8F0]">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#FAFAFA] border-b border-[#E2E8F0]">
            <th className="text-left px-4 py-3 font-medium text-[#64748B]">Lender</th>
            <th className="text-left px-4 py-3 font-medium text-[#64748B]">Amount</th>
            <th className="text-left px-4 py-3 font-medium text-[#64748B]">Outstanding</th>
            <th className="text-left px-4 py-3 font-medium text-[#64748B]">Status</th>
            <th className="text-left px-4 py-3 font-medium text-[#64748B]">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0]">
          {loans.map((loan, i) => (
            <tr key={i} className="bg-white hover:bg-[#FAFAFA] transition-colors">
              <td className="px-4 py-3 text-[#1E293B]">{loan.lender || '—'}</td>
              <td className="px-4 py-3 text-[#1E293B]">{formatNaira(loan.loan_amount)}</td>
              <td className="px-4 py-3 text-[#1E293B]">{formatNaira(loan.outstanding_balance)}</td>
              <td className="px-4 py-3">
                <Badge variant={statusVariant(loan.status)}>
                  {capitalise(loan.status || 'Unknown')}
                </Badge>
              </td>
              <td className="px-4 py-3 text-[#64748B]">{formatDate(loan.date_reported || '')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
