import { encryptString, decryptString } from '../utils/crypto'

/**
 * DB Mapper — bidirectional mapping between TypeScript interfaces and Supabase DB rows.
 *
 * Naming convention:
 *   - DB rows use snake_case with `_encrypted` suffix on sensitive columns
 *   - TypeScript interfaces use camelCase with plaintext values
 *
 * All encrypt/decrypt calls go through the provided CryptoKey.
 * Null/undefined fields are handled gracefully (null in DB → undefined in TS).
 */

// ─── Helpers ───

async function enc(value: string | undefined | null, key: CryptoKey): Promise<string | null> {
  if (value == null || value === '') return null
  return encryptString(value, key)
}

// Like enc() but always returns an encrypted string — encrypts empty string instead of returning null.
// Use for NOT NULL columns in the DB.
async function encReq(value: string | undefined | null, key: CryptoKey): Promise<string> {
  return encryptString(value ?? '', key)
}

async function dec(value: string | undefined | null, key: CryptoKey): Promise<string> {
  if (value == null || value === '') return ''
  return decryptString(value, key)
}

async function decOpt(value: string | undefined | null, key: CryptoKey): Promise<string | undefined> {
  if (value == null || value === '') return undefined
  return decryptString(value, key)
}

async function encNum(value: number | undefined | null, key: CryptoKey): Promise<string | null> {
  if (value == null) return null
  return encryptString(String(value), key)
}

async function decNum(value: string | undefined | null, key: CryptoKey): Promise<number | undefined> {
  if (value == null) return undefined
  const s = await decryptString(value, key)
  const n = Number(s)
  return isNaN(n) ? undefined : n
}

// ─── Resume row types (DB shape) ───

export interface DBResumeRow {
  id?: string
  user_id?: string
  style_id?: string | null
  title: string
  kind?: 'it' | 'other'
  duplicated_from?: string | null
  name_encrypted: string | null
  subtitle_encrypted: string | null
  email_encrypted: string | null
  phone_encrypted: string | null
  address_encrypted: string | null
  summary_encrypted: string | null
  birth_year_encrypted: string | null
  birth_month_encrypted: string | null
  birth_day_encrypted: string | null
  avatar_data_encrypted: string | null
  avatar_filename_encrypted: string | null
  avatar_content_type_encrypted: string | null
  hobbies_encrypted: string | null
  education_institutions_encrypted: string | null
  experience_institutions_encrypted: string | null
  is_public?: boolean
  created_at?: string
  updated_at?: string
}

export interface DBEducationRow {
  id?: string
  resume_id: string
  institution_id?: string | null
  institution_uuid_encrypted?: string | null
  institution_name_encrypted: string | null
  institution_url_encrypted: string | null
  degree_encrypted: string
  description_encrypted: string | null
  start_year_encrypted: string | null
  start_month_encrypted: string | null
  start_day_encrypted: string | null
  end_year_encrypted: string | null
  end_month_encrypted: string | null
  end_day_encrypted: string | null
  is_active: boolean
  sort_order: number
  collapsible_open: boolean
}

export interface DBExperienceRow {
  id?: string
  resume_id: string
  institution_id?: string | null
  institution_uuid_encrypted?: string | null
  institution_name_encrypted: string | null
  institution_url_encrypted: string | null
  position_encrypted: string
  description_encrypted: string | null
  is_internship: boolean
  technologies_encrypted?: string | null
  start_year_encrypted: string | null
  start_month_encrypted: string | null
  start_day_encrypted: string | null
  end_year_encrypted: string | null
  end_month_encrypted: string | null
  end_day_encrypted: string | null
  is_active: boolean
  sort_order: number
  collapsible_open: boolean
}

export interface DBProjectRow {
  id?: string
  resume_id: string
  name_encrypted: string
  description_encrypted: string | null
  url_encrypted: string | null
  repo_link_name_encrypted: string | null
  repo_link_url_encrypted: string | null
  repo_link_icon_label_encrypted: string | null
  repo_link_icon_value_encrypted: string | null
  repo_link_icon_icon: string | null
  is_open_source: boolean
  technologies_encrypted?: string | null
  start_year_encrypted: string | null
  start_month_encrypted: string | null
  start_day_encrypted: string | null
  end_year_encrypted: string | null
  end_month_encrypted: string | null
  end_day_encrypted: string | null
  sort_order: number
  collapsible_open: boolean
}

export interface DBSkillCategoryRow {
  id?: string
  resume_id: string
  name_encrypted: string
  sort_order: number
}

export interface DBSkillRow {
  id?: string
  category_id: string
  name_encrypted: string
  level_encrypted: string | null
  technology_label_encrypted: string | null
  technology_value_encrypted: string | null
  technology_icon: string | null
  display_type_label_encrypted: string | null
  display_type_value_encrypted: string | null
  display_type_icon: string | null
  sort_order: number
}

export interface DBResumeLinkRow {
  id?: string
  resume_id: string
  name_encrypted: string
  url_encrypted: string
  icon_label_encrypted: string | null
  icon_value_encrypted: string | null
  icon_icon: string | null
  sort_order: number
}

export interface DBResumeLanguageRow {
  id?: string
  resume_id: string
  name_encrypted: string
  level_encrypted: string | null
  sort_order: number
}

export interface DBCertificationRow {
  id?: string
  resume_id: string
  name_encrypted: string
  issuer_encrypted: string | null
  description_encrypted: string | null
  url_encrypted: string | null
  date_year_encrypted: string | null
  date_month_encrypted: string | null
  date_day_encrypted: string | null
  is_active: boolean
  sort_order: number
  collapsible_open: boolean
}

export interface DBCoverLetterRow {
  id?: string
  resume_id: string
  recipient_name_encrypted: string | null
  company_name_encrypted: string | null
  position_encrypted: string | null
  content_encrypted: string
}

export interface DBResumeRows {
  resume: DBResumeRow
  education: DBEducationRow[]
  experience: DBExperienceRow[]
  projects: DBProjectRow[]
  skillCategories: DBSkillCategoryRow[]
  skills: DBSkillRow[]
  links: DBResumeLinkRow[]
  languages: DBResumeLanguageRow[]
  certifications: DBCertificationRow[]
  coverLetter: DBCoverLetterRow | null
}

// ─── Resume → DB rows ───

export async function resumeToRows(
  data: ResumeData,
  resumeId: string,
  key: CryptoKey,
  title: string = data.name || 'Untitled Resume'
): Promise<DBResumeRows> {
  const resume: DBResumeRow = {
    id: resumeId,
    title,
    kind: data.jobField === 'IT' ? 'it' : 'other',
    name_encrypted: await encReq(data.name, key),
    subtitle_encrypted: await enc(data.subtitle, key),
    email_encrypted: await enc(data.email, key),
    phone_encrypted: await enc(data.phone, key),
    address_encrypted: await enc(data.address, key),
    summary_encrypted: await enc(data.summary, key),
    birth_year_encrypted: await encNum(data.birthdate?.year, key),
    birth_month_encrypted: await encNum(data.birthdate?.month, key),
    birth_day_encrypted: await encNum(data.birthdate?.day, key),
    avatar_data_encrypted: null, // avatar handled separately (File object)
    avatar_filename_encrypted: null,
    avatar_content_type_encrypted: null,
    hobbies_encrypted: await enc(data.hobbies.filter(Boolean).join('\n'), key),
    education_institutions_encrypted: await enc(JSON.stringify(data.educationInstitutions ?? []), key),
    experience_institutions_encrypted: await enc(JSON.stringify(data.experienceInstitutions ?? []), key),
  }

  const education: DBEducationRow[] = await Promise.all(
    data.education.map(async (e, i) => {
      // e.institution is a UUID string in form state; look up name/url from the institution list
      const instUuid = typeof e.institution === 'string' ? e.institution : (e.institution as any)?.uuid
      const instObj = instUuid ? (data.educationInstitutions ?? []).find(i => i.uuid === instUuid) : undefined
      return {
      resume_id: resumeId,
      institution_id: null,
      institution_uuid_encrypted: await enc(instUuid, key),
      institution_name_encrypted: await enc(instObj?.name ?? (e.institution as any)?.name, key),
      institution_url_encrypted: await enc(instObj?.url ?? (e.institution as any)?.url, key),
      degree_encrypted: await encReq(e.degree, key),
      description_encrypted: await enc(e.text, key),
      start_year_encrypted: await encNum(e.start?.year, key),
      start_month_encrypted: await encNum(e.start?.month, key),
      start_day_encrypted: await encNum(e.start?.day, key),
      end_year_encrypted: await encNum(e.end?.year, key),
      end_month_encrypted: await encNum(e.end?.month, key),
      end_day_encrypted: await encNum(e.end?.day, key),
      is_active: e.active ?? false,
      sort_order: i,
      collapsible_open: e.collapsibleOpen ?? true,
    }})
  )

  const experience: DBExperienceRow[] = await Promise.all(
    data.experience.map(async (e, i) => {
      const instUuid = typeof e.institution === 'string' ? e.institution : (e.institution as any)?.uuid
      const instObj = instUuid ? (data.experienceInstitutions ?? []).find(i => i.uuid === instUuid) : undefined
      return {
      resume_id: resumeId,
      institution_id: null,
      institution_uuid_encrypted: await enc(instUuid, key),
      institution_name_encrypted: await enc(instObj?.name ?? (e.institution as any)?.name, key),
      institution_url_encrypted: await enc(instObj?.url ?? (e.institution as any)?.url, key),
      position_encrypted: await encReq(e.position, key),
      description_encrypted: await enc(e.text, key),
      is_internship: e.internship ?? false,
      technologies_encrypted: await enc(JSON.stringify(e.technologies ?? []), key),
      start_year_encrypted: await encNum(e.start?.year, key),
      start_month_encrypted: await encNum(e.start?.month, key),
      start_day_encrypted: await encNum(e.start?.day, key),
      end_year_encrypted: await encNum(e.end?.year, key),
      end_month_encrypted: await encNum(e.end?.month, key),
      end_day_encrypted: await encNum(e.end?.day, key),
      is_active: e.active ?? false,
      sort_order: i,
      collapsible_open: e.collapsibleOpen ?? true,
    }})
  )

  const projects: DBProjectRow[] = await Promise.all(
    data.projects.map(async (p, i) => ({
      resume_id: resumeId,
      name_encrypted: await encReq(p.name, key),
      description_encrypted: await enc(p.description, key),
      url_encrypted: await enc(p.url, key),
      repo_link_name_encrypted: await enc(p.repoLink?.name, key),
      repo_link_url_encrypted: await enc(p.repoLink?.url, key),
      repo_link_icon_label_encrypted: await enc(p.repoLink?.icon?.label, key),
      repo_link_icon_value_encrypted: await enc(p.repoLink?.icon?.value, key),
      repo_link_icon_icon: p.repoLink?.icon?.icon ?? null,
      is_open_source: p.openSource ?? false,
      technologies_encrypted: await enc(JSON.stringify(p.technologies ?? []), key),
      start_year_encrypted: await encNum(p.start?.year, key),
      start_month_encrypted: await encNum(p.start?.month, key),
      start_day_encrypted: await encNum(p.start?.day, key),
      end_year_encrypted: await encNum(p.end?.year, key),
      end_month_encrypted: await encNum(p.end?.month, key),
      end_day_encrypted: await encNum(p.end?.day, key),
      sort_order: i,
      collapsible_open: p.collapsibleOpen ?? true,
    }))
  )

  // Flatten skill categories + skills
  const skillCategories: DBSkillCategoryRow[] = []
  const skills: DBSkillRow[] = []
  for (let ci = 0; ci < data.skillCategories.length; ci++) {
    const cat = data.skillCategories[ci]!
    const catId = crypto.randomUUID()
    skillCategories.push({
      id: catId,
      resume_id: resumeId,
      name_encrypted: await encReq(cat.name, key),
      sort_order: ci,
    })
    for (let si = 0; si < cat.skills.length; si++) {
      const s = cat.skills[si]!
      skills.push({
        category_id: catId,
        name_encrypted: await encReq(s.name, key),
        level_encrypted: await enc(s.level, key),
        technology_label_encrypted: await enc(s.technology?.label, key),
        technology_value_encrypted: await enc(s.technology?.value, key),
        technology_icon: s.technology?.icon ?? null,
        display_type_label_encrypted: await enc(s.displayType?.label, key),
        display_type_value_encrypted: await enc(s.displayType?.value, key),
        display_type_icon: s.displayType?.icon ?? null,
        sort_order: si,
      })
    }
  }

  const links: DBResumeLinkRow[] = await Promise.all(
    data.links.map(async (l, i) => ({
      resume_id: resumeId,
      name_encrypted: await encReq(l.name, key),
      url_encrypted: await encReq(l.url, key),
      icon_label_encrypted: await enc(l.icon?.label, key),
      icon_value_encrypted: await enc(l.icon?.value, key),
      icon_icon: l.icon?.icon ?? null,
      sort_order: i,
    }))
  )

  const languages: DBResumeLanguageRow[] = await Promise.all(
    data.languages.map(async (l, i) => ({
      resume_id: resumeId,
      name_encrypted: await encReq(l.name, key),
      level_encrypted: await enc(l.level, key),
      sort_order: i,
    }))
  )

  const certifications: DBCertificationRow[] = await Promise.all(
    (data.qualifications ?? []).map(async (q, i) => ({
      resume_id: resumeId,
      name_encrypted: await encReq(q.name, key),
      issuer_encrypted: await enc(q.issuer, key),
      description_encrypted: await enc(q.description, key),
      url_encrypted: null,
      date_year_encrypted: await encNum(q.date?.year, key),
      date_month_encrypted: await encNum(q.date?.month, key),
      date_day_encrypted: await encNum(q.date?.day, key),
      is_active: false,
      sort_order: i,
      collapsible_open: true,
    }))
  )

  let coverLetter: DBCoverLetterRow | null = null
  if (data.coverLetter?.content) {
    coverLetter = {
      resume_id: resumeId,
      recipient_name_encrypted: await enc(data.coverLetter.recipientName, key),
      company_name_encrypted: await enc(data.coverLetter.companyName, key),
      position_encrypted: await enc(data.coverLetter.position, key),
      content_encrypted: await encReq(data.coverLetter.content, key),
    }
  }

  return { resume, education, experience, projects, skillCategories, skills, links, languages, certifications, coverLetter }
}

// ─── DB rows → ResumeData ───

export async function rowsToResume(rows: DBResumeRows, key: CryptoKey): Promise<ResumeData> {
  const r = rows.resume

  const hobbiesRaw = await dec(r.hobbies_encrypted, key)
  const hobbies = hobbiesRaw ? hobbiesRaw.split('\n').filter(Boolean) : ['']

  const education: Education[] = await Promise.all(
    rows.education.map(async (e) => ({
      institution: e.institution_uuid_encrypted ? await decOpt(e.institution_uuid_encrypted, key) : undefined,
      degree: await dec(e.degree_encrypted, key),
      text: await dec(e.description_encrypted, key),
      start: {
        year: await decNum(e.start_year_encrypted, key),
        month: await decNum(e.start_month_encrypted, key),
        day: await decNum(e.start_day_encrypted, key),
      },
      end: {
        year: await decNum(e.end_year_encrypted, key),
        month: await decNum(e.end_month_encrypted, key),
        day: await decNum(e.end_day_encrypted, key),
      },
      active: e.is_active,
      collapsibleOpen: e.collapsible_open,
    }))
  )

  const experience: Experience[] = await Promise.all(
    rows.experience.map(async (e) => ({
      institution: e.institution_uuid_encrypted ? await decOpt(e.institution_uuid_encrypted, key) : undefined,
      position: await dec(e.position_encrypted, key),
      text: await dec(e.description_encrypted, key),
      internship: e.is_internship,
      technologies: await (async () => { try { const raw = e.technologies_encrypted ? await dec(e.technologies_encrypted, key) : '[]'; return JSON.parse(raw) } catch { return [] } })(),
      start: {
        year: await decNum(e.start_year_encrypted, key),
        month: await decNum(e.start_month_encrypted, key),
        day: await decNum(e.start_day_encrypted, key),
      },
      end: {
        year: await decNum(e.end_year_encrypted, key),
        month: await decNum(e.end_month_encrypted, key),
        day: await decNum(e.end_day_encrypted, key),
      },
      active: e.is_active,
      collapsibleOpen: e.collapsible_open,
    }))
  )

  const projects: Project[] = await Promise.all(
    rows.projects.map(async (p) => ({
      name: await dec(p.name_encrypted, key),
      description: await dec(p.description_encrypted, key),
      url: await decOpt(p.url_encrypted, key),
      repoLink: {
        name: await dec(p.repo_link_name_encrypted, key),
        url: await dec(p.repo_link_url_encrypted, key),
        icon: p.repo_link_icon_icon ? {
          label: await dec(p.repo_link_icon_label_encrypted, key),
          value: await dec(p.repo_link_icon_value_encrypted, key),
          icon: p.repo_link_icon_icon,
        } : undefined,
      },
      technologies: await (async () => { try { const raw = p.technologies_encrypted ? await dec(p.technologies_encrypted, key) : '[]'; return JSON.parse(raw) } catch { return [] } })(),
      openSource: p.is_open_source,
      collapsibleOpen: p.collapsible_open,
      start: {
        year: await decNum(p.start_year_encrypted, key),
        month: await decNum(p.start_month_encrypted, key),
        day: await decNum(p.start_day_encrypted, key),
      },
      end: {
        year: await decNum(p.end_year_encrypted, key),
        month: await decNum(p.end_month_encrypted, key),
        day: await decNum(p.end_day_encrypted, key),
      },
    }))
  )

  // Rebuild skill categories with their skills
  const skillCategories: SkillCategory[] = await Promise.all(
    rows.skillCategories.map(async (cat) => {
      const catSkills = rows.skills.filter(s => s.category_id === cat.id)
      return {
        name: await dec(cat.name_encrypted, key),
        skills: await Promise.all(catSkills.map(async (s) => ({
          name: await dec(s.name_encrypted, key),
          level: (await decOpt(s.level_encrypted, key)) as Skill['level'],
          technology: s.technology_icon ? {
            label: await dec(s.technology_label_encrypted, key),
            value: await dec(s.technology_value_encrypted, key),
            icon: s.technology_icon,
          } : undefined,
          displayType: s.display_type_icon ? {
            label: await dec(s.display_type_label_encrypted, key),
            value: await dec(s.display_type_value_encrypted, key),
            icon: s.display_type_icon,
          } : undefined,
        }))),
      }
    })
  )

  const links: Link[] = await Promise.all(
    rows.links.map(async (l) => ({
      name: await dec(l.name_encrypted, key),
      url: await dec(l.url_encrypted, key),
      icon: l.icon_icon ? {
        label: await dec(l.icon_label_encrypted, key),
        value: await dec(l.icon_value_encrypted, key),
        icon: l.icon_icon,
      } : undefined,
    }))
  )

  const languages: Language[] = await Promise.all(
    rows.languages.map(async (l) => ({
      name: await dec(l.name_encrypted, key),
      level: (await decOpt(l.level_encrypted, key)) as Language['level'],
    }))
  )

  const qualifications: Qualification[] = await Promise.all(
    rows.certifications.map(async (c) => ({
      name: await dec(c.name_encrypted, key),
      issuer: await decOpt(c.issuer_encrypted, key),
      description: await decOpt(c.description_encrypted, key),
      date: {
        year: await decNum(c.date_year_encrypted, key),
        month: await decNum(c.date_month_encrypted, key),
        day: await decNum(c.date_day_encrypted, key),
      },
    }))
  )

  let coverLetter: CoverLetter | undefined
  if (rows.coverLetter) {
    coverLetter = {
      content: await dec(rows.coverLetter.content_encrypted, key),
      recipientName: await decOpt(rows.coverLetter.recipient_name_encrypted, key),
      companyName: await decOpt(rows.coverLetter.company_name_encrypted, key),
      position: await decOpt(rows.coverLetter.position_encrypted, key),
    }
  }

  // Birthdate: return undefined if all fields are undefined (avoids DatePicker crash)
  const bdYear = await decNum(r.birth_year_encrypted, key)
  const bdMonth = await decNum(r.birth_month_encrypted, key)
  const bdDay = await decNum(r.birth_day_encrypted, key)
  const birthdate = (bdYear == null && bdMonth == null && bdDay == null)
    ? undefined
    : { year: bdYear, month: bdMonth, day: bdDay }

  // Decrypt institution lists from resume row
  let educationInstitutions: Institution[] = []
  let experienceInstitutions: Institution[] = []
  try {
    const eduInstRaw = await decOpt(r.education_institutions_encrypted, key)
    if (eduInstRaw) educationInstitutions = JSON.parse(eduInstRaw)
  } catch {}
  try {
    const expInstRaw = await decOpt(r.experience_institutions_encrypted, key)
    if (expInstRaw) experienceInstitutions = JSON.parse(expInstRaw)
  } catch {}

  return {
    name: await dec(r.name_encrypted, key),
    subtitle: await dec(r.subtitle_encrypted, key),
    email: await dec(r.email_encrypted, key),
    phone: await dec(r.phone_encrypted, key),
    address: await dec(r.address_encrypted, key),
    summary: await dec(r.summary_encrypted, key),
    birthdate,
    hobbies,
    languages: languages.length ? languages : [{ name: '' }],
    skillCategories: skillCategories.length ? skillCategories : [{
      name: '',
      skills: [{ name: '', technology: { label: 'Custom', value: 'custom', icon: 'i-lucide-shapes' } }]
    }],
    links: links.length ? links : [{ name: '', url: '' }],
    educationInstitutions,
    experienceInstitutions,
    education: education.length ? education : [{ degree: '', text: '', collapsibleOpen: true }],
    experience: experience.length ? experience : [{ position: '', text: '', collapsibleOpen: true, technologies: [] }],
    projects: projects.length ? projects : [{ name: '', description: '', url: '', repoLink: { name: '', url: '' }, technologies: [] }],
    jobField: r.kind === 'other' ? 'Other' : 'IT',
    qualifications,
    coverLetter,
    avatarData: await decOpt(r.avatar_data_encrypted, key),
    avatarContentType: await decOpt(r.avatar_content_type_encrypted, key),
  }
}

// ─── Portfolio row types (DB shape) ───

export interface DBApplicantProfileRow {
  user_id: string
  job_field: string | null
  name_encrypted: string | null
  subtitle_encrypted: string | null
  email_encrypted: string | null
  phone_encrypted: string | null
  address_encrypted: string | null
  summary_encrypted: string | null
  birth_year_encrypted: string | null
  birth_month_encrypted: string | null
  birth_day_encrypted: string | null
  avatar_data_encrypted: string | null
  avatar_filename_encrypted: string | null
  avatar_content_type_encrypted: string | null
  hobbies_encrypted: string | null
  education_institutions_encrypted: string | null
  experience_institutions_encrypted: string | null
}

export interface DBApplicantLinkRow {
  id?: string
  user_id: string
  name_encrypted: string
  url_encrypted: string
  icon_label_encrypted: string | null
  icon_value_encrypted: string | null
  icon_icon: string | null
  sort_order: number
}

export interface DBApplicantLanguageRow {
  id?: string
  user_id: string
  name_encrypted: string
  level_encrypted: string | null
  sort_order: number
}

export interface DBApplicantSkillCategoryRow {
  id?: string
  user_id: string
  name_encrypted: string
  sort_order: number
}

export interface DBApplicantSkillRow {
  id?: string
  category_id: string
  name_encrypted: string
  level_encrypted: string | null
  technology_label_encrypted: string | null
  technology_value_encrypted: string | null
  technology_icon: string | null
  display_type_label_encrypted: string | null
  display_type_value_encrypted: string | null
  display_type_icon: string | null
  sort_order: number
}

export interface DBApplicantEducationRow {
  id?: string
  user_id: string
  institution_id?: string | null
  institution_uuid_encrypted?: string | null
  institution_name_encrypted: string | null
  institution_url_encrypted: string | null
  degree_encrypted: string
  description_encrypted: string | null
  start_year_encrypted: string | null
  start_month_encrypted: string | null
  start_day_encrypted: string | null
  end_year_encrypted: string | null
  end_month_encrypted: string | null
  end_day_encrypted: string | null
  is_active: boolean
  sort_order: number
  collapsible_open: boolean
}

export interface DBApplicantExperienceRow {
  id?: string
  user_id: string
  institution_id?: string | null
  institution_uuid_encrypted?: string | null
  institution_name_encrypted: string | null
  institution_url_encrypted: string | null
  position_encrypted: string
  description_encrypted: string | null
  is_internship: boolean
  technologies_encrypted?: string | null
  start_year_encrypted: string | null
  start_month_encrypted: string | null
  start_day_encrypted: string | null
  end_year_encrypted: string | null
  end_month_encrypted: string | null
  end_day_encrypted: string | null
  is_active: boolean
  sort_order: number
  collapsible_open: boolean
}

export interface DBApplicantProjectRow {
  id?: string
  user_id: string
  name_encrypted: string
  description_encrypted: string | null
  url_encrypted: string | null
  repo_link_name_encrypted: string | null
  repo_link_url_encrypted: string | null
  repo_link_icon_label_encrypted: string | null
  repo_link_icon_value_encrypted: string | null
  repo_link_icon_icon: string | null
  is_open_source: boolean
  technologies_encrypted?: string | null
  start_year_encrypted: string | null
  start_month_encrypted: string | null
  start_day_encrypted: string | null
  end_year_encrypted: string | null
  end_month_encrypted: string | null
  end_day_encrypted: string | null
  sort_order: number
  collapsible_open: boolean
}

export interface DBApplicantCertificationRow {
  id?: string
  user_id: string
  name_encrypted: string
  issuer_encrypted: string | null
  description_encrypted: string | null
  url_encrypted: string | null
  date_year_encrypted: string | null
  date_month_encrypted: string | null
  date_day_encrypted: string | null
  is_active: boolean
  sort_order: number
  collapsible_open: boolean
}

export interface DBPortfolioRows {
  profile: DBApplicantProfileRow
  links: DBApplicantLinkRow[]
  languages: DBApplicantLanguageRow[]
  skillCategories: DBApplicantSkillCategoryRow[]
  skills: DBApplicantSkillRow[]
  education: DBApplicantEducationRow[]
  experience: DBApplicantExperienceRow[]
  projects: DBApplicantProjectRow[]
  certifications: DBApplicantCertificationRow[]
}

// ─── PortfolioData → DB rows ───

export async function portfolioToRows(
  data: PortfolioData,
  userId: string,
  key: CryptoKey
): Promise<DBPortfolioRows> {
  const profile: DBApplicantProfileRow = {
    user_id: userId,
    job_field: data.jobField ?? 'other',
    name_encrypted: await enc(data.profile.name, key),
    subtitle_encrypted: await enc(data.profile.subtitle, key),
    email_encrypted: await enc(data.profile.email, key),
    phone_encrypted: await enc(data.profile.phone, key),
    address_encrypted: await enc(data.profile.address, key),
    summary_encrypted: await enc(data.profile.summary, key),
    birth_year_encrypted: await encNum(data.profile.birthdate?.year, key),
    birth_month_encrypted: await encNum(data.profile.birthdate?.month, key),
    birth_day_encrypted: await encNum(data.profile.birthdate?.day, key),
    avatar_data_encrypted: await enc(data.profile.avatarData, key),
    avatar_filename_encrypted: await enc(data.profile.avatarFilename, key),
    avatar_content_type_encrypted: await enc(data.profile.avatarContentType, key),
    hobbies_encrypted: await enc(data.profile.hobbies.filter(Boolean).join('\n'), key),
    education_institutions_encrypted: await enc(JSON.stringify(data.educationInstitutions ?? []), key),
    experience_institutions_encrypted: await enc(JSON.stringify(data.experienceInstitutions ?? []), key),
  }

  const links: DBApplicantLinkRow[] = await Promise.all(
    data.links.map(async (l, i) => ({
      user_id: userId,
      name_encrypted: await encReq(l.name, key),
      url_encrypted: await encReq(l.url, key),
      icon_label_encrypted: await enc(l.icon?.label, key),
      icon_value_encrypted: await enc(l.icon?.value, key),
      icon_icon: l.icon?.icon ?? null,
      sort_order: i,
    }))
  )

  const languages: DBApplicantLanguageRow[] = await Promise.all(
    data.languages.map(async (l, i) => ({
      user_id: userId,
      name_encrypted: await encReq(l.name, key),
      level_encrypted: await enc(l.level, key),
      sort_order: i,
    }))
  )

  const skillCategories: DBApplicantSkillCategoryRow[] = []
  const skills: DBApplicantSkillRow[] = []
  for (let ci = 0; ci < data.skillCategories.length; ci++) {
    const cat = data.skillCategories[ci]!
    const catId = crypto.randomUUID()
    skillCategories.push({
      id: catId,
      user_id: userId,
      name_encrypted: await encReq(cat.name, key),
      sort_order: ci,
    })
    for (let si = 0; si < cat.skills.length; si++) {
      const s = cat.skills[si]!
      skills.push({
        category_id: catId,
        name_encrypted: await encReq(s.name, key),
        level_encrypted: await enc(s.level, key),
        technology_label_encrypted: await enc(s.technology?.label, key),
        technology_value_encrypted: await enc(s.technology?.value, key),
        technology_icon: s.technology?.icon ?? null,
        display_type_label_encrypted: await enc(s.displayType?.label, key),
        display_type_value_encrypted: await enc(s.displayType?.value, key),
        display_type_icon: s.displayType?.icon ?? null,
        sort_order: si,
      })
    }
  }

  const education: DBApplicantEducationRow[] = await Promise.all(
    data.education.map(async (e, i) => {
      const instUuid = typeof e.institution === 'string' ? e.institution : (e.institution as any)?.uuid
      const instObj = instUuid ? (data.educationInstitutions ?? []).find(inst => inst.uuid === instUuid) : undefined
      return {
      user_id: userId,
      institution_id: null,
      institution_uuid_encrypted: await enc(instUuid, key),
      institution_name_encrypted: await enc(instObj?.name ?? (e.institution as any)?.name, key),
      institution_url_encrypted: await enc(instObj?.url ?? (e.institution as any)?.url, key),
      degree_encrypted: await encReq(e.degree, key),
      description_encrypted: await enc(e.text, key),
      start_year_encrypted: await encNum(e.start?.year, key),
      start_month_encrypted: await encNum(e.start?.month, key),
      start_day_encrypted: await encNum(e.start?.day, key),
      end_year_encrypted: await encNum(e.end?.year, key),
      end_month_encrypted: await encNum(e.end?.month, key),
      end_day_encrypted: await encNum(e.end?.day, key),
      is_active: e.active ?? false,
      sort_order: i,
      collapsible_open: e.collapsibleOpen ?? true,
    }})
  )

  const experience: DBApplicantExperienceRow[] = await Promise.all(
    data.experience.map(async (e, i) => {
      const instUuid = typeof e.institution === 'string' ? e.institution : (e.institution as any)?.uuid
      const instObj = instUuid ? (data.experienceInstitutions ?? []).find(inst => inst.uuid === instUuid) : undefined
      return {
      user_id: userId,
      institution_id: null,
      institution_uuid_encrypted: await enc(instUuid, key),
      institution_name_encrypted: await enc(instObj?.name ?? (e.institution as any)?.name, key),
      institution_url_encrypted: await enc(instObj?.url ?? (e.institution as any)?.url, key),
      position_encrypted: await encReq(e.position, key),
      description_encrypted: await enc(e.text, key),
      is_internship: e.internship ?? false,
      technologies_encrypted: await enc(JSON.stringify(e.technologies ?? []), key),
      start_year_encrypted: await encNum(e.start?.year, key),
      start_month_encrypted: await encNum(e.start?.month, key),
      start_day_encrypted: await encNum(e.start?.day, key),
      end_year_encrypted: await encNum(e.end?.year, key),
      end_month_encrypted: await encNum(e.end?.month, key),
      end_day_encrypted: await encNum(e.end?.day, key),
      is_active: e.active ?? false,
      sort_order: i,
      collapsible_open: e.collapsibleOpen ?? true,
    }})
  )

  const projects: DBApplicantProjectRow[] = await Promise.all(
    data.projects.map(async (p, i) => ({
      user_id: userId,
      name_encrypted: await encReq(p.name, key),
      description_encrypted: await enc(p.description, key),
      url_encrypted: await enc(p.url, key),
      repo_link_name_encrypted: await enc(p.repoLink?.name, key),
      repo_link_url_encrypted: await enc(p.repoLink?.url, key),
      repo_link_icon_label_encrypted: await enc(p.repoLink?.icon?.label, key),
      repo_link_icon_value_encrypted: await enc(p.repoLink?.icon?.value, key),
      repo_link_icon_icon: p.repoLink?.icon?.icon ?? null,
      is_open_source: p.openSource ?? false,
      technologies_encrypted: await enc(JSON.stringify(p.technologies ?? []), key),
      start_year_encrypted: await encNum(p.start?.year, key),
      start_month_encrypted: await encNum(p.start?.month, key),
      start_day_encrypted: await encNum(p.start?.day, key),
      end_year_encrypted: await encNum(p.end?.year, key),
      end_month_encrypted: await encNum(p.end?.month, key),
      end_day_encrypted: await encNum(p.end?.day, key),
      sort_order: i,
      collapsible_open: p.collapsibleOpen ?? true,
    }))
  )

  const certifications: DBApplicantCertificationRow[] = await Promise.all(
    data.certifications.map(async (c, i) => ({
      user_id: userId,
      name_encrypted: await encReq(c.name, key),
      issuer_encrypted: await enc(c.issuer, key),
      description_encrypted: await enc(c.description, key),
      url_encrypted: null,
      date_year_encrypted: await encNum(c.date?.year, key),
      date_month_encrypted: await encNum(c.date?.month, key),
      date_day_encrypted: await encNum(c.date?.day, key),
      is_active: false,
      sort_order: i,
      collapsible_open: true,
    }))
  )

  return { profile, links, languages, skillCategories, skills, education, experience, projects, certifications }
}

// ─── DB rows → PortfolioData ───

export async function rowsToPortfolio(rows: DBPortfolioRows, key: CryptoKey): Promise<PortfolioData> {
  const p = rows.profile

  const hobbiesRaw = await dec(p.hobbies_encrypted, key)
  const hobbies = hobbiesRaw ? hobbiesRaw.split('\n').filter(Boolean) : []

  const links: Link[] = await Promise.all(
    rows.links.map(async (l) => ({
      name: await dec(l.name_encrypted, key),
      url: await dec(l.url_encrypted, key),
      icon: l.icon_icon ? {
        label: await dec(l.icon_label_encrypted, key),
        value: await dec(l.icon_value_encrypted, key),
        icon: l.icon_icon,
      } : undefined,
    }))
  )

  const languages: Language[] = await Promise.all(
    rows.languages.map(async (l) => ({
      name: await dec(l.name_encrypted, key),
      level: (await decOpt(l.level_encrypted, key)) as Language['level'],
    }))
  )

  const skillCategories: SkillCategory[] = await Promise.all(
    rows.skillCategories.map(async (cat) => {
      const catSkills = rows.skills.filter(s => s.category_id === cat.id)
      return {
        name: await dec(cat.name_encrypted, key),
        skills: await Promise.all(catSkills.map(async (s) => ({
          name: await dec(s.name_encrypted, key),
          level: (await decOpt(s.level_encrypted, key)) as Skill['level'],
          technology: s.technology_icon ? {
            label: await dec(s.technology_label_encrypted, key),
            value: await dec(s.technology_value_encrypted, key),
            icon: s.technology_icon,
          } : undefined,
          displayType: s.display_type_icon ? {
            label: await dec(s.display_type_label_encrypted, key),
            value: await dec(s.display_type_value_encrypted, key),
            icon: s.display_type_icon,
          } : undefined,
        }))),
      }
    })
  )

  const education: Education[] = await Promise.all(
    rows.education.map(async (e) => ({
      institution: e.institution_uuid_encrypted ? await decOpt(e.institution_uuid_encrypted, key) : undefined,
      degree: await dec(e.degree_encrypted, key),
      text: await dec(e.description_encrypted, key),
      start: {
        year: await decNum(e.start_year_encrypted, key),
        month: await decNum(e.start_month_encrypted, key),
        day: await decNum(e.start_day_encrypted, key),
      },
      end: {
        year: await decNum(e.end_year_encrypted, key),
        month: await decNum(e.end_month_encrypted, key),
        day: await decNum(e.end_day_encrypted, key),
      },
      active: e.is_active,
      collapsibleOpen: e.collapsible_open,
    }))
  )

  const experience: Experience[] = await Promise.all(
    rows.experience.map(async (e) => ({
      institution: e.institution_uuid_encrypted ? await decOpt(e.institution_uuid_encrypted, key) : undefined,
      position: await dec(e.position_encrypted, key),
      text: await dec(e.description_encrypted, key),
      internship: e.is_internship,
      technologies: await (async () => { try { const raw = e.technologies_encrypted ? await dec(e.technologies_encrypted, key) : '[]'; return JSON.parse(raw) } catch { return [] } })(),
      start: {
        year: await decNum(e.start_year_encrypted, key),
        month: await decNum(e.start_month_encrypted, key),
        day: await decNum(e.start_day_encrypted, key),
      },
      end: {
        year: await decNum(e.end_year_encrypted, key),
        month: await decNum(e.end_month_encrypted, key),
        day: await decNum(e.end_day_encrypted, key),
      },
      active: e.is_active,
      collapsibleOpen: e.collapsible_open,
    }))
  )

  const projects: Project[] = await Promise.all(
    rows.projects.map(async (proj) => ({
      name: await dec(proj.name_encrypted, key),
      description: await dec(proj.description_encrypted, key),
      url: await decOpt(proj.url_encrypted, key),
      repoLink: {
        name: await dec(proj.repo_link_name_encrypted, key),
        url: await dec(proj.repo_link_url_encrypted, key),
        icon: proj.repo_link_icon_icon ? {
          label: await dec(proj.repo_link_icon_label_encrypted, key),
          value: await dec(proj.repo_link_icon_value_encrypted, key),
          icon: proj.repo_link_icon_icon,
        } : undefined,
      },
      technologies: await (async () => { try { const raw = proj.technologies_encrypted ? await dec(proj.technologies_encrypted, key) : '[]'; return JSON.parse(raw) } catch { return [] } })(),
      openSource: proj.is_open_source,
      collapsibleOpen: proj.collapsible_open,
      start: {
        year: await decNum(proj.start_year_encrypted, key),
        month: await decNum(proj.start_month_encrypted, key),
        day: await decNum(proj.start_day_encrypted, key),
      },
      end: {
        year: await decNum(proj.end_year_encrypted, key),
        month: await decNum(proj.end_month_encrypted, key),
        day: await decNum(proj.end_day_encrypted, key),
      },
    }))
  )

  const certifications: Qualification[] = await Promise.all(
    rows.certifications.map(async (c) => ({
      name: await dec(c.name_encrypted, key),
      issuer: await decOpt(c.issuer_encrypted, key),
      description: await decOpt(c.description_encrypted, key),
      date: {
        year: await decNum(c.date_year_encrypted, key),
        month: await decNum(c.date_month_encrypted, key),
        day: await decNum(c.date_day_encrypted, key),
      },
    }))
  )

  // Birthdate: return undefined unless all three fields are valid finite numbers (avoids DatePicker RangeError)
  const pBdYear = await decNum(p.birth_year_encrypted, key)
  const pBdMonth = await decNum(p.birth_month_encrypted, key)
  const pBdDay = await decNum(p.birth_day_encrypted, key)
  const profileBirthdate = (
    typeof pBdYear === 'number' && isFinite(pBdYear) &&
    typeof pBdMonth === 'number' && isFinite(pBdMonth) &&
    typeof pBdDay === 'number' && isFinite(pBdDay)
  ) ? { year: pBdYear, month: pBdMonth, day: pBdDay } : undefined

  // Decrypt institution lists from profile row
  let educationInstitutions: Institution[] = []
  let experienceInstitutions: Institution[] = []
  try {
    const eduInstRaw = await decOpt(p.education_institutions_encrypted, key)
    if (eduInstRaw) educationInstitutions = JSON.parse(eduInstRaw)
  } catch {}
  try {
    const expInstRaw = await decOpt(p.experience_institutions_encrypted, key)
    if (expInstRaw) experienceInstitutions = JSON.parse(expInstRaw)
  } catch {}

  return {
    profile: {
      name: await dec(p.name_encrypted, key),
      subtitle: await dec(p.subtitle_encrypted, key),
      email: await dec(p.email_encrypted, key),
      phone: await dec(p.phone_encrypted, key),
      address: await dec(p.address_encrypted, key),
      summary: await dec(p.summary_encrypted, key),
      birthdate: profileBirthdate,
      hobbies,
      avatarData: await decOpt(p.avatar_data_encrypted, key),
      avatarFilename: await decOpt(p.avatar_filename_encrypted, key),
      avatarContentType: await decOpt(p.avatar_content_type_encrypted, key),
    },
    links,
    languages,
    skillCategories,
    education,
    experience,
    projects,
    certifications,
    educationInstitutions,
    experienceInstitutions,
    jobField: (p.job_field === 'it' ? 'IT' : 'Other') as 'IT' | 'Other',
  }
}

// ─── Style row type (DB shape) ───

export interface DBStyleRow {
  id?: string
  user_id?: string
  name: string
  is_default?: boolean
  font_family: string
  font_size: number
  font_line_height: number
  title_h1_size: number
  title_h2_size: number
  title_h3_size: number
  color_bg: string | null
  color_bg_elevated: string | null
  color_text_title: string
  color_text_subtitle: string
  color_text_section_title: string
  color_text_section_title_elevated: string
  color_text_base: string
  color_text_base_elevated: string
  color_skill_basic: string
  color_skill_decent: string
  color_skill_good: string
  color_skill_proficient: string
  color_skill_expert: string
  color_language_badges: string
  color_active: string
  color_tech_logos: string
  color_internship: string
  color_open_source: string
  use_shades: boolean
  use_avatar_shade: boolean
  use_gradients: boolean
  project_gradient_color: string | null
  use_borders: boolean
  border_width: number
  border_color: string | null
  fill_skill_icon: boolean
  layout_type: string
  layout_style: string
  show_background: boolean
  size_ratio: number
  section_spacing: number
  margin: number
  sections: unknown // JSONB
  created_at?: string
  updated_at?: string
}

// ─── ResumeStyle → DB row ───

export function styleToRow(style: ResumeStyle, name: string = 'Default'): Omit<DBStyleRow, 'id' | 'user_id' | 'created_at' | 'updated_at'> {
  return {
    name,
    is_default: false,
    font_family: style.font.family,
    font_size: style.font.size,
    font_line_height: style.font.lineHeight,
    title_h1_size: style.font.titleSizes.h1,
    title_h2_size: style.font.titleSizes.h2,
    title_h3_size: style.font.titleSizes.h3,
    color_bg: style.colors.bg ?? null,
    color_bg_elevated: style.colors.bgElevated ?? null,
    color_text_title: style.colors.text.title,
    color_text_subtitle: style.colors.text.subtitle,
    color_text_section_title: style.colors.text.sectionTitle,
    color_text_section_title_elevated: style.colors.text.sectionTitleElevated,
    color_text_base: style.colors.text.base,
    color_text_base_elevated: style.colors.text.baseElevated,
    color_skill_basic: style.colors.skillLevels.basic,
    color_skill_decent: style.colors.skillLevels.decent,
    color_skill_good: style.colors.skillLevels.good,
    color_skill_proficient: style.colors.skillLevels.proficient,
    color_skill_expert: style.colors.skillLevels.expert,
    color_language_badges: style.colors.languageBadges,
    color_active: style.colors.active,
    color_tech_logos: style.colors.techLogos,
    color_internship: style.colors.internship,
    color_open_source: style.colors.openSource,
    use_shades: style.effects.useShades,
    use_avatar_shade: style.effects.useAvatarShade ?? false,
    use_gradients: style.effects.useGradients,
    project_gradient_color: style.effects.projectGradientColor ?? null,
    use_borders: style.effects.useBorders,
    border_width: style.effects.borderWidth,
    border_color: style.effects.borderColor ?? null,
    fill_skill_icon: style.effects.fillSkillIcon,
    layout_type: style.layout.type,
    layout_style: style.layout.style,
    show_background: style.layout.showBackground,
    size_ratio: style.layout.sizeRatio,
    section_spacing: style.layout.sectionSpacing,
    margin: style.layout.margin,
    sections: style.sections,
  }
}

// ─── DB row → ResumeStyle ───

export function rowToStyle(row: DBStyleRow): ResumeStyle {
  return {
    font: {
      family: row.font_family,
      size: row.font_size,
      titleSizes: {
        h1: row.title_h1_size,
        h2: row.title_h2_size,
        h3: row.title_h3_size,
      },
      lineHeight: row.font_line_height,
    },
    colors: {
      bg: row.color_bg ?? undefined,
      bgElevated: row.color_bg_elevated ?? undefined,
      text: {
        title: row.color_text_title,
        subtitle: row.color_text_subtitle,
        sectionTitle: row.color_text_section_title,
        sectionTitleElevated: row.color_text_section_title_elevated,
        base: row.color_text_base,
        baseElevated: row.color_text_base_elevated,
      },
      skillLevels: {
        basic: row.color_skill_basic,
        decent: row.color_skill_decent,
        good: row.color_skill_good,
        proficient: row.color_skill_proficient,
        expert: row.color_skill_expert,
      },
      languageBadges: row.color_language_badges,
      active: row.color_active,
      techLogos: row.color_tech_logos,
      internship: row.color_internship,
      openSource: row.color_open_source,
    },
    effects: {
      useShades: row.use_shades,
      useAvatarShade: row.use_avatar_shade,
      useGradients: row.use_gradients,
      projectGradientColor: row.project_gradient_color ?? undefined,
      useBorders: row.use_borders,
      borderWidth: row.border_width,
      borderColor: row.border_color ?? undefined,
      fillSkillIcon: row.fill_skill_icon,
    },
    layout: {
      type: row.layout_type as ResumeStyle['layout']['type'],
      style: row.layout_style as ResumeStyle['layout']['style'],
      showBackground: row.show_background,
      sizeRatio: row.size_ratio,
      sectionSpacing: row.section_spacing,
      margin: row.margin,
    },
    sections: row.sections as ResumeStyle['sections'],
  }
}
