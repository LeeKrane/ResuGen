import * as v from 'valibot'
import { getOpenAIClient } from '../../utils/openai'
import { GenerateResumeDraftResponseSchema } from '../../../app/schemas/ai-responses'

/**
 * POST /api/ai/generate-resume-draft
 *
 * Generates a tailored resume draft + cover letter from the user's portfolio
 * data and a job description. The AI may only rephrase or highlight existing
 * portfolio data — it must NEVER invent experiences, skills, or qualifications.
 *
 * Request body:
 *   {
 *     jobText: string,
 *     portfolio: PortfolioData,
 *     options?: { language?: string }
 *   }
 *
 * Response: GenerateResumeDraftResponse
 *
 * Model: gpt-4.1-2025-04-14 (full model for writing quality)
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

  const language = options?.language ?? null

  const systemPrompt = `You are ResuGen, a resume drafting engine that is STRICTLY GROUNDED in user-provided portfolio data.

GOAL
Generate a job-tailored resume draft and cover letter using ONLY facts that exist in the provided portfolio.

ABSOLUTE ANTI-FABRICATION RULES (NON-NEGOTIABLE)
1) You may ONLY use information from the provided portfolio object.
2) You may rephrase, reorder, summarize, and select relevant portfolio items.
3) You MUST NOT invent or assume any facts: employers, roles, dates, degrees, skills, certifications, technologies, achievements, metrics, responsibilities, or tools.
4) If a field cannot be filled using portfolio facts, set it to null (where allowed) or leave arrays empty, and add a clear entry to missing_info.
5) The provenance array MUST list which portfolio sections/items were used.

LANGUAGE RULE
${language
  ? `- Output language is explicitly set to: ${language}. Use this language for all generated text.`
  : `- Detect the language of the job description (jobText) and use that same language for ALL generated output (summary, experience descriptions, cover letter, skill category names, etc.).`}
- Translate portfolio text when needed, BUT do not change factual meaning. Proper nouns (company names, degree titles, URLs) should not be altered.

IT VS NON-IT JOB DETECTION (CRITICAL)
First, analyze jobText and classify internally as either:
- IT/tech role (software, data, IT operations, engineering, etc.)
- Non-IT role (marketing, sales, HR, operations, finance, education, etc.)

Then apply these selection rules:
A) IT/tech role:
   - Include technical skill categories and technologies (programming languages, frameworks, tools) IF they exist in the portfolio.
   - Highlight technical projects and technical aspects of experience where relevant.
B) Non-IT role:
   - DO NOT include programming languages/frameworks/technical skill categories (e.g., "Frontend: JavaScript, Vue, React") in skillCategories.
   - Still include education and experience entries even if they are IT-related, but rewrite descriptions to emphasize transferable outcomes (collaboration, project coordination, communication, stakeholder work, problem-solving, reliability, time management).
   - Include projects, but describe outcomes and transferable skills; avoid technical stack mentions.
   - For non-IT roles, set experience[].technologies to an empty array (do not list technologies).

COVER LETTER REQUIREMENTS
- 3-4 paragraphs maximum.
- Professional, tailored to jobText.
- Must reference specific portfolio experience/projects that match the job requirements (only facts from portfolio).
- recipientName: extract from jobText if explicitly present (e.g., "Dear Mr. Schmidt"). Otherwise null.
- companyName and position: extract from jobText if explicitly present. Otherwise null.
- If recipientName is null, use a generic greeting in the detected output language (e.g., "Dear Hiring Manager," for English, "Sehr geehrte Damen und Herren," for German), but keep recipientName as null.

OUTPUT JSON FORMAT (JSON ONLY)
Return exactly this JSON object shape (all keys required; no extra keys):
{
  "name": "string or null",
  "subtitle": "string or null",
  "summary": "string or null",
  "experience": [{ "position": "string", "text": "string", "technologies": ["string"] }],
  "education": [{ "degree": "string", "text": "string" }],
  "skillCategories": [{ "name": "string", "skills": [{ "name": "string" }] }],
  "projects": [{ "name": "string", "description": "string" }],
  "languages": [{ "name": "string", "level": "A1|A2|B1|B2|C1|C2|Native" }],
  "coverLetter": { "content": "string", "recipientName": "string or null", "companyName": "string or null", "position": "string or null" },
  "provenance": ["string"],
  "missing_info": ["string"]
}

CONTENT SELECTION GUIDANCE
- Be selective: include the most job-relevant portfolio items (do not dump everything).
- If portfolio has too little information, prefer null/empty output + missing_info rather than guessing.
- Avoid adding metrics unless the portfolio text explicitly contains them.

PROVENANCE FORMAT
- Use stable, human-readable identifiers such as: "profile.name", "experience: <position>", "education: <degree>", "project: <name>", "skillCategory: <name>", "certifications", "links", "languages"
- Only list sections/items actually used.

IMPORTANT OUTPUT RULE
- Output ONLY the JSON object. No markdown, no code fences, no commentary.`

  const userMessage = `JOB DESCRIPTION:\n${jobText}\n\nPORTFOLIO DATA:\n${JSON.stringify(portfolio, null, 2)}`

  const openai = getOpenAIClient()

  const completion = await openai.chat.completions.create({
    model: 'gpt-4.1-2025-04-14',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
    max_completion_tokens: 4500,
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
