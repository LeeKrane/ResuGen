<script setup lang="ts">
const state = useResumeStyle()
const defaults = useResumeStyleDefaults()
</script>

<template>
	<UForm :state="state" class="flex flex-col gap-4 p-4 max-w-3xl mx-auto">
		<div class="hidden">
			<span class="bg-slate-500"/>
			<span class="bg-gray-500"/>
			<span class="bg-zinc-500"/>
			<span class="bg-blue-500"/>
			<span class="bg-indigo-500"/>
			<span class="bg-purple-500"/>
			<span class="bg-emerald-500"/>
			<span class="bg-teal-500"/>
			<span class="bg-sky-500"/>
			<span class="bg-rose-500"/>
		</div>

		<UCard class="bg-(--ui-bg)/20 backdrop-blur-xs">
			<template #header>
				<div class="flex items-center gap-2">
					<UIcon name="i-lucide-layout" size="20"/>
					<h3 class="font-bold text-lg">Layout</h3>
				</div>
			</template>

			<div class="flex flex-wrap gap-4">
				<UFormField label="Type" class="grow">
					<USelect
						v-model="state.layout.type"
						:items="['single-column', 'two-column', 'compact']"
						variant="soft"
						class="w-full"
						default-value="two-column"/>
				</UFormField>

				<UFormField label="Style" class="grow">
					<USelect
						v-model="state.layout.style"
						:items="['fancy', 'simple']"
						variant="soft"
						class="w-full"
						default-value="fancy"/>
				</UFormField>
			</div>
		</UCard>

		<UCard class="bg-(--ui-bg)/20 backdrop-blur-xs">
			<template #header>
				<div class="flex items-center gap-2">
					<UIcon name="i-lucide-palette" size="20"/>
					<h3 class="font-bold text-lg">Colors</h3>
				</div>
			</template>

			<div class="flex flex-wrap gap-4">
				<UFormField label="Background" class="grow">
					<FormPredefinedColorPicker
						v-model="state.colors.backgroundPicked"
						:default-color="defaults.colors.backgroundPicked"/>
				</UFormField>

				<UFormField label="Basic Skills" class="grow">
					<FormPredefinedColorPicker
						v-model="state.colors.skillLevels.basic"
						:default-color="defaults.colors.skillLevels.basic"/>
				</UFormField>

				<UFormField label="Decent Skills" class="grow">
					<FormPredefinedColorPicker
						v-model="state.colors.skillLevels.decent"
						:default-color="defaults.colors.skillLevels.decent"/>
				</UFormField>

				<UFormField label="Good Skills" class="grow">
					<FormPredefinedColorPicker
						v-model="state.colors.skillLevels.good"
						:default-color="defaults.colors.skillLevels.good"/>
				</UFormField>

				<UFormField label="Proficient Skills" class="grow">
					<FormPredefinedColorPicker
						v-model="state.colors.skillLevels.proficient"
						:default-color="defaults.colors.skillLevels.proficient"/>
				</UFormField>

				<UFormField label="Expert Skills" class="grow">
					<FormPredefinedColorPicker
						v-model="state.colors.skillLevels.expert"
						:default-color="defaults.colors.skillLevels.expert"/>
				</UFormField>
			</div>
		</UCard>
	</UForm>
</template>

<style scoped>

</style>