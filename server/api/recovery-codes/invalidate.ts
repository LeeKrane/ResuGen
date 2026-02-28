export default defineEventHandler(async (event) => {
    const user = await requireUser(event)
    const admin = supabaseAdmin()

    const { error } = await admin
        .from('recovery_codes')
        .delete()
        .eq('user_id', user.id)

    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    return { ok: true }
})