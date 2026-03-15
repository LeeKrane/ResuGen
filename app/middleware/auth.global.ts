export default defineNuxtRouteMiddleware(async (to) => {
	// publich paths
	const publicPrefixes = ['/', '/login', '/register', '/reset-password', '/about', '/docs']
	const isPublicPath = publicPrefixes.some(p => to.path === p || to.path.startsWith(p + '/'))

	const supabase = useSupabaseClient()
	const user = useSupabaseUser()

	// not logged in - only public allowed
	if (!user.value) {
		if (!isPublicPath) return navigateTo('/login')
		return
	}

	// logged in -> MFA required ?
	const { data, error } =
		await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
	if (error || !data) return

	const mfaRequired = data?.nextLevel === 'aal2' && data?.currentLevel !== 'aal2'
	const is2FASettings = to.path === '/settings/security' || to.path.startsWith('/settings/security/')

	let hasRecoveryWindow = false
	if (mfaRequired && is2FASettings) {
		const res = await $fetch<{ ok: boolean }>('/api/utils/recovery-window')
		hasRecoveryWindow = res.ok
	}

	const allowedWhenMfaRequired =
		to.path === '/' ||
		to.path === '/mfa' ||
		(hasRecoveryWindow && is2FASettings)

	// MFA required - force /mfa and remember target page
	if (mfaRequired && !allowedWhenMfaRequired) {
		return navigateTo({
			path: '/mfa',
			query: { redirect: to.fullPath }
		})
	}
	// MFA not required - keep away from MFA page
	if (!mfaRequired && to.path === '/mfa') {
		return navigateTo('/me')
	}

	// logged in - keep away from login page
	if (!mfaRequired && to.path === '/login') {
		return navigateTo('/me')
	}
})