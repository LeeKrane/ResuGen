<script setup lang="ts">
import {v7} from "uuid"

const state = reactive({
	institutions: useRefResumeData().institutions,
})
</script>

<template>
	<FormCollapsible label="Institutions">
		<div
			v-for="(_, index) in state.institutions"
			:key="index"
			class="flex gap-1 my-1">
			<FormTooltip text="Name">
				<UInput
					v-model="state.institutions[index]!.name"
					class="w-full"
					variant="soft"
					placeholder="Harvard University" />
			</FormTooltip>
			<FormTooltip text="URL" right>
				<UInput
					v-model="state.institutions[index]!.url!"
					class="w-full"
					variant="soft"
					placeholder="https://example.com/" />
			</FormTooltip>
			<FormModifyButtons
				v-model="state.institutions"
				:index />
		</div>
		<div class="w-full flex">
			<UButton
				label="Add Institution"
				variant="soft"
				class="mx-auto"
				@click="() => { state.institutions.push({ uuid: v7(), name: '' }) }" />
		</div>
	</FormCollapsible>
</template>

<style scoped>

</style>