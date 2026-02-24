<script setup lang="ts">
import { v7 } from 'uuid'

/**
 * Import page upload a resume file (PDF, DOCX, TXT) and merge/replace
 * the user's portfolio via AI-assisted parsing.
 *
 * Flow:
 *   1. User uploads a file
 *   2. File is sent to /api/ai/upload-resume (server extracts + parses via OpenAI)
 *   3. Review screen shows extracted data; user picks Replace or Merge
 *   4. Confirm and save to portfolio via usePortfolio().save()
 */

definePageMeta({ middleware: 'auth' })

type ParsedEntry = {
  degree?: string
  position?: string
  institution?: string
  institutionUrl?: string
  text?: string
  technologies?: string[]
  start?: { year?: number; month?: number }
  end?: { year?: number; month?: number }
  active?: boolean
  internship?: boolean
}

type ParsedData = {
  profile?: {
    name?: string
    subtitle?: string
    email?: string
    phone?: string
    address?: string
    summary?: string
    hobbies?: string[]
  }
  links?: Array<{ name: string; url: string }>
  languages?: Array<{ name: string; level?: string }>
  skillCategories?: Array<{ name: string; skills: Array<{ name: string; technologyValue?: string; level?: string }> }>
  education?: Array<ParsedEntry & { degree: string }>
  experience?: Array<ParsedEntry & { position: string }>
  projects?: Array<{
    name: string
    description: string
    url?: string
    repoUrl?: string
    repoPlatform?: string
    openSource?: boolean
    start?: { year?: number; month?: number }
    end?: { year?: number; month?: number }
    technologies?: string[]
  }>
  certifications?: Array<{ name: string; issuer?: string }>
}

// State
const step = ref<'upload' | 'review' | 'done'>('upload')
const uploading = ref(false)
const uploadError = ref<string | null>(null)
const saving = ref(false)
const saveError = ref<string | null>(null)
const importMode = ref<'replace' | 'merge'>('replace')

const parsedData = ref<ParsedData>({})
const confidence = ref<Record<string, number>>({})
const missingFields = ref<string[]>([])

// Editable review fields
const reviewProfile = ref({ name: '', subtitle: '', email: '', phone: '', address: '', summary: '' })
const reviewHobbies = ref<string[]>([])
const reviewLinks = ref<Array<{ name: string; url: string }>>([])
const reviewLanguages = ref<Array<{ name: string; level: string }>>([])
const reviewSkillCategories = ref<Array<{ name: string; skills: Array<{ name: string; technologyValue: string; level: string }> }>>([])
const reviewEducation = ref<Array<{
  degree: string
  institution: string
  institutionUrl: string
  text: string
  startYear: string
  startMonth: string
  endYear: string
  endMonth: string
  active: boolean
}>>([])
const reviewExperience = ref<Array<{
  position: string
  institution: string
  institutionUrl: string
  text: string
  technologies: string
  startYear: string
  startMonth: string
  endYear: string
  endMonth: string
  active: boolean
  internship: boolean
}>>([])
const reviewProjects = ref<Array<{
  name: string
  description: string
  url: string
  repoUrl: string
  repoPlatform: string
  openSource: boolean
  startYear: string
  startMonth: string
  endYear: string
  endMonth: string
  technologies: string
}>>([])
const reviewCertifications = ref<Array<{ name: string; issuer: string }>>([])

// Known technologies for client-side matching
const KNOWN_TECHNOLOGIES = [
  { label: 'Alpine Linux', value: 'alpine-linux' }, { label: 'Alpine.js', value: 'alpinejs' },
  { label: 'Android', value: 'android' }, { label: 'Angular', value: 'angular' },
  { label: 'Ansible', value: 'ansible' }, { label: 'Apache', value: 'apache' },
  { label: 'Astro', value: 'astro' }, { label: 'AWS', value: 'aws' },
  { label: 'Azure', value: 'azure' }, { label: 'Babel', value: 'babel' },
  { label: 'Bash', value: 'bash' }, { label: 'Bitbucket', value: 'bitbucket' },
  { label: 'Bootstrap', value: 'bootstrap' }, { label: 'Bun', value: 'bun' },
  { label: 'C', value: 'c' }, { label: 'C#', value: 'csharp' },
  { label: 'C++', value: 'cpp' }, { label: 'Cassandra', value: 'cassandra' },
  { label: 'CircleCI', value: 'circleci' }, { label: 'ClickHouse', value: 'clickhouse' },
  { label: 'Cloudflare', value: 'cloudflare' }, { label: 'Confluence', value: 'confluence' },
  { label: 'CSS', value: 'css' }, { label: 'Cypress', value: 'cypress' },
  { label: 'D3.js', value: 'd3' }, { label: 'Debian', value: 'debian' },
  { label: 'Deno', value: 'deno' }, { label: 'Discord', value: 'discord' },
  { label: 'Discord.js', value: 'discordjs' }, { label: 'Django', value: 'django' },
  { label: 'Docker', value: 'docker' }, { label: 'Elastic', value: 'elastic' },
  { label: 'Electron', value: 'electron' }, { label: 'Elixir', value: 'elixir' },
  { label: 'ESLint', value: 'eslint' }, { label: 'Express', value: 'express' },
  { label: 'FastAPI', value: 'fastapi' }, { label: 'Firebase', value: 'firebase' },
  { label: 'Flask', value: 'flask' }, { label: 'Flutter', value: 'flutter' },
  { label: 'Forgejo', value: 'forgejo' }, { label: 'Git', value: 'git' },
  { label: 'Gitea', value: 'gitea' }, { label: 'GitHub', value: 'github' },
  { label: 'GitHub Actions', value: 'github-actions' }, { label: 'GitLab', value: 'gitlab' },
  { label: 'Go', value: 'go' }, { label: 'Gradle', value: 'gradle' },
  { label: 'Grafana', value: 'grafana' }, { label: 'GraphQL', value: 'graphql' },
  { label: 'Hadoop', value: 'hadoop' }, { label: 'Haskell', value: 'haskell' },
  { label: 'Heroku', value: 'heroku' }, { label: 'HTML', value: 'html' },
  { label: 'IntelliJ IDEA', value: 'intellij' }, { label: 'iOS', value: 'ios' },
  { label: 'Java', value: 'java' }, { label: 'JavaScript', value: 'javascript' },
  { label: 'Jenkins', value: 'jenkins' }, { label: 'Jest', value: 'jest' },
  { label: 'Jira', value: 'jira' }, { label: 'jQuery', value: 'jquery' },
  { label: 'Julia', value: 'julia' }, { label: 'Kafka', value: 'kafka' },
  { label: 'Kotlin', value: 'kotlin' }, { label: 'Kubernetes', value: 'kubernetes' },
  { label: 'Laravel', value: 'laravel' }, { label: 'Linux', value: 'linux' },
  { label: 'Lua', value: 'lua' }, { label: 'MariaDB', value: 'mariadb' },
  { label: 'Material UI', value: 'material-ui' }, { label: 'MongoDB', value: 'mongodb' },
  { label: 'MySQL', value: 'mysql' }, { label: 'NestJS', value: 'nestjs' },
  { label: 'Netlify', value: 'netlify' }, { label: 'Next.js', value: 'nextjs' },
  { label: 'Nginx', value: 'nginx' }, { label: 'Node.js', value: 'nodejs' },
  { label: 'npm', value: 'npm' }, { label: 'Nuxt', value: 'nuxt' },
  { label: 'Oracle', value: 'oracle' }, { label: 'PHP', value: 'php' },
  { label: 'Playwright', value: 'playwright' }, { label: 'pnpm', value: 'pnpm' },
  { label: 'PostgreSQL', value: 'postgresql' }, { label: 'PostCSS', value: 'postcss' },
  { label: 'Preact', value: 'preact' }, { label: 'Prettier', value: 'prettier' },
  { label: 'Prisma', value: 'prisma' }, { label: 'Python', value: 'python' },
  { label: 'RabbitMQ', value: 'rabbitmq' }, { label: 'React', value: 'react' },
  { label: 'Redis', value: 'redis' }, { label: 'Remix', value: 'remix' },
  { label: 'Rollup', value: 'rollup' }, { label: 'Ruby', value: 'ruby' },
  { label: 'Ruby on Rails', value: 'ruby-on-rails' }, { label: 'Rust', value: 'rust' },
  { label: 'Sass', value: 'sass' }, { label: 'Scala', value: 'scala' },
  { label: 'Selenium', value: 'selenium' }, { label: 'Slack', value: 'slack' },
  { label: 'Solid.js', value: 'solidjs' }, { label: 'Sourcehut', value: 'sourcehut' },
  { label: 'Spring', value: 'spring' }, { label: 'SQLite', value: 'sqlite' },
  { label: 'Strapi', value: 'strapi' }, { label: 'Supabase', value: 'supabase' },
  { label: 'Subversion', value: 'subversion' }, { label: 'Svelte', value: 'svelte' },
  { label: 'Swift', value: 'swift' }, { label: 'Symfony', value: 'symfony' },
  { label: 'Tailwind', value: 'tailwind' }, { label: 'Terraform', value: 'terraform' },
  { label: 'TypeScript', value: 'typescript' }, { label: 'Ubuntu', value: 'ubuntu' },
  { label: 'Unity', value: 'unity' }, { label: 'Unreal Engine', value: 'unreal-engine' },
  { label: 'Vercel', value: 'vercel' }, { label: 'Vim', value: 'vim' },
  { label: 'Vite', value: 'vite' }, { label: 'VS Code', value: 'vs-code' },
  { label: 'Vue', value: 'vue' }, { label: 'Vuetify', value: 'vuetify' },
  { label: 'Webpack', value: 'webpack' }, { label: 'Windows', value: 'windows' },
  { label: 'Yarn', value: 'yarn' }, { label: 'Zoom', value: 'zoom' },
]

// Build a lookup map: lowercase label/value → value
const techLookup = new Map<string, string>()
for (const t of KNOWN_TECHNOLOGIES) {
  techLookup.set(t.label.toLowerCase(), t.value)
  techLookup.set(t.value.toLowerCase(), t.value)
}
// Common aliases
techLookup.set('c++', 'cpp')
techLookup.set('c#', 'csharp')
techLookup.set('node', 'nodejs')
techLookup.set('node.js', 'nodejs')
techLookup.set('react.js', 'react')
techLookup.set('reactjs', 'react')
techLookup.set('vue.js', 'vue')
techLookup.set('vuejs', 'vue')
techLookup.set('next', 'nextjs')
techLookup.set('next.js', 'nextjs')
techLookup.set('nuxt.js', 'nuxt')
techLookup.set('nuxtjs', 'nuxt')
techLookup.set('tailwindcss', 'tailwind')
techLookup.set('tailwind css', 'tailwind')
techLookup.set('postgres', 'postgresql')
techLookup.set('ts', 'typescript')
techLookup.set('js', 'javascript')
techLookup.set('k8s', 'kubernetes')
techLookup.set('gh actions', 'github-actions')
techLookup.set('rails', 'ruby-on-rails')
techLookup.set('ror', 'ruby-on-rails')
techLookup.set('alpine', 'alpinejs')
techLookup.set('d3', 'd3')
techLookup.set('aws', 'aws')

function matchTechnology(skillName: string): string {
  const lower = skillName.trim().toLowerCase()
  return techLookup.get(lower) ?? 'custom'
}

// Items for the technology type USelect (with 'custom' sentinel instead of empty string)
const techTypeItems = [
  { label: 'Custom', value: 'custom' },
  ...KNOWN_TECHNOLOGIES.map(t => ({ label: t.label, value: t.value })),
]

// File upload
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  selectedFile.value = input.files?.[0] ?? null
  uploadError.value = null
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  const file = e.dataTransfer?.files?.[0]
  if (file) {
    selectedFile.value = file
    uploadError.value = null
  }
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
}

async function uploadAndParse() {
  if (!selectedFile.value) return
  uploading.value = true
  uploadError.value = null

  try {
    const form = new FormData()
    form.append('file', selectedFile.value, selectedFile.value.name)

    const res = await $fetch<{ data: ParsedData; confidence: Record<string, number>; missing_fields: string[] }>(
      '/api/ai/upload-resume',
      { method: 'POST', body: form }
    )

    parsedData.value = res.data
    confidence.value = res.confidence
    missingFields.value = res.missing_fields

    // Populate editable review fields
    reviewProfile.value = {
      name: res.data.profile?.name ?? '',
      subtitle: res.data.profile?.subtitle ?? '',
      email: res.data.profile?.email ?? '',
      phone: res.data.profile?.phone ?? '',
      address: res.data.profile?.address ?? '',
      summary: res.data.profile?.summary ?? '',
    }
    reviewHobbies.value = res.data.profile?.hobbies ?? []
    reviewLinks.value = (res.data.links ?? []).map(l => ({ ...l }))
    reviewLanguages.value = (res.data.languages ?? []).map(l => ({ name: l.name, level: l.level ?? '' }))
    reviewSkillCategories.value = (res.data.skillCategories ?? []).map(c => ({
      name: c.name,
      skills: c.skills.map(s => {
        // Client-side technology matching - AI response may or may not have technologyValue
        const matched = s.technologyValue ? s.technologyValue : matchTechnology(s.name)
        return {
          name: s.name,
          technologyValue: matched,
          level: s.level ?? 'none',
        }
      }),
    }))
    reviewEducation.value = (res.data.education ?? []).map(e => ({
      degree: e.degree,
      institution: e.institution ?? '',
      institutionUrl: e.institutionUrl ?? '',
      text: e.text ?? '',
      startYear: e.start?.year?.toString() ?? '',
      startMonth: e.start?.month?.toString() ?? '',
      endYear: e.end?.year?.toString() ?? '',
      endMonth: e.end?.month?.toString() ?? '',
      active: e.active ?? false,
    }))
    reviewExperience.value = (res.data.experience ?? []).map(e => ({
      position: e.position,
      institution: e.institution ?? '',
      institutionUrl: e.institutionUrl ?? '',
      text: e.text ?? '',
      technologies: (e.technologies ?? []).join(', '),
      startYear: e.start?.year?.toString() ?? '',
      startMonth: e.start?.month?.toString() ?? '',
      endYear: e.end?.year?.toString() ?? '',
      endMonth: e.end?.month?.toString() ?? '',
      active: e.active ?? false,
      internship: e.internship ?? false,
    }))
    reviewProjects.value = (res.data.projects ?? []).map(p => ({
      name: p.name,
      description: p.description,
      url: p.url ?? '',
      repoUrl: p.repoUrl ?? '',
      repoPlatform: p.repoPlatform ?? 'none',
      openSource: p.openSource ?? false,
      startYear: p.start?.year?.toString() ?? '',
      startMonth: p.start?.month?.toString() ?? '',
      endYear: p.end?.year?.toString() ?? '',
      endMonth: p.end?.month?.toString() ?? '',
      technologies: (p.technologies ?? []).join(', '),
    }))
    reviewCertifications.value = (res.data.certifications ?? []).map(c => ({
      name: c.name,
      issuer: c.issuer ?? '',
    }))

    step.value = 'review'
  } catch (e: any) {
    uploadError.value = e?.data?.statusMessage ?? e?.data?.message ?? e?.message ?? 'Failed to parse file'
  } finally {
    uploading.value = false
  }
}

// Helpers
function parseDate(year: string, month: string): EmploymentDate | undefined {
  const y = parseInt(year)
  const m = parseInt(month)
  if (!y) return undefined
  // DatePicker requires year+month+day to display; default day to 1 when only year/month are known
  return { year: y, month: m || 1, day: 1 }
}

function buildInstitutions(
  entries: Array<{ institution: string; institutionUrl?: string }>,
  existing: Institution[]
): { institutions: Institution[]; uuidMap: Map<string, string> } {
  const uuidMap = new Map<string, string>()
  const institutions: Institution[] = [...existing]

  for (const entry of entries) {
    const name = entry.institution.trim()
    if (!name) continue
    const found = institutions.find(i => i.name.toLowerCase() === name.toLowerCase())
    if (found) {
      // Update URL if we now have one and didn't before
      if (entry.institutionUrl && !found.url) found.url = entry.institutionUrl
      uuidMap.set(name, found.uuid ?? '')
    } else {
      const newUuid = v7()
      institutions.push({ uuid: newUuid, name, url: entry.institutionUrl || undefined })
      uuidMap.set(name, newUuid)
    }
  }

  return { institutions, uuidMap }
}

// Confirm import
const { portfolio, load, save } = usePortfolio()
const { isReady: keyReady } = useEncryption()

async function confirmImport() {
  saving.value = true
  saveError.value = null

  try {
    if (!keyReady.value) {
      await new Promise<void>((resolve) => {
        const stop = watch(keyReady, (r) => { if (r) { stop(); resolve() } }, { immediate: true })
        setTimeout(() => { stop(); resolve() }, 8000)
      })
    }
    await load()

    const base = importMode.value === 'replace'
      ? emptyPortfolio()
      : (portfolio.value ?? emptyPortfolio())

    // Build institution lists with deduplication
    const { institutions: eduInstitutions, uuidMap: eduUuidMap } = buildInstitutions(
      reviewEducation.value.filter(e => e.institution).map(e => ({ institution: e.institution, institutionUrl: e.institutionUrl })),
      importMode.value === 'replace' ? [] : (base.educationInstitutions ?? [])
    )
    const { institutions: expInstitutions, uuidMap: expUuidMap } = buildInstitutions(
      reviewExperience.value.filter(e => e.institution).map(e => ({ institution: e.institution, institutionUrl: e.institutionUrl })),
      importMode.value === 'replace' ? [] : (base.experienceInstitutions ?? [])
    )

    // Ensure at least one empty institution entry
    if (eduInstitutions.length === 0) eduInstitutions.push({ uuid: v7(), name: '' })
    if (expInstitutions.length === 0) expInstitutions.push({ uuid: v7(), name: '' })

    const merged: PortfolioData = {
      ...base,
      profile: {
        ...base.profile,
        name: reviewProfile.value.name || base.profile.name,
        subtitle: reviewProfile.value.subtitle || base.profile.subtitle,
        email: reviewProfile.value.email || base.profile.email,
        phone: reviewProfile.value.phone || base.profile.phone,
        address: reviewProfile.value.address || base.profile.address,
        summary: reviewProfile.value.summary || base.profile.summary,
        hobbies: reviewHobbies.value.length ? reviewHobbies.value : base.profile.hobbies,
      },
      links: reviewLinks.value.length
        ? reviewLinks.value.filter(l => l.name || l.url)
        : base.links,
      languages: reviewLanguages.value.length
        ? reviewLanguages.value
            .filter(l => l.name)
            .map(l => ({ name: l.name, level: (l.level as Language['level']) || undefined }))
        : base.languages,
      skillCategories: reviewSkillCategories.value.length
        ? reviewSkillCategories.value
            .filter(c => c.name)
            .map(c => ({
              name: c.name,
              skills: c.skills
                .filter(s => s.name)
                .map(s => {
                  const techVal = s.technologyValue && s.technologyValue !== 'custom' ? s.technologyValue : ''
                  const tech = techVal
                    ? { label: s.name, value: techVal, icon: `i-simple-icons-${techVal}` }
                    : { label: 'Custom', value: 'custom', icon: 'i-lucide-shapes' }
                  return {
                    name: s.name,
                    technology: tech,
                    displayType: { label: 'Text', value: 'text', icon: 'i-lucide-letter-text' },
                    level: (s.level && s.level !== 'none' ? s.level as Skill['level'] : undefined),
                  }
                }),
            }))
        : base.skillCategories,
      education: reviewEducation.value
        .filter(e => e.degree || e.text)
        .map(e => {
          const instName = e.institution.trim()
          const instUuid = instName ? eduUuidMap.get(instName) : undefined
          return {
            degree: e.degree,
            text: e.text,
            // Form components expect institution as a UUID string (USelect value), not an object
            institution: instUuid || undefined,
            start: parseDate(e.startYear, e.startMonth),
            end: e.active ? undefined : parseDate(e.endYear, e.endMonth),
            active: e.active || undefined,
            technologies: [],
            collapsibleOpen: true,
          } as Education
        }),
      experience: reviewExperience.value
        .filter(e => e.position || e.text)
        .map(e => {
          const instName = e.institution.trim()
          const instUuid = instName ? expUuidMap.get(instName) : undefined
          return {
            position: e.position,
            text: e.text,
            // Form components expect institution as a UUID string (USelect value), not an object
            institution: instUuid || undefined,
            start: parseDate(e.startYear, e.startMonth),
            end: e.active ? undefined : parseDate(e.endYear, e.endMonth),
            active: e.active || undefined,
            internship: e.internship || undefined,
            technologies: e.technologies
              .split(',')
              .map(t => t.trim())
              .filter(Boolean)
              .map(t => ({ label: t, value: t.toLowerCase().replace(/\s+/g, '-'), icon: 'i-lucide-code', url: '' })),
            collapsibleOpen: true,
          } as Experience
        }),
      projects: reviewProjects.value.length
        ? reviewProjects.value
            .filter(p => p.name || p.description)
            .map(p => ({
              name: p.name,
              description: p.description,
              url: p.url || undefined,
              repoLink: p.repoUrl
                ? {
                    name: (p.repoPlatform && p.repoPlatform !== 'none') ? p.repoPlatform : '',
                    url: p.repoUrl,
                    icon: (p.repoPlatform && p.repoPlatform !== 'none')
                      ? { label: p.repoPlatform, value: p.repoPlatform, icon: `i-simple-icons-${p.repoPlatform}` }
                      : undefined,
                  }
                : { name: '', url: '' },
              openSource: p.openSource || undefined,
              start: parseDate(p.startYear, p.startMonth),
              end: parseDate(p.endYear, p.endMonth),
              technologies: p.technologies
                .split(',')
                .map(t => t.trim())
                .filter(Boolean)
                .map(t => ({ label: t, value: t.toLowerCase().replace(/\s+/g, '-'), icon: 'i-lucide-code', url: '' })),
              collapsibleOpen: true,
            }))
        : base.projects,
      certifications: reviewCertifications.value.length
        ? reviewCertifications.value
            .filter(c => c.name)
            .map(c => ({ name: c.name, issuer: c.issuer || undefined }))
        : base.certifications,
      educationInstitutions: eduInstitutions,
      experienceInstitutions: expInstitutions,
    }

    await save(merged)
    // Update in-memory portfolio so next load() sees fresh data
    portfolio.value = merged
    step.value = 'done'
  } catch (e: any) {
    saveError.value = e?.message ?? 'Failed to save portfolio'
  } finally {
    saving.value = false
  }
}

function emptyPortfolio(): PortfolioData {
  return {
    profile: { name: '', subtitle: '', email: '', phone: '', address: '', summary: '', hobbies: [] },
    links: [],
    languages: [],
    skillCategories: [],
    education: [],
    experience: [],
    projects: [],
    certifications: [],
    educationInstitutions: [],
    experienceInstitutions: [],
    jobField: 'Other',
  }
}

// Confidence helpers
function confidenceColor(field: string): 'success' | 'warning' | 'error' | 'neutral' {
  const c = confidence.value[field]
  if (c === undefined) return 'neutral'
  if (c >= 0.8) return 'success'
  if (c >= 0.5) return 'warning'
  return 'error'
}

function confidenceLabel(field: string): string {
  const c = confidence.value[field]
  if (c === undefined) return ''
  return `${Math.round(c * 100)}% confidence`
}

const hasAnyData = computed(() =>
  reviewProfile.value.name ||
  reviewProfile.value.subtitle ||
  reviewProfile.value.email ||
  reviewEducation.value.length > 0 ||
  reviewExperience.value.length > 0 ||
  reviewSkillCategories.value.length > 0
)

// SessionStorage persistence for review data
const STORAGE_KEY = 'import-review-state'

function saveReviewToSession() {
  if (step.value !== 'review') return
  try {
    const state = {
      step: step.value,
      importMode: importMode.value,
      confidence: confidence.value,
      missingFields: missingFields.value,
      reviewProfile: reviewProfile.value,
      reviewHobbies: reviewHobbies.value,
      reviewLinks: reviewLinks.value,
      reviewLanguages: reviewLanguages.value,
      reviewSkillCategories: reviewSkillCategories.value,
      reviewEducation: reviewEducation.value,
      reviewExperience: reviewExperience.value,
      reviewProjects: reviewProjects.value,
      reviewCertifications: reviewCertifications.value,
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch { /* quota exceeded or SSR - ignore */ }
}

function restoreReviewFromSession() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const state = JSON.parse(raw)
    if (state.step !== 'review') return
    step.value = 'review'
    importMode.value = state.importMode ?? 'replace'
    confidence.value = state.confidence ?? {}
    missingFields.value = state.missingFields ?? []
    reviewProfile.value = state.reviewProfile ?? reviewProfile.value
    reviewHobbies.value = state.reviewHobbies ?? []
    reviewLinks.value = state.reviewLinks ?? []
    reviewLanguages.value = state.reviewLanguages ?? []
    reviewSkillCategories.value = state.reviewSkillCategories ?? []
    reviewEducation.value = state.reviewEducation ?? []
    reviewExperience.value = state.reviewExperience ?? []
    reviewProjects.value = state.reviewProjects ?? []
    reviewCertifications.value = state.reviewCertifications ?? []
  } catch { /* parse error or SSR - ignore */ }
}

// Persist on changes (debounced via deep watch)
watch(
  [step, importMode, reviewProfile, reviewHobbies, reviewLinks, reviewLanguages,
   reviewSkillCategories, reviewEducation, reviewExperience, reviewProjects, reviewCertifications],
  saveReviewToSession,
  { deep: true }
)

// Restore on mount
onMounted(() => {
  restoreReviewFromSession()
})

// Clear on successful save
watch(step, (val) => {
  if (val === 'done') {
    try { sessionStorage.removeItem(STORAGE_KEY) } catch {}
  }
})
</script>

<template>
  <div class="flex flex-col mx-auto w-[clamp(24rem,65vw,56rem)] pt-6 pb-16 gap-6">

    <!-- Header -->
    <div class="flex items-center gap-3">
      <UButton
        icon="i-lucide-arrow-left"
        variant="ghost"
        color="neutral"
        to="/portfolio"
        class="cursor-pointer"
      />
      <div>
        <h1 class="text-xl font-semibold">Import Resume</h1>
        <p class="text-sm text-(--ui-text-muted)">Upload a PDF, DOCX, or TXT file to extract data into your portfolio</p>
      </div>
    </div>

    <!-- Step: Upload -->
    <template v-if="step === 'upload'">
      <UCard>
        <div
          class="flex flex-col items-center justify-center gap-4 py-12 border-2 border-dashed border-(--ui-border) rounded-lg cursor-pointer hover:border-(--ui-primary) transition-colors"
          @drop="onDrop"
          @dragover="onDragOver"
          @click="fileInput?.click()"
        >
          <UIcon name="i-lucide-cloud-upload" class="text-5xl text-(--ui-text-muted)" />
          <div class="text-center">
            <p class="font-medium">Drop your resume here or click to browse</p>
            <p class="text-sm text-(--ui-text-muted) mt-1">Supports PDF, DOCX, and TXT - max 10 MB</p>
          </div>
          <input
            ref="fileInput"
            type="file"
            accept=".pdf,.docx,.txt"
            class="hidden"
            @change="onFileChange"
          />
        </div>

        <div v-if="selectedFile" class="mt-4 flex items-center gap-3 p-3 rounded-lg bg-(--ui-bg-elevated)">
          <UIcon name="i-lucide-file-text" class="text-xl text-(--ui-primary)" />
          <div class="flex-1 min-w-0">
            <p class="font-medium truncate">{{ selectedFile.name }}</p>
            <p class="text-xs text-(--ui-text-muted)">{{ (selectedFile.size / 1024).toFixed(1) }} KB</p>
          </div>
          <UButton
            icon="i-lucide-x"
            variant="ghost"
            color="neutral"
            size="sm"
            class="cursor-pointer"
            @click.stop="selectedFile = null"
          />
        </div>

        <UAlert
          v-if="uploadError"
          color="error"
          :description="uploadError"
          icon="i-lucide-alert-circle"
          class="mt-4"
        />

        <div class="mt-4 flex justify-end">
          <UButton
            label="Parse Resume"
            icon="i-ri-ai-generate"
            color="primary"
            :loading="uploading"
            :disabled="!selectedFile || uploading"
            class="cursor-pointer"
            @click="uploadAndParse"
          />
        </div>
      </UCard>


    </template>

    <!-- Step: Review -->
    <template v-else-if="step === 'review'">
      <UAlert
        v-if="!hasAnyData"
        color="warning"
        icon="i-lucide-alert-circle"
        description="The AI could not extract much data from this file. You may want to try a different format or fill in the fields manually."
      />

      <UAlert
        v-if="missingFields.length > 0"
        color="neutral"
        icon="i-lucide-help-circle"
        :description="`Could not extract: ${missingFields.filter(f => f !== 'avatarData').join(', ')}. You can fill these in manually on the Portfolio page.`"
      />

      <!-- Import mode -->
      <UCard>
        <template #header>
          <span class="font-semibold">Import Mode</span>
        </template>
        <div class="flex flex-col gap-3">
          <label class="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-(--ui-border) hover:bg-(--ui-bg-elevated) transition-colors" :class="importMode === 'replace' ? 'border-(--ui-primary) bg-(--ui-primary)/5' : ''">
            <input type="radio" v-model="importMode" value="replace" class="mt-0.5" />
            <div>
              <p class="font-medium">Replace portfolio</p>
              <p class="text-sm text-(--ui-text-muted)">Discard existing data and use only what was extracted from this file</p>
            </div>
          </label>
          <label class="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-(--ui-border) hover:bg-(--ui-bg-elevated) transition-colors" :class="importMode === 'merge' ? 'border-(--ui-primary) bg-(--ui-primary)/5' : ''">
            <input type="radio" v-model="importMode" value="merge" class="mt-0.5" />
            <div>
              <p class="font-medium">Merge into existing</p>
              <p class="text-sm text-(--ui-text-muted)">Keep existing portfolio data and fill in any missing fields from this file</p>
            </div>
          </label>
        </div>
      </UCard>

      <!-- Profile -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-semibold">Profile</span>
            <UBadge v-if="confidence['profile']" :color="confidenceColor('profile')" variant="soft" size="sm">
              {{ confidenceLabel('profile') }}
            </UBadge>
          </div>
        </template>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UFormField label="Name">
            <UInput v-model="reviewProfile.name" placeholder="Full name" class="w-full" />
          </UFormField>
          <UFormField label="Professional Title">
            <UInput v-model="reviewProfile.subtitle" placeholder="e.g. Senior Frontend Engineer" class="w-full" />
          </UFormField>
          <UFormField label="Email">
            <UInput v-model="reviewProfile.email" placeholder="email@example.com" class="w-full" />
          </UFormField>
          <UFormField label="Phone">
            <UInput v-model="reviewProfile.phone" placeholder="+1 234 567 890" class="w-full" />
          </UFormField>
          <UFormField label="Address">
            <UInput v-model="reviewProfile.address" placeholder="City, Country" class="w-full" />
          </UFormField>
          <UFormField label="Summary" class="sm:col-span-2">
            <UTextarea v-model="reviewProfile.summary" placeholder="Professional summary..." :rows="3" class="w-full" />
          </UFormField>
        </div>
      </UCard>

      <!-- Skills -->
      <UCard v-if="reviewSkillCategories.length > 0">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-semibold">Skills</span>
            <UBadge v-if="confidence['skillCategories']" :color="confidenceColor('skillCategories')" variant="soft" size="sm">
              {{ confidenceLabel('skillCategories') }}
            </UBadge>
          </div>
        </template>
        <div class="flex flex-col gap-4">
          <div v-for="(cat, ci) in reviewSkillCategories" :key="ci" class="flex flex-col gap-2">
            <UInput v-model="cat.name" placeholder="Category name" class="font-medium" />
            <div v-for="(skill, si) in cat.skills" :key="si" class="grid grid-cols-[1fr_auto_auto] gap-2 items-center pl-2">
              <UInput v-model="skill.name" placeholder="Skill name" />
              <USelect
                v-model="skill.technologyValue"
                :items="techTypeItems"
                placeholder="Type"
                class="w-36"
              />
              <USelect
                v-model="skill.level"
                :items="[{ label: '-', value: 'none' }, { label: 'Basic', value: 'Basic' }, { label: 'Decent', value: 'Decent' }, { label: 'Good', value: 'Good' }, { label: 'Proficient', value: 'Proficient' }, { label: 'Expert', value: 'Expert' }]"
                placeholder="Level"
                class="w-28"
              />
            </div>
          </div>
        </div>
      </UCard>

      <!-- Languages -->
      <UCard v-if="reviewLanguages.length > 0">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-semibold">Languages</span>
            <UBadge v-if="confidence['languages']" :color="confidenceColor('languages')" variant="soft" size="sm">
              {{ confidenceLabel('languages') }}
            </UBadge>
          </div>
        </template>
        <div class="flex flex-col gap-2">
          <div v-for="(lang, i) in reviewLanguages" :key="i" class="flex gap-3 items-center">
            <UInput v-model="lang.name" placeholder="Language" class="flex-1" />
            <UInput v-model="lang.level" placeholder="Level (e.g. C1, Native)" class="w-40" />
          </div>
        </div>
      </UCard>

      <!-- Education -->
      <UCard v-if="reviewEducation.length > 0">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-semibold">Education</span>
            <UBadge v-if="confidence['education']" :color="confidenceColor('education')" variant="soft" size="sm">
              {{ confidenceLabel('education') }}
            </UBadge>
          </div>
        </template>
        <div class="flex flex-col gap-4">
          <div v-for="(edu, i) in reviewEducation" :key="i" class="flex flex-col gap-2 p-3 rounded-lg bg-(--ui-bg-elevated)">
            <UInput v-model="edu.degree" placeholder="Degree / Program" />
            <UInput v-model="edu.institution" placeholder="Institution name" />
            <UInput v-model="edu.institutionUrl" placeholder="Institution website (https://...)" />
            <UTextarea v-model="edu.text" placeholder="Additional details..." :rows="2" />
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <UInput v-model="edu.startYear" placeholder="Start year" />
              <UInput v-model="edu.startMonth" placeholder="Start month" />
              <UInput v-model="edu.endYear" placeholder="End year" :disabled="edu.active" />
              <UInput v-model="edu.endMonth" placeholder="End month" :disabled="edu.active" />
            </div>
            <label class="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" v-model="edu.active" />
              Currently ongoing
            </label>
          </div>
        </div>
      </UCard>

      <!-- Experience -->
      <UCard v-if="reviewExperience.length > 0">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-semibold">Experience</span>
            <UBadge v-if="confidence['experience']" :color="confidenceColor('experience')" variant="soft" size="sm">
              {{ confidenceLabel('experience') }}
            </UBadge>
          </div>
        </template>
        <div class="flex flex-col gap-4">
          <div v-for="(exp, i) in reviewExperience" :key="i" class="flex flex-col gap-2 p-3 rounded-lg bg-(--ui-bg-elevated)">
            <UInput v-model="exp.position" placeholder="Job title" />
            <UInput v-model="exp.institution" placeholder="Employer / Company" />
            <UInput v-model="exp.institutionUrl" placeholder="Company website (https://...)" />
            <UTextarea v-model="exp.text" placeholder="Description, responsibilities..." :rows="3" />
            <UInput v-model="exp.technologies" placeholder="Technologies (comma-separated)" />
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <UInput v-model="exp.startYear" placeholder="Start year" />
              <UInput v-model="exp.startMonth" placeholder="Start month" />
              <UInput v-model="exp.endYear" placeholder="End year" :disabled="exp.active" />
              <UInput v-model="exp.endMonth" placeholder="End month" :disabled="exp.active" />
            </div>
            <div class="flex gap-4">
              <label class="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" v-model="exp.active" />
                Currently ongoing
              </label>
              <label class="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" v-model="exp.internship" />
                Internship
              </label>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Projects -->
      <UCard v-if="reviewProjects.length > 0">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-semibold">Projects</span>
            <UBadge v-if="confidence['projects']" :color="confidenceColor('projects')" variant="soft" size="sm">
              {{ confidenceLabel('projects') }}
            </UBadge>
          </div>
        </template>
        <div class="flex flex-col gap-4">
          <div v-for="(proj, i) in reviewProjects" :key="i" class="flex flex-col gap-2 p-3 rounded-lg bg-(--ui-bg-elevated)">
            <div class="flex gap-3 items-center">
              <UInput v-model="proj.name" placeholder="Project name" class="flex-1" />
              <label class="flex items-center gap-2 text-sm cursor-pointer whitespace-nowrap">
                <input type="checkbox" v-model="proj.openSource" />
                Open Source
              </label>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <UInput v-model="proj.startYear" placeholder="Start year" />
              <UInput v-model="proj.startMonth" placeholder="Start month" />
              <UInput v-model="proj.endYear" placeholder="End year" />
              <UInput v-model="proj.endMonth" placeholder="End month" />
            </div>
            <UInput v-model="proj.url" placeholder="Project website (https://...)" />
            <div class="flex gap-2">
              <USelect
                v-model="proj.repoPlatform"
                :items="[{ label: '- No repo -', value: 'none' }, { label: 'GitHub', value: 'github' }, { label: 'GitLab', value: 'gitlab' }, { label: 'Bitbucket', value: 'bitbucket' }, { label: 'Sourcehut', value: 'sourcehut' }, { label: 'Forgejo', value: 'forgejo' }, { label: 'Gitea', value: 'gitea' }, { label: 'Subversion', value: 'subversion' }, { label: 'Mercurial', value: 'mercurial' }]"
                placeholder="Repository Platform"
                class="w-44 shrink-0"
              />
              <UInput v-model="proj.repoUrl" placeholder="https://github.com/user/repo" class="flex-1" />
            </div>
            <UTextarea v-model="proj.description" placeholder="Project description..." :rows="2" />
            <UInput v-model="proj.technologies" placeholder="Technologies (comma-separated)" />
          </div>
        </div>
      </UCard>

      <!-- Certifications -->
      <UCard v-if="reviewCertifications.length > 0">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-semibold">Certifications</span>
            <UBadge v-if="confidence['certifications']" :color="confidenceColor('certifications')" variant="soft" size="sm">
              {{ confidenceLabel('certifications') }}
            </UBadge>
          </div>
        </template>
        <div class="flex flex-col gap-2">
          <div v-for="(cert, i) in reviewCertifications" :key="i" class="flex gap-3 items-center">
            <UInput v-model="cert.name" placeholder="Certification name" class="flex-1" />
            <UInput v-model="cert.issuer" placeholder="Issuer" class="w-48" />
          </div>
        </div>
      </UCard>

      <!-- Links -->
      <UCard v-if="reviewLinks.length > 0">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-semibold">Links</span>
            <UBadge v-if="confidence['links']" :color="confidenceColor('links')" variant="soft" size="sm">
              {{ confidenceLabel('links') }}
            </UBadge>
          </div>
        </template>
        <div class="flex flex-col gap-2">
          <div v-for="(link, i) in reviewLinks" :key="i" class="flex gap-3 items-center">
            <UInput v-model="link.name" placeholder="Label (e.g. GitHub)" class="w-36 shrink-0" />
            <UInput v-model="link.url" placeholder="https://..." class="flex-1" />
          </div>
        </div>
      </UCard>

      <UAlert v-if="saveError" color="error" :description="saveError" icon="i-lucide-alert-circle" />

      <!-- Actions -->
      <div class="flex justify-between gap-3">
        <UButton
          label="Back"
          icon="i-lucide-arrow-left"
          variant="outline"
          color="neutral"
          class="cursor-pointer"
          @click="step = 'upload'"
        />
        <UButton
          label="Save to Portfolio"
          icon="i-lucide-check"
          color="primary"
          :loading="saving"
          :disabled="saving"
          class="cursor-pointer"
          @click="confirmImport"
        />
      </div>
    </template>

    <!-- Step: Done -->
    <template v-else-if="step === 'done'">
      <UCard class="text-center py-12">
        <div class="flex flex-col items-center gap-4">
          <div class="w-16 h-16 rounded-full bg-(--ui-success)/10 flex items-center justify-center">
            <UIcon name="i-lucide-check" class="text-3xl text-(--ui-success)" />
          </div>
          <div>
            <h2 class="text-lg font-semibold">Portfolio updated</h2>
            <p class="text-sm text-(--ui-text-muted) mt-1">
              {{ importMode === 'replace' ? 'Your portfolio has been replaced with the imported data.' : 'Imported data has been merged into your portfolio.' }}
            </p>
          </div>
          <div class="flex gap-3 mt-2">
            <UButton
              label="View Portfolio"
              icon="i-lucide-user"
              color="primary"
              to="/portfolio"
              class="cursor-pointer"
            />
          </div>
        </div>
      </UCard>
    </template>

  </div>
</template>
