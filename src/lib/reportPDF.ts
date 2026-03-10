import jsPDF from 'jspdf'
import type { CreditReportData } from '@/types/adjutor.types'
import { formatNaira, formatDate, getCreditRating } from './utils'
import type { RefObject } from 'react'

const PRIMARY = '#7C3AED'
const TEXT = '#1E293B'
const MUTED = '#94A3B8'
const BORDER = '#E2E8F0'
const SUCCESS = '#10B981'
const WARNING = '#F59E0B'
const ERROR = '#F43F5E'

function ratingColor(rating: string): string {
  switch (rating.toLowerCase()) {
    case 'excellent': return SUCCESS
    case 'good': return SUCCESS
    case 'fair': return WARNING
    case 'poor': return ERROR
    default: return MUTED
  }
}

export async function generateCreditPDF(
  data: CreditReportData,
  bureau: string,
  _ref: RefObject<HTMLDivElement | null>
): Promise<void> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const W = 210
  const margin = 20
  const contentW = W - margin * 2
  let y = 0

  const bureauLabel = bureau === 'crc' ? 'CRC Credit Bureau' : 'FirstCentral Credit Bureau'
  const generatedDate = new Date().toLocaleDateString('en-NG', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  // ── Cover Page ──────────────────────────────────────────────────────────────
  // Header band
  doc.setFillColor(PRIMARY)
  doc.rect(0, 0, W, 45, 'F')

  // Logo placeholder
  doc.setFillColor('#FFFFFF')
  doc.roundedRect(margin, 10, 10, 10, 2, 2, 'F')
  doc.setFontSize(7)
  doc.setTextColor(PRIMARY)
  doc.text('CC', margin + 2.2, 17.5)

  // App name
  doc.setFontSize(18)
  doc.setTextColor('#FFFFFF')
  doc.setFont('helvetica', 'bold')
  doc.text('CreditCheck', margin + 14, 17)

  // Tagline
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor('#EDE9FE')
  doc.text('Identity & Credit Verification Portal', margin + 14, 23)

  // Bureau + date
  doc.setFontSize(8)
  doc.setTextColor('#C4B5FD')
  doc.text(`${bureauLabel}  ·  Generated ${generatedDate}`, margin, 38)

  y = 60

  // Name
  const name = data.personal_info?.full_name || 'Report Holder'
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(TEXT)
  doc.text(name, margin, y)
  y += 8

  doc.setDrawColor(BORDER)
  doc.line(margin, y, W - margin, y)
  y += 12

  // Score block
  const score = data.credit_summary?.credit_score
  const maxScore = data.credit_summary?.max_score || 850
  if (score !== undefined) {
    const rating = getCreditRating(score, maxScore)
    const color = ratingColor(rating)

    doc.setFillColor(color)
    doc.roundedRect(margin, y, 60, 28, 3, 3, 'F')

    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor('#FFFFFF')
    doc.text(String(score), margin + 6, y + 16)

    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(`/ ${maxScore}`, margin + 6 + doc.getTextWidth(String(score)) + 1, y + 16)

    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(rating, margin + 6, y + 23)
    y += 38
  }

  // ── Helper: section header ───────────────────────────────────────────────────
  function sectionHeader(title: string) {
    if (y > 260) { doc.addPage(); y = 20 }
    doc.setFillColor('#F8F7FF')
    doc.rect(margin, y, contentW, 8, 'F')
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(PRIMARY)
    doc.text(title.toUpperCase(), margin + 3, y + 5.5)
    y += 12
  }

  // ── Helper: data row ─────────────────────────────────────────────────────────
  function dataRow(label: string, value: string) {
    if (y > 270) { doc.addPage(); y = 20 }
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(MUTED)
    doc.text(label, margin, y)
    doc.setTextColor(TEXT)
    doc.setFont('helvetica', 'bold')
    const maxW = contentW - 60
    const lines = doc.splitTextToSize(value, maxW)
    doc.text(lines, W - margin, y, { align: 'right' })
    y += lines.length * 5 + 3
    doc.setDrawColor(BORDER)
    doc.line(margin, y - 1, W - margin, y - 1)
  }

  // ── Personal Info ────────────────────────────────────────────────────────────
  const pi = data.personal_info
  if (pi) {
    sectionHeader('Personal Information')
    if (pi.full_name) dataRow('Full Name', pi.full_name)
    if (pi.date_of_birth) dataRow('Date of Birth', formatDate(pi.date_of_birth))
    if (pi.gender) dataRow('Gender', pi.gender)
    if (pi.phone) dataRow('Phone', pi.phone)
    if (pi.address) dataRow('Address', pi.address)
    if (pi.bvn) dataRow('BVN', `${pi.bvn.slice(0, 3)}*****${pi.bvn.slice(-3)}`)
    y += 4
  }

  // ── Loan Summary ─────────────────────────────────────────────────────────────
  const cs = data.credit_summary
  if (cs) {
    sectionHeader('Loan Summary')
    if (cs.total_facilities !== undefined) dataRow('Total Facilities', String(cs.total_facilities))
    if (cs.active_loans !== undefined) dataRow('Active Loans', String(cs.active_loans))
    if (cs.settled_loans !== undefined) dataRow('Settled Loans', String(cs.settled_loans))
    if (cs.past_due !== undefined) dataRow('Past Due', String(cs.past_due))
    if (cs.total_outstanding !== undefined) dataRow('Total Outstanding', formatNaira(cs.total_outstanding))
    y += 4
  }

  // ── Loan History ─────────────────────────────────────────────────────────────
  const loans = data.loan_history || []
  if (loans.length > 0) {
    sectionHeader('Loan History')

    // Table header
    const cols = { lender: margin, amount: margin + 55, outstanding: margin + 95, status: margin + 130, date: margin + 160 }
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(MUTED)
    doc.text('Lender', cols.lender, y)
    doc.text('Amount', cols.amount, y)
    doc.text('Outstanding', cols.outstanding, y)
    doc.text('Status', cols.status, y)
    doc.text('Date', cols.date, y)
    y += 4
    doc.setDrawColor(BORDER)
    doc.line(margin, y, W - margin, y)
    y += 4

    loans.forEach((loan) => {
      if (y > 270) { doc.addPage(); y = 20 }
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(TEXT)
      doc.setFontSize(8)
      doc.text(loan.lender || '—', cols.lender, y)
      doc.text(formatNaira(loan.loan_amount), cols.amount, y)
      doc.text(formatNaira(loan.outstanding_balance), cols.outstanding, y)
      doc.text(loan.status || '—', cols.status, y)
      doc.text(formatDate(loan.date_reported || ''), cols.date, y)
      y += 6
      doc.setDrawColor('#F1F5F9')
      doc.line(margin, y - 1, W - margin, y - 1)
    })
    y += 4
  }

  // ── Enquiry History ───────────────────────────────────────────────────────────
  const enquiries = data.enquiry_history || []
  if (enquiries.length > 0) {
    sectionHeader('Enquiry History')
    enquiries.forEach((eq) => {
      dataRow(
        formatDate(eq.enquiry_date || ''),
        `${eq.institution || '—'}${eq.purpose ? ` · ${eq.purpose}` : ''}`
      )
    })
    y += 4
  }

  // ── Footer on every page ──────────────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFillColor('#F8F7FF')
    doc.rect(0, 287, W, 10, 'F')
    doc.setFontSize(7)
    doc.setTextColor(MUTED)
    doc.text(`Generated via CreditCheck · Powered by Adjutor · ${bureauLabel}`, margin, 293)
    doc.text(`Page ${i} of ${totalPages}`, W - margin, 293, { align: 'right' })
  }

  // ── Disclaimer page ───────────────────────────────────────────────────────────
  doc.addPage()
  y = 30
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(TEXT)
  doc.text('Disclaimer', margin, y)
  y += 8

  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(MUTED)
  const disclaimer = [
    'This credit report has been generated for informational purposes only, based on data',
    'retrieved from the selected credit bureau via the Adjutor API.',
    '',
    'CreditCheck does not store, share, or retain any of your personal or financial data.',
    'All information was retrieved directly from the bureau at the time of your request.',
    '',
    'If you believe any information in this report is inaccurate, please contact the',
    'reporting credit bureau or the relevant financial institution directly.',
    '',
    `Report generated on ${generatedDate} via CreditCheck · Powered by Adjutor.`,
  ]

  disclaimer.forEach((line) => {
    doc.text(line, margin, y)
    y += 5.5
  })

  doc.save(`CreditCheck_Report_${bureau.toUpperCase()}_${Date.now()}.pdf`)
}
