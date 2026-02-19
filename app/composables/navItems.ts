export const useNavItems = () => {
	return useState("navItems", () => [
		{
			label: "Edit Data",
			icon: "i-lucide-square-pen",
			to: "/edit",
		},
		{
			label: "Resume",
			icon: "i-ri-ai-generate",
			to: "/resume",
		},
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
	])
}
