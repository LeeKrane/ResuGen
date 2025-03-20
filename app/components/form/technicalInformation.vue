<script setup lang="ts">
const state = reactive({
	skillCategories: useState("skillCategories", (): SkillCategory[] => [ { name: "", skills: [ { name: "" } ] } ]),
})

watch(state.skillCategories, (newVal) => {
	if (newVal.length === 0 || newVal[newVal.length - 1]?.name !== "")
		state.skillCategories.push({ name: "", skills: [ { name: "" } ] })
	else if (newVal.length > 1 && newVal[newVal.length - 2]?.name === "")
		state.skillCategories.pop()
})
</script>

<template>
	<UForm
		:state="state"
		class="flex flex-col gap-4 m-4">
		<UFormField label="Skills">
			<div
				v-for="(_c, index) in state.skillCategories"
				:key="index"
				class="flex flex-col gap-1 my-1">
				<div class="flex gap-1">
					<UInput
						v-if="state.skillCategories[index]"
						v-model="state.skillCategories[index].name"
						icon="i-lucide-folder"
						variant="soft"
						placeholder="Programming Languages"
						class="flex-1" />
					<UButton
						:class="state.skillCategories[index] && state.skillCategories[index].name && state.skillCategories[index].name.length > 0 ? '' : 'invisible'"
						color="neutral"
						variant="link"
						size="sm"
						icon="i-lucide-circle-x"
						aria-label="clear input"
						@click="state.skillCategories.splice(index, 1)" />
				</div>

				<div
					v-for="(_s, skillIndex) in state.skillCategories[index].skills"
					v-if="state.skillCategories[index]"
					:key="skillIndex"
					class="flex items-center gap-1 my-1">
					<UIcon name="i-lucide-chevron-right" size="20" />
					<UInput
						v-if="state.skillCategories[index].skills[skillIndex]"
						v-model="state.skillCategories[index].skills[skillIndex].name"
						variant="soft"
						placeholder="TypeScript"
						class="flex-1" />
					<USelect
						v-if="state.skillCategories[index].skills[skillIndex]"
						v-model="state.skillCategories[index].skills[skillIndex].level"
						placeholder="Level"
						class="min-w-24"
						variant="soft"
						:items="['Basic', 'Decent', 'Good', 'Proficient', 'Expert']" />
					<UButton
						:class="state.skillCategories[index].skills[skillIndex] && state.skillCategories[index].skills[skillIndex].name && state.skillCategories[index].skills[skillIndex].name.length > 0 ? '' : 'invisible'"
						color="neutral"
						variant="link"
						size="sm"
						icon="i-lucide-circle-x"
						aria-label="clear input"
						@click="state.skillCategories.splice(index, 1)" />
				</div>
			</div>
		</UFormField>
	</UForm>
</template>

<style scoped>

</style>