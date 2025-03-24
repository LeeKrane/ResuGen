<script setup lang="ts">
const sideNavOpen = ref(false)

useRouter().beforeEach(() => {
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

		<footer class="print:hidden border-t border-(--ui-border) p-4 bg-(--ui-bg)/75 backdrop-blur-sm">
			<div class="flex flex-col gap-8">
				<div class="grid md:grid-cols-[1fr_auto_1fr] gap-8 max-w-[80rem] mx-auto">
					<!-- First column - About -->
					<div class="flex flex-col gap-4 mx-auto">
						<h3 class="font-semibold text-lg text-center">About ResuGen</h3>
						<div class="flex gap-3 max-w-[60vw] mx-auto">
							<NuxtImg src="/logo.webp" class="w-16 h-16"/>
							<div class="flex flex-col gap-1">
								<p class="text-sm text-gray-600">Modern resume generator focused on simplicity and
									professional design. Built with Nuxt and NuxtUI.</p>
								<p class="text-sm text-gray-500">Made with
									<UIcon name="i-material-symbols-favorite-rounded" class="text-red-500"/>
									by Krane Development
								</p>
							</div>
						</div>
					</div>

					<!-- Second column - Quick Links -->
					<div class="flex flex-col gap-4 mx-auto">
						<h3 class="font-semibold text-lg text-center">Quick Links</h3>
						<UNavigationMenu :items="navItems" orientation="vertical" variant="link" class="mx-auto"/>
					</div>

					<!-- Third column - Resources -->
					<div class="flex flex-col gap-4 mx-auto">
						<h3 class="font-semibold text-lg text-center">Resources</h3>
						<div class="grid grid-cols-2 gap-3">
							<UButton
								to="https://gitlab.com/krane.dev/kranes-resume-generator"
								target="_blank"
								color="neutral"
								variant="ghost"
								class="flex items-center gap-2">
								<UIcon name="i-simple-icons-gitlab" class="w-5 h-5"/>
								<span class="text-sm">GitLab</span>
							</UButton>
							<UButton
								to="/docs"
								color="neutral"
								variant="ghost"
								class="flex items-center gap-2">
								<UIcon name="i-lucide-book-open" class="w-5 h-5"/>
								<span class="text-sm">Documentation</span>
							</UButton>
							<UButton
								to="https://github.com/LeeKrane/kranes-resume-generator"
								target="_blank"
								color="neutral"
								variant="ghost"
								class="flex items-center gap-2">
								<UIcon name="i-simple-icons-github" class="w-5 h-5"/>
								<span class="text-sm">GitHub (Mirror)</span>
							</UButton>
							<UButton
								to="mailto:support+resugen@krane.dev"
								color="neutral"
								variant="ghost"
								class="flex items-center gap-2">
								<UIcon name="i-lucide-mail" class="w-5 h-5"/>
								<span class="text-sm">Contact</span>
							</UButton>
						</div>
					</div>
				</div>

				<div class="flex flex-col items-center gap-2 border-t border-(--ui-border) pt-4">
					<GeneralCopyrightNotice class="text-sm text-gray-500"/>
					<p class="text-xs text-gray-400">Built with Nuxt and NuxtUI</p>
				</div>
			</div>
		</footer>
	</div>
</template>

<style scoped>

</style>