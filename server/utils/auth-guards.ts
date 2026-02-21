import type { H3Event } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export async function requireUser(event: H3Event) {
    const user = await serverSupabaseUser(event)
    if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    return user
}

export async function requireAAL2IfNeeded(event: H3Event) {
    await requireUser(event)

    // allow recovery-code verified app flag
    if (getCookie(event, 'aal2') === '1') return

    const client = await serverSupabaseClient(event)
    const { data, error } = await client.auth.mfa.getAuthenticatorAssuranceLevel()
    if (error || !data) throw createError({ statusCode: 500, statusMessage: 'Could not check AAL' })

    const mfaRequired = data.nextLevel === 'aal2' && data.currentLevel !== 'aal2'
    if (mfaRequired) {
        throw createError({ statusCode: 403, statusMessage: 'AAL2 required' })
    }
}