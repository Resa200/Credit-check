import { useRef } from 'react'
import type { CreditReportData } from '@/types/adjutor.types'
import { formatNaira, formatDate } from '@/lib/utils'
import { generateCreditPDF } from '@/lib/reportPDF'
import DataRow from '@/components/molecules/DataRow'
import LoanHistoryTable from '@/components/molecules/LoanHistoryTable'
import CreditScoreGauge from '@/components/molecules/CreditScoreGauge'
import StatusBadge from '@/components/molecules/StatusBadge'
import Button from '@/components/atoms/Button'
import { Download, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface CreditReportResultProps {
  data: CreditReportData
  bureau: string
  onCheckAnother: () => void
  onBackToServices: () => void
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(true)

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3 bg-[#FAFAFA] border-b border-[#E2E8F0] hover:bg-[#EDE9FE]/30 transition-colors"
      >
        <h3 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide">
          {title}
        </h3>
        <ChevronDown
          size={16}
          className={cn(
            'text-[#94A3B8] transition-transform duration-200',
            open ? 'rotate-180' : ''
          )}
        />
      </button>
      {open && <div className="px-5">{children}</div>}
    </div>
  )
}

export default function CreditReportResult({
  data,
  bureau,
  onCheckAnother,
  onBackToServices,
}: CreditReportResultProps) {
  const reportRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)

  const score = data.credit_summary?.credit_score
  const maxScore = data.credit_summary?.max_score || 850
  const personalInfo = data.personal_info
  const summary = data.credit_summary
  const loans = data.loan_history || []
  const enquiries = data.enquiry_history || []

  const bureauLabel = bureau === 'crc' ? 'CRC Credit Bureau' : 'FirstCentral'
  const generatedDate = new Date().toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  async function handleDownload() {
    setDownloading(true)
    try {
      await generateCreditPDF(data, bureau, reportRef)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col items-center gap-2 text-center">
        <StatusBadge status="success" label="Report Retrieved" />
        <h2 className="text-xl font-bold text-[#1E293B]">
          {personalInfo?.full_name || 'Credit Report'}
        </h2>
        <p className="text-xs text-[#94A3B8]">
          {bureauLabel} · Generated {generatedDate}
        </p>
      </div>

      {/* Score */}
      {score !== undefined && (
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 flex justify-center">
          <CreditScoreGauge score={score} max={maxScore} />
        </div>
      )}

      {/* Printable report area */}
      <div ref={reportRef} className="flex flex-col gap-4">
        {/* Personal Info */}
        {personalInfo && (
          <Section title="Personal Information">
            {personalInfo.full_name && (
              <DataRow label="Full Name" value={personalInfo.full_name} />
            )}
            {personalInfo.date_of_birth && (
              <DataRow
                label="Date of Birth"
                value={formatDate(personalInfo.date_of_birth)}
              />
            )}
            {personalInfo.gender && (
              <DataRow label="Gender" value={personalInfo.gender} />
            )}
            {personalInfo.phone && (
              <DataRow label="Phone" value={personalInfo.phone} />
            )}
            {personalInfo.address && (
              <DataRow label="Address" value={personalInfo.address} />
            )}
          </Section>
        )}

        {/* Loan Summary */}
        {summary && (
          <Section title="Loan Summary">
            {summary.total_facilities !== undefined && (
              <DataRow label="Total Facilities" value={summary.total_facilities} />
            )}
            {summary.active_loans !== undefined && (
              <DataRow label="Active Loans" value={summary.active_loans} />
            )}
            {summary.settled_loans !== undefined && (
              <DataRow label="Settled Loans" value={summary.settled_loans} />
            )}
            {summary.past_due !== undefined && (
              <DataRow label="Past Due" value={summary.past_due} />
            )}
            {summary.total_outstanding !== undefined && (
              <DataRow
                label="Total Outstanding"
                value={formatNaira(summary.total_outstanding)}
              />
            )}
          </Section>
        )}

        {/* Loan History */}
        <Section title="Loan History">
          <div className="py-3">
            <LoanHistoryTable loans={loans} />
          </div>
        </Section>

        {/* Enquiry History */}
        {enquiries.length > 0 && (
          <Section title="Enquiry History">
            {enquiries.map((eq, i) => (
              <DataRow
                key={i}
                label={formatDate(eq.enquiry_date || '')}
                value={`${eq.institution || '—'}${eq.purpose ? ` · ${eq.purpose}` : ''}`}
              />
            ))}
          </Section>
        )}
      </div>

      {/* Actions */}
      <Button
        size="lg"
        className="w-full"
        onClick={handleDownload}
        loading={downloading}
      >
        <Download size={16} />
        Download PDF Report
      </Button>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" className="flex-1" onClick={onCheckAnother}>
          Check Another BVN
        </Button>
        <Button variant="ghost" className="flex-1" onClick={onBackToServices}>
          Back to Services
        </Button>
      </div>
    </div>
  )
}
