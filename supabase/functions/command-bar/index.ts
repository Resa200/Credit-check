// Supabase Edge Function: command-bar
// Parses natural language commands into structured intents using OpenAI function calling
//
// Deploy with: supabase functions deploy command-bar
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

const SYSTEM_PROMPT = `You are the AI command parser for CreditCheck, a Nigerian financial verification app. Your job is to parse the user's natural language command into a structured intent.

Today's date is: {{TODAY}}

## Available Intents

### 1. navigate — Go to a page
Valid paths:
- /services — Service selection page
- /profile — User profile
- /profile?tab=subscription — Subscription management
- /profile?tab=history — Lookup history
- /profile?tab=audit — Audit log
- /login — Sign in page
- /signup — Create account page

### 2. start_service — Begin a verification lookup
Valid services: bvn, account, credit
Use this when the user wants to "do a lookup", "check", "verify", "run", "start" a BVN/account/credit service.

### 3. filter_history — Filter lookup history
Filter fields (all optional):
- serviceType: "bvn" | "account" | "credit"
- status: "success" | "error" | "pending"
  - Map user terms: "failed"/"unsuccessful" → "error", "successful"/"completed"/"passed" → "success"
- dateFrom: YYYY-MM-DD format (resolve relative dates using today's date)
- dateTo: YYYY-MM-DD format

### 4. answer — Answer a question using the provided user context
Use this for questions about quota, subscription status, account info.
User context is provided in the request — use it to compose a helpful, concise answer.

### 5. unknown — Cannot parse the command
Use this when the command doesn't match any intent. Return a helpful suggestion.

## Rules
- Always return exactly ONE intent
- For "start_service", infer the service from context: "BVN" → bvn, "account"/"bank account" → account, "credit"/"credit report"/"credit score" → credit
- For date resolution: "last week" = 7 days ago to today, "this month" = 1st of current month to today, "yesterday" = yesterday's date for both from and to, "today" = today's date
- If the user is not authenticated (from context), and asks about history/subscription/profile, return an answer saying "Please sign in to access this feature."
- Keep answer texts under 100 words, friendly and concise`

const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'return_intent',
      description: 'Return the parsed command intent',
      parameters: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['navigate', 'start_service', 'filter_history', 'answer', 'unknown'],
            description: 'The type of intent parsed from the command',
          },
          path: {
            type: 'string',
            description: 'For navigate: the route path',
          },
          service: {
            type: 'string',
            enum: ['bvn', 'account', 'credit'],
            description: 'For start_service: which service to start',
          },
          label: {
            type: 'string',
            description: 'A short human-readable description of the action (e.g. "Navigate to Lookup History", "Start BVN Verification")',
          },
          filters: {
            type: 'object',
            properties: {
              serviceType: { type: 'string', enum: ['bvn', 'account', 'credit'] },
              status: { type: 'string', enum: ['pending', 'success', 'error'] },
              dateFrom: { type: 'string', description: 'YYYY-MM-DD' },
              dateTo: { type: 'string', description: 'YYYY-MM-DD' },
            },
            description: 'For filter_history: the filters to apply',
          },
          text: {
            type: 'string',
            description: 'For answer/unknown: the response text',
          },
        },
        required: ['type'],
      },
    },
  },
]

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiKey) {
      return new Response(
        JSON.stringify({ error: 'AI provider not configured.' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json()
    const { command, user_context } = body

    if (!command || typeof command !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing required field: command' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const today = new Date().toISOString().split('T')[0]
    const systemPrompt = SYSTEM_PROMPT.replace('{{TODAY}}', today)

    const userMessage = user_context
      ? `Command: "${command}"\n\nUser context: ${JSON.stringify(user_context)}`
      : `Command: "${command}"`

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        tools: TOOLS,
        tool_choice: { type: 'function', function: { name: 'return_intent' } },
        temperature: 0,
        max_tokens: 300,
      }),
    })

    if (!openaiRes.ok) {
      const err = await openaiRes.text()
      throw new Error(`OpenAI API error: ${err}`)
    }

    const openaiData = await openaiRes.json()
    const toolCall = openaiData.choices?.[0]?.message?.tool_calls?.[0]
    if (!toolCall?.function?.arguments) {
      throw new Error('No intent returned from AI')
    }

    const intent = JSON.parse(toolCall.function.arguments)

    return new Response(
      JSON.stringify({ intent }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err?.message ?? 'Failed to parse command' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
