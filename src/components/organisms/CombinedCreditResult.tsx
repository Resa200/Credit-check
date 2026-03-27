import { useRef, useState } from 'react'
import type { CombinedCreditReport, CreditScoreFactor, NormalizedCreditReport } from '@/types/adjutor.types'
import { formatDate, formatNaira, cn, getRatingColor } from '@/lib/utils'
import { generateCombinedCreditPDF } from '@/lib/reportPDF'
import DataRow from '@/components/molecules/DataRow'
import CreditScoreGauge from '@/components/molecules/CreditScoreGauge'
import StatusBadge from '@/components/molecules/StatusBadge'
import Badge from '@/components/atoms/Badge'
import Button from '@/components/atoms/Button'
import AIExplanation from '@/components/molecules/AIExplanation'
import ShareResult from '@/components/molecules/ShareResult'
import { useExport } from '@/hooks/useExport'
import { useAuth } from '@/hooks/useAuth'
import {
  Download,
  ChevronDown,
  FileJson,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Shield,
  TrendingUp,
  BarChart3,
} from 'lucide-react'

interface CombinedCreditResultProps {
  data: CombinedCreditReport
  onCheckAnother: () => void
  onBackToServices: () => void
}

// ── Collapsible Section ─────────────────────────────────────────────────────
function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

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

// ── Score Factor Bar ────────────────────────────────────────────────────────
function FactorBar({ factor }: { factor: CreditScoreFactor }) {
  const pct = Math.round((factor.score / factor.max) * 100)
  const color =
    pct >= 80 ? '#10B981' : pct >= 60 ? '#34D399' : pct >= 40 ? '#F59E0B' : '#F43F5E'

  return (
    <div className="flex items-center gap-3">
      <div className="w-32 shrink-0 text-right">
        <span className="text-xs font-medium text-[#64748B]">{factor.label}</span>
      </div>
      <div className="flex-1 h-3 bg-[#F1F5F9] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <div className="w-12 shrink-0">
        <span className="text-xs font-bold text-[#1E293B]">{pct}%</span>
      </div>
      <div className="w-10 shrink-0">
        <span className="text-[10px] text-[#94A3B8]">×{Math.round(factor.weight * 100)}%</span>
      </div>
    </div>
  )
}

// ── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({
  label,
  crcValue,
  fcValue,
}: {
  label: string
  crcValue?: string
  fcValue?: string
}) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] p-3.5 bg-white">
      <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wide mb-2">
        {label}
      </p>
      <div className="flex items-center gap-3">
        {crcValue !== undefined && (
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
            <span className="text-sm font-bold text-[#1E293B]">{crcValue}</span>
          </div>
        )}
        {fcValue !== undefined && (
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
            <span className="text-sm font-bold text-[#1E293B]">{fcValue}</span>
          </div>
        )}
        {crcValue === undefined && fcValue === undefined && (
          <span className="text-sm text-[#94A3B8]">N/A</span>
        )}
      </div>
    </div>
  )
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function CombinedCreditResult({
  data,
  onCheckAnother,
  onBackToServices,
}: CombinedCreditResultProps) {
  const reportRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)
  const { exportResultJSON, emailResult } = useExport()
  const { isAuthenticated } = useAuth()

  const { crc, firstCentral, creditCheckScore, errors } = data
  const name = crc?.fullName || firstCentral?.fullName || 'Credit Report'
  const generatedDate = new Date().toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const ratingColor =
    creditCheckScore.rating === 'Excellent'
      ? '#10B981'
      : creditCheckScore.rating === 'Good'
      ? '#34D399'
      : creditCheckScore.rating === 'Fair'
      ? '#F59E0B'
      : '#F43F5E'

  async function handleDownload() {
    setDownloading(true)
    try {
      await generateCombinedCreditPDF(data, reportRef)
    } finally {
      setDownloading(false)
    }
  }

  // Merge personal info for comparison
  const comparisonFields = buildComparison(crc, firstCentral)

  // Merge loans with bureau tags
  const combinedLoans = [
    ...(crc?.loans || []).map((l) => ({ ...l, _bureau: 'CRC' as const })),
    ...(firstCentral?.loans || []).map((l) => ({ ...l, _bureau: 'FirstCentral' as const })),
  ]

  // Merge enquiries
  const combinedEnquiries = [
    ...(crc?.enquiries || []).map((e) => ({ ...e, _bureau: 'CRC' as const })),
    ...(firstCentral?.enquiries || []).map((e) => ({ ...e, _bureau: 'FirstCentral' as const })),
  ]

  // Merge credit stats
  const mergedStats = buildMergedStats(crc, firstCentral)

  const exportData = data as unknown as Record<string, unknown>

  return (
    <div className="flex flex-col gap-5">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-2 text-center">
        <StatusBadge
          status={errors.length > 0 ? 'warning' : 'success'}
          label={errors.length > 0 ? 'Partial Report' : 'Combined Report Retrieved'}
        />
        <h2 className="text-xl font-bold text-[#1E293B]">{name}</h2>
        <p className="text-xs text-[#94A3B8]">
          Combined Report · Generated {generatedDate}
        </p>

        {/* Bureau status badges */}
        <div className="flex items-center gap-2 mt-1">
          <span className={cn(
            'inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full',
            crc ? 'bg-[#ECFDF5] text-[#059669]' : 'bg-[#FEF2F2] text-[#DC2626]'
          )}>
            <span className={cn('w-1.5 h-1.5 rounded-full', crc ? 'bg-[#059669]' : 'bg-[#DC2626]')} />
            CRC
          </span>
          <span className={cn(
            'inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full',
            firstCentral ? 'bg-[#ECFDF5] text-[#059669]' : 'bg-[#FEF2F2] text-[#DC2626]'
          )}>
            <span className={cn('w-1.5 h-1.5 rounded-full', firstCentral ? 'bg-[#059669]' : 'bg-[#DC2626]')} />
            FirstCentral
          </span>
        </div>

        {/* Error warnings */}
        {errors.map((err, i) => (
          <div
            key={i}
            className="flex items-center gap-2 text-xs text-[#D97706] bg-[#FFFBEB] px-3 py-1.5 rounded-lg mt-1"
          >
            <AlertTriangle size={13} />
            {err.bureau} data unavailable: {err.message}
          </div>
        ))}
      </div>

      {/* ── CreditCheck Score Hero ──────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-gradient-to-br from-[#F5F3FF] via-white to-[#EDE9FE] p-6 overflow-hidden">
        <div className="flex items-center gap-2 mb-4 justify-center">
          <Sparkles size={16} className="text-[#7C3AED]" />
          <h3 className="text-sm font-bold text-[#7C3AED] uppercase tracking-wider">
            CreditCheck Score
          </h3>
        </div>

        {/* Large score display */}
        <div className="flex flex-col items-center gap-1">
          <div className="relative w-44 h-24 overflow-hidden">
            <svg viewBox="0 0 120 60" className="w-full" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M 10 58 A 50 50 0 0 1 110 58"
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <path
                d="M 10 58 A 50 50 0 0 1 110 58"
                fill="none"
                stroke={ratingColor}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${Math.PI * 54 * Math.min(creditCheckScore.score / creditCheckScore.max, 1)} ${Math.PI * 54}`}
                style={{ transition: 'stroke-dasharray 1s ease' }}
              />
            </svg>
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
              <span className="text-3xl font-bold text-[#1E293B]">{creditCheckScore.score}</span>
            </div>
          </div>
          <p className="text-xs text-[#94A3B8]">out of {creditCheckScore.max}</p>
          <p className={`text-base font-bold mt-0.5 ${getRatingColor(creditCheckScore.rating)}`}>
            {creditCheckScore.rating}
          </p>
        </div>
      </div>

      {/* Printable area */}
      <div ref={reportRef} className="flex flex-col gap-4">

        {/* ── Score Factor Breakdown ────────────────────────────────────────── */}
        <Section title="Score Breakdown">
          <div className="py-4 flex flex-col gap-2.5">
            {creditCheckScore.factors.map((factor, i) => (
              <FactorBar key={i} factor={factor} />
            ))}
            <div className="mt-2 pt-3 border-t border-[#E2E8F0]">
              <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                <BarChart3 size={13} />
                <span>Score is computed from {creditCheckScore.factors.length} weighted factors across both bureaus</span>
              </div>
            </div>
          </div>
        </Section>

        {/* ── Bureau Scores (if available) ──────────────────────────────────── */}
        {(crc?.creditScore !== undefined || firstCentral?.creditScore !== undefined) && (
          <Section title="Bureau Scores">
            <div className="py-4 flex items-center justify-around">
              {crc?.creditScore !== undefined ? (
                <div className="flex flex-col items-center gap-1">
                  <CreditScoreGauge score={crc.creditScore} max={crc.maxScore || 850} />
                  <Badge variant="default">CRC</Badge>
                </div>
              ) : crc ? (
                <div className="flex flex-col items-center gap-2 text-[#94A3B8]">
                  <div className="w-20 h-12 rounded-xl bg-[#F1F5F9] flex items-center justify-center text-xs font-medium">N/A</div>
                  <Badge variant="default">CRC</Badge>
                </div>
              ) : null}

              {firstCentral?.creditScore !== undefined ? (
                <div className="flex flex-col items-center gap-1">
                  <CreditScoreGauge score={firstCentral.creditScore} max={firstCentral.maxScore || 850} />
                  <Badge variant="default">FirstCentral</Badge>
                </div>
              ) : firstCentral ? (
                <div className="flex flex-col items-center gap-2 text-[#94A3B8]">
                  <div className="w-20 h-12 rounded-xl bg-[#F1F5F9] flex items-center justify-center text-xs font-medium">N/A</div>
                  <Badge variant="default">FirstCentral</Badge>
                </div>
              ) : null}
            </div>
          </Section>
        )}

        {/* ── Risk Assessment ───────────────────────────────────────────────── */}
        <div
          className="rounded-2xl border border-[#E2E8F0] bg-white p-5 flex items-start gap-4"
          style={{ borderLeftWidth: 4, borderLeftColor: ratingColor }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${ratingColor}15` }}
          >
            <Shield size={20} style={{ color: ratingColor }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-bold text-[#1E293B]">Risk Assessment</h4>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: ratingColor }}
              >
                {creditCheckScore.rating}
              </span>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Based on data from {[crc && 'CRC', firstCentral && 'FirstCentral'].filter(Boolean).join(' & ')},
              your combined credit health is rated <strong>{creditCheckScore.rating.toLowerCase()}</strong> with
              a CreditCheck Score of <strong>{creditCheckScore.score}/{creditCheckScore.max}</strong>.
            </p>
          </div>
        </div>

        {/* ── Bureau Agreement Grid ─────────────────────────────────────────── */}
        {comparisonFields.length > 0 && (
          <Section title="Bureau Comparison">
            <div className="py-3">
              <div className="overflow-x-auto rounded-lg border border-[#E2E8F0]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#FAFAFA] border-b border-[#E2E8F0]">
                      <th className="text-left px-4 py-2.5 font-medium text-[#64748B] text-xs">Field</th>
                      <th className="text-left px-4 py-2.5 font-medium text-xs">
                        <span className="flex items-center gap-1.5 text-[#7C3AED]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />CRC
                        </span>
                      </th>
                      <th className="text-left px-4 py-2.5 font-medium text-xs">
                        <span className="flex items-center gap-1.5 text-[#2563EB]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />FirstCentral
                        </span>
                      </th>
                      <th className="text-center px-4 py-2.5 font-medium text-[#64748B] text-xs">Match</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {comparisonFields.map((field, i) => (
                      <tr key={i} className="bg-white">
                        <td className="px-4 py-2.5 text-xs font-medium text-[#64748B]">{field.label}</td>
                        <td className="px-4 py-2.5 text-xs text-[#1E293B]">{field.crc || '—'}</td>
                        <td className="px-4 py-2.5 text-xs text-[#1E293B]">{field.fc || '—'}</td>
                        <td className="px-4 py-2.5 text-center">
                          {field.match ? (
                            <CheckCircle2 size={15} className="text-[#10B981] inline" />
                          ) : (
                            <AlertTriangle size={15} className="text-[#F59E0B] inline" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {(() => {
                const matches = comparisonFields.filter((f) => f.match).length
                return (
                  <p className="text-xs text-[#94A3B8] mt-2 flex items-center gap-1.5">
                    <TrendingUp size={12} />
                    Agreement: {matches}/{comparisonFields.length} fields match across bureaus
                  </p>
                )
              })()}
            </div>
          </Section>
        )}

        {/* ── Personal Information ──────────────────────────────────────────── */}
        {(name || crc?.dateOfBirth || firstCentral?.dateOfBirth) && (
          <Section title="Personal Information">
            {name && <DataRow label="Full Name" value={name} />}
            {(crc?.dateOfBirth || firstCentral?.dateOfBirth) && (
              <DataRow
                label="Date of Birth"
                value={formatDate(crc?.dateOfBirth || firstCentral?.dateOfBirth || '')}
              />
            )}
            {(crc?.gender || firstCentral?.gender) && (
              <DataRow label="Gender" value={crc?.gender || firstCentral?.gender || ''} />
            )}
            {(crc?.phone || firstCentral?.phone) && (
              <DataRow label="Phone" value={crc?.phone || firstCentral?.phone || ''} />
            )}
            {(crc?.address || firstCentral?.address) && (
              <DataRow label="Address" value={crc?.address || firstCentral?.address || ''} />
            )}
          </Section>
        )}

        {/* ── Credit Summary Dashboard ──────────────────────────────────────── */}
        {mergedStats.length > 0 && (
          <Section title="Credit Summary">
            <div className="py-3">
              {/* Legend */}
              <div className="flex items-center gap-4 mb-3 text-[10px] text-[#94A3B8]">
                {crc && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#7C3AED]" />CRC
                  </span>
                )}
                {firstCentral && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#2563EB]" />FirstCentral
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {mergedStats.map((stat, i) => (
                  <StatCard
                    key={i}
                    label={stat.label}
                    crcValue={stat.crc}
                    fcValue={stat.fc}
                  />
                ))}
              </div>
            </div>
          </Section>
        )}

        {/* ── Credit Facilities (CRC) ───────────────────────────────────────── */}
        {crc?.facilitySections && crc.facilitySections.length > 0 && (
          <Section title="Credit Facilities (CRC)">
            <div className="py-3 flex flex-col gap-3">
              {crc.facilitySections.map((section, i) => (
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
                      {section.hasFacilities ? 'Has Facilities' : 'No Facilities'}
                    </span>
                  </div>
                  {section.hasFacilities && (
                    <p className="text-xs text-[#94A3B8]">
                      Delinquent:{' '}
                      <span
                        className={cn(
                          'font-semibold',
                          section.delinquentCount > 0 ? 'text-[#F43F5E]' : 'text-[#059669]'
                        )}
                      >
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

        {/* ── Combined Loan History ─────────────────────────────────────────── */}
        {combinedLoans.length > 0 && (
          <Section title="Combined Loan History">
            <div className="py-3">
              <div className="overflow-x-auto rounded-lg border border-[#E2E8F0]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#FAFAFA] border-b border-[#E2E8F0]">
                      <th className="text-left px-4 py-3 font-medium text-[#64748B]">Bureau</th>
                      <th className="text-left px-4 py-3 font-medium text-[#64748B]">Lender</th>
                      <th className="text-left px-4 py-3 font-medium text-[#64748B]">Amount</th>
                      <th className="text-left px-4 py-3 font-medium text-[#64748B]">Outstanding</th>
                      <th className="text-left px-4 py-3 font-medium text-[#64748B]">Status</th>
                      <th className="text-left px-4 py-3 font-medium text-[#64748B]">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {combinedLoans.map((loan, i) => (
                      <tr key={i} className="bg-white hover:bg-[#FAFAFA] transition-colors">
                        <td className="px-4 py-3">
                          <Badge variant={loan._bureau === 'CRC' ? 'default' : 'default'}>
                            {loan._bureau}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-[#1E293B]">{loan.lender || '—'}</td>
                        <td className="px-4 py-3 text-[#1E293B]">{formatNaira(loan.loan_amount)}</td>
                        <td className="px-4 py-3 text-[#1E293B]">{formatNaira(loan.outstanding_balance)}</td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              (loan.status || '').toLowerCase().includes('settled') ? 'success'
                                : (loan.status || '').toLowerCase().includes('due') ? 'error'
                                : 'warning'
                            }
                          >
                            {loan.status || 'Unknown'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-[#64748B]">{formatDate(loan.date_reported || '')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Section>
        )}

        {/* ── Combined Enquiry History ──────────────────────────────────────── */}
        {combinedEnquiries.length > 0 && (
          <Section title="Combined Enquiry History">
            {combinedEnquiries.map((eq, i) => (
              <div key={i} className="flex items-center gap-2 py-2 border-b border-[#F1F5F9] last:border-0">
                <Badge variant="default">{eq._bureau}</Badge>
                <span className="text-xs text-[#94A3B8] shrink-0">
                  {formatDate(eq.enquiry_date || '')}
                </span>
                <span className="text-xs text-[#1E293B]">
                  {eq.institution || '—'}{eq.purpose ? ` · ${eq.purpose}` : ''}
                </span>
              </div>
            ))}
          </Section>
        )}

        {/* ── Identifications ───────────────────────────────────────────────── */}
        {(() => {
          const ids = [
            ...(crc?.identifications || []),
            ...(firstCentral?.identifications || []),
          ]
          // Deduplicate by type+value
          const unique = ids.filter(
            (id, i, arr) => arr.findIndex((x) => x.type === id.type && x.value === id.value) === i
          )
          if (unique.length === 0) return null
          return (
            <Section title="Identifications">
              {unique.map((id, i) => (
                <DataRow key={i} label={id.type} value={id.value} />
              ))}
            </Section>
          )
        })()}
      </div>

      {/* ── Actions ─────────────────────────────────────────────────────────── */}
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
          onClick={() => exportResultJSON('credit', exportData)}
        >
          <FileJson size={16} />
          Download JSON
        </Button>
        {isAuthenticated && (
          <Button
            size="lg"
            variant="outline"
            className="flex-1"
            onClick={() => emailResult('credit', exportData)}
          >
            <Mail size={16} />
            Email to Me
          </Button>
        )}
      </div>

      <ShareResult serviceType="credit" resultData={exportData} />

      <AIExplanation serviceType="credit" resultData={exportData} />

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

// ── Helpers ─────────────────────────────────────────────────────────────────

interface ComparisonField {
  label: string
  crc?: string
  fc?: string
  match: boolean
}

function buildComparison(
  crc: NormalizedCreditReport | null,
  fc: NormalizedCreditReport | null
): ComparisonField[] {
  if (!crc || !fc) return []

  const fields: { label: string; crc?: string; fc?: string }[] = [
    { label: 'Full Name', crc: crc.fullName, fc: fc.fullName },
    { label: 'Date of Birth', crc: crc.dateOfBirth, fc: fc.dateOfBirth },
    { label: 'Gender', crc: crc.gender, fc: fc.gender },
    { label: 'Phone', crc: crc.phone, fc: fc.phone },
    { label: 'Address', crc: crc.address, fc: fc.address },
  ]

  return fields
    .filter((f) => f.crc || f.fc)
    .map((f) => ({
      ...f,
      match: normalizeCompare(f.crc) === normalizeCompare(f.fc),
    }))
}

function normalizeCompare(value?: string): string {
  if (!value) return ''
  return value.toLowerCase().replace(/\s+/g, ' ').trim()
}

interface MergedStat {
  label: string
  crc?: string
  fc?: string
}

function buildMergedStats(
  crc: NormalizedCreditReport | null,
  fc: NormalizedCreditReport | null
): MergedStat[] {
  const statsMap = new Map<string, MergedStat>()

  crc?.creditStats?.forEach((s) => {
    const existing = statsMap.get(s.label) || { label: s.label }
    existing.crc = s.value
    statsMap.set(s.label, existing)
  })

  fc?.creditStats?.forEach((s) => {
    const existing = statsMap.get(s.label) || { label: s.label }
    existing.fc = s.value
    statsMap.set(s.label, existing)
  })

  return Array.from(statsMap.values())
}
