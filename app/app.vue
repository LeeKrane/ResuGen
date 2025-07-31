<template>
	<UApp>
		<GeneralParticles class="invert-100 dark:invert-0 print:hidden" />
		<NuxtLayout>
			<NuxtPage />
		</NuxtLayout>
	</UApp>
</template>

<style lang="css">
* {
  transition-property: filter, color, box-shadow, background-color, border-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to, text-color;
  transition-timing-function: var(--default-transition-timing-function); /* z. B. cubic-bezier(0.4, 0, 0.2, 1) */
  transition-duration: 10s; /* z. B. 150ms */
}
</style>