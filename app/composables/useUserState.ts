import { useSupabaseClient, useSupabaseUser } from '#imports'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  uid: string | null

  confirmed: boolean
  confirmedAt: string | null

  email: string | null
  emailConfirmed: boolean
  emailConfirmedAt: string | null

  phone: string | null
  phoneConfirmed: boolean
  phoneConfirmedAt: string | null

  recoverySentAt: string | null
  lastSignIn: string | null

  rawAppMetadata: object | null
  rawUserMetadata: object | null

  createdAt: string | null
  updatedAt: string | null

  // Our own User information
  username: string | null
  fullName: string | null
  firstName: string | null
  lastName: string | null
  avatarUrl: string | null
  picture: string | null
}

export const useUserState = () => {
  const supabase = useSupabaseClient()
  const supabaseUser = useSupabaseUser()

  const userState = useState<AuthState>('userState', () => ({
    uid: null,

    confirmed: false,
    confirmedAt: null,

    email: null,
    emailConfirmed: false,
    emailConfirmedAt: null,

    phone: null,
    phoneConfirmed: false,
    phoneConfirmedAt: null,

    recoverySentAt: null,
    lastSignIn: null,

    rawAppMetadata: null,
    rawUserMetadata: null,

    createdAt: null,
    updatedAt: null,

    username: null,
    fullName: null,
    firstName: null,
    lastName: null,
    avatarUrl: null,
    picture: null,
  }))

  const setUserState = (user: User | null) => {
    userState.value = {
      uid: user?.id || null,

      confirmed: !!user?.confirmed_at,
      confirmedAt: user?.confirmed_at || null,

      email: user?.email || null,
      emailConfirmed: !!user?.email_confirmed_at,
      emailConfirmedAt: user?.email_confirmed_at || null,

      phone: user?.phone || null,
      phoneConfirmed: !!user?.phone_confirmed_at,
      phoneConfirmedAt: user?.phone_confirmed_at || null,

      recoverySentAt: (user as any)?.recovery_sent_at || null,
      lastSignIn: user?.last_sign_in_at || null,

      rawAppMetadata: user?.app_metadata || null,
      rawUserMetadata: user?.user_metadata || null,

      createdAt: user?.created_at || null,
      updatedAt: user?.updated_at || null,

      username: user?.user_metadata?.username ?? null,
      fullName: user?.user_metadata?.full_name ?? null,
      firstName: user?.user_metadata?.first_name ?? null,
      lastName: user?.user_metadata?.last_name ?? null,

      avatarUrl: user?.user_metadata?.avatar_url ?? null,
      picture: user?.user_metadata?.picture ?? null,
    }
  }


  /**
   * Clear state
   */
  const clearUserState = () => {
    setUserState(null)
  }

  /**
   * Load user
   */
  const loadUserState = async () => {
    if (userState.value.uid !== null) return userState.value

    const { data, error } = await supabase.auth.getUser()
    if (!error) setUserState(data.user)
    return userState.value
  }

  /**
   * Keep state in sync with `useSupabaseUser`
   */
  watch(
    supabaseUser,
    (newUser) => {
      setUserState(newUser)
    },
    { immediate: true }
  )

  return {
    userState,
    setUserState,
    clearUserState,
    loadUserState,
  }
}
