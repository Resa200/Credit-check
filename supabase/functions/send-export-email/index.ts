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

function buildCreditHtml(data: Record<string, unknown>): string {
  // Try to extract normalized fields
  const fullName = String(data.fullName ?? data.full_name ?? data.name ?? 'Credit Report')
  const score = data.creditScore ?? data.credit_score
  const maxScore = data.maxScore ?? data.max_score ?? 850

  const personalRows = [
    data.fullName || data.full_name ? dataRow('Full Name', fullName) : '',
    data.dateOfBirth || data.date_of_birth ? dataRow('Date of Birth', String(data.dateOfBirth ?? data.date_of_birth)) : '',
    data.gender ? dataRow('Gender', String(data.gender)) : '',
    data.phone ? dataRow('Phone', String(data.phone)) : '',
    data.address ? dataRow('Address', String(data.address)) : '',
  ].join('')

  const scoreHtml = score != null ? `
    <div style="text-align: center; background: #FAFAFA; border: 1px solid #E2E8F0; border-radius: 12px; padding: 24px; margin-bottom: 16px;">
      <p style="margin: 0 0 8px; font-size: 12px; color: #94A3B8; text-transform: uppercase;">Credit Score</p>
      <p style="margin: 0; font-size: 36px; font-weight: 700; color: #7C3AED;">${score}</p>
      <p style="margin: 4px 0 0; font-size: 12px; color: #94A3B8;">out of ${maxScore}</p>
    </div>
  ` : ''

  // Handle loans array if present
  const loans = data.loans as Array<Record<string, unknown>> | undefined
  let loansHtml = ''
  if (loans && Array.isArray(loans) && loans.length > 0) {
    const loanRows = loans.slice(0, 10).map((loan) => `
      <tr>
        <td style="padding: 8px 12px; font-size: 12px; color: #1E293B; border-bottom: 1px solid #F1F5F9;">${loan.institution ?? loan.lender ?? '—'}</td>
        <td style="padding: 8px 12px; font-size: 12px; color: #1E293B; border-bottom: 1px solid #F1F5F9;">${loan.type ?? loan.loan_type ?? '—'}</td>
        <td style="padding: 8px 12px; font-size: 12px; color: #1E293B; border-bottom: 1px solid #F1F5F9; text-align: right;">${loan.amount ?? loan.balance ?? '—'}</td>
        <td style="padding: 8px 12px; font-size: 12px; border-bottom: 1px solid #F1F5F9; text-align: right;">
          <span style="color: ${loan.status === 'Closed' || loan.status === 'closed' ? '#059669' : '#F59E0B'};">${loan.status ?? '—'}</span>
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
        ${loans.length > 10 ? '<p style="padding: 12px; font-size: 12px; color: #94A3B8; text-align: center;">Showing 10 of ' + loans.length + ' loans. View full report on CreditCheck.</p>' : ''}
      </div>
    `
  }

  return `
    <div style="text-align: center; margin-bottom: 20px;">
      ${statusBadge('success', 'Report Retrieved')}
      <h2 style="margin: 12px 0 0; color: #1E293B; font-size: 20px;">${fullName}</h2>
      <p style="margin: 4px 0 0; font-size: 12px; color: #94A3B8;">Generated ${new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
    </div>
    ${scoreHtml}
    ${sectionCard('Personal Information', personalRows)}
    ${loansHtml}
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
        from: 'CreditCheck <onboarding@credit-checker.dev>',
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
