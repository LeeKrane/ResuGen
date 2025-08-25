<script setup lang="ts">
import { useWindowScroll } from "@vueuse/core"
const { y } = useWindowScroll()
const visible = computed(() => y.value > 500)
</script>

<template>
	<UButton
		label="Back to top"
		to="#"
		variant="outline"
		:class="{ 'opacity-0 invisible': !visible }"
		class="motion-safe:transition-all"
		icon="i-lucide-chevron-up"
		aria-label="scroll-to-top"/>
</template>

<style scoped>

</style>