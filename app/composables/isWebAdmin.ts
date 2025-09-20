export const useIsWebAdmin = async () => {
	if (!useSupabaseUser())
		return null
	return useSupabaseClient().rpc("get_my_claim", {"claims_webadmin"})
}