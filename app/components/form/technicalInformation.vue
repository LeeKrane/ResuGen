<script setup lang="ts">
const state = reactive({
	skillCategories: useState("skillCategories", (): SkillCategory[] => [ { name: "", skills: [ { name: "" } ] } ]),
	links: useState("links", (): Link[] => [ { name: "", url: "" } ]),
})

const iconItems = ref([
	{ label: "Website", value: "i-lucide-globe" },
	{ label: "GitHub", value: "i-simple-icons-github" },
	{ label: "GitLab", value: "i-simple-icons-gitlab" },
	{ label: "LinkedIn", value: "i-simple-icons-linkedin" },
	{ label: "Xing", value: "i-simple-icons-xing" },
	{ label: "Stack Overflow", value: "i-simple-icons-stackoverflow" },
	{ label: "Discord", value: "i-simple-icons-discord" },
	{ label: "X", value: "i-simple-icons-x" },
	{ label: "DeviantArt", value: "i-simple-icons-deviantart" },
	{ label: "Medium", value: "i-simple-icons-medium" },
	{ label: "Instagram", value: "i-simple-icons-instagram" },
	{ label: "Reddit", value: "i-simple-icons-reddit" },
	{ label: "Facebook", value: "i-simple-icons-facebook" },
	{ label: "YouTube", value: "i-simple-icons-youtube" },
	{ label: "Twitch", value: "i-simple-icons-twitch" },
])

watch(state.skillCategories, (newVal) => {
	if (newVal.length === 0 || newVal[newVal.length - 1]?.name !== "")
		state.skillCategories.push({ name: "", skills: [ { name: "" } ] })
	else if (newVal.length > 1 && newVal[newVal.length - 2]?.name === "")
		state.skillCategories.pop()

	for (const category of newVal) {
		if (category.skills.length === 0 || category.skills[category.skills.length - 1]?.name !== "")
			category.skills.push({ name: "" })
		else if (category.skills.length > 1 && category.skills[category.skills.length - 2]?.name === "")
			category.skills.pop()
	}
})

watch(state.links, (newVal) => {
	if (newVal.length === 0 || newVal[newVal.length - 1]?.url !== "")
		state.links.push({ name: "", url: "" })
	else if (newVal.length > 1 && newVal[newVal.length - 2]?.url === "")
		state.links.pop()
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
					<UIcon name="i-lucide-dot" size="20" />
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
						@click="state.skillCategories[index].skills.splice(skillIndex, 1)" />
				</div>
			</div>
		</UFormField>

		<UFormField label="Links">
			<div
				v-for="(_l, index) in state.links"
				:key="index"
				class="flex gap-1 my-1">
				<USelectMenu
					v-if="state.links[index]"
					class="min-w-32"
					v-model="state.links[index].icon"
					placeholder="Choose Website"
					variant="soft"
					:icon="state.links[index].icon ? state.links[index].icon.value : undefined"
					:items="iconItems" />
				<UInput
					v-if="state.links[index] && state.links[index].icon && state.links[index].icon.label === 'Website'"
					v-model="state.links[index].name"
					variant="soft"
					placeholder="Krane's Resume Generator"
					class="flex-1" />
				<UInput
					v-if="state.links[index]"
					v-model="state.links[index].url"
					variant="soft"
					placeholder="https://resume.krane.dev/"
					class="flex-1" />
				<UButton
					:class="state.links[index] && (state.links[index].icon || state.links[index].url!.length > 0) ? '' : 'invisible'"
					color="neutral"
					variant="link"
					size="sm"
					icon="i-lucide-circle-x"
					aria-label="clear input"
					@click="state.links.splice(index, 1)" />
			</div>
		</UFormField>
	</UForm>
</template>

<style scoped>

</style>