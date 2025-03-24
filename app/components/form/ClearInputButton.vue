<script setup lang="ts">
const { fn, soft, error } = defineProps<{
	fn: () => void
	soft?: boolean
	error?: boolean
}>()
</script>

<template>
	<UButton
		:color="error ? 'error' : 'neutral'"
		class="hover:text-(--ui-error)"
		:variant="soft ? 'soft' : 'link'"
		size="sm"
		icon="i-lucide-trash-2"
		aria-label="clear input"
		@click="fn" />
</template>
