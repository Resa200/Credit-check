import jsPDF from 'jspdf'
import type { BVNData, AccountData } from '@/types/adjutor.types'

const PRIMARY = '#7C3AED'
const TEXT = '#1E293B'
const MUTED = '#94A3B8'
const BORDER = '#E2E8F0'

function createBasePDF(title: string, subtitle: string) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const W = 210
  const margin = 20

  // Header band
  doc.setFillColor(PRIMARY)
  doc.rect(0, 0, W, 45, 'F')

  doc.setFillColor('#FFFFFF')
  doc.roundedRect(margin, 10, 10, 10, 2, 2, 'F')
  doc.setFontSize(7)
  doc.setTextColor(PRIMARY)
  doc.text('CC', margin + 2.2, 17.5)

  doc.setFontSize(18)
  doc.setTextColor('#FFFFFF')
  doc.setFont('helvetica', 'bold')
  doc.text('CreditCheck', margin + 14, 17)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor('#EDE9FE')
  doc.text('Identity & Credit Verification Portal', margin + 14, 23)

  doc.setFontSize(8)
  doc.setTextColor('#C4B5FD')
  const generatedDate = new Date().toLocaleDateString('en-NG', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
  doc.text(`${subtitle}  ·  Generated ${generatedDate}`, margin, 38)

  let y = 60

  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(TEXT)
  doc.text(title, margin, y)
  y += 8

  doc.setDrawColor(BORDER)
  doc.line(margin, y, W - margin, y)
  y += 12

  return { doc, y, margin, W }
}

function addDataRow(
  doc: jsPDF,
  label: string,
  value: string,
  y: number,
  margin: number,
  W: number
): number {
  if (y > 270) { doc.addPage(); y = 20 }
  const contentW = W - margin * 2
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(MUTED)
  doc.text(label, margin, y)
  doc.setTextColor(TEXT)
  doc.setFont('helvetica', 'bold')
  const maxW = contentW - 60
  const lines = doc.splitTextToSize(value || '—', maxW)
  doc.text(lines, W - margin, y, { align: 'right' })
  y += lines.length * 5 + 3
  doc.setDrawColor(BORDER)
  doc.line(margin, y - 1, W - margin, y - 1)
  return y
}

function addFooter(doc: jsPDF, subtitle: string) {
  const W = 210
  const margin = 20
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFillColor('#F8F7FF')
    doc.rect(0, 287, W, 10, 'F')
    doc.setFontSize(7)
    doc.setTextColor(MUTED)
    doc.text(`Generated via CreditCheck · ${subtitle}`, margin, 293)
    doc.text(`Page ${i} of ${totalPages}`, W - margin, 293, { align: 'right' })
  }
}

export function generateBVNPDF(data: BVNData): void {
  const fullName = [data.first_name, data.middle_name, data.last_name].filter(Boolean).join(' ')
  const { doc, margin, W } = createBasePDF(fullName, 'BVN Verification')
  let y = 80

  // Section header
  doc.setFillColor('#F8F7FF')
  doc.rect(margin, y, W - margin * 2, 8, 'F')
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(PRIMARY)
  doc.text('IDENTITY', margin + 3, y + 5.5)
  y += 12

  y = addDataRow(doc, 'BVN', data.bvn, y, margin, W)
  y = addDataRow(doc, 'Full Name', fullName, y, margin, W)
  y = addDataRow(doc, 'Date of Birth', data.formatted_dob || data.dob, y, margin, W)
  y = addDataRow(doc, 'Gender', data.gender, y, margin, W)
  if (data.mobile) y = addDataRow(doc, 'Phone', data.mobile, y, margin, W)
  if (data.email) y = addDataRow(doc, 'Email', data.email, y, margin, W)
  if (data.state_of_residence) y = addDataRow(doc, 'State of Residence', data.state_of_residence, y, margin, W)
  if (data.residential_address) y = addDataRow(doc, 'Address', data.residential_address, y, margin, W)

  addFooter(doc, 'BVN Verification')
  doc.save(`CreditCheck_BVN_${Date.now()}.pdf`)
}

export function generateAccountPDF(data: AccountData): void {
  const { doc, margin, W } = createBasePDF(data.account_name, 'Account Verification')
  let y = 80

  doc.setFillColor('#F8F7FF')
  doc.rect(margin, y, W - margin * 2, 8, 'F')
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(PRIMARY)
  doc.text('ACCOUNT DETAILS', margin + 3, y + 5.5)
  y += 12

  y = addDataRow(doc, 'Account Name', data.account_name, y, margin, W)
  y = addDataRow(doc, 'Account Number', data.account_number, y, margin, W)
  y = addDataRow(doc, 'Bank Code', data.bank_code, y, margin, W)
  if (data.bvn) addDataRow(doc, 'Linked BVN', data.bvn, y, margin, W)

  addFooter(doc, 'Account Verification')
  doc.save(`CreditCheck_Account_${Date.now()}.pdf`)
}
