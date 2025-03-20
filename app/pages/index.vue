<script setup lang="ts">
import {useWindowScroll} from "@vueuse/core";

const forms = ref<HTMLDivElement>()

const hoveringMenuVisible = ref(false)
const { y } = useWindowScroll()

const handleScroll = () => {
	hoveringMenuVisible.value = y.value > 500
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
			<UButton
				:class="{ 'opacity-0 invisible': !hoveringMenuVisible }"
				class="fixed right-0 bottom-0 m-4 z-50 motion-safe:transition-all"
				as="a"
				label="to top"
				icon="i-lucide-arrow-up-from-dot"
				aria-label="scroll-to-top"
				href="#" />
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

			<div>
				<EditMenu />
			</div>
		</div>

		<div ref="forms" class="grid grid-cols-1 mx-auto items-center justify-center gap-4 p-16 w-[clamp(28rem,80vw,56rem)]">
			<FormCollapsible label="Personal Information">
				<FormPersonalInformation />
			</FormCollapsible>
			<FormCollapsible label="Technical Information">
				<FormTechnicalInformation />
			</FormCollapsible>
		</div>
	</div>
</template>
