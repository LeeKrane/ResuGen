<script setup lang="ts">
const state = reactive({
	name: useRefResumeData().name,
	subtitle: useRefResumeData().subtitle,
	email: useRefResumeData().email,
	phone: useRefResumeData().phone,
	summary: useRefResumeData().summary,
	hobbies: useRefResumeData().hobbies,
	languages: useRefResumeData().languages,
	skillCategories: useRefResumeData().skillCategories,
	links: useRefResumeData().links,
	avatar: useRefResumeData().avatar,
})

const previewImage = ref<string | null>(null)

const iconItems = ref([
	{ label: "Website", value: "website", icon: "i-lucide-globe" },
	{ label: "GitHub", value: "github", icon: "i-simple-icons-github" },
	{ label: "GitLab", value: "gitlab", icon: "i-simple-icons-gitlab" },
	{ label: "LinkedIn", value: "linkedin", icon: "i-simple-icons-linkedin" },
	{ label: "Xing", value: "xing", icon: "i-simple-icons-xing" },
	{ label: "Stack Overflow", value: "stack-overflow", icon: "i-simple-icons-stackoverflow" },
	{ label: "Discord", value: "discord", icon: "i-simple-icons-discord" },
	{ label: "X", value: "x", icon: "i-simple-icons-x" },
	{ label: "Instagram", value: "instagram", icon: "i-simple-icons-instagram" },
	{ label: "Reddit", value: "reddit", icon: "i-simple-icons-reddit" },
	{ label: "Facebook", value: "facebook", icon: "i-simple-icons-facebook" },
	{ label: "YouTube", value: "youtube", icon: "i-simple-icons-youtube" },
	{ label: "Twitch", value: "twitch", icon: "i-simple-icons-twitch" },
].sort((a, b) => a.label.localeCompare(b.label)))

const onFileChange = async (event: Event) => {
	const file = (event.target as HTMLInputElement).files?.[0]

	if (file) {
		const reader = new FileReader()

		reader.onload = () => {
			const img = new Image()
			img.onload = () => {
				const canvas = document.createElement("canvas")
				const ctx = canvas.getContext("2d")

				canvas.width = Math.min(1024, img.width)
				canvas.height = Math.min(1024, img.height)
				ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)
				previewImage.value = canvas.toDataURL("image/webp", 0.7)

				canvas.toBlob((blob) => {
					if (blob) {
						state.avatar = new File([blob], "avatar.webp", {
							type: "image/webp"
						})
					}
				}, "image/webp", 0.7)
			}

			img.src = reader.result as string
		}

		reader.readAsDataURL(file)
	} else {
		previewImage.value = null
		state.avatar = null
	}
}

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
		class="flex flex-col gap-8 m-4">
		<UFormField label="Image">
			<div class="flex flex-col items-start gap-1">
				<UInput
					type="file"
					accept="image/*"
					class="grow w-full"
					variant="soft"
					placeholder="Image"
					icon="i-lucide-image"
					@change="onFileChange" />
				<NuxtImg
					v-if="previewImage"
					:src="previewImage"
					class="w-32 h-32 rounded-lg" />
			</div>
		</UFormField>

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
					icon="i-lucide-volleyball"
					placeholder="Volleyball">
					<template v-if="state.hobbies[index] && state.hobbies[index].length > 0" #trailing>
						<FormClearInputButton :fn="() => { state.hobbies.splice(index, 1) }" />
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
					icon="i-lucide-languages"
					variant="soft"
					placeholder="English"
					class="flex-1" />
				<USelect
					v-if="state.languages[index]"
					v-model="state.languages[index].level"
					placeholder="Level"
					variant="soft"
					:items="['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Native']" />
				<FormClearInputButton
					:class="state.languages[index] && state.languages[index].name && state.languages[index].name.length > 0 ? '' : 'invisible'"
					:fn="() => { state.languages.splice(index, 1) }" />
			</div>
		</UFormField>

		<UFormField label="Skills">
			<div
				v-for="(_c, index) in state.skillCategories"
				:key="index"
				class="flex flex-col gap-1 mt-1 not-last:mb-7 last:mb-1">
				<div class="flex gap-1">
					<UInput
						v-if="state.skillCategories[index]"
						v-model="state.skillCategories[index].name"
						icon="i-lucide-folder"
						variant="soft"
						placeholder="Programming Languages"
						class="flex-1" />
					<FormClearInputButton
						:class="state.skillCategories[index] && state.skillCategories[index].name && state.skillCategories[index].name.length > 0 ? '' : 'invisible'"
						:fn="() => { state.skillCategories.splice(index, 1) }" />
				</div>

				<div
					v-for="(_s, skillIndex) in state.skillCategories[index].skills"
					v-if="state.skillCategories[index]"
					:key="skillIndex"
					class="flex items-center gap-1">
					<UIcon name="i-lucide-minus" size="12" />
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
					<FormClearInputButton
						:class="state.skillCategories[index].skills[skillIndex] && state.skillCategories[index].skills[skillIndex].name && state.skillCategories[index].skills[skillIndex].name.length > 0 ? '' : 'invisible'"
						:fn="() => { state.skillCategories![index!]!.skills.splice(skillIndex, 1) }" />
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
					class="min-w-40"
					v-model="state.links[index].icon"
					placeholder="Choose Website"
					variant="soft"
					:icon="state.links[index].icon ? state.links[index].icon.icon : undefined"
					:items="iconItems" />
				<UInput
					v-if="state.links[index] && state.links[index].icon && state.links[index].icon.label === 'Website'"
					v-model="state.links[index].name"
					variant="soft"
					placeholder="Krane's Resume Generator"
					class="grow" />
				<UInput
					v-if="state.links[index]"
					v-model="state.links[index].url!"
					icon="i-lucide-link"
					variant="soft"
					placeholder="https://resume.krane.dev/"
					class="grow" />
				<FormClearInputButton
					:class="state.links[index] && (state.links[index].icon || state.links[index].url!.length > 0) ? '' : 'invisible'"
					:fn="() => { state.links.splice(index, 1) }" />
			</div>
		</UFormField>
	</UForm>
</template>

<style scoped>

</style>