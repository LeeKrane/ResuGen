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

const computedCollapsableNames = computed(() => state.education
	.map((e) => {
		return (e.degree || e.institution)
			? (e.degree || '?') + ' at ' + (state.institutions.find((i) => i.uuid === e.institution)?.name || '?')
			: undefined
	})
)
</script>

<template>
	<UForm
		:state="state"
		class="flex flex-col gap-8 m-4">
		<FormInstitutions />

		<USeparator icon="i-lucide-graduation-cap" />

		<UFormField>
			<div class="flex flex-col gap-8">
				<div
					class="flex items-center grow gap-1"
					v-for="(_, index) in state.education"
					:key="index">
					<FormCollapsible
						v-model:open="state.education[index]!.collapsibleOpen"
						:label="computedCollapsableNames[index] || 'New Education'"
						class="grow">
						<div class="flex flex-col gap-1">
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
						</div>
					</FormCollapsible>

					<div class="flex h-full items-center">
						<FormModifyButtons
							v-model="state.education"
							:index
							:vertical="state.education[index]!.collapsibleOpen" />
					</div>
				</div>
			</div>

			<div class="flex">
				<UButton
					label="Add Education"
					variant="soft"
					class="mt-1 mx-auto"
					@click="() => { state.education.push({ degree: '', text: '', collapsibleOpen: true }) }" />
			</div>
		</UFormField>
	</UForm>
</template>

<style scoped>

</style>