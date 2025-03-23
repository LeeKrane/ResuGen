<script setup lang="ts">
import {v7} from "uuid"

const state = reactive({
	institutions: useRefResumeData().institutions,
})

watch(state.institutions, (newVal) => {
	if (newVal.length === 0 || newVal[newVal.length - 1]?.name !== "" || (newVal[newVal.length - 1]?.url && newVal[newVal.length - 1]?.url !== ""))
		state.institutions.push({ uuid: v7(), name: "" })
	else if (newVal.length > 1 && newVal[newVal.length - 2]?.name === "" && newVal[newVal.length - 2]?.url === "")
		state.institutions.pop()
})
</script>

<template>
	<UFormField label="Institutions" description="Needed for Education and Experience">
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
			<FormClearInputButton
				:class="state.institutions[index] && ((state.institutions[index].name && state.institutions[index].name.length > 0) || (state.institutions[index].url && state.institutions[index].url.length > 0)) ? '' : 'invisible'"
				:fn="() => { state.institutions.splice(index, 1) }" />
		</div>
	</UFormField>
</template>

<style scoped>

</style>