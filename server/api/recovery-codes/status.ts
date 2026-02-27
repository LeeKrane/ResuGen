import { supabaseAdmin } from '~~/server/utils/supabaseAdmin'
import { requireUser } from '~~/server/utils/auth-guards'

export default defineEventHandler(async (event) => {
    const user = await requireUser(event)
    const admin = supabaseAdmin()

    const { count, error } = await admin
        .from('recovery_codes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .is('used_at', null)
        .is('revoked_at', null)

    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    return { available: (count ?? 0) > 0, count: count ?? 0 }
})