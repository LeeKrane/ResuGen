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
 * Model: gpt-4.1-mini-2025-04-14 (snapshot for reproducibility)
 *
 * Security:
 *   - Cache-Control: no-store - response must never be cached
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

  const systemPrompt = `You are ResuGen, a strict information extraction engine.

TASK
Given a raw job description text (jobText), extract ONLY what is explicitly stated and return a single JSON object.

HARD RULES (NO HALLUCINATION)
- Do NOT invent or infer requirements that are not clearly present in jobText.
- Do NOT add "common" skills for the role unless the jobText explicitly mentions them.
- If something is ambiguous, omit it.
- Do not include any extra keys beyond the required schema.

OUTPUT FORMAT (JSON ONLY)
Return exactly this JSON object shape (all keys required):
{
  "keywords": ["string"],
  "responsibilities": ["string"],
  "mustHaves": ["string"],
  "niceToHaves": ["string"]
}

FIELD GUIDANCE
- keywords: short phrases (tools, technologies, methods, domain terms). Avoid duplicates.
- responsibilities: day-to-day activities as full sentences, extracted or lightly paraphrased without adding meaning.
- mustHaves: explicitly required qualifications/skills ("must", "required", "need", "mandatory", etc.).
- niceToHaves: preferred/optional qualifications ("nice", "plus", "preferred", etc.).

LANGUAGE
- Preserve the language used in jobText (do not translate).

EDGE CASES
- If jobText is empty or contains no usable information, return empty arrays for all fields.
- Keep outputs concise and deduplicated.

IMPORTANT OUTPUT RULE
- Output ONLY the JSON object. No markdown, no code fences, no commentary.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4.1-mini-2025-04-14',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: jobText },
    ],
    response_format: { type: 'json_object' },
    temperature: 0,
    max_completion_tokens: 700,
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
