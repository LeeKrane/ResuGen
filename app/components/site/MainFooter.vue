<script setup lang="ts">
const navItems = useNavItems()
</script>

<template>
	<footer class="print:hidden border-t border-(--ui-border) p-4 bg-(--ui-bg)/75 backdrop-blur-xs">
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
							to="https://github.com/LeeKrane/kranes-resume-generator"
							target="_blank"
							color="neutral"
							variant="ghost"
							class="flex items-center gap-2">
							<UIcon name="i-simple-icons-github" class="w-5 h-5"/>
							<span class="text-sm">GitHub (Mirror)</span>
						</UButton>
						<UButton
							to="/docs"
							color="neutral"
							variant="ghost"
							class="flex items-center gap-2">
							<UIcon name="i-lucide-presentation" class="w-5 h-5"/>
							<span class="text-sm">Demo</span>
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
</template>

<style scoped>

</style>