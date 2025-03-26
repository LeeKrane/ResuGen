<script setup lang="ts">
import {useRefreshAvatar} from "~/composables/refreshAvatar";

const state = reactive({
	name: useRefResumeData().name,
	subtitle: useRefResumeData().subtitle,
	email: useRefResumeData().email,
	birthdate: useRefResumeData().birthdate,
	phone: useRefResumeData().phone,
	address: useRefResumeData().address,
	summary: useRefResumeData().summary,
	hobbies: useRefResumeData().hobbies,
	languages: useRefResumeData().languages,
	skillCategories: useRefResumeData().skillCategories,
	links: useRefResumeData().links,
	avatar: useRefResumeData().avatar,
})

const previewImage = useState<string | null>("previewImage", () => null)

const iconItems = ref([
	{label: "Website", value: "website", icon: "i-lucide-globe"},
	{label: "GitHub", value: "github", icon: "i-simple-icons-github"},
	{label: "GitLab", value: "gitlab", icon: "i-simple-icons-gitlab"},
	{label: "LinkedIn", value: "linkedin", icon: "i-simple-icons-linkedin"},
	{label: "Xing", value: "xing", icon: "i-simple-icons-xing"},
	{label: "Stack Overflow", value: "stack-overflow", icon: "i-simple-icons-stackoverflow"},
	{label: "Discord", value: "discord", icon: "i-simple-icons-discord"},
	{label: "X", value: "x", icon: "i-simple-icons-x"},
	{label: "Instagram", value: "instagram", icon: "i-simple-icons-instagram"},
	{label: "Reddit", value: "reddit", icon: "i-simple-icons-reddit"},
	{label: "Facebook", value: "facebook", icon: "i-simple-icons-facebook"},
	{label: "YouTube", value: "youtube", icon: "i-simple-icons-youtube"},
	{label: "Twitch", value: "twitch", icon: "i-simple-icons-twitch"},
].sort((a, b) => a.label.localeCompare(b.label)))

const onFileChange = async (event: Event) => {
	const file = (event.target as HTMLInputElement).files?.[0]
	useRefreshAvatar(file ?? null)
}

const avatarInput = ref<HTMLInputElement | null>(null)
</script>

<template>
	<UForm
		:state="state"
		class="flex flex-col gap-4 m-4">
		<div class="flex gap-4">
			<div class="flex flex-col grow gap-4">
				<UFormField label="Name">
					<UInput
						v-model="state.name"
						class="w-full"
						variant="soft"
						placeholder="MSc. John Doe"
						icon="i-lucide-user"/>
				</UFormField>

				<UFormField label="Subtitle">
					<UInput
						v-model="state.subtitle"
						class="w-full"
						variant="soft"
						placeholder="Software Engineer"
						icon="i-lucide-message-square-text"/>
				</UFormField>

				<UFormField label="Email">
					<UInput
						v-model="state.email"
						class="w-full"
						variant="soft"
						placeholder="john.doe@example.com"
						icon="i-lucide-at-sign"/>
				</UFormField>
			</div>

			<UFormField label="Avatar">
				<div class="flex flex-col items-start gap-4">
					<NuxtImg
						v-if="previewImage"
						:src="previewImage"
						class="w-32 h-32 rounded-lg"/>
					<GeneralPlaceholder
						v-else
						class="w-32 h-32"
					/>
					<UButtonGroup class="w-full">
						<UButton
							icon="i-lucide-upload"
							variant="soft"
							placeholder="Upload Avatar"
							class="cursor-pointer grow"
							label="Upload"
							@click="avatarInput!.click()"/>
						<FormClearInputButton
							v-if="previewImage"
							:fn="() => {
								previewImage = null
								state.avatar = null
							}"
							error
							soft
						/>
					</UButtonGroup>
					<input
						ref="avatarInput"
						type="file"
						accept="image/*"
						class="hidden"
						@change="onFileChange">
				</div>
			</UFormField>
		</div>

		<div class="flex flex-wrap gap-4">
			<UFormField label="Birthdate" class="grow">
				<FormDatePicker v-model="state.birthdate"/>
			</UFormField>

			<UFormField label="Phone" class="grow">
				<UInput
					v-model="state.phone"
					class="w-full"
					variant="soft"
					placeholder="+43 123 456 789"
					icon="i-lucide-phone"/>
			</UFormField>

			<UFormField label="Address" class="grow">
				<UInput
					v-model="state.address"
					class="w-full"
					variant="soft"
					placeholder="123 Main Street, City, Country"
					icon="i-lucide-map-pin"/>
			</UFormField>
		</div>

		<UFormField label="Professional Summary">
			<UTextarea
				v-model="state.summary"
				class="w-full"
				variant="soft"
				placeholder="Experienced software engineer..."
				icon="i-lucide-user"
				autoresize/>
		</UFormField>

		<UFormField label="Hobbies">
			<div
				v-for="(_, index) in state.hobbies"
				:key="index"
				class="flex gap-1 my-1">
				<UInput
					v-model="state.hobbies[index]"
					class="w-full"
					variant="soft"
					icon="i-lucide-volleyball"
					placeholder="Volleyball"/>
				<FormModifyButtons
					v-model="state.hobbies"
					:index="index"/>
			</div>

			<FormAddButton
				v-model="state.hobbies"
				label="Add Hobby"
				:default-value-getter="() =>{  return ('') }"/>
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
					class="flex-1"/>
				<USelect
					v-if="state.languages[index]"
					v-model="state.languages[index].level"
					placeholder="Level"
					variant="soft"
					:items="['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Native']"/>
				<FormModifyButtons
					v-model="state.languages"
					:index="index"/>
			</div>

			<FormAddButton
				v-model="state.languages"
				label="Add Language"
				:default-value-getter="() =>{  return ({ name: '' }) }"/>
		</UFormField>

		<UFormField label="Skills">
			<div
				v-for="(_c, index) in state.skillCategories"
				:key="index"
				class="flex flex-col gap-1 not-first:mt-3">
				<div class="flex gap-1">
					<UInput
						v-if="state.skillCategories[index]"
						v-model="state.skillCategories[index].name"
						icon="i-lucide-folder"
						variant="soft"
						placeholder="Programming Languages"
						class="flex-1"/>
					<FormModifyButtons
						v-model="state.skillCategories"
						:index="index">
						<template #leading>
							<FormAddButton
								v-model="state.skillCategories[index]!.skills"
								class="col-span-2"
								label="+"
								raw
								:default-value-getter="() =>{  return ({ name: '' }) }"/>
						</template>
					</FormModifyButtons>
				</div>

				<div class="grid grid-cols-[auto_1fr] gap-x-1 mx-5">
					<USeparator
						v-if="state.skillCategories[index] && state.skillCategories[index].skills.length > 0"
						orientation="vertical"
						class="h-[calc(100%-1.25rem)] mr-4"/>

					<div
						v-if="state.skillCategories[index] && state.skillCategories[index].skills.length > 0"
						class="flex flex-col gap-1 mb-1">
						<div
							v-for="(_s, skillIndex) in state.skillCategories[index].skills"
							:key="skillIndex"
							class="flex items-center gap-1">
							<USeparator class="w-4 -ml-5"/>
							<UInput
								v-if="state.skillCategories[index].skills[skillIndex]"
								v-model="state.skillCategories[index].skills[skillIndex].name"
								variant="soft"
								placeholder="TypeScript"
								class="flex-1"/>
							<USelect
								v-if="state.skillCategories[index].skills[skillIndex]"
								v-model="state.skillCategories[index].skills[skillIndex].level"
								placeholder="Level"
								class="min-w-24"
								variant="soft"
								:items="['Basic', 'Decent', 'Good', 'Proficient', 'Expert']"/>
							<FormModifyButtons
								v-model="state.skillCategories[index].skills"
								:index="skillIndex"/>
						</div>
					</div>
				</div>
			</div>

			<FormAddButton
				v-model="state.skillCategories"
				label="Add Skill Category"
				:default-value-getter="() =>{  return ({ name: '', skills: [] }) }"/>
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
					:items="iconItems"/>
				<UInput
					v-if="state.links[index] && state.links[index].icon && state.links[index].icon.label === 'Website'"
					v-model="state.links[index].name"
					variant="soft"
					placeholder="Krane's Resume Generator"
					class="grow"/>
				<UInput
					v-if="state.links[index]"
					v-model="state.links[index].url!"
					icon="i-lucide-link"
					variant="soft"
					placeholder="https://resume.krane.dev/"
					class="grow"/>
				<FormModifyButtons
					v-model="state.links"
					:index="index"/>
			</div>

			<FormAddButton
				v-model="state.links"
				label="Add Link"
				:default-value-getter="() =>{  return ({ name: '', url: '' }) }"/>
		</UFormField>
	</UForm>
</template>

<style scoped>

</style>