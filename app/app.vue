<template>
	<UApp>
		<GeneralParticles class="invert-100 dark:invert-0 print:hidden" />
		<NuxtLayout>
			<NuxtPage />
		</NuxtLayout>
	</UApp>
</template>

<style lang="css">
*, ::before, ::after {
transition-property: filter, color, box-shadow, background-color, border-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to;
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
transition-duration: 250ms;
}
</style> 