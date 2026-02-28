import { hash } from '@node-rs/argon2'
import { supabaseAdmin } from '~~/server/utils/supabaseAdmin'
import { generateRecoveryCodes, normalizeRecoveryCode } from '~~/server/utils/recoveryCodes'
import { requireUser, hasVerifiedTotp } from '~~/server/utils/auth-guards'

export default defineEventHandler(async (event) => {
    const user = await requireUser(event)
    const admin = supabaseAdmin()

    const has2fa = await hasVerifiedTotp(event)
    if (!has2fa) {
        throw createError({ statusCode: 400, statusMessage: 'Enable 2FA first' })
    }

    const { error: delErr } = await admin
        .from('recovery_codes')
        .delete()
        .eq('user_id', user.id)

    if (delErr) throw createError({ statusCode: 500, statusMessage: delErr.message })

    const codes = generateRecoveryCodes(10)
    const rows = await Promise.all(
        codes.map(async (code) => ({
            user_id: user.id,
            code_hash: await hash(normalizeRecoveryCode(code)),
            used_at: null,
            revoked_at: null,
        })),
    )

    const { error: insErr } = await admin.from('recovery_codes').insert(rows)
    if (insErr) throw createError({ statusCode: 500, statusMessage: insErr.message })

    return { codes }
})