<script setup lang="ts">
import {useWindowScroll} from "@vueuse/core";

const hoveringMenuVisible = ref(false)
const { y } = useWindowScroll()

const handleScroll = () => {
	hoveringMenuVisible.value = y.value > 600
}

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

		<div id="forms" class="grid grid-cols-1 mx-auto gap-8 px-16 mt-32 mb-48 w-[clamp(28rem,80vw,56rem)] min-h-[75vh]">
			<div class="w-full sticky top-16 z-40 bg-(--ui-bg)">
				<UTabs
					:unmount-on-hide="false"
					:items="tabItems"
					class="mt-4">
					<template #general>
						<FormGeneral />
					</template>
					<template #education>
						<FormEducation />
					</template>
					<template #experience>
						<FormExperience />
					</template>
					<template #projects>
						<FormProjects />
					</template>
				</UTabs>
			</div>
		</div>
	</div>
</template>
