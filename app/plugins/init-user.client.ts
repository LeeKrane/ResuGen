export default defineNuxtPlugin(async () => {
  const { loadUserState } = useUserState()
  await loadUserState()
})