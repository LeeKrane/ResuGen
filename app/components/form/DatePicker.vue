<script setup lang="ts">
const model = defineModel<Date | undefined>()
</script>

<template>
	<UPopover>
		<UButtonGroup class="grow">
			<UButton
				variant="soft"
				color="neutral"
				class="grow"
				icon="i-lucide-calendar"
				:label="model ? model : 'Select Date'">
			</UButton>

			<FormClearInputButton
				v-if="model"
				:fn="() => { model = undefined }"
				soft
				error />
		</UButtonGroup>

		<template #content>
			<UCalendar
				v-model="model"
				class="grow"
				variant="soft" />
		</template>
	</UPopover>
</template>

<style scoped>

</style>