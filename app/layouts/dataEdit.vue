<script setup lang="ts">

</script>

<template>
	<div class="flex flex-col">
		<GeneralParticles/>

		<div class="min-h-dvh grid grid-rows-[auto_1fr_auto]">
			<SiteMainHeader/>

			<main class="grow mt-16 mb-32">
				<slot/>
			</main>

			<SiteCompletionFooter/>
		</div>

		<SiteMainFooter/>
	</div>
</template>

<style scoped>

</style>