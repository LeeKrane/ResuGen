import { useSupabaseClient, useSupabaseUser } from '#imports'
import {
  resumeToRows,
  rowsToResume,
  type DBResumeRow,
  type DBEducationRow,
  type DBExperienceRow,
  type DBProjectRow,
  type DBSkillCategoryRow,
  type DBSkillRow,
  type DBResumeLinkRow,
  type DBResumeLanguageRow,
  type DBCertificationRow,
  type DBCoverLetterRow,
  type DBResumeRows,
} from './useDBMapper'
import { useEncryption } from './useEncryption'

/**
 * useResumeDB — composable for CRUD operations on the user's resumes.
 *
 * Resumes and their child tables (education, experience, projects, etc.) ARE in the
 * generated Supabase types, so no `as any` cast is needed here.
 *
 * Usage:
 *   const { resumes, listResumes, loadResume, createResume, saveResume } = useResumeDB()
 *   await listResumes()
 *   const id = await createResume('My Resume', 'IT')
 *   await saveResume(id, resumeData)
 */
export const useResumeDB = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const { deriveKey, isReady } = useEncryption()

  // Shared reactive state
  const resumes = useState<ResumeSummary[]>('resumeList', () => [])
  const loading = useState<boolean>('resumeListLoading', () => false)
  const error = useState<string | null>('resumeListError', () => null)

  /**
   * Fetch resume summaries (id, title, kind, updated_at, created_at, duplicated_from)
   * for the current user. Populates the reactive `resumes` list.
   */
  async function listResumes(): Promise<void> {
    const userId = user.value?.id
    if (!userId) {
      error.value = 'Not authenticated'
      return
    }

    loading.value = true
    error.value = null

    try {
      const { data, error: dbErr } = await supabase
        .from('resumes')
        .select('id, title, kind, updated_at, created_at, duplicated_from')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      if (dbErr) throw new Error(dbErr.message)

      resumes.value = (data ?? []).map((r: any) => ({
        id: r.id as string,
        title: r.title as string,
        kind: (r.kind ?? 'it') as 'it' | 'other',
        updatedAt: r.updated_at as string,
        createdAt: r.created_at as string,
        duplicatedFrom: r.duplicated_from ?? undefined,
      }))
    } catch (e: any) {
      error.value = e?.message ?? 'Failed to list resumes'
    } finally {
      loading.value = false
    }
  }

  /**
   * Load a full resume by ID — fetches the resume row + all child rows in parallel,
   * decrypts all encrypted fields, and returns a ResumeData object.
   *
   * Returns null if the resume is not found or does not belong to the current user.
   */
  async function loadResume(id: string): Promise<ResumeData | null> {
    const userId = user.value?.id
    if (!userId) throw new Error('Not authenticated')

    // Ensure encryption key is ready
    if (!isReady.value) await deriveKey()
    const cryptoKey = useState<CryptoKey | null>('encryptionKey').value
    if (!cryptoKey) throw new Error('Encryption key not available')

    // Fetch resume row + all child tables in parallel
    const [
      resumeRes,
      educationRes,
      experienceRes,
      projectsRes,
      skillCatsRes,
      skillsRes,
      linksRes,
      languagesRes,
      certificationsRes,
      coverLetterRes,
    ] = await Promise.all([
      supabase
        .from('resumes')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .maybeSingle(),
      supabase
        .from('education')
        .select('*')
        .eq('resume_id', id)
        .order('sort_order'),
      supabase
        .from('experience')
        .select('*')
        .eq('resume_id', id)
        .order('sort_order'),
      supabase
        .from('projects')
        .select('*')
        .eq('resume_id', id)
        .order('sort_order'),
      supabase
        .from('skill_categories')
        .select('*')
        .eq('resume_id', id)
        .order('sort_order'),
      supabase
        .from('skills')
        .select('*')
        .order('sort_order'),
      supabase
        .from('resume_links')
        .select('*')
        .eq('resume_id', id)
        .order('sort_order'),
      supabase
        .from('resume_languages')
        .select('*')
        .eq('resume_id', id)
        .order('sort_order'),
      supabase
        .from('certifications')
        .select('*')
        .eq('resume_id', id)
        .order('sort_order'),
      supabase
        .from('cover_letters')
        .select('*')
        .eq('resume_id', id)
        .maybeSingle(),
    ])

    // Check for errors
    const errs = [resumeRes, educationRes, experienceRes, projectsRes, skillCatsRes, skillsRes, linksRes, languagesRes, certificationsRes, coverLetterRes]
      .map(r => r.error).filter(Boolean)
    if (errs.length) throw new Error(errs[0]!.message)

    // Resume not found or not owned by this user
    if (!resumeRes.data) return null

    // Filter skills to only those belonging to this resume's skill categories
    const catIds = new Set((skillCatsRes.data ?? []).map((c: any) => c.id))
    const filteredSkills = (skillsRes.data ?? []).filter((s: any) => catIds.has(s.category_id))

    const rows: DBResumeRows = {
      resume: resumeRes.data as DBResumeRow,
      education: (educationRes.data ?? []) as DBEducationRow[],
      experience: (experienceRes.data ?? []) as DBExperienceRow[],
      projects: (projectsRes.data ?? []) as DBProjectRow[],
      skillCategories: (skillCatsRes.data ?? []) as DBSkillCategoryRow[],
      skills: filteredSkills as DBSkillRow[],
      links: (linksRes.data ?? []) as DBResumeLinkRow[],
      languages: (languagesRes.data ?? []) as DBResumeLanguageRow[],
      certifications: (certificationsRes.data ?? []) as DBCertificationRow[],
      coverLetter: (coverLetterRes.data ?? null) as DBCoverLetterRow | null,
    }

    return rowsToResume(rows, cryptoKey)
  }

  /**
   * Clear resume list state from memory. Call on logout.
   */
  function clear(): void {
    resumes.value = []
    error.value = null
  }

  // ─── Create ───

  /**
   * Create a new resume row and return its ID.
   *
   * @param title  Display title for the resume
   * @param kind   'IT' or 'Other' — determines which template is used
   * @param fromPortfolio  Optional PortfolioData to seed the resume's child tables from
   * @param duplicatedFrom  Optional source resume ID (for lineage tracking)
   */
  async function createResume(
    title: string,
    kind: 'IT' | 'Other' = 'IT',
    fromPortfolio?: PortfolioData,
    duplicatedFrom?: string
  ): Promise<string> {
    const userId = user.value?.id
    if (!userId) throw new Error('Not authenticated')

    if (!isReady.value) await deriveKey()
    const cryptoKey = useState<CryptoKey | null>('encryptionKey').value
    if (!cryptoKey) throw new Error('Encryption key not available')

    const resumeId = crypto.randomUUID()

    // Insert the resume row — name_encrypted is NOT NULL in DB, so we must provide it
    const db = supabase as any
    const { encryptString } = await import('../utils/crypto')
    const nameEncrypted = await encryptString('', cryptoKey)
    const { error: insertErr } = await db
      .from('resumes')
      .insert({
        id: resumeId,
        user_id: userId,
        title,
        kind: kind === 'IT' ? 'it' : 'other',
        duplicated_from: duplicatedFrom ?? null,
        name_encrypted: nameEncrypted,
      })
    if (insertErr) throw new Error(insertErr.message)

    // If seeding from portfolio, copy portfolio data into resume child tables
    if (fromPortfolio) {
      // Build a minimal ResumeData from the portfolio
      const seedData: ResumeData = _portfolioToResumeData(fromPortfolio, title, kind)
      await _saveResumeRows(resumeId, seedData, cryptoKey)

      // Copy avatar from portfolio directly (resumeToRows can't handle File objects from portfolio base64)
      if (fromPortfolio.profile.avatarData) {
        const { encryptString } = await import('../utils/crypto')
        const db2 = supabase as any
        await db2.from('resumes').update({
          avatar_data_encrypted: await encryptString(fromPortfolio.profile.avatarData, cryptoKey),
          avatar_filename_encrypted: fromPortfolio.profile.avatarFilename
            ? await encryptString(fromPortfolio.profile.avatarFilename, cryptoKey)
            : null,
          avatar_content_type_encrypted: fromPortfolio.profile.avatarContentType
            ? await encryptString(fromPortfolio.profile.avatarContentType, cryptoKey)
            : null,
        }).eq('id', resumeId)
      }
    }

    // Refresh the list
    await listResumes()

    return resumeId
  }

  /**
   * Create a blank resume with no child rows.
   * Convenience wrapper around createResume with no portfolio seed.
   */
  async function createBlankResume(title: string = 'New Resume', kind: 'IT' | 'Other' = 'IT'): Promise<string> {
    return createResume(title, kind)
  }

  // ─── Save ───

  /**
   * Persist all resume data for a given resume ID.
   *
   * Strategy: upsert the resume row, then delete-and-reinsert all child tables.
   * Same approach as usePortfolio.save() — simple and correct for small data volumes.
   */
  async function saveResume(id: string, data: ResumeData, title?: string): Promise<void> {
    const userId = user.value?.id
    if (!userId) throw new Error('Not authenticated')

    if (!isReady.value) await deriveKey()
    const cryptoKey = useState<CryptoKey | null>('encryptionKey').value
    if (!cryptoKey) throw new Error('Encryption key not available')

    loading.value = true
    error.value = null

    try {
      // Update the resume row title/kind
      // Cast to any: generated types may not include migration-added columns
      const db = supabase as any
      const { error: updateErr } = await db
        .from('resumes')
        .update({
          title: title ?? data.name ?? 'Untitled Resume',
          kind: data.jobField === 'IT' ? 'it' : 'other',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', userId)
      if (updateErr) throw new Error(updateErr.message)

      await _saveResumeRows(id, data, cryptoKey)

      // Refresh summary list to reflect updated_at change
      await listResumes()
    } catch (e: any) {
      error.value = e?.message ?? 'Failed to save resume'
      throw e
    } finally {
      loading.value = false
    }
  }

  // ─── Delete ───

  /**
   * Delete a resume by ID.
   *
   * The ON DELETE CASCADE constraint on all resume → child table FKs ensures that
   * all child rows (education, experience, projects, skills, etc.) are removed
   * atomically by the database. No manual child cleanup is needed here.
   *
   * The associated resume_style row is NOT deleted — it uses ON DELETE SET NULL,
   * so styles survive resume deletion and can be reused.
   */
  async function deleteResume(id: string): Promise<void> {
    const userId = user.value?.id
    if (!userId) throw new Error('Not authenticated')

    loading.value = true
    error.value = null

    try {
      const db = supabase as any
      const { error: delErr } = await db
        .from('resumes')
        .delete()
        .eq('id', id)
        .eq('user_id', userId) // RLS guard: only delete own resumes

      if (delErr) throw new Error(delErr.message)

      // Remove from local list immediately (optimistic update)
      resumes.value = resumes.value.filter(r => r.id !== id)
    } catch (e: any) {
      error.value = e?.message ?? 'Failed to delete resume'
      throw e
    } finally {
      loading.value = false
    }
  }

  // ─── Duplicate ───

  /**
   * Duplicate a resume by ID.
   *
   * Loads the source resume's full data, creates a new resume row with
   * `duplicated_from` set to the source ID (for lineage tracking), then
   * copies all child rows into the new resume.
   *
   * Returns the new resume's ID.
   */
  async function duplicateResume(id: string, newTitle?: string): Promise<string> {
    const userId = user.value?.id
    if (!userId) throw new Error('Not authenticated')

    if (!isReady.value) await deriveKey()
    const cryptoKey = useState<CryptoKey | null>('encryptionKey').value
    if (!cryptoKey) throw new Error('Encryption key not available')

    // Load the source resume's full data
    const sourceData = await loadResume(id)
    if (!sourceData) throw new Error('Source resume not found')

    // Find the source summary to get title and kind
    const sourceSummary = resumes.value.find(r => r.id === id)
    const sourceTitle = sourceSummary?.title ?? sourceData.name ?? 'Untitled Resume'
    const sourceKind = sourceSummary?.kind === 'other' ? 'Other' : 'IT'

    const title = newTitle ?? `${sourceTitle} (copy)`

    // Create the new resume row with duplicated_from set
    const newId = await createResume(title, sourceKind as 'IT' | 'Other', undefined, id)

    // Save the copied child data into the new resume
    await _saveResumeRows(newId, sourceData, cryptoKey)

    // Refresh list to include the new resume
    await listResumes()

    return newId
  }

  return {
    resumes,
    loading,
    error,
    listResumes,
    loadResume,
    createResume,
    createBlankResume,
    saveResume,
    deleteResume,
    duplicateResume,
    clear,
  }
}

// ─── Private helpers ───

/**
 * Encrypt and insert/replace all child rows for a resume.
 * Also updates the resume row's encrypted profile fields (name, email, etc.).
 * Deletes existing child rows first, then reinserts.
 */
async function _saveResumeRows(resumeId: string, data: ResumeData, cryptoKey: CryptoKey): Promise<void> {
  // Cast to any: resume child tables may not be fully typed in generated Supabase types
  const supabase = useSupabaseClient() as any
  const rows = await resumeToRows(data, resumeId, cryptoKey)

  // Update the resume row's encrypted profile fields
  const r = rows.resume

  // Build the update payload — avatar columns are only included when data.avatarData
  // is present (base64 string). resumeToRows always sets avatar_data_encrypted: null
  // because it can't handle base64 strings (only File objects). Omitting avatar columns
  // here prevents overwriting a previously-saved avatar with null on every save.
  const resumeUpdatePayload: Record<string, any> = {
    name_encrypted: r.name_encrypted,
    subtitle_encrypted: r.subtitle_encrypted,
    email_encrypted: r.email_encrypted,
    phone_encrypted: r.phone_encrypted,
    address_encrypted: r.address_encrypted,
    summary_encrypted: r.summary_encrypted,
    birth_year_encrypted: r.birth_year_encrypted,
    birth_month_encrypted: r.birth_month_encrypted,
    birth_day_encrypted: r.birth_day_encrypted,
    hobbies_encrypted: r.hobbies_encrypted,
    education_institutions_encrypted: r.education_institutions_encrypted,
    experience_institutions_encrypted: r.experience_institutions_encrypted,
  }

  // Only update avatar columns when the in-memory state has avatar data.
  // This preserves a previously-saved avatar when the user saves without changing it.
  if (data.avatarData) {
    const { encryptString } = await import('../utils/crypto')
    resumeUpdatePayload.avatar_data_encrypted = await encryptString(data.avatarData, cryptoKey)
    resumeUpdatePayload.avatar_content_type_encrypted = data.avatarContentType
      ? await encryptString(data.avatarContentType, cryptoKey)
      : null
    resumeUpdatePayload.avatar_filename_encrypted = null
  }

  const { error: resumeUpdateErr } = await supabase
    .from('resumes')
    .update(resumeUpdatePayload)
    .eq('id', resumeId)
  if (resumeUpdateErr) throw new Error(`Update resume row: ${resumeUpdateErr.message}`)

  // Delete all child rows (CASCADE would handle this on resume delete, but here we're replacing)
  await Promise.all([
    supabase.from('education').delete().eq('resume_id', resumeId),
    supabase.from('experience').delete().eq('resume_id', resumeId),
    supabase.from('projects').delete().eq('resume_id', resumeId),
    supabase.from('resume_links').delete().eq('resume_id', resumeId),
    supabase.from('resume_languages').delete().eq('resume_id', resumeId),
    supabase.from('certifications').delete().eq('resume_id', resumeId),
    supabase.from('cover_letters').delete().eq('resume_id', resumeId),
    // Skill categories: deleting them cascades to skills
    supabase.from('skill_categories').delete().eq('resume_id', resumeId),
  ])

  // Insert child rows (skill categories before skills due to FK)
  const inserts: Promise<any>[] = []

  if (rows.education.length) inserts.push(supabase.from('education').insert(rows.education))
  if (rows.experience.length) inserts.push(supabase.from('experience').insert(rows.experience))
  if (rows.projects.length) inserts.push(supabase.from('projects').insert(rows.projects))
  if (rows.links.length) inserts.push(supabase.from('resume_links').insert(rows.links))
  if (rows.languages.length) inserts.push(supabase.from('resume_languages').insert(rows.languages))
  if (rows.certifications.length) inserts.push(supabase.from('certifications').insert(rows.certifications))
  if (rows.coverLetter) inserts.push(supabase.from('cover_letters').insert(rows.coverLetter))

  // Skill categories + skills must be sequential (FK dependency)
  if (rows.skillCategories.length) {
    const { error: catErr } = await supabase.from('skill_categories').insert(rows.skillCategories)
    if (catErr) throw new Error(`Insert skill_categories: ${catErr.message}`)
    if (rows.skills.length) {
      const { error: skillErr } = await supabase.from('skills').insert(rows.skills)
      if (skillErr) throw new Error(`Insert skills: ${skillErr.message}`)
    }
  }

  const results = await Promise.all(inserts)
  const errs = results.map(r => r.error).filter(Boolean)
  if (errs.length) throw new Error(errs[0]!.message)
}

/**
 * Convert PortfolioData into a ResumeData seed.
 * Copies all sections from the portfolio into the resume structure.
 * Fields are scoped by kind: General resumes exclude IT-specific sections (projects, technologies).
 */
function _portfolioToResumeData(portfolio: PortfolioData, title: string, kind: 'IT' | 'Other'): ResumeData {
  const isIT = kind === 'IT'

  return {
    name: portfolio.profile.name || title,
    subtitle: portfolio.profile.subtitle,
    email: portfolio.profile.email,
    phone: portfolio.profile.phone,
    address: portfolio.profile.address,
    summary: portfolio.profile.summary,
    birthdate: portfolio.profile.birthdate,
    hobbies: [...portfolio.profile.hobbies],
    languages: portfolio.languages.map(l => ({ ...l })),
    skillCategories: portfolio.skillCategories.map(cat => ({
      name: cat.name,
      skills: cat.skills.map(s => ({ ...s })),
    })),
    links: portfolio.links.map(l => ({ ...l })),
    educationInstitutions: (portfolio.educationInstitutions ?? []).map(i => ({ ...i })),
    experienceInstitutions: (portfolio.experienceInstitutions ?? []).map(i => ({ ...i })),
    education: portfolio.education.map(e => ({ ...e, technologies: undefined as any })),
    experience: portfolio.experience.map(e => ({
      ...e,
      // Only include technologies for IT resumes
      technologies: isIT ? (e.technologies ?? []) : [],
    })),
    // Only include projects for IT resumes
    projects: isIT
      ? portfolio.projects.map(p => ({ ...p, technologies: p.technologies ?? [] }))
      : [],
    jobField: kind,
    qualifications: portfolio.certifications.map(c => ({ ...c })),
    coverLetter: undefined,
  }
}
