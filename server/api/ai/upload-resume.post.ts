import * as v from 'valibot'
import { getOpenAIClient } from '../../utils/openai'
import { extractText } from '../../utils/file-parser'
import { ParseImportResponseSchema } from '../../../app/schemas/ai-responses'

/**
 * POST /api/ai/upload-resume
 *
 * Accepts a resume file upload (multipart/form-data), and returns structured
 * portfolio data via OpenAI.
 *
 * PDF:  Sent as base64 directly to gpt-4o-mini via Chat Completions API.
 *       OpenAI handles both text-layer and scanned/image PDFs natively.
 * DOCX: Text extracted via mammoth → gpt-4o-mini
 * TXT:  UTF-8 decoded → gpt-4o-mini
 *
 * Security:
 *   - Cache-Control: no-store
 *   - File content is ephemeral: used only for this request, never persisted
 *   - Max file size: 10 MB
 */

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

const KNOWN_TECHNOLOGIES = [
  { label: "Alpine Linux", value: "alpine-linux" }, { label: "Alpine.js", value: "alpinejs" },
  { label: "Android", value: "android" }, { label: "Angular", value: "angular" },
  { label: "Ansible", value: "ansible" }, { label: "Apache", value: "apache" },
  { label: "Astro", value: "astro" }, { label: "AWS", value: "aws" },
  { label: "Azure", value: "azure" }, { label: "Babel", value: "babel" },
  { label: "Bash", value: "bash" }, { label: "Bitbucket", value: "bitbucket" },
  { label: "Bootstrap", value: "bootstrap" }, { label: "Bun", value: "bun" },
  { label: "C", value: "c" }, { label: "C#", value: "csharp" },
  { label: "C++", value: "cpp" }, { label: "Cassandra", value: "cassandra" },
  { label: "CircleCI", value: "circleci" }, { label: "ClickHouse", value: "clickhouse" },
  { label: "Cloudflare", value: "cloudflare" }, { label: "Confluence", value: "confluence" },
  { label: "CSS", value: "css" }, { label: "Cypress", value: "cypress" },
  { label: "D3.js", value: "d3" }, { label: "Debian", value: "debian" },
  { label: "Deno", value: "deno" }, { label: "Discord", value: "discord" },
  { label: "Django", value: "django" }, { label: "Docker", value: "docker" },
  { label: "Elastic", value: "elastic" }, { label: "Electron", value: "electron" },
  { label: "Elixir", value: "elixir" }, { label: "ESLint", value: "eslint" },
  { label: "Express", value: "express" }, { label: "FastAPI", value: "fastapi" },
  { label: "Firebase", value: "firebase" }, { label: "Flask", value: "flask" },
  { label: "Flutter", value: "flutter" }, { label: "Forgejo", value: "forgejo" },
  { label: "Git", value: "git" }, { label: "Gitea", value: "gitea" },
  { label: "GitHub", value: "github" }, { label: "GitHub Actions", value: "github-actions" },
  { label: "GitLab", value: "gitlab" }, { label: "Go", value: "go" },
  { label: "Gradle", value: "gradle" }, { label: "Grafana", value: "grafana" },
  { label: "GraphQL", value: "graphql" }, { label: "Hadoop", value: "hadoop" },
  { label: "Haskell", value: "haskell" }, { label: "Heroku", value: "heroku" },
  { label: "HTML", value: "html" }, { label: "IntelliJ IDEA", value: "intellij" },
  { label: "iOS", value: "ios" }, { label: "Java", value: "java" },
  { label: "JavaScript", value: "javascript" }, { label: "Jenkins", value: "jenkins" },
  { label: "Jest", value: "jest" }, { label: "Jira", value: "jira" },
  { label: "jQuery", value: "jquery" }, { label: "Julia", value: "julia" },
  { label: "Kafka", value: "kafka" }, { label: "Kotlin", value: "kotlin" },
  { label: "Kubernetes", value: "kubernetes" }, { label: "Laravel", value: "laravel" },
  { label: "Linux", value: "linux" }, { label: "Lua", value: "lua" },
  { label: "MariaDB", value: "mariadb" }, { label: "Material UI", value: "material-ui" },
  { label: "MongoDB", value: "mongodb" }, { label: "MySQL", value: "mysql" },
  { label: "NestJS", value: "nestjs" }, { label: "Netlify", value: "netlify" },
  { label: "Next.js", value: "nextjs" }, { label: "Nginx", value: "nginx" },
  { label: "Node.js", value: "nodejs" }, { label: "npm", value: "npm" },
  { label: "Nuxt", value: "nuxt" }, { label: "Oracle", value: "oracle" },
  { label: "PHP", value: "php" }, { label: "Playwright", value: "playwright" },
  { label: "PostgreSQL", value: "postgresql" }, { label: "PostCSS", value: "postcss" },
  { label: "Preact", value: "preact" }, { label: "Prettier", value: "prettier" },
  { label: "Prisma", value: "prisma" }, { label: "Python", value: "python" },
  { label: "RabbitMQ", value: "rabbitmq" }, { label: "React", value: "react" },
  { label: "Redis", value: "redis" }, { label: "Remix", value: "remix" },
  { label: "Rollup", value: "rollup" }, { label: "Ruby", value: "ruby" },
  { label: "Ruby on Rails", value: "ruby-on-rails" }, { label: "Rust", value: "rust" },
  { label: "Sass", value: "sass" }, { label: "Scala", value: "scala" },
  { label: "Selenium", value: "selenium" }, { label: "Slack", value: "slack" },
  { label: "Solid.js", value: "solidjs" }, { label: "Sourcehut", value: "sourcehut" },
  { label: "Spring", value: "spring" }, { label: "SQLite", value: "sqlite" },
  { label: "Strapi", value: "strapi" }, { label: "Supabase", value: "supabase" },
  { label: "Subversion", value: "subversion" }, { label: "Svelte", value: "svelte" },
  { label: "Swift", value: "swift" }, { label: "Symfony", value: "symfony" },
  { label: "Tailwind", value: "tailwind" }, { label: "Terraform", value: "terraform" },
  { label: "TypeScript", value: "typescript" }, { label: "Ubuntu", value: "ubuntu" },
  { label: "Unity", value: "unity" }, { label: "Unreal Engine", value: "unreal-engine" },
  { label: "Vercel", value: "vercel" }, { label: "Vim", value: "vim" },
  { label: "Vite", value: "vite" }, { label: "VS Code", value: "vs-code" },
  { label: "Vue", value: "vue" }, { label: "Vuetify", value: "vuetify" },
  { label: "Webpack", value: "webpack" }, { label: "Windows", value: "windows" },
  { label: "Yarn", value: "yarn" }, { label: "Zoom", value: "zoom" },
]

const TECH_LIST_FOR_PROMPT = KNOWN_TECHNOLOGIES.map(t => `${t.label} → "${t.value}"`).join(', ')

const SYSTEM_PROMPT = `You are a resume parser. Extract structured portfolio data from the provided resume.

STRICT NO-GUESSING POLICY (NON-NEGOTIABLE)
1) Only extract information EXPLICITLY present in the resume.
2) If a field is ambiguous or absent, OMIT it from data and ADD it to missing_fields.
3) NEVER infer, assume, or fabricate dates, titles, descriptions, skills, or any other data.
4) Assign a confidence score (0.0–1.0) for each extracted top-level field in the confidence object.
5) Avatar/photo data CANNOT be extracted - always add "avatarData" to missing_fields.

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

SKILL TECHNOLOGY MATCHING
For each skill, check if it matches a known technology from this list:
${TECH_LIST_FOR_PROMPT}
Matching rules:
- Case-insensitive. "python" → "python", "C++" → "cpp", "SQL" → check if it matches MySQL/PostgreSQL/SQLite specifically, else omit technologyValue.
- If a skill clearly matches one entry, set technologyValue to that entry's value string.
- If no match, omit technologyValue entirely (do NOT set it to null or "custom").

SKILL LEVEL MAPPING
Only set a skill level if it is EXPLICITLY stated in the resume for that specific skill.
Map to one of: "Basic", "Decent", "Good", "Proficient", "Expert"
- "beginner", "basic", "Grundkenntnisse" → "Basic"
- "decent", "fair", "some experience" → "Decent"
- "good", "gute Kenntnisse", "intermediate" → "Good"
- "proficient", "advanced", "fortgeschritten" → "Proficient"
- "expert", "master", "Experte", "sehr gut" → "Expert"
If no level is explicitly stated for a skill, omit the level field entirely.

INSTITUTION URL
For each education and experience institution, try to identify the official website URL.
Only include institutionUrl if you are highly confident (well-known universities, major companies).
Use the main landing page (e.g. "https://www.jku.at" for Johannes Kepler Universität).
If unsure, omit institutionUrl entirely.

INTERNSHIP DETECTION
Set experience[].internship: true only if the role is explicitly described as an internship, "Praktikum", "trainee", or similar.

PROJECT FIELDS
- projects[].name: project name
- projects[].description: project description
- projects[].url: project website/demo URL if present
- projects[].repoUrl: repository URL if present (e.g. GitHub link)
- projects[].repoPlatform: one of "github", "gitlab", "bitbucket", "sourcehut", "forgejo", "gitea", "subversion", "mercurial" - inferred from repoUrl domain if present
- projects[].openSource: true only if explicitly stated as open source
- projects[].start: { year, month } if present
- projects[].end: { year, month } if present
- projects[].technologies: array of technology names used in the project

FIELD EXTRACTION RULES
- profile.name: the applicant's full name (first + last name)
- profile.subtitle: professional title or headline (e.g., "Senior Frontend Engineer")
- profile.summary: professional summary or objective paragraph
- profile.hobbies: only if explicitly listed as hobbies/interests
- links: extract ALL URLs found in the resume - GitHub profiles, LinkedIn, portfolio/personal websites, social media, etc. Use descriptive names like "GitHub", "LinkedIn", "Portfolio", "Website". If a URL appears anywhere in the resume (header, footer, contact section), include it.
- education[].degree: degree name (e.g., "B.Sc. Computer Science")
- education[].institution: institution name only (e.g., "Johannes Kepler Universität Linz") - do NOT include in text
- education[].institutionUrl: official website URL if well-known (omit if unsure)
- education[].text: any additional details beyond degree and institution (omit if nothing extra)
- education[].start: { year, month } from start date if present (month is 1-12)
- education[].end: { year, month } from end date if present; omit if still ongoing
- education[].active: true if currently ongoing (e.g. "laufend", "present", "current")
- experience[].position: job title only
- experience[].institution: employer/company name only - do NOT include in text
- experience[].institutionUrl: official website URL if well-known (omit if unsure)
- experience[].text: job description, responsibilities, achievements (no dates, no company name)
- experience[].technologies: technologies/tools mentioned in that specific role (as string array of names)
- experience[].start: { year, month } from start date if present
- experience[].end: { year, month } from end date if present; omit if still ongoing
- experience[].active: true if currently ongoing
- experience[].internship: true only if explicitly an internship/Praktikum
- skillCategories: group skills by category if the resume has categories; otherwise use a single "General" category
- certifications: this field captures certifications, awards, hackathon wins, competitions, honors, scholarships, and any other notable accomplishments. Include ALL of these:
  - Professional certifications (e.g. "AWS Solutions Architect")
  - Awards and honors (e.g. "Dean's List", "Employee of the Year")
  - Hackathon wins and competition results (e.g. "1st Place - HackZurich 2023")
  - Scholarships and grants
  - Any other notable achievements that don't fit education or experience
- certifications[].name: the name of the certification, award, or accomplishment
- certifications[].issuer: issuing organization, event name, or awarding body (if mentioned)
- languages: spoken/written languages with CEFR levels

OUTPUT JSON FORMAT (JSON ONLY - no markdown, no code fences)
{
  "data": {
    "profile": { "name": "string", "subtitle": "string", "email": "string", "phone": "string", "address": "string", "summary": "string", "hobbies": ["string"] },
    "links": [{ "name": "string", "url": "string" }],
    "languages": [{ "name": "string", "level": "A1|A2|B1|B2|C1|C2|Native" }],
    "skillCategories": [{ "name": "string", "skills": [{ "name": "string", "technologyValue": "python", "level": "Expert" }] }],
    "education": [{ "degree": "string", "institution": "string", "institutionUrl": "https://...", "text": "string", "start": { "year": 2020, "month": 10 }, "end": { "year": 2023, "month": 6 }, "active": false }],
    "experience": [{ "position": "string", "institution": "string", "institutionUrl": "https://...", "text": "string", "technologies": ["Python", "Docker"], "start": { "year": 2020, "month": 1 }, "end": { "year": 2023, "month": 12 }, "active": false, "internship": false }],
    "projects": [{ "name": "string", "description": "string", "url": "https://...", "repoUrl": "https://github.com/...", "repoPlatform": "github", "openSource": true, "start": { "year": 2022, "month": 3 }, "end": { "year": 2023, "month": 1 }, "technologies": ["React", "TypeScript"] }],
    "certifications": [{ "name": "string", "issuer": "string" }]
  },
  "confidence": { "fieldName": 0.0 },
  "missing_fields": ["string"]
}
All fields in data are optional - only include what is clearly present in the resume.
For dates: only include year/month if explicitly stated. Never guess or infer dates.`

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'Cache-Control': 'no-store',
    'Pragma': 'no-cache',
  })

  // Parse multipart form data
  const formData = await readMultipartFormData(event)
  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No file uploaded' })
  }

  const filePart = formData.find(p => p.name === 'file')
  if (!filePart || !filePart.data) {
    throw createError({ statusCode: 400, statusMessage: 'Missing file field in form data' })
  }

  if (filePart.data.length > MAX_FILE_SIZE) {
    throw createError({ statusCode: 413, statusMessage: 'File too large (max 10 MB)' })
  }

  const filename = filePart.filename ?? 'upload'
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''

  if (!['pdf', 'docx', 'txt'].includes(ext)) {
    throw createError({ statusCode: 400, statusMessage: 'Unsupported file type. Use PDF, DOCX, or TXT.' })
  }

  const openai = getOpenAIClient()
  let messages: any[]

  if (ext === 'pdf') {
    // Send PDF as base64 directly - OpenAI handles text-layer and scanned PDFs natively
    const base64 = filePart.data.toString('base64')
    messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Parse this resume PDF. Extract all structured data.' },
          {
            type: 'file',
            file: {
              filename: filename,
              file_data: `data:application/pdf;base64,${base64}`,
            },
          },
        ],
      },
    ]
  } else {
    // DOCX / TXT: extract text server-side
    let rawText: string
    try {
      rawText = await extractText(filePart.data, ext as 'docx' | 'txt')
    } catch (e: any) {
      throw createError({ statusCode: 422, statusMessage: `Text extraction failed: ${e?.message ?? String(e)}` })
    }
    if (!rawText.trim()) {
      throw createError({ statusCode: 422, statusMessage: 'Could not extract text from file' })
    }
    messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `FILE TYPE: ${ext}\n\nRESUME TEXT:\n${rawText}` },
    ]
  }

  let completion: Awaited<ReturnType<typeof openai.chat.completions.create>>
  try {
    completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      response_format: { type: 'json_object' },
      temperature: 0,
      max_tokens: 4000,
    })
  } catch (e: any) {
    throw createError({ statusCode: 502, statusMessage: `OpenAI error: ${e?.message ?? String(e)}` })
  }

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
    const issues = result.issues.map(i => i.message).join('; ')
    throw createError({ statusCode: 502, statusMessage: `AI response schema mismatch: ${issues}` })
  }

  return result.output
})
