export const useIsWebAdmin = (): boolean => {
	const user = useSupabaseUser()
	if (!user.value) return false
	return user.value.app_metadata?.claims_webadmin === true
}
