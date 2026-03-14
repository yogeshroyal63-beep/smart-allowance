import OpenAI from 'openai'
import dotenv from 'dotenv'
dotenv.config()

const apiKey = process.env.OPENROUTER_API_KEY
if (!apiKey) {
  console.error('❌ OPENROUTER_API_KEY missing from .env')
  process.exit(1)
}

console.log(`   Using OpenRouter: ${apiKey.slice(0, 16)}...`)

const client = new OpenAI({
  apiKey,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:3000',
    'X-Title': 'SmartAllowance'
  }
})

const MODEL = 'openrouter/free'

async function chat(system, user, maxTokens = 500) {
  const response = await client.chat.completions.create({
    model: MODEL,
    max_tokens: maxTokens,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ]
  })
  return response.choices[0].message.content?.trim() || ''
}

export async function evaluatePayment({
  childAlias, merchant, amount, category, notes, limits, allowedCategories
}) {
  const system = `You are SmartAllowance AI — an autonomous payment approval agent for a child allowance system.
Evaluate payment requests against parent-set rules. Make approve/deny decisions.
Protect child privacy — never reveal real identity to merchants.
Always respond in valid JSON only, no markdown, no extra text.`

  const user = `Payment Request:
- Child Alias: ${childAlias}
- Merchant: ${merchant}
- Amount: ${amount} ETH
- Category: ${category}
- Notes: ${notes || 'none'}

Limits:
- Weekly limit: ${limits?.weeklyLimit || '0.05'} ETH | Weekly spent: ${limits?.weeklySpent || '0'} ETH
- Monthly limit: ${limits?.monthlyLimit || '0.2'} ETH | Monthly spent: ${limits?.monthlySpent || '0'} ETH

Allowed: ${Object.entries(allowedCategories || {}).filter(([,v]) => v).map(([k]) => k).join(', ') || 'food, education'}
Blocked: ${Object.entries(allowedCategories || {}).filter(([,v]) => !v).map(([k]) => k).join(', ') || 'none'}

Respond ONLY with this JSON:
{"approved":true,"reason":"one sentence","aiAnalysis":"2-3 sentences","confidence":85,"flags":[]}`

  const text = (await chat(system, user, 400)).replace(/```json|```/g, '').trim()
  return JSON.parse(text)
}

export async function generateInsights({ children, recentTransactions }) {
  const system = `You are SmartAllowance AI — a family finance advisor. Always respond in valid JSON only, no markdown.`

  const user = `Analyze this allowance data and provide 3 insights:
Children: ${JSON.stringify(children)}
Recent Transactions: ${JSON.stringify(recentTransactions)}

Respond ONLY with a JSON array of exactly 3 objects:
[{"type":"tip","icon":"TrendingUp","title":"short title","body":"2-3 sentence insight","severity":"positive"}]
severity options: positive, warning, neutral, danger
icon options: TrendingUp, AlertTriangle, CheckCircle, Brain`

  const text = (await chat(system, user, 700)).replace(/```json|```/g, '').trim()
  const parsed = JSON.parse(text)
  return Array.isArray(parsed) ? parsed : parsed.insights || []
}

export async function generatePrivacyAlias({ childName }) {
  const response = await client.chat.completions.create({
    model: MODEL,
    max_tokens: 50,
    messages: [{
      role: 'user',
      content: `Generate ONE anonymous alias for a child named ${childName}. Format: Word#Numbers (e.g. StarGazer#4821). Fun, age-appropriate. Respond with ONLY the alias, nothing else.`
    }]
  })
  return response.choices[0].message.content?.trim() || 'StarKid#1234'
}

export async function agentChat({ message, history = [], role, childContext }) {
  const system = role === 'parent'
    ? `You are SmartAllowance AI — a smart assistant for parents managing children's allowances on blockchain.
Help with balances, spending patterns, limits, payments, and funding.
Children data: ${childContext ? JSON.stringify(childContext) : 'No data loaded yet'}
Be concise and friendly. Plain text only.`
    : `You are SmartAllowance AI — a friendly assistant for a child using SmartAllowance.
Child profile: ${childContext ? JSON.stringify(childContext) : 'No profile loaded yet'}
Help with balance, spending limits, categories, payment requests.
Be fun, simple, encouraging. Plain text only.`

  const messages = [
    { role: 'system', content: system },
    ...history.slice(-10).map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content
    })),
    { role: 'user', content: message }
  ]

  const response = await client.chat.completions.create({
    model: MODEL,
    max_tokens: 500,
    messages
  })

  const reply = response.choices[0].message.content?.trim() || 'I am having trouble responding right now. Please try again.'

  let requiresApproval = null
  if (role === 'child' && /pay|spend|buy|purchase/i.test(message)) {
    const amountMatch = message.match(/(\d+\.?\d*)\s*eth/i)
    if (amountMatch) {
      requiresApproval = { type: 'payment', amount: amountMatch[1], merchant: 'Unknown', reason: message }
    }
  }

  return { reply, action: null, requiresApproval }
}
