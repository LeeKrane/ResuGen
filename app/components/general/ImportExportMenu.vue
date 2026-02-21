<script setup lang="ts">
import JSZip from "jszip"

const downloadZip = async () => {
	const resumeData = useResumeData()
	const resumeStyle = useResumeStyle()
	const { coverLetter, hasCoverLetter } = useCoverLetter()
	const refResumeData = useRefResumeData()
	const zip = new JSZip()

	// Create complete resume data object with current state values
	const completeResumeData = {
		name: refResumeData.name.value,
		subtitle: refResumeData.subtitle.value,
		email: refResumeData.email.value,
		birthdate: refResumeData.birthdate.value,
		phone: refResumeData.phone.value,
		address: refResumeData.address.value,
		summary: refResumeData.summary.value,
		hobbies: refResumeData.hobbies.value,
		languages: refResumeData.languages.value,
		skillCategories: refResumeData.skillCategories.value,
		links: refResumeData.links.value,
		educationInstitutions: refResumeData.educationInstitutions.value,
		experienceInstitutions: refResumeData.experienceInstitutions.value,
		education: refResumeData.education.value,
		experience: refResumeData.experience.value,
		projects: refResumeData.projects.value,
		jobField: refResumeData.jobField.value,
		qualifications: refResumeData.qualifications.value,
		coverLetter: refResumeData.coverLetter.value,
	}

	zip.file("resume-data.json", JSON.stringify(completeResumeData, null, 2))

	// Avatar: prefer the File object (freshly uploaded), fall back to the previewImage
	// data URI (set when a resume is loaded from DB).
	if (resumeData.avatar) {
		zip.file("resume-avatar.webp", resumeData.avatar)
	} else {
		const previewImage = useState<string | null>('previewImage')
		if (previewImage.value) {
			const match = previewImage.value.match(/^data:([^;]+);base64,(.+)$/)
			if (match) {
				const binary = atob(match[2]!)
				const bytes = new Uint8Array(binary.length)
				for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
				zip.file("resume-avatar.webp", bytes)
			}
		}
	}
	zip.file("resume-style.json", JSON.stringify({
		font: resumeStyle.value.font,
		colors: resumeStyle.value.colors,
		effects: resumeStyle.value.effects,
		layout: resumeStyle.value.layout,
		sections: resumeStyle.value.sections,
	}, null, 2))
	
	// Add cover letter data as separate file when it exists
	if (hasCoverLetter.value) {
		zip.file("cover-letter.json", JSON.stringify(coverLetter.value, null, 2))
	}
	
	zip.generateAsync({type: "blob"}).then((blob) => {
		const url = URL.createObjectURL(blob)
		const a = document.createElement("a")
		a.href = url
		a.download = `resume-export-${new Date().toISOString()}.zip`
		a.click()
		document.body.removeChild(a)
		URL.revokeObjectURL(url)
	})
}
</script>

<template>
	<UButton
		class="cursor-pointer"
		label="Export"
		icon="i-material-symbols-file-export-rounded"
		variant="outline"
		loading-auto
		@click="downloadZip"
	/>
</template>

<style scoped>

</style>