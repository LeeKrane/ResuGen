<script setup lang="ts">
const state = reactive({
	qualifications: useRefResumeData().qualifications,
})
</script>

<template>
	<UForm
		:state="state"
		class="flex flex-col gap-4">
		<UFormField label="Qualifications & Certifications">
			<div class="flex flex-col gap-4">
				<div
					v-for="(_, index) in state.qualifications"
					:key="index"
					class="flex flex-col gap-1 p-3 border border-(--ui-border) rounded-lg">
					<UInput
						v-if="state.qualifications[index]"
						v-model="state.qualifications[index].name"
						class="w-full"
						variant="soft"
						icon="i-lucide-award"
						placeholder="Certified Project Manager"/>
					<UInput
						v-if="state.qualifications[index]"
						v-model="state.qualifications[index].issuer"
						class="w-full"
						variant="soft"
						icon="i-lucide-building"
						placeholder="Issuing organization (e.g. TÜV Austria)"/>
					<div class="flex items-center gap-1">
						<label class="text-sm">Obtained on</label>
						<FormDatePicker 
							v-if="state.qualifications[index]"
							v-model="state.qualifications[index].date"
							class="flex-1"/>
						<FormModifyButtons
							v-model="state.qualifications"
							:index="index"/>
					</div>
					<UTextarea
						v-if="state.qualifications[index]"
						v-model="state.qualifications[index].description"
						class="w-full"
						variant="soft"
						placeholder="Description (optional)..."
						autoresize/>
				</div>
			</div>

			<FormAddButton
				v-model="state.qualifications"
				label="Add Qualification"
				:default-value-getter="() => { return { name: '' } }"/>
		</UFormField>
	</UForm>
</template>

<style scoped>

</style>
