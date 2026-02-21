import { verify } from '@node-rs/argon2'
import { normalizeRecoveryCode } from '~/server/utils/recoveryCodes'

export default defineEventHandler(async (event) => {
    const user = await requireUser(event) // user is AAL1-authenticated at this point
    const admin = supabaseAdmin()

    const body = await readBody<{ code?: string }>(event)
    const code = (body.code ?? '').trim()
    if (!code) throw createError({ statusCode: 400, statusMessage: 'Missing code' })

    const normalized = normalizeRecoveryCode(code)

    // load active codes (should be ~10)
    const { data, error } = await admin
        .from('recovery_codes')
        .select('id, code_hash')
        .eq('user_id', user.id)
        .is('used_at', null)
        .is('revoked_at', null)
        .limit(20)

    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    if (!data?.length) return { ok: false }

    // find match
    let matchId: string | null = null
    for (const row of data) {
        if (await verify(row.code_hash, normalized)) {
            matchId = row.id
            break
        }
    }
    if (!matchId) return { ok: false }

    // consume (single-use)
    const { error: updErr } = await admin
        .from('recovery_codes')
        .update({ used_at: new Date().toISOString() })
        .eq('id', matchId)
        .is('used_at', null)
        .is('revoked_at', null)

    if (updErr) throw createError({ statusCode: 500, statusMessage: updErr.message })

    return { ok: true }
})