import Anthropic from '@anthropic-ai/sdk'
import dotenv from 'dotenv'
dotenv.config()

// Use Synthesis key if available, otherwise fall back to Anthropic key
const apiKey = process.env.SYNTHESIS_API_KEY || process.env.ANTHROPIC_API_KEY

const client = new Anthropic({
  apiKey: apiKey,
  baseURL: process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com',
})

const MODEL = 'claude-sonnet-4-6'

export async function evaluatePayment({
  childAlias, merchant, amount, category, notes, limits, allowedCategories
}) {
  const systemPrompt = `You are SmartAllowance AI — an autonomous payment approval agent for a child allowance system.
Your job: evaluate payment requests against parent-set rules. Make approve/deny decisions with clear reasoning.
Protect child privacy — never reveal their real identity to merchants.
Always respond in valid JSON only, no markdown, no extra text.`

  const userPrompt = `Payment Request:
- Child Alias: ${childAlias}
- Merchant: ${merchant}
- Amount: ${amount} ETH
- Category: ${category}
- Notes: ${notes || 'none'}

Limits & Spending:
- Weekly limit: ${limits.weeklyLimit} ETH | Weekly spent: ${limits.weeklySpent} ETH
- Monthly limit: ${limits.monthlyLimit} ETH | Monthly spent: ${limits.monthlySpent} ETH

Allowed Categories: ${Object.entries(allowedCategories).filter(([,v]) => v).map(([k]) => k).join(', ')}
Blocked Categories: ${Object.entries(allowedCategories).filter(([,v]) => !v).map(([k]) => k).join(', ')}

Respond with JSON:
{
  "approved": boolean,
  "reason": "short one-sentence reason shown to child",
  "aiAnalysis": "2-3 sentence explanation of decision and privacy protection",
  "confidence": number (0-100),
  "flags": []
}`

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 500,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }]
  })

  const text = response.content[0].text.trim().replace(/```json|```/g, '').trim()
  return JSON.parse(text)
}

export async function generateInsights({ children, recentTransactions }) {
  const systemPrompt = `You are SmartAllowance AI — a family finance advisor. Always respond in valid JSON only.`

  const userPrompt = `Analyze this allowance data and provide 3 insights:
Children: ${JSON.stringify(children, null, 2)}
Recent Transactions: ${JSON.stringify(recentTransactions, null, 2)}

Return JSON array of exactly 3 insights:
[{ "type": "tip|alert|block|praise", "icon": "TrendingUp|AlertTriangle|CheckCircle|Brain", "title": "short title", "body": "2-3 sentence insight", "severity": "positive|warning|neutral|danger" }]`

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 800,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }]
  })

  const text = response.content[0].text.trim().replace(/```json|```/g, '').trim()
  const parsed = JSON.parse(text)
  return Array.isArray(parsed) ? parsed : parsed.insights || []
}

export async function generatePrivacyAlias({ childName }) {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 100,
    messages: [{
      role: 'user',
      content: `Generate ONE anonymous alias for a child named ${childName}. Format: Word#Numbers (e.g. StarGazer#4821). Fun, age-appropriate. Respond with just the alias.`
    }]
  })
  return response.content[0].text.trim()
}

export async function agentChat({ message, history = [], role, childContext }) {
  const systemPrompt = role === 'parent'
    ? `You are SmartAllowance AI — a smart financial assistant for parents managing children's allowances on blockchain.
Help parents check balances, understand spending patterns, set limits, review payments, and fund allowances.
Children data: ${childContext ? JSON.stringify(childContext, null, 2) : 'No data'}
Be concise, friendly, and informative. Respond in plain text.`
    : `You are SmartAllowance AI — a friendly assistant for a child using SmartAllowance.
Child profile: ${childContext ? JSON.stringify(childContext, null, 2) : 'No profile'}
Help children check balance, spending limits, categories, and make payment requests.
Be fun, simple, encouraging. Respond in plain text.`

  const messages = [
    ...history.slice(-10).map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
    { role: 'user', content: message }
  ]

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 600,
    system: systemPrompt,
    messages
  })

  const reply = response.content[0].text.trim()

  // Detect payment intent from child
  let requiresApproval = null
  if (role === 'child' && /pay|spend|buy|purchase/i.test(message)) {
    const amountMatch = message.match(/(\d+\.?\d*)\s*eth/i)
    if (amountMatch) {
      requiresApproval = {
        type: 'payment',
        amount: amountMatch[1],
        merchant: 'Unknown',
        reason: message
      }
    }
  }

  return { reply, action: null, requiresApproval }
}
