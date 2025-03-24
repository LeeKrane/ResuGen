<script setup lang="ts">
import {useWindowScroll} from "@vueuse/core"

const hoveringMenuVisible = ref(false)
const { y } = useWindowScroll()

const handleScroll = () => {
	hoveringMenuVisible.value = y.value > 600
}

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

onMounted(() => {
	window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
	window.removeEventListener('scroll', handleScroll)
})

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
	<div class="relative">
		<div
			:class="{ 'opacity-0 invisible': !hoveringMenuVisible }"
			class="flex bg-(--ui-bg-elevated) p-4 fixed top-0 w-full z-50 motion-safe:transition-all">
			<h1 class="font-bold text-2xl text-(--ui-primary) mx-auto">
				Krane's Resume Generator
			</h1>
		</div>

		<div
			:class="{ 'opacity-0 invisible': !hoveringMenuVisible }"
			class="grid md:grid-cols-[1fr_1fr_1fr] max-md:grid-cols-2 bg-(--ui-bg-elevated) fixed bottom-0 w-full z-50 motion-safe:transition-all">
			<GeneralEditMenu class="m-4 mr-auto max-md:hidden" />
			<div class="flex md:flex-col max-md:col-span-2 w-full items-center gap-1 px-8 max-md:pt-4 m-auto max-md:gap-8">
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
			<GeneralEditMenu class="m-4 mr-auto md:hidden" />
			<UButton
				label="Back to top"
				to="#"
				class="m-4 ml-auto"
				icon="i-lucide-chevron-up"
				aria-label="scroll-to-top" />
		</div>

		<div class="flex flex-col items-center justify-center gap-4 h-screen">
			<h1 class="font-bold text-2xl text-(--ui-primary)">
				Krane's Resume Generator
			</h1>

			<div class="flex items-center gap-2">
				<UButton
					label="GitLab"
					color="neutral"
					variant="outline"
					icon="i-simple-icons-gitlab"
					to="https://gitlab.com/krane.dev/kranes-resume-generator"
					target="_blank"
				/>

				<UButton
					label="GitHub (mirror)"
					color="neutral"
					variant="outline"
					icon="i-simple-icons-github"
					to="https://github.com/LeeKrane/kranes-resume-generator"
					target="_blank"
				/>
			</div>

			<GeneralEditMenu />

			<UIcon name="i-lucide-dot" class="text-(--ui-primary)" />

			<UButton
				label="Get started"
				to="#forms"
				icon="i-lucide-square-pen"
				aria-label="scroll-to-forms"
			/>
		</div>

		<div id="forms" class="flex flex-col mx-auto gap-8 px-2 pb-48 w-[clamp(32rem,80vw,80rem)] min-h-[calc(100vh-16rem)]">
			<div class="sticky w-full top-16 pt-4 bg-(--ui-bg) z-40 h-fit">
				<UTabs
					v-model="activeTab"
					:items="tabItems" />
			</div>

			<div :class="activeTab === '0' ? 'block' : 'hidden'">
				<FormGeneral />
			</div>

			<div :class="activeTab === '1' ? 'block' : 'hidden'">
				<FormEducation />
			</div>

			<div :class="activeTab === '2' ? 'block' : 'hidden'">
				<FormExperience />
			</div>

			<div :class="activeTab === '3' ? 'block' : 'hidden'">
				<FormProjects />
			</div>
		</div>
	</div>
</template>
