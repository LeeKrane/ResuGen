<script setup lang="ts">
const model = defineModel<any[]>()
const {index, vertical} = defineProps<{
	index: number
	vertical?: boolean
}>()
</script>

<template>
	<UButtonGroup :orientation="vertical ? 'vertical' : 'horizontal' ">
		<slot name="leading"/>
		<UButton
			class="cursor-pointer"
			variant="soft"
			color="neutral"
			:disabled="index === 0"
			icon="i-lucide-chevron-up"
			size="sm"
			aria-label="move up"
			@click="() => { model!.splice(index - 1, 2, model![index]!, model![index - 1]!) }"/>
		<FormClearInputButton
			v-if="vertical"
			:fn="() => { model!.splice(index, 1) }"
			soft
			error/>
		<UButton
			class="cursor-pointer"
			variant="soft"
			color="neutral"
			:disabled="index === model?.length! - 1"
			icon="i-lucide-chevron-down"
			size="sm"
			aria-label="move down"
			@click="() => { model!.splice(index, 2, model![index + 1]!, model![index]!) }"/>
		<FormClearInputButton
			v-if="!vertical"
			:fn="() => { model!.splice(index, 1) }"
			soft
			error/>
		<slot name="trailing"/>
	</UButtonGroup>
</template>

<style scoped>

</style>