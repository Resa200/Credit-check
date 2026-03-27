// Supabase Edge Function: send-export-email
// Sends a lookup result export to the user's registered email
//
// Supports two modes:
//   1. By lookup_request_id — fetches data from DB
//   2. By direct payload — service_type + result_data sent from client
//
// Deploy with: supabase functions deploy send-export-email
// Requires RESEND_API_KEY in Supabase secrets

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SERVICE_LABELS: Record<string, string> = {
  bvn: 'BVN Verification',
  account: 'Account Verification',
  credit: 'Credit Report',
}

// ─── Email HTML builders per service type ─────────────────────────────────────

function maskValue(value: string, keepStart = 3, keepEnd = 3): string {
  if (!value || value.length <= keepStart + keepEnd) return value
  const start = value.slice(0, keepStart)
  const end = value.slice(-keepEnd)
  return `${start}${'*'.repeat(value.length - keepStart - keepEnd)}${end}`
}

function dataRow(label: string, value: string | null | undefined): string {
  if (!value) return ''
  return `
    <tr>
      <td style="padding: 10px 12px; color: #64748B; font-size: 13px; border-bottom: 1px solid #F1F5F9; width: 40%;">${label}</td>
      <td style="padding: 10px 12px; color: #1E293B; font-size: 13px; font-weight: 500; border-bottom: 1px solid #F1F5F9; text-align: right;">${value}</td>
    </tr>
  `
}

function sectionHeader(title: string): string {
  return `
    <div style="background: #FAFAFA; padding: 10px 16px; border-bottom: 1px solid #E2E8F0;">
      <p style="margin: 0; font-size: 11px; font-weight: 600; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.05em;">${title}</p>
    </div>
  `
}

function sectionCard(title: string, rows: string): string {
  if (!rows.trim()) return ''
  return `
    <div style="border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; margin-bottom: 16px;">
      ${sectionHeader(title)}
      <table style="width: 100%; border-collapse: collapse;">${rows}</table>
    </div>
  `
}

function statusBadge(status: string, label: string): string {
  const isSuccess = status === 'success' || status === 'verified'
  const bg = isSuccess ? '#D1FAE5' : '#FFE4E6'
  const color = isSuccess ? '#059669' : '#F43F5E'
  return `<span style="display: inline-block; background: ${bg}; color: ${color}; font-size: 12px; font-weight: 500; padding: 4px 12px; border-radius: 100px;">${label}</span>`
}

function capitalize(s: string | undefined | null): string {
  if (!s) return ''
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

function buildBVNHtml(data: Record<string, unknown>): string {
  const fullName = [data.first_name, data.middle_name, data.last_name].filter(Boolean).join(' ')

  const identity = [
    dataRow('BVN', maskValue(String(data.bvn ?? ''), 3, 3)),
    dataRow('Full Name', fullName),
    dataRow('Date of Birth', String(data.formatted_dob ?? data.dob ?? '')),
    dataRow('Gender', capitalize(String(data.gender ?? ''))),
    data.marital_status ? dataRow('Marital Status', capitalize(String(data.marital_status))) : '',
    data.nationality ? dataRow('Nationality', capitalize(String(data.nationality))) : '',
    data.nin ? dataRow('NIN', maskValue(String(data.nin), 3, 3)) : '',
  ].join('')

  const contact = [
    dataRow('Phone', maskValue(String(data.mobile ?? ''), 4, 3)),
    data.mobile2 ? dataRow('Alt. Phone', maskValue(String(data.mobile2), 4, 3)) : '',
    data.email ? dataRow('Email', maskValue(String(data.email), 2, 10)) : '',
    data.residential_address ? dataRow('Address', String(data.residential_address)) : '',
  ].join('')

  const location = [
    data.state_of_origin ? dataRow('State of Origin', capitalize(String(data.state_of_origin))) : '',
    data.lga_of_origin ? dataRow('LGA of Origin', capitalize(String(data.lga_of_origin))) : '',
    data.state_of_residence ? dataRow('State of Residence', capitalize(String(data.state_of_residence))) : '',
    data.lga_of_residence ? dataRow('LGA of Residence', capitalize(String(data.lga_of_residence))) : '',
  ].join('')

  const enrollment = [
    data.registration_date ? dataRow('Registration Date', String(data.registration_date)) : '',
    data.enrollment_bank ? dataRow('Enrollment Bank', String(data.enrollment_bank)) : '',
    data.enrollment_branch ? dataRow('Enrollment Branch', capitalize(String(data.enrollment_branch))) : '',
    data.level_of_account ? dataRow('Account Level', capitalize(String(data.level_of_account))) : '',
  ].join('')

  const watchlisted = data.watchlisted
  const watchlistBadge = watchlisted != null
    ? (watchlisted
      ? '<span style="display: inline-block; background: #FFE4E6; color: #F43F5E; font-size: 12px; font-weight: 500; padding: 4px 12px; border-radius: 100px;">⚠ Watchlisted</span>'
      : '<span style="display: inline-block; background: #D1FAE5; color: #059669; font-size: 12px; font-weight: 500; padding: 4px 12px; border-radius: 100px;">✓ Not Watchlisted</span>')
    : ''

  return `
    <div style="text-align: center; margin-bottom: 20px;">
      ${statusBadge('success', 'BVN Verified')}
      <h2 style="margin: 12px 0 4px; color: #1E293B; font-size: 20px;">${fullName}</h2>
      ${watchlistBadge ? `<div style="margin-top: 8px;">${watchlistBadge}</div>` : ''}
    </div>
    ${sectionCard('Identity', identity)}
    ${sectionCard('Contact', contact)}
    ${sectionCard('Location', location)}
    ${sectionCard('Bank Enrollment', enrollment)}
  `
}

function buildAccountHtml(data: Record<string, unknown>): string {
  const rows = [
    dataRow('Account Name', String(data.account_name ?? '')),
    dataRow('Account Number', maskValue(String(data.account_number ?? ''), 3, 3)),
    dataRow('Bank Code', String(data.bank_code ?? '')),
    dataRow('Linked BVN', data.bvn ? maskValue(String(data.bvn), 3, 3) : '—'),
  ].join('')

  return `
    <div style="text-align: center; margin-bottom: 20px;">
      ${statusBadge('success', 'Account Verified')}
      <h2 style="margin: 12px 0 0; color: #1E293B; font-size: 20px;">${data.account_name ?? ''}</h2>
    </div>
    ${sectionCard('Account Details', rows)}
  `
}

// ─── Normalization helpers (mirrors client-side normalizeCreditReport) ────────

interface NormalizedCredit {
  fullName?: string
  dateOfBirth?: string
  gender?: string
  phone?: string
  address?: string
  identifications?: { type: string; value: string }[]
  creditScore?: number
  maxScore?: number
  creditStats?: { label: string; value: string }[]
  facilitySections?: { label: string; hasFacilities: boolean; delinquentCount: number; lastReportedDate?: string }[]
  loans?: Record<string, unknown>[]
  enquiries?: Record<string, unknown>[]
  lastCheckedDate?: string
}

// deno-lint-ignore no-explicit-any
function normalizeCreditData(data: any): NormalizedCredit {
  // ── FirstCentral: data is an array ──
  if (Array.isArray(data)) {
    const pd = data.find((i: Record<string, unknown>) => i.PersonalDetailsSummary)?.PersonalDetailsSummary?.[0]
    const cs = data.find((i: Record<string, unknown>) => i.CreditSummary)?.CreditSummary?.[0]
    const perf = data.find((i: Record<string, unknown>) => i.PerformanceClassification)?.PerformanceClassification?.[0]

    const fullName = pd
      ? [pd.Surname, pd.FirstName, pd.OtherNames].filter(Boolean).join(' ')
      : undefined

    const address = [pd?.ResidentialAddress1, pd?.ResidentialAddress2].filter(Boolean).join(', ') || undefined

    const identifications: { type: string; value: string }[] = []
    if (pd?.BankVerificationNo) identifications.push({ type: 'BVN', value: pd.BankVerificationNo })
    if (pd?.NationalIDNo) identifications.push({ type: 'NIN', value: pd.NationalIDNo })
    if (pd?.PassportNo) identifications.push({ type: 'Passport', value: pd.PassportNo })
    if (pd?.DriversLicenseNo) identifications.push({ type: "Driver's License", value: pd.DriversLicenseNo })
    if (pd?.PencomIDNo) identifications.push({ type: 'PenCom ID', value: pd.PencomIDNo })

    const creditStats: { label: string; value: string }[] = []
    if (cs?.TotalNumberOfAccountsReported) creditStats.push({ label: 'Total Accounts', value: cs.TotalNumberOfAccountsReported })
    if (cs?.NumberOfAccountsInGoodStanding) creditStats.push({ label: 'Good Standing', value: cs.NumberOfAccountsInGoodStanding })
    if (cs?.NumberOfAccountsInBadStanding) creditStats.push({ label: 'Bad Standing', value: cs.NumberOfAccountsInBadStanding })
    if (perf?.NoOfLoansPerforming) creditStats.push({ label: 'Performing Loans', value: perf.NoOfLoansPerforming })
    if (perf?.NoOfLoansSubstandard) creditStats.push({ label: 'Substandard', value: perf.NoOfLoansSubstandard })
    if (perf?.NoOfLoansDoubtful) creditStats.push({ label: 'Doubtful', value: perf.NoOfLoansDoubtful })
    if (perf?.NoOfLoansLost) creditStats.push({ label: 'Lost', value: perf.NoOfLoansLost })

    return {
      fullName,
      dateOfBirth: pd?.BirthDate,
      gender: pd?.Gender ? capitalize(pd.Gender) : undefined,
      phone: pd?.CellularNo || pd?.HomeTelephoneNo || pd?.WorkTelephoneNo,
      address,
      identifications: identifications.length ? identifications : undefined,
      creditStats: creditStats.length ? creditStats : undefined,
    }
  }

  // ── CRC: object with nano_consumer_profile ──
  if (data?.nano_consumer_profile) {
    const cd = data.nano_consumer_profile.consumer_details

    const identifications = (cd?.identification ?? []).map((id: Record<string, string>) => ({
      type: id.id_display_name,
      value: id.id_value,
    }))

    const facilitySections: NormalizedCredit['facilitySections'] = []
    const creditSummary = data.credit_nano_summary?.summary
    if (creditSummary) {
      facilitySections.push({
        label: 'Bank Credit',
        hasFacilities: creditSummary.has_creditfacilities === 'YES',
        delinquentCount: parseInt(creditSummary.no_of_delinqcreditfacilities ?? '0', 10),
        lastReportedDate: creditSummary.last_reported_date,
      })
    }
    const mfSummary = data.mfcredit_nano_summary?.summary
    if (mfSummary) {
      facilitySections.push({
        label: 'Microfinance Credit',
        hasFacilities: mfSummary.has_creditfacilities === 'YES',
        delinquentCount: parseInt(mfSummary.no_of_delinqcreditfacilities ?? '0', 10),
        lastReportedDate: mfSummary.last_reported_date,
      })
    }
    const mgSummary = data.mgcredit_nano_summary?.summary
    if (mgSummary) {
      facilitySections.push({
        label: 'Mortgage Credit',
        hasFacilities: mgSummary.has_creditfacilities === 'YES',
        delinquentCount: parseInt(mgSummary.no_of_delinqcreditfacilities ?? '0', 10),
        lastReportedDate: mgSummary.last_reported_date,
      })
    }

    return {
      fullName: cd?.name,
      dateOfBirth: cd?.date_of_birth,
      gender: cd?.gender ? capitalize(cd.gender) : undefined,
      identifications: identifications.length ? identifications : undefined,
      facilitySections: facilitySections.length ? facilitySections : undefined,
      lastCheckedDate: data.last_checked_date,
    }
  }

  // ── Generic object fallback ──
  return {
    fullName: data.personal_info?.full_name ?? data.fullName ?? data.full_name ?? data.name,
    dateOfBirth: data.personal_info?.date_of_birth ?? data.dateOfBirth ?? data.date_of_birth,
    gender: data.personal_info?.gender ?? data.gender,
    phone: data.personal_info?.phone ?? data.phone,
    address: data.personal_info?.address ?? data.address,
    creditScore: data.credit_summary?.credit_score ?? data.creditScore ?? data.credit_score,
    maxScore: data.credit_summary?.max_score ?? data.maxScore ?? data.max_score,
    loans: data.loan_history ?? data.loans,
    enquiries: data.enquiry_history ?? data.enquiries,
  }
}

// ─── Credit HTML builder ─────────────────────────────────────────────────────

function buildCreditHtml(data: Record<string, unknown>): string {
  const n = normalizeCreditData(data)
  const displayName = n.fullName || 'Credit Report'
  const generatedDate = new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })

  // Personal information section
  const personalRows = [
    n.fullName ? dataRow('Full Name', n.fullName) : '',
    n.dateOfBirth ? dataRow('Date of Birth', n.dateOfBirth) : '',
    n.gender ? dataRow('Gender', n.gender) : '',
    n.phone ? dataRow('Phone', maskValue(n.phone, 4, 3)) : '',
    n.address ? dataRow('Address', n.address) : '',
  ].join('')

  // Identifications section
  let identificationsHtml = ''
  if (n.identifications && n.identifications.length > 0) {
    const idRows = n.identifications
      .map((id) => dataRow(id.type, maskValue(id.value, 3, 3)))
      .join('')
    identificationsHtml = sectionCard('Identification', idRows)
  }

  // Credit score section
  let scoreHtml = ''
  if (n.creditScore != null) {
    const max = n.maxScore ?? 850
    scoreHtml = `
      <div style="text-align: center; background: #FAFAFA; border: 1px solid #E2E8F0; border-radius: 12px; padding: 24px; margin-bottom: 16px;">
        <p style="margin: 0 0 8px; font-size: 12px; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.05em;">Credit Score</p>
        <p style="margin: 0; font-size: 36px; font-weight: 700; color: #7C3AED;">${n.creditScore}</p>
        <p style="margin: 4px 0 0; font-size: 12px; color: #94A3B8;">out of ${max}</p>
      </div>
    `
  }

  // Credit stats (FirstCentral: Total Accounts, Good/Bad Standing, Performing Loans, etc.)
  let creditStatsHtml = ''
  if (n.creditStats && n.creditStats.length > 0) {
    // Render as a grid of stat cards
    const statCards = n.creditStats.map((stat) => {
      let valueColor = '#1E293B'
      const lbl = stat.label.toLowerCase()
      if (lbl.includes('good') || lbl.includes('performing')) valueColor = '#059669'
      if (lbl.includes('bad') || lbl.includes('substandard') || lbl.includes('doubtful') || lbl.includes('lost')) {
        valueColor = parseInt(stat.value) > 0 ? '#F43F5E' : '#94A3B8'
      }
      return `
        <td style="width: 50%; padding: 12px; text-align: center; vertical-align: top;">
          <p style="margin: 0; font-size: 24px; font-weight: 700; color: ${valueColor};">${stat.value}</p>
          <p style="margin: 4px 0 0; font-size: 11px; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.05em;">${stat.label}</p>
        </td>
      `
    }).join('')

    // Arrange in rows of 2
    let gridRows = ''
    for (let i = 0; i < n.creditStats.length; i += 2) {
      const cells = [statCards[i]]
      if (i + 1 < n.creditStats.length) {
        // deno-lint-ignore no-explicit-any
        cells.push((statCards as any)[i + 1])
      } else {
        cells.push('<td></td>')
      }
      // Re-generate directly to avoid indexing the joined string
      gridRows += '<tr>'
      const stat1 = n.creditStats[i]
      let vc1 = '#1E293B'
      const l1 = stat1.label.toLowerCase()
      if (l1.includes('good') || l1.includes('performing')) vc1 = '#059669'
      if (l1.includes('bad') || l1.includes('substandard') || l1.includes('doubtful') || l1.includes('lost')) vc1 = parseInt(stat1.value) > 0 ? '#F43F5E' : '#94A3B8'
      gridRows += `<td style="width: 50%; padding: 12px; text-align: center; vertical-align: top;">
        <p style="margin: 0; font-size: 24px; font-weight: 700; color: ${vc1};">${stat1.value}</p>
        <p style="margin: 4px 0 0; font-size: 11px; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.05em;">${stat1.label}</p>
      </td>`
      if (i + 1 < n.creditStats.length) {
        const stat2 = n.creditStats[i + 1]
        let vc2 = '#1E293B'
        const l2 = stat2.label.toLowerCase()
        if (l2.includes('good') || l2.includes('performing')) vc2 = '#059669'
        if (l2.includes('bad') || l2.includes('substandard') || l2.includes('doubtful') || l2.includes('lost')) vc2 = parseInt(stat2.value) > 0 ? '#F43F5E' : '#94A3B8'
        gridRows += `<td style="width: 50%; padding: 12px; text-align: center; vertical-align: top;">
          <p style="margin: 0; font-size: 24px; font-weight: 700; color: ${vc2};">${stat2.value}</p>
          <p style="margin: 4px 0 0; font-size: 11px; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.05em;">${stat2.label}</p>
        </td>`
      } else {
        gridRows += '<td style="width: 50%;"></td>'
      }
      gridRows += '</tr>'
    }

    creditStatsHtml = `
      <div style="border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; margin-bottom: 16px;">
        ${sectionHeader('Credit Summary')}
        <table style="width: 100%; border-collapse: collapse;">
          ${gridRows}
        </table>
      </div>
    `
  }

  // Facility sections (CRC: Bank Credit, Microfinance, Mortgage)
  let facilitiesHtml = ''
  if (n.facilitySections && n.facilitySections.length > 0) {
    const facilityRows = n.facilitySections.map((fs) => {
      const hasColor = fs.hasFacilities ? '#059669' : '#94A3B8'
      const hasLabel = fs.hasFacilities ? 'Yes' : 'No'
      const delinqColor = fs.delinquentCount > 0 ? '#F43F5E' : '#059669'
      return `
        ${dataRow(fs.label, `<span style="color: ${hasColor}; font-weight: 600;">${hasLabel}</span>`)}
        ${dataRow(`${fs.label} — Delinquent`, `<span style="color: ${delinqColor}; font-weight: 600;">${fs.delinquentCount}</span>`)}
        ${fs.lastReportedDate ? dataRow(`${fs.label} — Last Reported`, fs.lastReportedDate) : ''}
      `
    }).join('')

    facilitiesHtml = sectionCard('Credit Facilities', facilityRows)
  }

  // Loans table
  let loansHtml = ''
  if (n.loans && Array.isArray(n.loans) && n.loans.length > 0) {
    const loanRows = n.loans.slice(0, 10).map((loan: Record<string, unknown>) => `
      <tr>
        <td style="padding: 8px 12px; font-size: 12px; color: #1E293B; border-bottom: 1px solid #F1F5F9;">${loan.institution ?? loan.lender ?? '—'}</td>
        <td style="padding: 8px 12px; font-size: 12px; color: #1E293B; border-bottom: 1px solid #F1F5F9;">${loan.type ?? loan.loan_type ?? '—'}</td>
        <td style="padding: 8px 12px; font-size: 12px; color: #1E293B; border-bottom: 1px solid #F1F5F9; text-align: right;">${loan.amount ?? loan.loan_amount ?? loan.balance ?? '—'}</td>
        <td style="padding: 8px 12px; font-size: 12px; border-bottom: 1px solid #F1F5F9; text-align: right;">
          <span style="color: ${String(loan.status).toLowerCase() === 'closed' ? '#059669' : '#F59E0B'};">${loan.status ?? '—'}</span>
        </td>
      </tr>
    `).join('')

    loansHtml = `
      <div style="border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; margin-bottom: 16px;">
        ${sectionHeader('Loan History')}
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background: #FAFAFA;">
            <th style="padding: 8px 12px; font-size: 11px; color: #94A3B8; text-align: left; border-bottom: 1px solid #E2E8F0;">Institution</th>
            <th style="padding: 8px 12px; font-size: 11px; color: #94A3B8; text-align: left; border-bottom: 1px solid #E2E8F0;">Type</th>
            <th style="padding: 8px 12px; font-size: 11px; color: #94A3B8; text-align: right; border-bottom: 1px solid #E2E8F0;">Amount</th>
            <th style="padding: 8px 12px; font-size: 11px; color: #94A3B8; text-align: right; border-bottom: 1px solid #E2E8F0;">Status</th>
          </tr>
          ${loanRows}
        </table>
        ${n.loans.length > 10 ? '<p style="padding: 12px; font-size: 12px; color: #94A3B8; text-align: center;">Showing 10 of ' + n.loans.length + ' loans</p>' : ''}
      </div>
    `
  }

  // Enquiries table
  let enquiriesHtml = ''
  if (n.enquiries && Array.isArray(n.enquiries) && n.enquiries.length > 0) {
    const enquiryRows = n.enquiries.slice(0, 10).map((eq: Record<string, unknown>) => `
      <tr>
        <td style="padding: 8px 12px; font-size: 12px; color: #1E293B; border-bottom: 1px solid #F1F5F9;">${eq.institution ?? '—'}</td>
        <td style="padding: 8px 12px; font-size: 12px; color: #1E293B; border-bottom: 1px solid #F1F5F9;">${eq.purpose ?? '—'}</td>
        <td style="padding: 8px 12px; font-size: 12px; color: #1E293B; border-bottom: 1px solid #F1F5F9; text-align: right;">${eq.enquiry_date ?? '—'}</td>
      </tr>
    `).join('')

    enquiriesHtml = `
      <div style="border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; margin-bottom: 16px;">
        ${sectionHeader('Enquiry History')}
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background: #FAFAFA;">
            <th style="padding: 8px 12px; font-size: 11px; color: #94A3B8; text-align: left; border-bottom: 1px solid #E2E8F0;">Institution</th>
            <th style="padding: 8px 12px; font-size: 11px; color: #94A3B8; text-align: left; border-bottom: 1px solid #E2E8F0;">Purpose</th>
            <th style="padding: 8px 12px; font-size: 11px; color: #94A3B8; text-align: right; border-bottom: 1px solid #E2E8F0;">Date</th>
          </tr>
          ${enquiryRows}
        </table>
      </div>
    `
  }

  // Last checked date
  const lastChecked = n.lastCheckedDate
    ? `<p style="margin: 4px 0 0; font-size: 12px; color: #94A3B8;">Last checked: ${n.lastCheckedDate}</p>`
    : ''

  return `
    <div style="text-align: center; margin-bottom: 20px;">
      ${statusBadge('success', 'Report Retrieved')}
      <h2 style="margin: 12px 0 0; color: #1E293B; font-size: 20px;">${displayName}</h2>
      <p style="margin: 4px 0 0; font-size: 12px; color: #94A3B8;">Generated ${generatedDate}</p>
      ${lastChecked}
    </div>
    ${scoreHtml}
    ${sectionCard('Personal Information', personalRows)}
    ${identificationsHtml}
    ${creditStatsHtml}
    ${facilitiesHtml}
    ${loansHtml}
    ${enquiriesHtml}
  `
}

function buildResultHtml(serviceType: string, data: Record<string, unknown>): string {
  switch (serviceType) {
    case 'bvn': return buildBVNHtml(data)
    case 'account': return buildAccountHtml(data)
    case 'credit': return buildCreditHtml(data)
    default: return `<pre style="background: #F8FAFC; padding: 16px; border-radius: 8px; font-size: 12px; overflow-x: auto; border: 1px solid #E2E8F0; white-space: pre-wrap;">${JSON.stringify(data, null, 2)}</pre>`
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const body = await req.json()
    const { user_id } = body

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: user_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Rate limit: max 10 emails per hour per user
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user_id)
      .eq('action', 'export_email')
      .gte('created_on', oneHourAgo)

    if ((count ?? 0) >= 10) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Maximum 10 emails per hour.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch user profile
    const { data: user } = await supabase
      .from('users')
      .select('email, full_name')
      .eq('id', user_id)
      .single()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Resolve export data — either from DB or from direct payload
    let serviceType: string
    let resultData: Record<string, unknown>

    if (body.lookup_request_id) {
      const { data: lookup } = await supabase
        .from('data_lookup_requests')
        .select('*')
        .eq('id', body.lookup_request_id)
        .eq('user_id', user_id)
        .single()

      if (!lookup) {
        return new Response(
          JSON.stringify({ error: 'Lookup request not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      serviceType = lookup.service_type
      resultData = lookup.response_payload ?? {}
    } else if (body.service_type && body.result_data) {
      serviceType = body.service_type
      resultData = body.result_data
    } else {
      return new Response(
        JSON.stringify({ error: 'Provide either lookup_request_id or service_type + result_data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const serviceLabel = SERVICE_LABELS[serviceType] ?? serviceType
    const resultHtml = buildResultHtml(serviceType, resultData)

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
      <body style="margin: 0; padding: 0; background: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="max-width: 560px; margin: 0 auto; padding: 24px 16px;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #7C3AED, #6D28D9); padding: 24px 24px 20px; border-radius: 16px 16px 0 0;">
            <table style="width: 100%;"><tr>
              <td>
                <div style="display: inline-block; background: rgba(255,255,255,0.2); border-radius: 8px; padding: 6px 8px; margin-bottom: 12px;">
                  <span style="color: white; font-weight: 700; font-size: 14px;">🛡 CreditCheck</span>
                </div>
                <h1 style="color: white; font-size: 22px; font-weight: 700; margin: 0;">${serviceLabel} Result</h1>
                <p style="color: #EDE9FE; font-size: 13px; margin: 6px 0 0;">Sent to ${user.email}</p>
              </td>
            </tr></table>
          </div>

          <!-- Body -->
          <div style="background: white; padding: 24px; border: 1px solid #E2E8F0; border-top: none; border-radius: 0 0 16px 16px;">
            <p style="color: #1E293B; font-size: 14px; margin: 0 0 20px;">
              Hi ${user.full_name || 'there'}, here is your <strong>${serviceLabel.toLowerCase()}</strong> result:
            </p>

            ${resultHtml}

            <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;" />

            <p style="color: #94A3B8; font-size: 11px; margin: 0; text-align: center;">
              This email was generated by CreditCheck &middot; Powered by Adjutor<br />
              Your data is never stored beyond your secure account.
            </p>
          </div>
        </div>
      </body>
      </html>
    `

    // Send via Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: 'Email provider not configured. Please set RESEND_API_KEY.' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'CreditCheck <onboarding@kayode.dev>',
        to: [user.email],
        subject: `Your ${serviceLabel} Result — CreditCheck`,
        html: emailHtml,
      }),
    })

    if (!emailRes.ok) {
      const err = await emailRes.text()
      throw new Error(`Email send failed: ${err}`)
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      user_id,
      action: 'export_email',
      resource_type: 'data_lookup_requests',
      resource_id: body.lookup_request_id ?? null,
      details: { service_type: serviceType },
      created_by: user_id,
      modified_by: user_id,
    })

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
