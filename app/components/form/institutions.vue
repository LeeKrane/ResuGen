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

		<FormAddButton
			v-model="state.institutions"
			label="Add Institution"
			:default-value-getter="() =>{  return ({ uuid: v7(), name: '' }) }"/>
	</FormCollapsible>
</template>

<style scoped>

</style>