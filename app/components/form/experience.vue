<script setup lang="ts">
const state = reactive({
	institutions: useRefResumeData().institutions,
	experience: useRefResumeData().experience,
})

const selectableInstitutions = computed(() => state.institutions
	.filter((i) => i.name.length > 0)
	.map((i) => { return { label: i.name, value: i.uuid } })
	.sort((a, b) => a.label.localeCompare(b.label))
)

const computedCollapsableNames = computed(() => state.experience
	.map((e) => {
		return (e.position || e.institution)
			? (e.position || '?') + ' at ' + (state.institutions.find((i) => i.uuid === e.institution)?.name || '?')
			: undefined
	})
)
</script>

<template>
	<UForm
		:state="state"
		class="flex flex-col gap-8 m-4">
		<FormInstitutions />

		<USeparator icon="i-lucide-briefcase" />

		<UFormField>
			<div class="flex flex-col gap-8">
				<div
					v-for="(_, index) in state.experience"
					:key="index"
					class="flex items-center grow gap-1">
					<FormCollapsible
						v-model:open="state.experience[index]!.collapsibleOpen"
						:label="computedCollapsableNames[index] || 'New Experience'"
						class="grow">
						<div class="flex flex-col gap-1">
							<div class="flex gap-1">
								<FormTooltip text="Institution">
									<USelect
										v-model="state.experience[index]!.institution"
										:items="selectableInstitutions"
										class="grow"
										variant="soft"
										placeholder="Institution" />
								</FormTooltip>

								<FormTooltip text="Position" right>
									<UInput
										v-model="state.experience[index]!.position"
										class="grow"
										variant="soft"
										placeholder="Software Engineer" />
								</FormTooltip>
							</div>
							<div class="flex items-center gap-1">
								<label>from</label>
								<FormDatePicker v-model="state.experience[index]!.start" />
								<label>until</label>
								<FormDatePicker v-model="state.experience[index]!.end" />
								<UFormField>
									<UCheckbox
										v-model="state.experience[index]!.active"
										label="Active" />
								</UFormField>
							</div>
							<FormTooltip text="Description">
								<UTextarea
									v-model="state.experience[index]!.text"
									class="w-full"
									variant="soft"
									placeholder="Developed a web application..."
									autoresize />
							</FormTooltip>
							<div class="flex items-center gap-1">
								<FormTechSelectMenu v-model="state.experience[index]!.technologies" class="grow" />
								<UFormField>
									<FormClearInputButton :fn="() => { state.experience[index]!.technologies = [] }" trailing label="Clear Technologies" />
								</UFormField>
								<UFormField>
									<UCheckbox v-model="state.experience[index]!.internship" label="Internship" />
								</UFormField>
							</div>
							<div
								v-if="state.experience[index]!.technologies.length > 0"
								class="flex flex-wrap gap-1">
								<UIcon
									v-for="(t, tIndex) in state.experience[index]!.technologies"
									:key="tIndex"
									:name="t.icon" />
							</div>
						</div>
					</FormCollapsible>

					<div class="flex h-full items-center">
						<FormModifyButtons
							v-model="state.experience"
							:index
							:vertical="state.experience[index]!.collapsibleOpen ?? true" />
					</div>
				</div>
			</div>

			<FormAddButton
				v-model="state.experience"
				class="mt-1"
				label="Add Experience"
				:default-value-getter="() =>{  return ({ position: '', text: '', collapsibleOpen: true, technologies: [] }) }"/>
		</UFormField>
	</UForm>
</template>

<style scoped>

</style>