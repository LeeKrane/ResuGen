export default defineEventHandler(async (event) => {
    const user = await requireUser(event)
    const admin = supabaseAdmin()

    // revoke all old (used or unused doesn’t matter)
    await admin
        .from('recovery_codes')
        .update({ revoked_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .is('revoked_at', null)

    // then call same logic as generate
    // (you can refactor into a shared function)
    // return { codes }
})