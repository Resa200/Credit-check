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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const body = await req.json()
    const { user_id, format } = body

    if (!user_id || !format) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id, format' }),
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
    let exportData: Record<string, unknown>

    if (body.lookup_request_id) {
      // Mode 1: fetch from DB by ID
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
      exportData = {
        service_type: lookup.service_type,
        date: lookup.created_on,
        status: lookup.status,
        request: lookup.request_payload,
        response: lookup.response_payload,
      }
    } else if (body.service_type && body.result_data) {
      // Mode 2: direct payload from client
      serviceType = body.service_type
      exportData = {
        service_type: body.service_type,
        date: new Date().toISOString(),
        status: 'success',
        response: body.result_data,
      }
    } else {
      return new Response(
        JSON.stringify({ error: 'Provide either lookup_request_id or service_type + result_data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const serviceLabel = SERVICE_LABELS[serviceType] ?? serviceType

    const content = format === 'csv'
      ? `Date,Service,Status,Response\n"${exportData.date}","${exportData.service_type}","${exportData.status}","${JSON.stringify(exportData.response).replace(/"/g, '""')}"`
      : JSON.stringify(exportData, null, 2)

    const emailHtml = `
      <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #7C3AED; padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; font-size: 20px; margin: 0;">CreditCheck Export</h1>
          <p style="color: #EDE9FE; font-size: 13px; margin: 8px 0 0 0;">${serviceLabel}</p>
        </div>
        <div style="background: white; padding: 24px; border: 1px solid #E2E8F0; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="color: #1E293B;">Hi ${user.full_name || 'there'},</p>
          <p style="color: #64748B;">Here is your <strong>${serviceLabel}</strong> result (${format.toUpperCase()}):</p>
          <pre style="background: #F8FAFC; padding: 16px; border-radius: 8px; font-size: 12px; overflow-x: auto; border: 1px solid #E2E8F0; white-space: pre-wrap; word-break: break-word;">${content}</pre>
          <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;" />
          <p style="color: #94A3B8; font-size: 12px;">
            Generated via CreditCheck &middot; Powered by Adjutor
          </p>
        </div>
      </div>
    `

    // Send via Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      console.warn('RESEND_API_KEY not set.')
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
        from: 'CreditCheck <noreply@creditcheck.app>',
        to: [user.email],
        subject: `CreditCheck - ${serviceLabel} Export`,
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
      details: { format, service_type: serviceType },
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
