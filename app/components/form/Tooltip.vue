<script setup lang="ts">
const { text, right } = defineProps<{
	text: string
	right?: boolean
}>()
</script>

<template>
	<UTooltip :text :delay-duration="0" :content="{ side: right ? 'right' : 'left' }" arrow>
		<slot />
	</UTooltip>
</template>

<style scoped>

</style>