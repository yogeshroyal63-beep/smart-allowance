import Groq from 'groq-sdk'
import dotenv from 'dotenv'
dotenv.config()

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

const MODEL = 'llama-3.1-8b-instant'

console.log(`   Using Groq: ${process.env.GROQ_API_KEY?.slice(0, 20)}...`)

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

async function chatWithHistory(system, messages, maxTokens = 400) {
  const response = await client.chat.completions.create({
    model: MODEL,
    max_tokens: maxTokens,
    messages: [
      { role: 'system', content: system },
      ...messages
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

Respond ONLY with this JSON (no markdown):
{"approved":true,"reason":"one sentence","aiAnalysis":"2-3 sentences","confidence":85,"flags":[]}`

  const text = (await chat(system, user, 400)).replace(/```json|```/g, '').trim()
  return JSON.parse(text)
}

export async function generateInsights({ children, recentTransactions }) {
  const system = `You are SmartAllowance AI — a family finance advisor. Always respond in valid JSON only, no markdown.`

  const user = `Analyze this allowance data and provide 3 insights:
Children: ${JSON.stringify(children)}
Recent Transactions: ${JSON.stringify(recentTransactions)}

Respond ONLY with a JSON array of exactly 3 objects (no markdown):
[{"type":"tip","icon":"TrendingUp","title":"short title","body":"2-3 sentence insight","severity":"positive"}]
severity options: positive, warning, neutral, danger
icon options: TrendingUp, AlertTriangle, CheckCircle, Brain`

  const text = (await chat(system, user, 700)).replace(/```json|```/g, '').trim()
  const parsed = JSON.parse(text)
  return Array.isArray(parsed) ? parsed : parsed.insights || []
}

export async function generatePrivacyAlias({ childName }) {
  const system = 'You generate anonymous aliases for children. Respond with ONLY the alias, nothing else.'
  const user = `Generate ONE anonymous alias for a child named ${childName}. Format: Word#Numbers (e.g. StarGazer#4821). Fun, age-appropriate.`
  const result = await chat(system, user, 50)
  return result.split('\n')[0].trim() || 'StarKid#1234'
}

function parsePaymentIntent(message) {
  const msg = message.toLowerCase()
  if (!/pay|spend|buy|purchase|send|transfer/i.test(msg)) return null

  const amountMatch = message.match(/(\d+\.?\d*)\s*eth/i)
  if (!amountMatch) return null
  const amount = amountMatch[1]

  let merchant = ''
  const merchantMatch = message.match(/(?:to|at|@)\s+([A-Za-z][A-Za-z0-9\s\.]+?)(?:\s+for|\s+using|\s+on|\s+ETH|$)/i)
  if (merchantMatch) merchant = merchantMatch[1].trim()

  const CATEGORY_KEYWORDS = {
    food: ['food', 'eat', 'restaurant', 'pizza', 'burger', 'subway', 'mcdonald', 'chipotle', 'lunch', 'dinner', 'breakfast'],
    education: ['education', 'edu', 'school', 'course', 'learn', 'study', 'textbook', 'khan', 'coursera', 'duolingo', 'book'],
    entertainment: ['entertainment', 'netflix', 'spotify', 'youtube', 'movie', 'cinema', 'stream', 'music', 'show'],
    clothing: ['clothing', 'clothes', 'shirt', 'shoes', 'nike', 'zara', 'fashion', 'wear', 'jacket'],
    gaming: ['gaming', 'game', 'games', 'steam', 'playstation', 'xbox', 'roblox', 'minecraft', 'fortnite'],
  }

  let category = ''
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(k => msg.includes(k))) { category = cat; break }
  }

  if (!category) {
    const forMatch = message.match(/for\s+(\w+)/i)
    if (forMatch) {
      const word = forMatch[1].toLowerCase()
      for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.includes(word) || cat === word) { category = cat; break }
      }
    }
  }

  return { amount, merchant, category }
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
If asked about balance, check the profile data above and give specific numbers.
If the user wants to make a payment, confirm you are opening the payment form for them.
Be fun, simple, encouraging. Plain text only.`

  const messages = [
    ...history.slice(-8).map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content
    })),
    { role: 'user', content: message }
  ]

  try {
    const reply = await chatWithHistory(system, messages, 400)

    let requiresApproval = null
    if (role === 'child') {
      const intent = parsePaymentIntent(message)
      if (intent && intent.amount) {
        requiresApproval = {
          type: 'payment',
          amount: intent.amount,
          merchant: intent.merchant || '',
          category: intent.category || '',
          reason: message
        }
      }
    }

    return { reply, action: null, requiresApproval }

  } catch (err) {
    console.error('agentChat error:', err.message)
    return {
      reply: 'Sorry, AI service is temporarily unavailable. Please try again in a moment.',
      action: null,
      requiresApproval: null
    }
  }
}
