export default defineNuxtRouteMiddleware(async (to) => {
	// publich paths
	const publicPrefixes = ['/', '/login', '/register', '/reset-password']
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

	// MFA required - force /mfa and remember target page
	if (mfaRequired && to.path !== '/mfa') {
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