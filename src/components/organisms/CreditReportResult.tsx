import { useRef, useState } from 'react'
import type { CreditReportData } from '@/types/adjutor.types'
import { normalizeCreditReport, formatDate } from '@/lib/utils'
import { generateCreditPDF } from '@/lib/reportPDF'
import DataRow from '@/components/molecules/DataRow'
import LoanHistoryTable from '@/components/molecules/LoanHistoryTable'
import CreditScoreGauge from '@/components/molecules/CreditScoreGauge'
import StatusBadge from '@/components/molecules/StatusBadge'
import Button from '@/components/atoms/Button'
import { Download, ChevronDown, CheckCircle2, XCircle, FileJson, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useExport } from '@/hooks/useExport'
import { useAuth } from '@/hooks/useAuth'
import AIExplanation from '@/components/molecules/AIExplanation'
import ShareResult from '@/components/molecules/ShareResult'

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
  const { exportResultJSON, emailResult } = useExport()
  const { isAuthenticated } = useAuth()

  const report = normalizeCreditReport(data, bureau)

  const bureauLabel = bureau === 'crc' ? 'CRC Credit Bureau' : 'FirstCentral'
  const generatedDate = new Date().toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  async function handleDownload() {
    setDownloading(true)
    try {
      await generateCreditPDF(report, bureau, reportRef)
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
          {report.fullName || 'Credit Report'}
        </h2>
        <p className="text-xs text-[#94A3B8]">
          {bureauLabel} · Generated {generatedDate}
        </p>
        {report.lastCheckedDate && (
          <p className="text-xs text-[#94A3B8]">
            Last checked: {report.lastCheckedDate}
          </p>
        )}
      </div>

      {/* Score gauge — only if present */}
      {report.creditScore !== undefined && (
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 flex justify-center">
          <CreditScoreGauge
            score={report.creditScore}
            max={report.maxScore || 850}
          />
        </div>
      )}

      {/* Printable report area */}
      <div ref={reportRef} className="flex flex-col gap-4">

        {/* Personal Info */}
        {(report.fullName || report.dateOfBirth || report.gender || report.phone || report.address) && (
          <Section title="Personal Information">
            {report.fullName && <DataRow label="Full Name" value={report.fullName} />}
            {report.dateOfBirth && <DataRow label="Date of Birth" value={formatDate(report.dateOfBirth)} />}
            {report.gender && <DataRow label="Gender" value={report.gender} />}
            {report.phone && <DataRow label="Phone" value={report.phone} />}
            {report.address && <DataRow label="Address" value={report.address} />}
          </Section>
        )}

        {/* Identifications */}
        {report.identifications && report.identifications.length > 0 && (
          <Section title="Identifications">
            {report.identifications.map((id, i) => (
              <DataRow key={i} label={id.type} value={id.value} />
            ))}
          </Section>
        )}

        {/* Credit Statistics (FirstCentral account counts + performance) */}
        {report.creditStats && report.creditStats.length > 0 && (
          <Section title="Credit Summary">
            {report.creditStats.map((stat, i) => (
              <DataRow key={i} label={stat.label} value={stat.value} />
            ))}
          </Section>
        )}

        {/* Facility Summaries (CRC) */}
        {report.facilitySections && report.facilitySections.length > 0 && (
          <Section title="Credit Facilities">
            <div className="py-3 flex flex-col gap-3">
              {report.facilitySections.map((section, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-[#E2E8F0] p-4 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#1E293B]">
                      {section.label}
                    </span>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full',
                        section.hasFacilities
                          ? 'bg-[#EDE9FE] text-[#7C3AED]'
                          : 'bg-[#F1F5F9] text-[#64748B]'
                      )}
                    >
                      {section.hasFacilities ? (
                        <CheckCircle2 size={11} />
                      ) : (
                        <XCircle size={11} />
                      )}
                      {section.hasFacilities ? 'Has Facilities' : 'No Facilities'}
                    </span>
                  </div>
                  {section.hasFacilities && (
                    <p className="text-xs text-[#94A3B8]">
                      Delinquent:{' '}
                      <span className={cn(
                        'font-semibold',
                        section.delinquentCount > 0 ? 'text-[#F43F5E]' : 'text-[#059669]'
                      )}>
                        {section.delinquentCount}
                      </span>
                    </p>
                  )}
                  {section.lastReportedDate && (
                    <p className="text-xs text-[#94A3B8]">
                      Last reported: {section.lastReportedDate}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Loan History */}
        {report.loans && report.loans.length > 0 && (
          <Section title="Loan History">
            <div className="py-3">
              <LoanHistoryTable loans={report.loans} />
            </div>
          </Section>
        )}

        {/* Enquiry History */}
        {report.enquiries && report.enquiries.length > 0 && (
          <Section title="Enquiry History">
            {report.enquiries.map((eq, i) => (
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
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          size="lg"
          className="flex-1"
          onClick={handleDownload}
          loading={downloading}
        >
          <Download size={16} />
          Download PDF
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="flex-1"
          onClick={() => exportResultJSON('credit', data as unknown as Record<string, unknown>)}
        >
          <FileJson size={16} />
          Download JSON
        </Button>
        {isAuthenticated && (
          <Button
            size="lg"
            variant="outline"
            className="flex-1"
            onClick={() => emailResult('credit', data as unknown as Record<string, unknown>)}
          >
            <Mail size={16} />
            Email to Me
          </Button>
        )}
      </div>

      {/* Share */}
      <ShareResult
        serviceType="credit"
        resultData={data as unknown as Record<string, unknown>}
      />

      {/* AI Explanation */}
      <AIExplanation
        serviceType="credit"
        resultData={data as unknown as Record<string, unknown>}
      />

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
