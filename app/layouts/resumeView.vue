<script setup lang="ts">

</script>

<template>
	<div class="flex flex-col">
		<div class="min-h-dvh grid grid-rows-[auto_1fr_auto]">
			<SiteMainHeader/>

			<main class="grow mb-16">
				<slot/>
			</main>

			<SiteCompletionFooter/>
		</div>

		<SiteMainFooter/>
	</div>
</template>

<style scoped>

</style>