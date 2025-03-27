<script setup lang="ts">

</script>

<template>
	<div class="flex flex-col">
		<div class="min-h-dvh grid grid-rows-[auto_1fr]">
			<SiteMainHeader/>

			<main class="grow mt-16 mb-32">
				<slot/>
			</main>
		</div>

		<SiteMainFooter/>
	</div>
</template>

<style scoped>

</style>