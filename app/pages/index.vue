<script setup lang="ts">
import {useWindowScroll} from "@vueuse/core";

const hoveringMenuVisible = ref(false)
const { y } = useWindowScroll()

const handleScroll = () => {
	hoveringMenuVisible.value = y.value > 600
}

onMounted(() => {
	window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
	window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
	<div class="relative">
		<Transition>
			<div
				:class="{ 'opacity-0 invisible': !hoveringMenuVisible }"
				class="flex bg-(--ui-bg-elevated) p-4 fixed top-0 w-full z-50 motion-safe:transition-all">
				<h1 class="font-bold text-2xl text-(--ui-primary) mx-auto">
					Krane's Resume Generator
				</h1>
			</div>
		</Transition>

		<Transition>
			<UButton
				:class="{ 'opacity-0 invisible': !hoveringMenuVisible }"
				class="fixed right-0 bottom-0 m-4 z-50 motion-safe:transition-all"
				label="Back to top"
				to="#"
				icon="i-lucide-chevron-up"
				aria-label="scroll-to-top" />
		</Transition>

		<Transition>
			<EditMenu
				:class="{ 'opacity-0 invisible': !hoveringMenuVisible }"
				class="fixed left-0 bottom-0 m-4 z-50 motion-safe:transition-all"/>
		</Transition>

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

			<EditMenu />

			<UIcon name="i-lucide-dot" class="text-(--ui-primary)" />

			<UButton
				label="Configure Resume Data"
				to="#forms"
				icon="i-lucide-square-pen"
				aria-label="scroll-to-forms"
			/>
		</div>

		<div id="forms" class="grid grid-cols-1 mx-auto items-center justify-center gap-4 px-16 py-32 w-[clamp(28rem,80vw,56rem)]">
			<h1 class="font-bold text-2xl text-(--ui-primary) mx-auto">
				Resume Data
			</h1>

			<FormCollapsible label="Personal Information">
				<FormPersonalInformation />
			</FormCollapsible>
			<FormCollapsible label="Technical Information">
				<FormTechnicalInformation />
			</FormCollapsible>
		</div>
	</div>
</template>
