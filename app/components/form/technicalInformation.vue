<script setup lang="ts">
const state = reactive({
	skills: useState("skills", (): Skill[] => [ { name: "" } ]),
})
</script>

<template>
	<UForm
		:state="state"
		class="flex flex-col gap-4 m-4">
		<UFormField label="Skills"> <!-- todo: categories -->
			<div
				v-for="(_l, index) in state.skills"
				:key="index"
				class="flex gap-1 my-1">
				<UInput
					v-if="state.skills[index]"
					v-model="state.skills[index].name"
					variant="soft"
					placeholder="TypeScript"
					class="flex-1" />
				<USelect
					v-if="state.skills[index]"
					v-model="state.skills[index].level"
					placeholder="Level"
					class="min-w-24"
					variant="soft"
					:items="['Basic', 'Decent', 'Good', 'Proficient', 'Expert']" />
				<UButton
					:class="state.skills[index] && state.skills[index].name && state.skills[index].name.length > 0 ? '' : 'invisible'"
					color="neutral"
					variant="link"
					size="sm"
					icon="i-lucide-circle-x"
					aria-label="clear input"
					@click="state.skills.splice(index, 1)" />
			</div>
		</UFormField>
	</UForm>
</template>

<style scoped>

</style>