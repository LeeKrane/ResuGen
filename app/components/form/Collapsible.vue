<script setup lang="ts">
const {label} = defineProps<{
	label: string
}>()
</script>

<template>
	<UCollapsible class="flex flex-col max-w-full" default-open :unmount-on-hide="false">
		<UButton
			class="group"
			:label
			color="neutral"
			variant="subtle"
			trailing-icon="i-lucide-chevron-down"
			:ui="{
				trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200'
			}"
			block
		/>

		<template #content>
			<div class="flex flex-col max-w-full mt-2">
				<slot />
			</div>
		</template>
	</UCollapsible>
</template>

<style scoped>

</style>