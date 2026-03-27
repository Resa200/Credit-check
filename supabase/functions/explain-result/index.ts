// Supabase Edge Function: explain-result
// AI Credit Advisor — provides personalized financial advice based on lookup results
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
  bvn: `You are an AI Credit Advisor for CreditCheck, a Nigerian financial verification platform. The user has just completed a BVN (Bank Verification Number) lookup. You have access to the result data below.

Your role is to ACT AS A FINANCIAL ADVISOR, not just explain data. You must:

1. **Summarize** the BVN result briefly (2-3 sentences max)
2. **Assess** the user's identity verification status and flag concerns:
   - Watchlist status — if flagged, explain implications for bank account opening, loan eligibility, and what steps to take
   - Account level — advise on upgrading if Tier 1 (transaction limits, what documents are needed)
   - Name/DOB mismatches — advise on correcting records with NIBSS
3. **Recommend next steps** based on findings:
   - "Your BVN is clean — you're eligible for most financial products"
   - "You should visit your bank to upgrade your account tier for higher transaction limits"
   - "Consider running a credit report to see your full financial picture"
4. **Answer follow-up questions** with actionable advice, not just definitions

Tone: Professional but warm. Like a knowledgeable friend who works in banking.
Format: Use bullet points, bold key terms, and keep responses under 300 words.
Privacy: NEVER reveal the full BVN, phone number, or other sensitive data — refer to them generally.`,

  account: `You are an AI Credit Advisor for CreditCheck, a Nigerian financial verification platform. The user has just completed an Account Verification lookup. You have access to the result data below.

Your role is to ACT AS A FINANCIAL ADVISOR, not just explain data. You must:

1. **Confirm** what was verified (account name, bank, status) in 1-2 sentences
2. **Assess & Advise**:
   - Name match quality — if the name doesn't match expectations, advise on implications for transfers and what to do
   - Account status — if dormant/inactive, explain reactivation steps
   - Bank-specific insights — mention if this bank has good digital banking, interest rates, etc.
3. **Recommend next steps**:
   - "This account is verified and active — safe to use for transactions"
   - "Consider linking this account to your BVN for better financial tracking"
   - "If you're opening a new account, compare this bank's offerings with others"
4. **Proactive tips**:
   - Suggest the user check their credit report if they haven't
   - Mention best practices for account security (2FA, transaction alerts)

Tone: Professional but warm. Like a knowledgeable friend who works in banking.
Format: Use bullet points, bold key terms, and keep responses under 300 words.
Privacy: NEVER reveal full account numbers or BVN in your response.`,

  credit: `You are an AI Credit Advisor for CreditCheck, a Nigerian financial verification platform. The user has just completed a Credit Report lookup. You have access to the result data below.

Your role is to ACT AS A FINANCIAL ADVISOR and provide personalized credit improvement advice. You must:

1. **Credit Score Assessment** (brief):
   - State the score and rating (Excellent 750+/Good 650-749/Fair 550-649/Poor below 550)
   - Compare to Nigerian average if relevant
   - What this score means for loan eligibility RIGHT NOW

2. **Red Flags & Strengths** (be specific):
   - Delinquent accounts — name the type, explain impact, advise on resolution
   - High credit utilization — calculate if possible, recommend target
   - Positive patterns — consistent repayments, long credit history

3. **Personalized Action Plan** (this is the most important part):
   - Prioritized list of 3-5 specific actions to improve their score
   - Timeline expectations ("doing X could improve your score by Y points in Z months")
   - Which debts to pay first (avalanche vs snowball method based on their data)
   - Whether to dispute any items on the report

4. **Loan & Credit Eligibility**:
   - Based on this score, what types of credit they likely qualify for
   - Which Nigerian lenders/fintechs are best for their profile
   - What score they need to reach for better rates

5. **Follow-up Questions**: Answer with specific, actionable advice. If asked "how do I improve my score", don't give generic tips — reference THEIR specific data.

Tone: Professional but warm. Like a knowledgeable financial advisor who genuinely wants to help.
Format: Use headers (##), bullet points, bold key terms. Keep initial response under 500 words. Follow-ups under 300 words.
Privacy: NEVER reveal full ID numbers or sensitive data in your response.`,
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
      const firstAsk: Record<string, string> = {
        bvn: `Analyze this BVN result and give me your assessment. What should I know, and what should I do next?`,
        account: `Analyze this account verification result. Is everything in order? What should I know or do next?`,
        credit: `Analyze this credit report and give me a full assessment. What's my credit health, what are the red flags, and give me a specific action plan to improve my score.`,
      }
      conversation.push({
        role: 'user',
        content: firstAsk[service_type] ?? firstAsk.bvn,
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
        temperature: 0.6,
        max_tokens: 1500,
      }),
    })

    if (!openaiRes.ok) {
      const err = await openaiRes.text()
      throw new Error(`OpenAI API error: ${err}`)
    }

    const openaiData = await openaiRes.json()
    const reply = openaiData.choices?.[0]?.message?.content ?? 'Unable to generate advice.'

    return new Response(
      JSON.stringify({ explanation: reply }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err?.message ?? 'An error occurred while processing your request.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
