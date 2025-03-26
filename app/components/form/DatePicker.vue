<script setup lang="ts">
import {CalendarDate, DateFormatter} from "@internationalized/date"

const model = defineModel<EmploymentDate | undefined>()
const calendarDate = ref<CalendarDate | undefined>(
	model.value
		? new CalendarDate(model.value.year ?? 0, model.value.month ?? 0, model.value.day ?? 0)
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
		<UButtonGroup class="grow w-full">
			<UButton
				variant="soft"
				color="neutral"
				class="grow"
				icon="i-lucide-calendar"
				:label="model
					? new DateFormatter('de-AT', { dateStyle: 'medium' })
						.format(new Date(model.year!, model.month! - 1, model.day!))
					: 'Select a date'">
			</UButton>

			<FormClearInputButton
				v-if="model"
				:fn="() => { model = undefined }"
				soft
				error/>
		</UButtonGroup>

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