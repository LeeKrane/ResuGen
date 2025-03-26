<script setup lang="ts">
const model = defineModel<object[] | string[]>()
const {label, defaultValueGetter, raw = false} = defineProps<{
	label: string
	defaultValueGetter: () => object | string
	raw?: boolean
}>()
</script>

<template>
	<UButton
		v-if="raw"
		:label
		variant="soft"
		class="mx-auto cursor-pointer"
		@click="() => { model!.push(defaultValueGetter()) }"/>
	<div v-else class="flex">
		<UButton
			:label
			variant="soft"
			class="mx-auto cursor-pointer"
			@click="() => { model!.push(defaultValueGetter()) }"/>
	</div>
</template>

<style scoped>

</style>