
import { navigateTo, useToast, useSupabaseClient } from '#imports';

export const useLogout = () => { 
  const { clearUserState } = useUserState()
  const logout = async () => {
    await useSupabaseClient().auth.signOut()
    navigateTo('/')
    clearUserState();
    useToast().add({ title: 'Successfully logged out', color: 'info', icon: 'i-lucide-info' })
  }
  return logout;
}
