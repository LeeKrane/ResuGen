<script setup lang="ts">
const sideNavOpen = ref(false)

useRouter().beforeEach(() => {
	sideNavOpen.value = false
})

const navItems = useNavItems()
</script>

<template>
	<header
		class="print:hidden sticky top-0 z-50 bg-(--ui-bg)/20 backdrop-blur-xs border-b border-(--ui-border) grid md:grid-cols-[1fr_1fr_1fr] max-md:grid-cols-[1fr_1fr] items-center px-4 py-1">
		<GeneralResuGenButton class="justify-self-start"/>

		<UNavigationMenu class="max-md:hidden justify-center" :items="navItems"/>
		<div class="justify-self-end flex items-center gap-2 mr-2">
			<UTooltip
				text="Source Code"
				arrow
				:delay-duration="0">
				<UButton
					color="neutral"
					variant="ghost"
					icon="i-lucide-code"
					to="https://gitlab.com/krane.dev/kranes-resume-generator"
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
</template>

<style scoped>

</style>