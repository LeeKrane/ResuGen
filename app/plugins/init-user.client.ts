export default defineNuxtPlugin(async () => {
  const { loadUserState } = useUserState()
  const supabase = useSupabaseClient()

  // Load user state on initial page load
  await loadUserState()

  // Wire portfolio load/clear to Supabase auth state changes.
  // This handles: initial login, token refresh, and logout events.
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      // Derive encryption key and load portfolio after login
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
      // Clear encryption key and portfolio state on logout
      const { clearKey } = useEncryption()
      const { clear } = usePortfolio()
      clearKey()
      clear()
    }
  })
})
