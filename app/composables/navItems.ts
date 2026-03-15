export const useNavItems = () => {
	const user = useSupabaseUser()

	// Auth-gated items only shown when logged in
	const authItems = computed(() => user.value ? [
		{
			label: "Portfolio",
			icon: "i-lucide-user",
			to: "/portfolio",
		},
		{
			label: "Resumes",
			icon: "i-lucide-file-text",
			to: "/resumes",
		},
		{
			label: "AI Generate",
			icon: "i-ri-ai-generate",
			to: "/ai-generate",
		},
	] : [])

	// Always-visible items
	const publicItems = [
		{
			label: "About",
			icon: "i-lucide-info",
			to: "/about",
		},
		{
			label: "Docs",
			icon: "i-lucide-book-open",
			to: "/docs",
		},
	]

	return computed(() => [...authItems.value, ...publicItems])
}
