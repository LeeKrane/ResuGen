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
 * usePortfolio — reactive composable for reading and writing the user's portfolio.
 *
 * The portfolio is the single source-of-truth for applicant data (applicant_* tables).
 * All sensitive fields are encrypted client-side before storage and decrypted on load.
 *
 * Usage:
 *   const { portfolio, loading, error, load, save } = usePortfolio()
 *   await load()
 */
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
   */
  async function load(): Promise<void> {
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
    clear,
  }
}

// ─── Helpers ───

function emptyPortfolio(): PortfolioData {
  return {
    profile: {
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
    institutions: [],
  }
}
