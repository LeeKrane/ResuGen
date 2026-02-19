/**
 * Auth middleware — redirects unauthenticated users to /login.
 * Apply with: definePageMeta({ middleware: 'auth' })
 */
export default defineNuxtRouteMiddleware(() => {
  if (!useSupabaseUser().value) {
    return navigateTo('/login')
  }
})
