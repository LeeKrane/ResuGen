<script setup lang="ts">
const { fn } = defineProps<{
	fn: () => void
}>()
</script>

<template>
	<UButton
		color="neutral"
		class="hover:text-(--ui-error)"
		variant="link"
		size="sm"
		icon="i-lucide-trash-2"
		aria-label="clear input"
		@click="fn" />
</template>
