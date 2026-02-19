
import { navigateTo, useToast, useSupabaseClient } from '#imports';

export const useLogout = () => { 
  const { clearUserState } = useUserState()
  const { clearKey } = useEncryption()
  const { clear: clearPortfolio } = usePortfolio()

  const logout = async () => {
    await useSupabaseClient().auth.signOut()
    // Clear all in-memory state before navigating
    clearUserState()
    clearKey()
    clearPortfolio()
    navigateTo('/')
    useToast().add({ title: 'Successfully logged out', color: 'info', icon: 'i-lucide-info' })
  }
  return logout;
}
