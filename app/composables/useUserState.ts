import { useState } from "#app"
import { useSupabaseClient, useSupabaseUser } from "#imports"
import type { User } from '@supabase/supabase-js';

interface AuthState {
  uid: string | null
  role: string | null

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

  rawappMetadata: object | null
  rawuserMetadata: object | null

  createdAt: string | null
  updatedAt: string | null

  // Our own Information
  username: string | null
  fullName: string | null
  firstName: string | null
  lastName: string | null
  avatarUrl: string | null
  picture: string | null
}

export const useUserState =  () => {
  const supabase = useSupabaseClient()

  const userState = useState<AuthState>("userState", () => ({
    uid: null,
    role: null,

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

    rawappMetadata: null,
    rawuserMetadata: null,

    createdAt: null,
    updatedAt: null,

    // Our own Information
    username: null,
    fullName: null,
    firstName: null,
    lastName: null,
    avatarUrl: null,
    picture: null
  }))

  const setUserState = (user: User | null) => {
    userState.value = {
      uid: user?.id || null,
      role: user?.role || null,
      confirmed: !!user?.confirmed_at,
      confirmedAt: user?.confirmed_at || null,
      email: user?.email || null,
      emailConfirmed: !!user?.email_confirmed_at,
      emailConfirmedAt: user?.email_confirmed_at || null,
      phone: user?.phone || null,
      phoneConfirmed: !!user?.phone_confirmed_at,
      phoneConfirmedAt: user?.phone_confirmed_at || null,
      recoverySentAt: user?.recovery_sent_at || null,
      lastSignIn: user?.last_sign_in_at || null,
      rawappMetadata: user?.app_metadata || null,
      rawuserMetadata: user?.user_metadata || null,
      createdAt: user?.created_at || null,
      updatedAt: user?.updated_at || null,
      username: (user?.user_metadata?.username as string) || null,
      fullName: (user?.user_metadata?.full_name as string) || null,
      firstName: (user?.user_metadata?.first_name as string) || null,
      lastName: (user?.user_metadata?.last_name as string) || null,
      avatarUrl: (user?.user_metadata?.avatar_url as string) || null,
      picture: (user?.user_metadata?.picture as string) || null,
    }
  }

  const loadUserState = async () => {
    const {data: { user }} = await supabase.auth.getUser();
    setUserState(user)
  }

  loadUserState();

  return {
    userState,
    setUserState,
    loadUserState
  };
}
