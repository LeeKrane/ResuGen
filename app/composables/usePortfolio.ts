import { useSupabaseClient, useSupabaseUser } from '#imports'
import {
  rowsToPortfolio,
  portfolioToRows,
  type DBPortfolioRows,
  type DBApplicantProfileRow,
  type DBApplicantLinkRow,
  type DBApplicantLanguageRow,
  type DBApplicantSkillCategoryRow,
  type DBApplicantSkillRow,
  type DBApplicantEducationRow,
  type DBApplicantExperienceRow,
  type DBApplicantProjectRow,
  type DBApplicantCertificationRow,
} from './useDBMapper'
import { useEncryption } from './useEncryption'

/**
 * usePortfolio - reactive composable for reading and writing the user's portfolio.
 *
 * The portfolio is the single source-of-truth for applicant data (applicant_* tables).
 * All sensitive fields are encrypted client-side before storage and decrypted on load.
 *
 * Usage:
 *   const { portfolio, loading, error, load, save } = usePortfolio()
 *   await load()
 */

// Module-level deduplication: shared across ALL composable instances.
// A let inside the factory would create a new closure per call, breaking deduplication.
let _sharedLoadPromise: Promise<void> | null = null

export const usePortfolio = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const { deriveKey, isReady } = useEncryption()

  // Shared reactive state across all composable instances (SSR-safe)
  const portfolio = useState<PortfolioData | null>('portfolio', () => null)
  const loading = useState<boolean>('portfolioLoading', () => false)
  const error = useState<string | null>('portfolioError', () => null)

  /**
   * Load all portfolio data for the current user from Supabase.
   * Fetches all applicant_* tables in parallel, decrypts, and maps to PortfolioData.
   * If a load is already in progress, returns the existing promise (deduplication).
   * If portfolio is already loaded, returns immediately (idempotent).
   */
  async function load(): Promise<void> {
    // Already loaded - skip network call
    if (portfolio.value) return
    // Deduplicate concurrent calls (module-level, shared across all instances)
    if (_sharedLoadPromise) return _sharedLoadPromise
    _sharedLoadPromise = _doLoad()
    try {
      await _sharedLoadPromise
    } finally {
      _sharedLoadPromise = null
    }
  }

  async function _doLoad(): Promise<void> {
    const userId = user.value?.id
    if (!userId) {
      error.value = 'Not authenticated'
      return
    }

    loading.value = true
    error.value = null

    try {
      // Ensure encryption key is ready before fetching
      if (!isReady.value) await deriveKey()

      // Fetch all portfolio tables in parallel
      const [
        profileRes,
        linksRes,
        languagesRes,
        skillCatsRes,
        skillsRes,
        educationRes,
        experienceRes,
        projectsRes,
        certificationsRes,
      ] = await Promise.all([
        supabase.from('applicant_profile').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('applicant_links').select('*').eq('user_id', userId).order('sort_order'),
        supabase.from('applicant_languages').select('*').eq('user_id', userId).order('sort_order'),
        supabase.from('applicant_skill_categories').select('*').eq('user_id', userId).order('sort_order'),
        supabase.from('applicant_skills').select('*').order('sort_order'),
        supabase.from('applicant_education').select('*').eq('user_id', userId).order('sort_order'),
        supabase.from('applicant_experience').select('*').eq('user_id', userId).order('sort_order'),
        supabase.from('applicant_projects').select('*').eq('user_id', userId).order('sort_order'),
        supabase.from('applicant_certifications').select('*').eq('user_id', userId).order('sort_order'),
      ])

      // Check for errors
      const errs = [profileRes, linksRes, languagesRes, skillCatsRes, skillsRes, educationRes, experienceRes, projectsRes, certificationsRes]
        .map(r => r.error).filter(Boolean)
      if (errs.length) throw new Error(errs[0]!.message)

      // If no profile row exists yet, return empty portfolio
      if (!profileRes.data) {
        portfolio.value = emptyPortfolio()
        return
      }

      // Filter skills to only those belonging to this user's skill categories
      const catIds = new Set((skillCatsRes.data ?? []).map((c: any) => c.id))
      const filteredSkills = (skillsRes.data ?? []).filter((s: any) => catIds.has(s.category_id))

      const rows: DBPortfolioRows = {
        profile: profileRes.data as DBApplicantProfileRow,
        links: (linksRes.data ?? []) as DBApplicantLinkRow[],
        languages: (languagesRes.data ?? []) as DBApplicantLanguageRow[],
        skillCategories: (skillCatsRes.data ?? []) as DBApplicantSkillCategoryRow[],
        skills: filteredSkills as DBApplicantSkillRow[],
        education: (educationRes.data ?? []) as DBApplicantEducationRow[],
        experience: (experienceRes.data ?? []) as DBApplicantExperienceRow[],
        projects: (projectsRes.data ?? []) as DBApplicantProjectRow[],
        certifications: (certificationsRes.data ?? []) as DBApplicantCertificationRow[],
      }

      // Get the encryption key from the composable's internal state
      const { encrypt: _enc } = useEncryption()
      // Access the key via the useState directly (same key as useEncryption uses)
      const cryptoKey = useState<CryptoKey | null>('encryptionKey').value
      if (!cryptoKey) throw new Error('Encryption key not available after derivation')

      portfolio.value = await rowsToPortfolio(rows, cryptoKey)
    } catch (e: any) {
      error.value = e?.message ?? 'Failed to load portfolio'
    } finally {
      loading.value = false
    }
  }

  /**
   * Save the current portfolio state to Supabase.
   *
   * Strategy: upsert profile row, then delete-and-reinsert all list tables.
   * This avoids complex diffing while remaining correct for the data volumes involved.
   * Retries once on network error before surfacing the failure.
   */
  async function save(data?: PortfolioData): Promise<void> {
    const userId = user.value?.id
    if (!userId) {
      error.value = 'Not authenticated'
      return
    }

    const target = data ?? portfolio.value
    if (!target) {
      error.value = 'No portfolio data to save'
      return
    }

    loading.value = true
    error.value = null

    try {
      await _doSave(userId, target)
    } catch (e: any) {
      // Retry once on failure
      try {
        await _doSave(userId, target)
      } catch (e2: any) {
        error.value = e2?.message ?? 'Failed to save portfolio'
      }
    } finally {
      loading.value = false
    }
  }

  async function _doSave(userId: string, data: PortfolioData): Promise<void> {
    if (!isReady.value) await deriveKey()

    const cryptoKey = useState<CryptoKey | null>('encryptionKey').value
    if (!cryptoKey) throw new Error('Encryption key not available')

    const rows = await portfolioToRows(data, userId, cryptoKey)

    // 1. Upsert profile (single row keyed by user_id)
    // Cast needed: applicant_* tables were added via SQL migration and are not in the generated types
    const db = supabase as any
    const { error: profileErr } = await db
      .from('applicant_profile')
      .upsert({ ...rows.profile, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    if (profileErr) throw new Error(profileErr.message)

    // 2. Delete-and-reinsert list tables in parallel
    // Skills must be inserted after skill categories (FK dependency)
    await Promise.all([
      _replaceRows(db, 'applicant_links', 'user_id', userId, rows.links),
      _replaceRows(db, 'applicant_languages', 'user_id', userId, rows.languages),
      _replaceRows(db, 'applicant_education', 'user_id', userId, rows.education),
      _replaceRows(db, 'applicant_experience', 'user_id', userId, rows.experience),
      _replaceRows(db, 'applicant_projects', 'user_id', userId, rows.projects),
      _replaceRows(db, 'applicant_certifications', 'user_id', userId, rows.certifications),
      // Skill categories + skills: delete categories (CASCADE removes skills), then reinsert both
      _replaceSkillCategories(db, userId, rows.skillCategories, rows.skills),
    ])
  }

  /**
   * Clear portfolio state from memory. Call on logout.
   */
  function clear(): void {
    portfolio.value = null
    error.value = null
  }

  return {
    portfolio,
    loading,
    error,
    load,
    save,
    clear,
  }
}

//  Helpers 

function emptyPortfolio(): PortfolioData {
  return {
    profile: {
      name: '',
      subtitle: '',
      email: '',
      phone: '',
      address: '',
      summary: '',
      hobbies: [],
    },
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

/**
 * Delete all rows for a user in a table, then insert the new rows.
 * Accepts `any` typed client because applicant_* tables are not in the generated Supabase types.
 */
async function _replaceRows(
  db: any,
  table: string,
  userCol: string,
  userId: string,
  rows: Record<string, any>[]
): Promise<void> {
  const { error: delErr } = await db.from(table).delete().eq(userCol, userId)
  if (delErr) throw new Error(`Delete ${table}: ${delErr.message}`)
  if (rows.length === 0) return
  const { error: insErr } = await db.from(table).insert(rows)
  if (insErr) throw new Error(`Insert ${table}: ${insErr.message}`)
}

/**
 * Replace skill categories and their skills.
 * Deletes categories (CASCADE removes skills), then inserts categories + skills.
 */
async function _replaceSkillCategories(
  db: any,
  userId: string,
  categories: Record<string, any>[],
  skills: Record<string, any>[]
): Promise<void> {
  const { error: delErr } = await db
    .from('applicant_skill_categories')
    .delete()
    .eq('user_id', userId)
  if (delErr) throw new Error(`Delete applicant_skill_categories: ${delErr.message}`)
  if (categories.length === 0) return

  const { error: catErr } = await db.from('applicant_skill_categories').insert(categories)
  if (catErr) throw new Error(`Insert applicant_skill_categories: ${catErr.message}`)

  if (skills.length === 0) return
  const { error: skillErr } = await db.from('applicant_skills').insert(skills)
  if (skillErr) throw new Error(`Insert applicant_skills: ${skillErr.message}`)
}
