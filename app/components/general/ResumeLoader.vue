<script setup lang="ts">
const open = ref(false)
</script>

<template>
	<UModal v-model:open="open"
			title="Load data from file">
		<UButton
			class="cursor-pointer"
			label="Import"
			icon="i-material-symbols-upload-file"
			variant="outline"
		/>

		<template #content>
			<UForm
				@submit.prevent="() => { open = !open }"
				class="flex flex-col items-center justify-center gap-4 p-16">
				<UFormField label="Resume data" name="resumeData">
					<UInput type="file" />
				</UFormField>

				<UButton label="Load data" type="submit" />
			</UForm>
		</template>
	</UModal>
</template>

<style scoped>

</style>