export const useJobField = () => {
	const jobField = useState<"IT" | "Other">("jobField", () => "IT")

	const isIT = computed(() => jobField.value === "IT")
	const isOther = computed(() => jobField.value === "Other")

	return { jobField, isIT, isOther }
}
