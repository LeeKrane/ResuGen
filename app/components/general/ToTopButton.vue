<script setup lang="ts">
import {useWindowScroll} from "@vueuse/core"

const visible = ref(false)
const {y} = useWindowScroll()

const handleScroll = () => {
	visible.value = y.value > 500
}

onMounted(() => {
	window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
	window.removeEventListener('scroll', handleScroll)
})
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