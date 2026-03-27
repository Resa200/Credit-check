// Supabase Edge Function: manage-subscription
// Proxies subscription management calls to Paystack API
//
// Deploy: supabase functions deploy manage-subscription
// Required secret: PAYSTACK_SECRET_KEY

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Authenticate caller via JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .eq('deleted_flag', false)
      .single()

    if (!profile) {
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json()
    const { action, subscription_code } = body

    if (action === 'cancel') {
      if (!subscription_code) {
        return new Response(
          JSON.stringify({ error: 'Missing subscription_code' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Verify user owns this subscription
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('id, paystack_subscription_code')
        .eq('user_id', profile.id)
        .eq('paystack_subscription_code', subscription_code)
        .single()

      if (!sub) {
        return new Response(
          JSON.stringify({ error: 'Subscription not found or not owned by user' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Fetch the email token from Paystack
      const fetchRes = await fetch(
        `https://api.paystack.co/subscription/${subscription_code}`,
        {
          headers: { Authorization: `Bearer ${paystackSecret}` },
        }
      )
      const fetchData = await fetchRes.json()

      if (!fetchRes.ok || !fetchData.data?.email_token) {
        return new Response(
          JSON.stringify({ error: 'Failed to fetch subscription details from Paystack' }),
          { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Disable subscription on Paystack
      const disableRes = await fetch('https://api.paystack.co/subscription/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${paystackSecret}`,
        },
        body: JSON.stringify({
          code: subscription_code,
          token: fetchData.data.email_token,
        }),
      })

      const disableData = await disableRes.json()

      if (!disableRes.ok) {
        return new Response(
          JSON.stringify({ error: disableData.message || 'Failed to cancel subscription' }),
          { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Update local DB (webhook will also do this, but update immediately for UX)
      await supabase
        .from('subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          modified_by: profile.id,
        })
        .eq('id', sub.id)

      // Audit log
      await supabase.from('audit_logs').insert({
        user_id: profile.id,
        action: 'subscription_cancel',
        resource_type: 'subscriptions',
        resource_id: sub.id,
        created_by: profile.id,
        modified_by: profile.id,
      })

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: `Unknown action: ${action}` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
