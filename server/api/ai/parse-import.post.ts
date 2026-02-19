import * as v from 'valibot'
import { getOpenAIClient } from '../../utils/openai'
import { ParseImportResponseSchema } from '../../../app/schemas/ai-responses'

/**
 * POST /api/ai/parse-import
 *
 * Parses an uploaded resume file into structured PortfolioData using OpenAI.
 *
 * Two processing paths (per ADR-008):
 *   - PDF:  Pages sent as base64 images → gpt-4.1 with vision API
 *   - DOCX/TXT: Extracted text → gpt-4.1-mini with text prompt
 *
 * Request body:
 *   For PDF:      { fileType: 'pdf', pages: string[] }  — array of base64 PNG data URIs
 *   For DOCX/TXT: { fileType: 'docx' | 'txt', rawText: string }
 *
 * Response: ParseImportResponse
 *
 * Security:
 *   - Cache-Control: no-store
 *   - Request/response bodies are NOT logged
 *   - File content is ephemeral: used only for this request, never persisted
 */
export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'Cache-Control': 'no-store',
    'Pragma': 'no-cache',
  })

  const body = await readBody(event)
  const { fileType } = body ?? {}

  if (!fileType || !['pdf', 'docx', 'txt'].includes(fileType)) {
    throw createError({ statusCode: 400, statusMessage: 'fileType must be pdf, docx, or txt' })
  }

  // Validate input based on file type
  if (fileType === 'pdf') {
    const { pages } = body
    if (!pages || !Array.isArray(pages) || pages.length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'pages array is required for PDF files' })
    }
    if (pages.some((p: unknown) => typeof p !== 'string')) {
      throw createError({ statusCode: 400, statusMessage: 'pages must be an array of base64 data URI strings' })
    }
  } else {
    const { rawText } = body
    if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'rawText is required for DOCX/TXT files' })
    }
  }

  const systemPrompt = `You are a resume parser. Extract structured portfolio data from the provided resume.

STRICT NO-GUESSING POLICY (NON-NEGOTIABLE)
1) Only extract information EXPLICITLY present in the resume.
2) If a field is ambiguous or absent, OMIT it from data and ADD it to missing_fields.
3) NEVER infer, assume, or fabricate dates, titles, descriptions, skills, or any other data.
4) Assign a confidence score (0.0–1.0) for each extracted top-level field in the confidence object.
5) Avatar/photo data CANNOT be extracted — always add "avatarData" to missing_fields.

LANGUAGE LEVEL MAPPING (CEFR)
Map informal language proficiency descriptions to CEFR levels:
- "native", "mother tongue", "Muttersprache" → "Native"
- "fluent", "proficient", "fließend", "verhandlungssicher" → "C2"
- "advanced", "fortgeschritten" → "C1"
- "upper intermediate" → "B2"
- "intermediate", "gute Kenntnisse" → "B1"
- "elementary", "basic", "Grundkenntnisse" → "A2"
- "beginner", "Anfänger" → "A1"
If a level is already in CEFR format (A1–C2), keep it as-is.
If no level is mentioned, omit the level field entirely.

FIELD EXTRACTION RULES
- profile.subtitle: professional title or headline (e.g., "Senior Frontend Engineer")
- profile.summary: professional summary or objective paragraph
- profile.hobbies: only if explicitly listed as hobbies/interests
- education[].degree: degree name (e.g., "B.Sc. Computer Science")
- education[].text: institution name and any additional details
- experience[].position: job title
- experience[].text: job description, responsibilities, achievements
- experience[].technologies: technologies/tools mentioned in that specific role (as string array)
- skillCategories: group skills by category if the resume has categories; otherwise use a single "General" category
- certifications[].name: certification name
- certifications[].issuer: issuing organization (if mentioned)
- links: extract URLs for GitHub, LinkedIn, portfolio sites, etc.
- languages: spoken/written languages with CEFR levels

OUTPUT JSON FORMAT (JSON ONLY — no markdown, no code fences)
{
  "data": {
    "profile": { "subtitle": "string", "email": "string", "phone": "string", "address": "string", "summary": "string", "hobbies": ["string"] },
    "links": [{ "name": "string", "url": "string" }],
    "languages": [{ "name": "string", "level": "A1|A2|B1|B2|C1|C2|Native" }],
    "skillCategories": [{ "name": "string", "skills": [{ "name": "string" }] }],
    "education": [{ "degree": "string", "text": "string" }],
    "experience": [{ "position": "string", "text": "string", "technologies": ["string"] }],
    "projects": [{ "name": "string", "description": "string" }],
    "certifications": [{ "name": "string", "issuer": "string" }]
  },
  "confidence": { "fieldName": 0.0 },
  "missing_fields": ["string"]
}
All fields in data are optional — only include what is clearly present in the resume.`

  const openai = getOpenAIClient()

  // Build messages based on file type
  let model: string
  let messages: Array<{ role: 'system' | 'user'; content: string | Array<{ type: string; text?: string; image_url?: { url: string; detail?: string } }> }>

  if (fileType === 'pdf') {
    // PDF path: vision API with page images → gpt-4.1 (per ADR-008)
    model = 'gpt-4.1-2025-04-14'
    const imageContent = (body.pages as string[]).map((dataUri: string) => ({
      type: 'image_url' as const,
      image_url: { url: dataUri, detail: 'high' as const },
    }))
    messages = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          { type: 'text' as const, text: 'Parse this resume from the following page images. Extract all structured data.' },
          ...imageContent,
        ],
      },
    ]
  } else {
    // DOCX/TXT path: text extraction → gpt-4.1-mini
    model = 'gpt-4.1-mini-2025-04-14'
    messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `FILE TYPE: ${fileType}\n\nRESUME TEXT:\n${body.rawText}` },
    ]
  }

  const completion = await openai.chat.completions.create({
    model,
    messages: messages as any,
    response_format: { type: 'json_object' },
    temperature: 0,
    max_completion_tokens: 3000,
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

  const result = v.safeParse(ParseImportResponseSchema, parsed)
  if (!result.success) {
    throw createError({ statusCode: 502, statusMessage: 'AI response did not match expected schema' })
  }

  return result.output
})
