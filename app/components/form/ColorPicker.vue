<script setup lang="ts">
import type {Vector0to7} from "~/composables/rbg2oklch";

const model = defineModel<string>()
const manualColor = ref(model.value?.toUpperCase())
const isManualInput = ref(false)

const {defaultColor} = defineProps<{
	defaultColor?: string
}>()

function resetColor() {
	model.value = defaultColor
}

const manualColorError = computed(() => {
	return !manualColor.value || !manualColor.value.match(/^#([0-9A-F]{6})$/i)
})

let isUpdating = false

function setColor(newVal: string | undefined, source: 'model' | 'manual') {
	if (isUpdating)
		return

	isUpdating = true
	newVal = newVal?.toUpperCase()

	if (newVal === undefined || !newVal.match(/^#([0-9A-F]{6})$/i)) {
		isUpdating = false
		return
	}

	if (source === 'manual' && isManualInput.value)
		model.value = newVal
	else if (source === 'model' && !isManualInput.value)
		manualColor.value = newVal

	isUpdating = false
}

watch(model, (newVal) => setColor(newVal, 'model'))
watch(manualColor, (newVal, oldValue) => {
	if (newVal!.match(/^.*([a-f]+).*$/i)) {
		manualColor.value = newVal!.toUpperCase()
		return
	}
	if (!newVal!.match(/^#([0-9A-F]{0,6})$/i))
		setTimeout(() => manualColor.value = oldValue, 1)
	setColor(newVal, 'manual')
})

const textColor = computed(() => {
	if (!model.value) return '#000000'

	const rgb = model.value.split('').map((c, i) => {
		if (i === 0) return 0
		return parseInt(c, 16)
	})

	return useRGB2OKLCH(rgb as Vector0to7)[0] < 5.0 ? '#FFFFFF' : '#000000'
})
</script>

<template>
	<div class="flex gap-1">
		<UButtonGroup class="grow">
			<UPopover>
				<UButton
					variant="soft"
					class="cursor-pointer grow"
					icon="i-mage-color-picker"
					label="Select Color"
					:style="{
						backgroundColor: model,
						color: textColor
					}"/>

				<template #content>
					<div class="flex flex-col gap-4 p-4 pr-0">
						<UFormField>
							<UColorPicker v-model="model"/>
						</UFormField>
						<UFormField name="manualColor" :error="manualColorError ? 'Invalid color' : undefined">
							<UInput
								v-model="manualColor"
								maxlength="7"
								class="w-[calc(100%-0.75rem)]"
								variant="soft"
								@focus="isManualInput = true"
								@blur="isManualInput = false"/>
						</UFormField>
					</div>
				</template>
			</UPopover>

			<FormClearInputButton
				:fn="resetColor"
				label="Reset"
				:icon="undefined"
				trailing-icon="i-fluent-arrow-reset-20-filled"
				soft
				error/>
		</UButtonGroup>
	</div>
</template>

<style scoped>

</style>