<script setup lang="ts">
const predefinedColors = ref([
	{
		label: "Custom",
		value: "custom",
	},
	{
		label: "Slate",
		value: "slate",
		color: "slate-500"
	},
	{
		label: "Gray",
		value: "gray",
		color: "gray-500"
	},
	{
		label: "Zinc",
		value: "zinc",
		color: "zinc-500"
	},
	{
		label: "Blue",
		value: "blue",
		color: "blue-500"
	},
	{
		label: "Indigo",
		value: "indigo",
		color: "indigo-500"
	},
	{
		label: "Purple",
		value: "purple",
		color: "purple-500"
	},
	{
		label: "Emerald",
		value: "emerald",
		color: "emerald-500"
	},
	{
		label: "Teal",
		value: "teal",
		color: "teal-500"
	},
	{
		label: "Sky",
		value: "sky",
		color: "sky-500"
	},
	{
		label: "Rose",
		value: "rose",
		color: "rose-500",
	}
])

const model = defineModel<string>()

const {defaultColor} = defineProps<{
	defaultColor?: string
}>()

const selection = ref<string | undefined>(defaultColor ? predefinedColors.value.find(item => item.value === "custom")?.value : undefined)

function getColor(value: string) {
	return predefinedColors.value.find(item => item.value === value)?.color
}

function resetColor() {
	model.value = defaultColor
	selection.value = defaultColor ? predefinedColors.value.find(item => item.value === "custom")?.value : undefined
}
</script>

<template>
	<div class="flex gap-1">
		<GeneralPlaceholder
			v-if="!selection"
			class="w-8 h-8"/>

		<UPopover v-else-if="selection === 'custom'">
			<UButton
				variant="soft"
				class="w-8 h-8 cursor-pointer text-black"
				icon="i-mage-color-picker"
				:style="{
					backgroundColor: selection === 'custom'
						? model
						: undefined
				}"/>

			<template #content>
				<UColorPicker v-model="model"/>
			</template>
		</UPopover>

		<div
			v-else
			class="w-8 h-8 rounded-md"
			:class="`bg-${getColor(selection ?? 'white')}`"/>

		<USelect
			v-model="selection"
			:items="predefinedColors"
			value-key="value"
			variant="soft"
			class="grow"
			placeholder="Select a color">
		</USelect>

		<FormClearInputButton
			v-if="selection"
			:fn="resetColor"
			icon="i-fluent-arrow-reset-20-filled"
			soft
			error/>
	</div>
</template>

<style scoped>

</style>