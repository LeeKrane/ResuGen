<script setup lang="ts">
import {CalendarDate, DateFormatter} from "@internationalized/date"

const { label = "Select a date" } = defineProps<{
	label?: string
}>()

const model = defineModel<EmploymentDate | undefined>()
const calendarDate = ref<CalendarDate | undefined>(
	model.value && model.value.year != null && model.value.month != null && model.value.day != null
		? new CalendarDate(model.value.year, model.value.month, model.value.day)
		: undefined
)

watch(calendarDate, (newVal) => {
	model.value = {
		year: newVal?.year ?? undefined,
		month: newVal?.month ?? undefined,
		day: newVal?.day ?? undefined,
	}
})
</script>

<template>
	<UPopover>
		<UFieldGroup class="grow w-full">
			<UButton
				variant="soft"
				color="neutral"
				class="grow"
				icon="i-lucide-calendar"
				:label="model && model.year != null && model.month != null && model.day != null
					? new DateFormatter('de-AT', { dateStyle: 'medium' })
						.format(new Date(model.year, model.month - 1, model.day))
					: label">
			</UButton>

			<FormClearInputButton
				v-if="model"
				:fn="() => { model = undefined }"
				soft
				error/>
		</UFieldGroup>

		<template #content>
			<UCalendar
				v-model="calendarDate"
				class="grow"
				variant="soft"/>
		</template>
	</UPopover>
</template>

<style scoped>

</style>