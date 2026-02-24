/**
 * Auth middleware redirects unauthenticated users to /login.
 * Apply with: definePageMeta({ middleware: 'auth' })
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
