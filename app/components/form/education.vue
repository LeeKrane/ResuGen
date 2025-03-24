<script setup lang="ts">
const state = reactive({
	institutions: useRefResumeData().institutions,
	education: useRefResumeData().education,
})

const selectableInstitutions = computed(() => state.institutions
	.filter((i) => i.name.length > 0)
	.map((i) => { return { label: i.name, value: i.uuid } })
	.sort((a, b) => a.label.localeCompare(b.label))
)
</script>

<template>
	<UForm
		:state="state"
		class="flex flex-col gap-8 m-4">
		<FormInstitutions />

		<UFormField>
			<template
				v-for="(_, index) in state.education"
				:key="index">

				<USeparator v-if="index === 0" class="mb-7" icon="i-lucide-graduation-cap" />

				<FormCollapsible :label="(state.education[index]!.degree || state.education[index]!.institution) ? (state.education[index]!.degree || '?') + ' at ' + (state.institutions.find((i) => i.uuid === state.education[index]!.institution)!.name || '?') : 'New Education'" class="my-2">
					<div class="flex flex-col gap-1 not-first:mt-4 mb-4">
						<div class="flex gap-1">
							<FormTooltip text="Institution">
								<USelect
									:items="selectableInstitutions"
									v-model="state.education[index]!.institution"
									class="grow"
									variant="soft"
									placeholder="Institution" />
							</FormTooltip>

							<FormTooltip text="Degree" right>
								<UInput
									v-model="state.education[index]!.degree"
									class="grow"
									variant="soft"
									placeholder="Bachelor of Science" />
							</FormTooltip>
						</div>
						<div class="flex items-center gap-1">
							<label>from</label>
							<FormDatePicker v-model="state.education[index]!.start" />
							<label>until</label>
							<FormDatePicker v-model="state.education[index]!.end" />
							<UFormField>
								<UCheckbox
									v-model="state.education[index]!.active"
									label="Active" />
							</UFormField>
						</div>
						<FormTooltip text="Description">
							<UTextarea
								v-model="state.education[index]!.text"
								class="w-full"
								variant="soft"
								placeholder="Graduated with honors..."
								autoresize />
						</FormTooltip>
						<div class="flex">
							<div class="grow" />
							<FormClearInputButton :fn="() => { state.education.splice(index, 1) }" trailing label="Remove Education" />
						</div>
					</div>
				</FormCollapsible>
			</template>

			<div class="flex">
				<UButton
					label="Add Education"
					class="mt-2 mx-auto"
					@click="() => { state.education.push({ degree: '', text: '' }) }" />
			</div>
		</UFormField>
	</UForm>
</template>

<style scoped>

</style>