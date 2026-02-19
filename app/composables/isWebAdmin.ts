export const useIsWebAdmin = async () => {
	if (!useSupabaseUser())
		return null
	return useSupabaseUser().value?.app_metadata.claims_webadmin === true
}