<script setup lang="ts">
const jobField = useRefResumeData().jobField

const options = [
	{
		value: 'IT',
		label: 'IT / Developer',
		icon: 'i-lucide-code',
		description: 'For software development and IT positions'
	},
	{
		value: 'Other',
		label: 'Other Fields',
		icon: 'i-lucide-briefcase',
		description: 'For all other professional fields'
	}
]
</script>

<template>
	<UForm class="flex flex-col gap-4 m-4">
		<UFormField label="Job Field">
			<URadioGroup
				v-model="jobField"
				:items="options"
				class="flex gap-4">
				<template #label="{ item }">
					<div class="flex items-center gap-2">
						<UIcon :name="item.icon" class="w-5 h-5" />
						<div class="flex flex-col">
							<span class="font-medium">{{ item.label }}</span>
							<span class="text-xs text-(--ui-text-muted)">{{ item.description }}</span>
						</div>
					</div>
				</template>
			</URadioGroup>
		</UFormField>
	</UForm>
</template>

<style scoped>

</style>
