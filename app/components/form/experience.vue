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
</script>

<template>
	<UForm
		:state="state"
		class="flex flex-col gap-8 m-4">
		<FormInstitutions />

		<UFormField>
			<template
				v-for="(_, index) in state.experience"
				:key="index">
				<USeparator v-if="index === 0" class="mb-7" icon="i-lucide-briefcase" />

				<FormCollapsible :label="(state.experience[index]!.position || state.experience[index]!.institution) ? (state.experience[index]!.position || '?') + ' at ' + (state.institutions.find((i) => i.uuid === state.experience[index]!.institution)!.name || '?') : 'New Experience'" class="my-2">
					<div class="flex flex-col gap-1 not-first:mt-4 mb-4">
						<div class="flex gap-1">
							<FormTooltip text="Institution">
								<USelect
									:items="selectableInstitutions"
									v-model="state.experience[index]!.institution"
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
							<UInput
								v-model="state.experience[index]!.start"
								type="date"
								class="grow"
								variant="soft" />
							<label>until</label>
							<UInput
								v-model="state.experience[index]!.end"
								type="date"
								class="grow"
								variant="soft" />
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
						<div class="flex">
							<div class="grow" />
							<FormClearInputButton :fn="() => { state.experience.splice(index, 1) }" trailing label="Remove Experience" />
						</div>
					</div>
				</FormCollapsible>
			</template>

			<div class="flex">
				<UButton
					label="Add Experience"
					class="mt-2 mx-auto"
					@click="() => { state.experience.push({ position: '', text: '', technologies: [] }) }" />
			</div>
		</UFormField>
	</UForm>
</template>

<style scoped>

</style>