/**
 * Auth middleware — redirects unauthenticated users to /login.
 * Apply with: definePageMeta({ middleware: 'auth' })
 *
 * Only runs on pages that explicitly opt in via definePageMeta.
 * Does NOT affect 404 routes or public pages.
 */
export default defineNuxtRouteMiddleware((to) => {
  // Only protect known auth-required routes
  const protectedPrefixes = ['/portfolio', '/resumes', '/ai-generate']
  const isProtected = protectedPrefixes.some(p => to.path === p || to.path.startsWith(p + '/'))
  if (!isProtected) return

  if (!useSupabaseUser().value) {
    return navigateTo('/login')
  }
})
