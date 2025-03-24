<script setup lang="ts">
const activeTab = ref("0")
const tabItems = [
	{
		label: "General",
		icon: "i-lucide-user",
		slot: "general",
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
	{
		label: "Projects",
		icon: "i-lucide-code",
		slot: "projects",
	},
	{
		label: "Colors",
		icon: "i-lucide-palette",
		slot: "colors",
	}
]
</script>

<template>
	<div>
		<div class="sticky top-[4.3rem] w-full z-40 bg-(--ui-bg) flex justify-center pt-2">
			<UTabs
				v-model="activeTab"
				class="mx-auto w-[clamp(36rem,60vw,56rem)]"
				color="neutral"
				variant="pill"
				:items="tabItems"/>
		</div>

		<div class="flex flex-col mx-auto w-[clamp(28rem,60vw,56rem)]">
			<div :class="activeTab === '0' ? 'block' : 'hidden'">
				<FormGeneral/>
			</div>

			<div :class="activeTab === '1' ? 'block' : 'hidden'">
				<FormEducation/>
			</div>

			<div :class="activeTab === '2' ? 'block' : 'hidden'">
				<FormExperience/>
			</div>

			<div :class="activeTab === '3' ? 'block' : 'hidden'">
				<FormProjects/>
			</div>
		</div>
	</div>
</template>

<style scoped>

</style>