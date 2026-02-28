import { supabaseAdmin } from '~~/server/utils/supabaseAdmin'
import { generateRecoveryCodes, normalizeRecoveryCode } from '~~/server/utils/recoveryCodes'
import { hash } from '@node-rs/argon2'
import { requireUser, hasVerifiedTotp} from '~~/server/utils/auth-guards'

export default defineEventHandler(async (event) => {
    const user = await requireUser(event) // implement like your auth guard (from session)
    const admin = supabaseAdmin()

    const has2fa = await hasVerifiedTotp(event)
    if (!has2fa) {
        throw createError({ statusCode: 400, statusMessage: 'Enable 2FA first' })
    }

    // 2) Prevent generating if active codes already exist
    const { data: existing } = await admin
        .from('recovery_codes')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .is('used_at', null)
        .is('revoked_at', null)

    if ((existing as any)?.length) {
        throw createError({ statusCode: 409, statusMessage: 'Recovery codes already exist' })
    }

    // 3) Create batch
    const batchId = crypto.randomUUID()
    const codes = generateRecoveryCodes(10)

    // 4) Hash & insert
    const rows = await Promise.all(
        codes.map(async (code) => ({
            user_id: user.id,
            batch_id: batchId,
            code_hash: await hash(normalizeRecoveryCode(code)),
        })),
    )

    const { error } = await admin.from('recovery_codes').insert(rows)
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })

    // 5) Return plaintext codes ONCE
    return { codes }
})