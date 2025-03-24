<script setup lang="ts">
const model = defineModel<object[] | string[]>()
const {label, defaultValueGetter} = defineProps<{
	label: string
	defaultValueGetter: () => object | string
}>()
</script>

<template>
	<div class="flex">
		<UButton
			:label
			variant="soft"
			class="mx-auto cursor-pointer"
			@click="() => { model!.push(defaultValueGetter()) }"/>
	</div>
</template>

<style scoped>

</style>