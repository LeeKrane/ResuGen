<script setup lang="ts">
import JSZip from "jszip"

const downloadZip = () => {
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
		institutions: refResumeData.institutions.value,
		education: refResumeData.education.value,
		experience: refResumeData.experience.value,
		projects: refResumeData.projects.value,
		jobField: refResumeData.jobField.value,
		qualifications: refResumeData.qualifications.value,
		coverLetter: refResumeData.coverLetter.value,
	}

	zip.file("resume-data.json", JSON.stringify(completeResumeData, null, 2))
	if (resumeData.avatar)
		zip.file("resume-avatar.webp", resumeData.avatar)
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
	<UFieldGroup>
		<GeneralResumeLoader/>
		<UButton
			class="cursor-pointer"
			label="Export"
			icon="i-material-symbols-file-export-rounded"
			variant="outline"
			loading-auto
			@click="downloadZip"
		/>
	</UFieldGroup>
</template>

<style scoped>

</style>