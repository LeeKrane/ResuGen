<script setup lang="ts">
const sideNavOpen = ref(false)

useRouter().beforeEach(() => {
	console.log("AAAA")
	sideNavOpen.value = false
})

const navItems = ref([
	{
		label: "Edit Data",
		icon: "i-lucide-square-pen",
		to: "/edit",
	},
	{
		label: "Resume",
		icon: "i-ri-ai-generate",
		to: "/resume",
	},
	{
		label: "Theming",
		icon: "i-lucide-swatch-book",
		to: "/theming",
	},
	{
		label: "About",
		icon: "i-lucide-info",
		to: "/about",
	},
])

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
	<div class="flex flex-col">
		<div class="min-h-dvh grid grid-rows-[auto_1fr_auto]">
			<header
				class="print:hidden sticky top-0 z-50 bg-(--ui-bg)/75 backdrop-blur-sm border-b border-(--ui-border) grid md:grid-cols-[1fr_1fr_1fr] max-md:grid-cols-[1fr_1fr] items-center px-4 py-1">
				<GeneralResuGenButton class="justify-self-start"/>

				<UNavigationMenu class="max-md:hidden" :items="navItems"/>
				<div class="justify-self-end flex items-center gap-2 mr-2">
					<UTooltip
						text="GitLab"
						arrow
						:delay-duration="0">
						<UButton
							color="neutral"
							variant="ghost"
							icon="i-simple-icons-gitlab"
							to="https://gitlab.com/krane.dev/kranes-resume-generator"
							target="_blank"
						/>
					</UTooltip>

					<UTooltip
						text="GitHub (mirror)"
						arrow
						:delay-duration="0">
						<UButton
							color="neutral"
							variant="ghost"
							icon="i-simple-icons-github"
							to="https://github.com/LeeKrane/kranes-resume-generator"
							target="_blank"
						/>
					</UTooltip>

					<aside class="md:hidden">
						<USlideover
							v-model:open="sideNavOpen"
							title="Navigation">
							<UButton
								color="neutral"
								variant="ghost"
								icon="i-lucide-menu"/>

							<template #body>
								<UNavigationMenu
									:items="navItems"
									class="w-full"
									orientation="vertical"
									@click="sideNavOpen = false"/>
							</template>

							<template #footer>
								<div class="flex items-center justify-center w-full">
									<GeneralCopyrightNotice/>
								</div>
							</template>
						</USlideover>
					</aside>
				</div>
			</header>

			<main class="grow">
				<slot/>
			</main>

			<footer
				class="print:hidden sticky bottom-0 z-50 bg-(--ui-bg)/75 backdrop-blur-sm border-t border-(--ui-border) grid md:grid-cols-[1fr_1fr_1fr] max-md:grid-cols-[1fr_1fr] items-center px-6 py-2">
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
		</div>

		<footer class="print:hidden border-t border-(--ui-border) p-4">
			<div class="flex flex-col gap-2">
				<h1 class="text-2xl text-center mx-auto text-(--ui-primary)">Footer in development...</h1>
				<div class="grid md:grid-cols-3 gap-8 max-w-[80rem] mx-auto">
					<!-- First column -->
					<div class="flex flex-col gap-4">
						<USkeleton class="w-32 h-8"/> <!-- Title -->
						<div class="flex gap-3">
							<USkeleton class="w-12 h-12 rounded-full"/> <!-- Icon/Avatar -->
							<div class="flex flex-col gap-2 flex-1">
								<USkeleton class="w-full h-4"/> <!-- Text line -->
								<USkeleton class="w-2/3 h-4"/> <!-- Shorter text line -->
							</div>
						</div>
					</div>

					<!-- Second column -->
					<div class="flex flex-col gap-4">
						<USkeleton class="w-40 h-8"/> <!-- Title -->
						<div class="flex flex-col gap-2">
							<div class="flex items-center gap-2">
								<USkeleton class="w-6 h-6"/> <!-- Small icon -->
								<USkeleton class="w-3/4 h-4"/> <!-- Text -->
							</div>
							<div class="flex items-center gap-2">
								<USkeleton class="w-6 h-6"/> <!-- Small icon -->
								<USkeleton class="w-2/3 h-4"/> <!-- Text -->
							</div>
							<div class="flex items-center gap-2">
								<USkeleton class="w-6 h-6"/> <!-- Small icon -->
								<USkeleton class="w-4/5 h-4"/> <!-- Text -->
							</div>
						</div>
					</div>

					<!-- Third column -->
					<div class="flex flex-col gap-4">
						<USkeleton class="w-36 h-8"/> <!-- Title -->
						<div class="grid grid-cols-3 gap-3">
							<USkeleton class="w-full h-20 rounded-lg"/> <!-- Image card -->
							<USkeleton class="w-full h-20 rounded-lg"/> <!-- Image card -->
							<USkeleton class="w-full h-20 rounded-lg"/> <!-- Image card -->
						</div>
					</div>
				</div>
				<GeneralCopyrightNotice class="mx-auto"/>
			</div>

		</footer>
	</div>
</template>

<style scoped>

</style>