<script setup lang="ts">
const state = reactive({
	projects: useRefResumeData().projects,
})
</script>

<template>
	<UForm
		:state="state"
		class="flex flex-col gap-8 m-4">
		<UFormField>
			<div class="flex flex-col gap-8">
				<div
					v-for="(_, index) in state.projects"
					:key="index"
					class="flex items-center grow gap-1">
					<FormCollapsible
						v-model:open="state.projects[index]!.collapsibleOpen"
						:label="state.projects[index]!.name || 'New Project'"
						class="grow">
						<div class="flex flex-col gap-1">
							<div class="flex items-center gap-1">
								<FormTooltip text="Name">
									<UInput
										v-model="state.projects[index]!.name"
										class="grow"
										variant="soft"
										placeholder="Project Name" />
								</FormTooltip>
								<UFormField>
									<UCheckbox v-model="state.projects[index]!.openSource" label="Open Source" />
								</UFormField>
							</div>
							<FormTooltip text="URL">
								<UInput
									v-model="state.projects[index]!.url!"
									class="grow"
									variant="soft"
									placeholder="https://example.com/" />
							</FormTooltip>
							<FormTooltip text="Repository">
								<div class="flex gap-1">
									<FormTechSelectMenu git-platforms-only placeholder="Repository Platform" single />
									<UInput
										v-model="state.projects[index]!.repoLink!.url!"
										class="grow"
										variant="soft"
										placeholder="https://github.com/example/repo.git" />
								</div>
							</FormTooltip>
							<FormTooltip text="Description">
								<UTextarea
									v-model="state.projects[index]!.description"
									class="w-full"
									variant="soft"
									placeholder="Project Description"
									autoresize />
							</FormTooltip>
							<div class="flex items-center gap-1">
								<FormTechSelectMenu v-model="state.projects[index]!.technologies" class="grow" />
								<UFormField>
									<FormClearInputButton :fn="() => { state.projects[index]!.technologies = [] }" trailing label="Clear Technologies" />
								</UFormField>
							</div>
							<div
								v-if="state.projects[index]!.technologies.length > 0"
								class="flex flex-wrap gap-1">
								<UIcon
									v-for="(t, tIndex) in state.projects[index]!.technologies"
									:key="tIndex"
									:name="t.icon" />
							</div>
						</div>
					</FormCollapsible>

					<div class="flex h-full items-center">
						<FormModifyButtons
							v-model="state.projects"
							:index
							:vertical="state.projects[index]!.collapsibleOpen || true" />
					</div>
				</div>
			</div>

			<div class="flex">
				<UButton
					label="Add Project"
					variant="soft"
					class="mt-2 mx-auto"
					@click="() => { state.projects.push({ name: '', description: '', url: '', repoLink: { name: '', url: '' }, technologies: [] }) }" />
			</div>
		</UFormField>
	</UForm>
</template>

<style scoped>

</style>