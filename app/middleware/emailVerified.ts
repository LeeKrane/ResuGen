export default defineNuxtRouteMiddleware(() => {
	if (useSupabaseUser().value && !useSupabaseUser().value?.email_confirmed_at) {
		return navigateTo('/verify')
	}
})