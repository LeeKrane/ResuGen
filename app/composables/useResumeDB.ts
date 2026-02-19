import { useSupabaseClient, useSupabaseUser } from '#imports'
import {
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
 * useResumeDB — composable for reading the user's resumes from Supabase.
 *
 * Resumes and their child tables (education, experience, projects, etc.) ARE in the
 * generated Supabase types, so no `as any` cast is needed here.
 *
 * Usage:
 *   const { resumes, loadResume, listResumes } = useResumeDB()
 *   await listResumes()
 *   const data = await loadResume(id)
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

  return {
    resumes,
    loading,
    error,
    listResumes,
    loadResume,
    clear,
  }
}
