<script setup lang="ts">
const state = reactive({
	name: useState("name", () => ""),
	subtitle: useState("subtitle", () => ""),
	email: useState("email", () => ""),
	phone: useState("phone", () => ""),
	summary: useState("summary", () => ""),
	hobbies: useState("hobbies", (): string[] => [""]),
	languages: useState("languages", (): Language[] => [ { name: "" } ]),
})

watch(state.hobbies, (newVal) => {
	if (newVal.length === 0 || newVal[newVal.length - 1] !== "")
		state.hobbies.push("")
	else if (newVal.length > 1 && newVal[newVal.length - 2] === "")
		state.hobbies.pop()
})

watch(state.languages, (newVal) => {
	if (newVal.length === 0 || newVal[newVal.length - 1]?.name !== "")
		state.languages.push({ name: "" })
	else if (newVal.length > 1 && newVal[newVal.length - 2]?.name === "")
		state.languages.pop()
})
</script>

<template>
	<UForm
		:state="state"
		class="flex flex-col gap-4 m-4">
		<UFormField label="Name">
			<UInput
				v-model="state.name"
				class="w-full"
				variant="soft"
				placeholder="MSc. John Doe"
				icon="i-lucide-user" />
		</UFormField>

		<UFormField label="Subtitle">
			<UInput
				v-model="state.subtitle"
				class="w-full"
				variant="soft"
				placeholder="Software Engineer"
				icon="i-lucide-message-square-text" />
		</UFormField>

		<UFormField label="Email">
			<UInput
				v-model="state.email"
				class="w-full"
				variant="soft"
				placeholder="john.doe@example.com"
				icon="i-lucide-at-sign" />
		</UFormField>

		<UFormField label="Phone">
			<UInput
				v-model="state.phone"
				class="w-full"
				variant="soft"
				placeholder="+43 123 456 789"
				icon="i-lucide-phone" />
		</UFormField>

		<UFormField label="Professional Summary">
			<UTextarea
				v-model="state.summary"
				class="w-full"
				variant="soft"
				placeholder="Experienced software engineer..."
				icon="i-lucide-user"
				autoresize />
		</UFormField>

		<UFormField label="Hobbies">
			<div
				v-for="(_, index) in state.hobbies"
				:key="index"
				class="flex flex-col my-1">
				<UInput
					v-model="state.hobbies[index]"
					class="w-full"
					variant="soft"
					placeholder="Volleyball">
					<template v-if="state.hobbies[index] && state.hobbies[index].length > 0" #trailing>
						<UButton
							color="neutral"
							variant="link"
							size="sm"
							icon="i-lucide-circle-x"
							aria-label="clear input"
							@click="state.hobbies.splice(index, 1)" />
					</template>
				</UInput>
			</div>
		</UFormField>

		<UFormField label="Languages">
			<div
				v-for="(_l, index) in state.languages"
				:key="index"
				class="flex gap-1 my-1">
				<UInput
					v-if="state.languages[index]"
					v-model="state.languages[index].name"
					variant="soft"
					placeholder="English"
					class="flex-1" />
				<USelect
					v-if="state.languages[index]"
					v-model="state.languages[index].level"
					placeholder="Level"
					variant="soft"
					:items="['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Native']" />
				<UButton
					:class="state.languages[index] && state.languages[index].name && state.languages[index].name.length > 0 ? '' : 'invisible'"
					color="neutral"
					variant="link"
					size="sm"
					icon="i-lucide-circle-x"
					aria-label="clear input"
					@click="state.languages.splice(index, 1)" />
			</div>
		</UFormField>
	</UForm>
</template>

<style scoped>

</style>