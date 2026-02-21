export default defineNuxtPlugin(async () => {
  const { loadUserState } = useUserState()
  const supabase = useSupabaseClient()

  // Load user state on initial page load
  await loadUserState()

  // Wire portfolio load/clear to Supabase auth state changes.
  // INITIAL_SESSION fires on page reload for already-authenticated users.
  // SIGNED_IN fires after a fresh login.
  supabase.auth.onAuthStateChange(async (event, session) => {
    if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
      // Derive encryption key and load portfolio
      const { deriveKey } = useEncryption()
      const { load } = usePortfolio()
      try {
        await deriveKey()
        await load()
      } catch (e) {
        console.error('[init-user] Failed to load portfolio after sign-in:', e)
      }
    }

    if (event === 'SIGNED_OUT') {
      // Clear encryption key and all user state on logout
      const { clearKey } = useEncryption()
      const { clear: clearPortfolio } = usePortfolio()
      const { clear: clearResumes } = useResumeDB()
      clearKey()
      clearPortfolio()
      clearResumes()
    }
  })
})
