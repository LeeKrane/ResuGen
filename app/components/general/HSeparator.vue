<script setup lang="ts">
const { icon, label, elevated } = defineProps<{
	icon?: string
	label?: string
	elevated?: boolean
}>()

const style = useResumeStyle()
</script>

<template>
	<div
			:style="{
				color: elevated
						? style.colors.text.sectionTitleElevated
						: style.colors.text.sectionTitle,
			}"
			class="flex items-center gap-1">
		<hr class="grow">
		<UIcon
				v-if="icon"
				:name="icon"
				:size="style.font.titleSizes.h3 * 1.5"/>
		<h3
				v-if="label"
				class="font-bold"
				:style="{
					fontSize: `${style.font.titleSizes.h3}pt`,
				}">
			{{ label }}
		</h3>
		<hr v-if="icon || label" class="grow">
	</div>
</template>

<style scoped>

</style>