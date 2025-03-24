<script setup lang="ts">
import {useWindowScroll} from "@vueuse/core";

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
			class="flex bg-(--ui-bg-elevated) p-4 fixed bottom-0 w-full z-50 motion-safe:transition-all">
			<GeneralEditMenu />
			<div class="grow" />
			<UButton
				label="Back to top"
				to="#"
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

		<div id="forms" class="flex flex-col mx-auto gap-8 px-16 pb-48 w-[clamp(28rem,80vw,56rem)] min-h-[calc(100vh-16rem)]">
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
