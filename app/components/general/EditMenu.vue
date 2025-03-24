<script setup lang="ts">
import JSZip from "jszip"

const downloadZip = () => {
	const resumeData = useResumeData()
	const zip = new JSZip()
	zip.file("resume-data.json", JSON.stringify(resumeData.data, null, 2))
	if (resumeData.avatar)
		zip.file("resume-avatar.webp", resumeData.avatar)
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
	<UButtonGroup>
		<UButton
			label="Generate"
			icon="i-ri-ai-generate"
			to="/resume"
		/>
		<GeneralResumeLoader/>
		<UButton
			class="cursor-pointer"
			label="Export"
			icon="i-material-symbols-file-export-rounded"
			variant="outline"
			loading-auto
			@click="downloadZip"
		/>
	</UButtonGroup>
</template>

<style scoped>

</style>