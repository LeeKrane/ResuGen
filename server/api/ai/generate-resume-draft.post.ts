import * as v from 'valibot'
import { getOpenAIClient } from '../../utils/openai'
import { GenerateResumeDraftResponseSchema } from '../../../app/schemas/ai-responses'

/**
 * POST /api/ai/generate-resume-draft
 *
 * Generates a tailored resume draft from the user's portfolio data and extracted
 * job requirements. The AI may only rephrase or highlight existing portfolio data —
 * it must NEVER invent experiences, skills, or qualifications.
 *
 * Request body:
 *   {
 *     jobText: string,
 *     portfolio: PortfolioData,
 *     options?: { language?: string }
 *   }
 *
 * Response: GenerateResumeDraftResponse (includes provenance[] and missing_info[])
 *
 * Security:
 *   - Cache-Control: no-store
 *   - Request/response bodies are NOT logged
 *   - jobText is ephemeral: used only for this request, never persisted
 */
export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'Cache-Control': 'no-store',
    'Pragma': 'no-cache',
  })

  const body = await readBody(event)
  const { jobText, portfolio, options } = body ?? {}

  if (!jobText || typeof jobText !== 'string' || jobText.trim().length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'jobText is required' })
  }
  if (!portfolio || typeof portfolio !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'portfolio is required' })
  }

  const language = options?.language ?? 'English'

  const systemPrompt = `You are a professional resume writer. Your task is to generate a tailored resume draft.

STRICT ANTI-FABRICATION RULES — you MUST follow these:
1. You may ONLY use information that exists in the provided portfolio data.
2. You may rephrase, restructure, or highlight existing content to match the job description.
3. You must NEVER invent, assume, or add any experience, skill, qualification, or fact not present in the portfolio.
4. For every field you populate, you MUST include its source in the provenance array.
5. If the portfolio lacks data for a field, add that field name to missing_info — do NOT guess.

Return ONLY valid JSON matching this exact schema — no markdown, no explanation:
{
  "name": "string or null",
  "subtitle": "string or null",
  "summary": "string or null",
  "provenance": [{ "field": "string", "sourceIds": ["string"] }],
  "missing_info": ["string"]
}

Language for the output: ${language}`

  const userMessage = `JOB DESCRIPTION:
${jobText}

PORTFOLIO DATA:
${JSON.stringify(portfolio, null, 2)}`

  const openai = getOpenAIClient()

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  })

  const raw = completion.choices[0]?.message?.content
  if (!raw) {
    throw createError({ statusCode: 502, statusMessage: 'No response from AI' })
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw createError({ statusCode: 502, statusMessage: 'AI returned invalid JSON' })
  }

  const result = v.safeParse(GenerateResumeDraftResponseSchema, parsed)
  if (!result.success) {
    throw createError({ statusCode: 502, statusMessage: 'AI response did not match expected schema' })
  }

  return result.output
})
