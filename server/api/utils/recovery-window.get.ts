import { defineEventHandler, getCookie} from 'h3';

export default defineEventHandler((event) => {
    return { ok: getCookie(event, 'mfa_recovery_window') === '1' }
})