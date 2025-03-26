<script setup lang="ts">
const resumeData = useRefResumeData()

const completionPercentage = computed(() => {
	const fields = {
		avatar: !!resumeData.avatar.value,
		name: resumeData.name.value?.trim().length > 0,
		subtitle: resumeData.subtitle.value?.trim().length > 0,
		email: resumeData.email.value?.trim().length > 0,
		phone: resumeData.phone.value?.trim().length > 0,
		address: resumeData.address.value?.trim().length > 0,
		summary: resumeData.summary.value?.trim().length > 0,
		education: resumeData.education.value.some(e => e.degree?.trim().length > 0),
		experience: resumeData.experience.value.some(e => e.position?.trim().length > 0),
		languages: resumeData.languages.value.some(l => l.name?.trim().length > 0),
		skillCategories: resumeData.skillCategories.value.some(c => c.name?.trim().length > 0)
	}

	const filledFields = Object.values(fields).filter(Boolean).length
	return Math.round((filledFields / Object.keys(fields).length) * 100)
})
</script>

<template>
	<footer
		class="print:hidden sticky bottom-0 z-50 bg-(--ui-bg)/75 backdrop-blur-xs border-t border-(--ui-border) grid md:grid-cols-[1fr_1fr_1fr] max-md:grid-cols-[1fr_1fr] items-center px-6 py-2">
		<GeneralImportExportMenu class="my-2 mr-auto max-md:hidden"/>
		<div
			class="flex md:flex-col max-md:col-span-2 w-full items-center gap-1 px-8 max-md:pt-4 m-auto max-md:gap-8">
			<span class="text-sm text-gray-500 md:mx-auto">Resume completion</span>
			<div class="flex md:w-full max-md:grow items-center gap-2">
				<UProgress
					v-model="completionPercentage"
					:max="100"
					:value="completionPercentage"
					class="min-w-24 grow"
					size="sm"
				/>
				<span class="text-sm text-gray-500">{{ completionPercentage }}%</span>
			</div>
		</div>
		<GeneralImportExportMenu class="my-2 mr-auto md:hidden"/>
		<GeneralToTopButton class="my-2 ml-auto"/>
	</footer>
</template>

<style scoped>

</style>