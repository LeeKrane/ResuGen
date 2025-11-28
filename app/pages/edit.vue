<script setup lang="ts">
definePageMeta({
	layout: "data-edit"
})

const { isIT } = useJobField()
const activeTab = ref("0")

const tabItems = computed(() => {
	const baseTabs = [
		{
			label: "General",
			icon: "i-lucide-user",
			slot: "general",
		},
		{
			label: "Cover Letter",
			icon: "i-lucide-file-text",
			slot: "cover-letter",
		},
		{
			label: "Education",
			icon: "i-lucide-graduation-cap",
			slot: "education",
		},
		{
			label: "Experience",
			icon: "i-lucide-briefcase",
			slot: "experience",
		},
	]

	// Add Projects tab only for IT field
	if (isIT.value) {
		baseTabs.push({
			label: "Projects",
			icon: "i-lucide-code",
			slot: "projects",
		})
	}

	return baseTabs
})
</script>

<template>
	<div>
		<div class="flex flex-col mx-auto w-[clamp(24rem,65vw,56rem)]">
			<FormJobFieldSelector/>
		</div>

		<div class="sticky top-16 w-full z-40 flex justify-center">
			<UTabs
				v-model="activeTab"
				class="mx-auto w-[clamp(24rem,65vw,56rem)] bg-(--ui-bg)/20 backdrop-blur-xs pt-2"
				color="neutral"
				variant="pill"
				:items="tabItems"/>
		</div>

		<div class="flex flex-col mx-auto w-[clamp(24rem,65vw,56rem)]">
			<div :class="activeTab === '0' ? 'block' : 'hidden'">
				<FormGeneral/>
			</div>

			<div :class="activeTab === '1' ? 'block' : 'hidden'">
				<FormCoverLetter/>
			</div>

			<div :class="activeTab === '2' ? 'block' : 'hidden'">
				<FormEducation/>
			</div>

			<div :class="activeTab === '3' ? 'block' : 'hidden'">
				<FormExperience/>
			</div>

			<div v-if="isIT" :class="activeTab === '4' ? 'block' : 'hidden'">
				<FormProjects/>
			</div>
		</div>
	</div>
</template>

<style scoped>

</style>