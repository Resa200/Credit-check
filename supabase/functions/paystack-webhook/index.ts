// Supabase Edge Function: paystack-webhook
// Handles Paystack webhook events for subscription management
//
// Deploy: supabase functions deploy paystack-webhook --no-verify-jwt
// Required secret: PAYSTACK_SECRET_KEY

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from 'https://deno.land/std@0.208.0/crypto/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-paystack-signature',
}

async function verifySignature(body: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(body))
  const hash = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return hash === signature
}

async function resolveUserId(
  supabase: ReturnType<typeof createClient>,
  customerEmail: string,
  customerCode?: string
): Promise<{ userId: string; profileId: string } | null> {
  // Try by customer code first (faster) via subscriptions table
  if (customerCode) {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('paystack_customer_code', customerCode)
      .single()
    if (sub) {
      return { userId: sub.user_id, profileId: sub.user_id }
    }
  }

  // Fallback: look up by email in users table
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('email', customerEmail)
    .eq('deleted_flag', false)
    .single()

  if (user) {
    return { userId: user.id, profileId: user.id }
  }

  return null
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const paystackSecret = Deno.env.get('PAYSTACK_SECRET_KEY')!
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const body = await req.text()
    const signature = req.headers.get('x-paystack-signature') ?? ''

    // Verify webhook signature
    const valid = await verifySignature(body, signature, paystackSecret)
    if (!valid) {
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const payload = JSON.parse(body)
    const event = payload.event as string
    const data = payload.data

    const customerEmail = data?.customer?.email
    const customerCode = data?.customer?.customer_code

    if (!customerEmail) {
      return new Response(
        JSON.stringify({ error: 'No customer email in payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const resolved = await resolveUserId(supabase, customerEmail, customerCode)
    if (!resolved) {
      console.warn(`User not found for email: ${customerEmail}`)
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { userId } = resolved

    // ── Handle events ────────────────────────────────────────────────────────

    if (event === 'charge.success') {
      // Record transaction
      await supabase.from('payment_transactions').upsert(
        {
          user_id: userId,
          paystack_reference: data.reference,
          amount: data.amount,
          currency: data.currency ?? 'NGN',
          status: 'success',
          payment_type: data.plan ? 'subscription' : 'one_time',
          meta: { paystack_event: event, channel: data.channel },
          created_by: userId,
          modified_by: userId,
        },
        { onConflict: 'paystack_reference' }
      )

      // Save card authorization if present
      const auth = data.authorization
      if (auth?.authorization_code) {
        // Check if card already exists (by auth code)
        const { data: existing } = await supabase
          .from('payment_cards')
          .select('id')
          .eq('user_id', userId)
          .eq('paystack_authorization_code', auth.authorization_code)
          .eq('deleted_flag', false)
          .single()

        if (!existing) {
          // Check if user has any cards to determine default
          const { count } = await supabase
            .from('payment_cards')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('deleted_flag', false)

          await supabase.from('payment_cards').insert({
            user_id: userId,
            paystack_authorization_code: auth.authorization_code,
            card_bin: auth.bin ?? null,
            card_last4: auth.last4 ?? null,
            card_exp_month: auth.exp_month ?? null,
            card_exp_year: auth.exp_year ?? null,
            card_type: auth.card_type ?? null,
            bank: auth.bank ?? null,
            is_default: (count ?? 0) === 0,
            created_by: userId,
            modified_by: userId,
          })
        }
      }
    }

    if (event === 'subscription.create') {
      const now = new Date().toISOString()
      const nextPayment = data.next_payment_date
        ? new Date(data.next_payment_date).toISOString()
        : null

      await supabase.from('subscriptions').upsert(
        {
          user_id: userId,
          paystack_customer_code: customerCode ?? null,
          paystack_subscription_code: data.subscription_code ?? null,
          paystack_plan_code: data.plan?.plan_code ?? null,
          status: 'active',
          current_period_start: now,
          current_period_end: nextPayment,
          cancelled_at: null,
          meta: { paystack_event: event },
          created_by: userId,
          modified_by: userId,
        },
        { onConflict: 'user_id' }
      )
    }

    if (event === 'subscription.disable') {
      await supabase
        .from('subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          modified_by: userId,
        })
        .eq('user_id', userId)
    }

    if (event === 'subscription.not_renew' || event === 'invoice.payment_failed') {
      await supabase
        .from('subscriptions')
        .update({
          status: 'past_due',
          modified_by: userId,
        })
        .eq('user_id', userId)
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action: `paystack_${event}`,
      resource_type: 'subscriptions',
      details: { event, reference: data.reference ?? null },
      created_by: userId,
      modified_by: userId,
    })

    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Webhook error:', err)
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
