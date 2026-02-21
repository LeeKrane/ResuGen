
import { navigateTo, useToast, useSupabaseClient } from '#imports';

export const useLogout = () => { 
  const { clearUserState } = useUserState()

  const logout = async () => {
    try {
      await useSupabaseClient().auth.signOut()
    } catch (e) {
      console.error('[logout] signOut error:', e)
    }
    // Clear all in-memory state before navigating
    clearUserState()
    try {
      const { clearKey } = useEncryption()
      clearKey()
    } catch {}
    try {
      const { clear: clearPortfolio } = usePortfolio()
      clearPortfolio()
    } catch {}
    try {
      const { clear: clearResumes } = useResumeDB()
      clearResumes()
    } catch {}
    navigateTo('/')
    useToast().add({ title: 'Successfully logged out', color: 'info', icon: 'i-lucide-info' })
  }
  return logout;
}
