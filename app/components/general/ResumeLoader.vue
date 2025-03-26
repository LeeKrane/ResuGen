<script setup lang="ts">
import JSZip from "jszip"

const open = ref(false)
const state = useRefResumeData()
const errorMessage = ref<string | null>(null)
const disabled = ref(false)

async function onFileChange(event) {
	const file = event.target.files[0];
	if (!file)
		return

	disabled.value = true
	errorMessage.value = null

	try {
		const zip = new JSZip()
		const loadedZip = await zip.loadAsync(file)
		let resumeData: ResumeData

		// Extract resume-data.json
		const jsonData = await loadedZip.file('resume-data.json')?.async('string');
		if (jsonData) {
			try {
				resumeData = JSON.parse(jsonData)
			} catch (error) {
				errorMessage.value = 'Error parsing resume-data.json'
				disabled.value = false
				return
			}
		} else {
			errorMessage.value = 'resume-data.json not found in the zip file.'
			disabled.value = false
			return
		}

		// Extract resume-avatar.webp
		const avatarBlob = await loadedZip.file('resume-avatar.webp')?.async('blob');

		// Update state with validated data
		state.name.value = resumeData.name
		state.subtitle.value = resumeData.subtitle
		state.email.value = resumeData.email
		state.phone.value = resumeData.phone
		state.address.value = resumeData.address
		state.summary.value = resumeData.summary
		state.hobbies.value = resumeData.hobbies
		state.languages.value = resumeData.languages
		state.skillCategories.value = resumeData.skillCategories
		state.links.value = resumeData.links
		state.institutions.value = resumeData.institutions
		state.education.value = resumeData.education
		state.experience.value = resumeData.experience
		state.projects.value = resumeData.projects

		if (avatarBlob) {
			useRefreshAvatar(new File([avatarBlob], "avatar.webp", {type: "image/webp"}))
		}
	} catch (error) {
		errorMessage.value = 'Error reading the zip file: ' + error.message;
		console.error('Error reading zip file:', error);
		disabled.value = false
	}

	disabled.value = false
	open.value = false
}
</script>

<template>
	<UModal v-model:open="open"
			title="Load data from file">
		<UButton
			class="cursor-pointer"
			label="Import"
			icon="i-material-symbols-upload-file"
			variant="outline"
		/>

		<template #content>
			<UForm
				:state="state"
				@submit.prevent="onFileChange"
				class="flex flex-col items-center justify-center gap-4 p-16">
				<UFormField label="Resume data" name="resumeData" :error="errorMessage">
					<UInput type="file" accept=".zip" @change="onFileChange" :disabled="disabled"/>
				</UFormField>
			</UForm>
		</template>
	</UModal>
</template>

<style scoped>

</style>