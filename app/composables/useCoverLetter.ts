export const useCoverLetter = () => {
	const coverLetter = useState("coverLetter", () => ({
		content: "",
		recipientName: "",
		companyName: "",
		position: ""
	}))

	const hasCoverLetter = computed(() => 
		coverLetter.value.content.trim().length > 0
	)

	return { 
		coverLetter, 
		hasCoverLetter 
	}
}
