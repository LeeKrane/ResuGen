<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const showCompleteFooter = useShowCompleteFooter()

const showFooter = computed(() => {
  return ['/edit', '/resume'].includes(route.path) && showCompleteFooter.value //  showCompleteFooter.value (true/false) controls visibility for manual toggling
})

watchEffect(() => {
  showCompleteFooter.value = ['/edit', '/resume'].includes(route.path)
})
</script>

<template>
	<div class="flex flex-col">
		<div class="min-h-dvh grid grid-rows-[auto_1fr_auto]">
			<SiteMainHeader/>
			<main class="grow mt-16 mb-32">
				<slot/>
			</main>

			<SiteCompletionFooter v-if="showFooter"/>
		</div>

		<SiteMainFooter/>
	</div>
</template>

<style scoped>

</style>