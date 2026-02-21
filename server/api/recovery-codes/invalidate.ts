export default defineEventHandler(async (event) => {
    const user = await requireUser(event)
    const admin = supabaseAdmin()

    const { error } = await admin
        .from('recovery_codes')
        .update({ revoked_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .is('revoked_at', null)

    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    return { ok: true }
})