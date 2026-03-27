// Supabase Edge Function: explain-result
// Sends result data to OpenAI and returns a plain-language explanation
// Supports multi-turn conversation for follow-up questions
//
// Deploy with: supabase functions deploy explain-result
// Requires OPENAI_API_KEY in Supabase secrets

// deno-lint-ignore-file
declare const Deno: {
  serve: (handler: (req: Request) => Promise<Response>) => void
  env: { get: (key: string) => string | undefined }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SERVICE_LABELS: Record<string, string> = {
  bvn: 'BVN Verification',
  account: 'Account Verification',
  credit: 'Credit Report',
}

const SYSTEM_PROMPTS: Record<string, string> = {
  bvn: `You are a helpful financial data analyst for CreditCheck, a Nigerian identity verification platform. The user has just completed a BVN (Bank Verification Number) lookup. You have access to the result data below.

Your job is to:
- Explain what the BVN result means in plain, simple language
- Highlight any important details (e.g. watchlist status, account level)
- Answer any follow-up questions the user has about their result
- Be concise and friendly. Use bullet points where helpful.
- If the person is watchlisted, explain what that means clearly.
- Do NOT reveal the full BVN, phone, or other sensitive data in your response — refer to them generally.`,

  account: `You are a helpful financial data analyst for CreditCheck, a Nigerian identity verification platform. The user has just completed an Account Verification lookup. You have access to the result data below.

Your job is to:
- Explain what the account verification result means in plain, simple language
- Confirm what was verified (account name, bank, linked BVN)
- Answer any follow-up questions the user has
- Be concise and friendly. Use bullet points where helpful.
- Do NOT reveal full account numbers or BVN in your response — refer to them generally.`,

  credit: `You are a helpful financial data analyst for CreditCheck, a Nigerian identity verification platform. The user has just completed a Credit Report lookup. You have access to the result data below.

Your job is to:
- Explain the credit score and what rating it falls under (Excellent/Good/Fair/Poor)
- Summarize the loan history, credit facilities, and any delinquencies
- Highlight any red flags or positive indicators
- Answer any follow-up questions the user has about their credit report
- Be concise and friendly. Use bullet points where helpful.
- Provide actionable advice where appropriate (e.g. how to improve credit score)
- Do NOT reveal full ID numbers or sensitive data in your response.`,
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiKey) {
      return new Response(
        JSON.stringify({ error: 'AI provider not configured. Please set OPENAI_API_KEY.' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json()
    const { service_type, result_data, messages } = body

    if (!service_type || !result_data) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: service_type, result_data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const serviceLabel = SERVICE_LABELS[service_type] ?? service_type
    const systemPrompt = SYSTEM_PROMPTS[service_type] ?? SYSTEM_PROMPTS.bvn

    const systemMessage = {
      role: 'system',
      content: `${systemPrompt}\n\n--- ${serviceLabel} Result Data ---\n${JSON.stringify(result_data, null, 2)}`,
    }

    // Build conversation: system + previous messages or default first ask
    const conversation = [systemMessage]

    if (messages && Array.isArray(messages) && messages.length > 0) {
      conversation.push(...messages)
    } else {
      conversation.push({
        role: 'user',
        content: `Please explain this ${serviceLabel} result to me in simple terms. What are the key takeaways?`,
      })
    }

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: conversation,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    if (!openaiRes.ok) {
      const err = await openaiRes.text()
      throw new Error(`OpenAI API error: ${err}`)
    }

    const openaiData = await openaiRes.json()
    const reply = openaiData.choices?.[0]?.message?.content ?? 'Unable to generate explanation.'

    return new Response(
      JSON.stringify({ explanation: reply }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
