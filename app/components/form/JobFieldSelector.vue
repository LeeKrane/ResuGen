<script setup lang="ts">
const jobField = useRefResumeData().jobField

const options = [
	{
		value: 'IT',
		label: 'IT / Developer',
		icon: 'i-lucide-code'
	},
	{
		value: 'Other',
		label: 'Other Fields',
		icon: 'i-lucide-briefcase'
	}
]

const selectedOption = computed(() => {
	return options.find(opt => opt.value === jobField.value)
})
</script>

<template>
	<UForm class="flex flex-col gap-4 m-4">
		<UFormField label="Job Field" class="max-w-md">
			<USelect
				v-model="jobField"
				:items="options"
				variant="soft"
				placeholder="Select job field"
				:icon="selectedOption?.icon"
			/>
		</UFormField>
	</UForm>
</template>

<style scoped>

</style>
