import * as v from 'valibot'
import { getOpenAIClient } from '../../utils/openai'
import { ExtractRequirementsResponseSchema } from '../../../app/schemas/ai-responses'

/**
 * POST /api/ai/extract-requirements
 *
 * Extracts structured job requirements from a raw job description text.
 *
 * Request body: { jobText: string }
 * Response:     ExtractRequirementsResponse
 *
 * Security:
 *   - Cache-Control: no-store — response must never be cached
 *   - Request/response bodies are NOT logged (only method, path, status, timing)
 *   - jobText is ephemeral: used only for this request, never persisted
 */
export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'Cache-Control': 'no-store',
    'Pragma': 'no-cache',
  })

  const body = await readBody(event)
  const jobText: string = body?.jobText

  if (!jobText || typeof jobText !== 'string' || jobText.trim().length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'jobText is required' })
  }

  const openai = getOpenAIClient()

  const systemPrompt = `You are a job requirements analyst. Extract structured information from job descriptions.
Return ONLY valid JSON matching this exact schema — no markdown, no explanation:
{
  "keywords": ["string"],
  "responsibilities": ["string"],
  "mustHaves": ["string"],
  "niceToHaves": ["string"]
}
- keywords: important technical skills, tools, and domain terms (short phrases)
- responsibilities: what the role involves day-to-day (full sentences)
- mustHaves: explicitly required qualifications or experience
- niceToHaves: preferred but not required qualifications`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: jobText },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
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

  const result = v.safeParse(ExtractRequirementsResponseSchema, parsed)
  if (!result.success) {
    throw createError({ statusCode: 502, statusMessage: 'AI response did not match expected schema' })
  }

  return result.output
})
