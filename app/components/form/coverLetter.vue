<script setup lang="ts">
const { coverLetter } = useCoverLetter()

const state = reactive({
	content: computed({
		get: () => coverLetter.value.content,
		set: (val) => { coverLetter.value.content = val }
	}),
	recipientName: computed({
		get: () => coverLetter.value.recipientName,
		set: (val) => { coverLetter.value.recipientName = val }
	}),
	companyName: computed({
		get: () => coverLetter.value.companyName,
		set: (val) => { coverLetter.value.companyName = val }
	}),
	position: computed({
		get: () => coverLetter.value.position,
		set: (val) => { coverLetter.value.position = val }
	})
})
</script>

<template>
	<UForm
		:state="state"
		class="flex flex-col gap-4 m-4">
		<div class="flex flex-wrap gap-4">
			<UFormField label="Recipient Name" class="grow">
				<UInput
					v-model="state.recipientName"
					class="w-full"
					variant="soft"
					placeholder="Ms. Jane Smith"
					icon="i-lucide-user"/>
			</UFormField>

			<UFormField label="Company Name" class="grow">
				<UInput
					v-model="state.companyName"
					class="w-full"
					variant="soft"
					placeholder="Acme Corporation"
					icon="i-lucide-building"/>
			</UFormField>

			<UFormField label="Position" class="grow">
				<UInput
					v-model="state.position"
					class="w-full"
					variant="soft"
					placeholder="Senior Software Engineer"
					icon="i-lucide-briefcase"/>
			</UFormField>
		</div>

		<UFormField label="Cover Letter Content">
			<UTextarea
				v-model="state.content"
				class="w-full"
				variant="soft"
				placeholder="Dear Hiring Manager,&#10;&#10;I am writing to express my interest in the position..."
				:rows="15"
				autoresize/>
		</UFormField>
	</UForm>
</template>

<style scoped>

</style>
