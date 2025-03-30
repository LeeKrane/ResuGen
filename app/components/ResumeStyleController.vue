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
						class="w-full"/>
				</UFormField>

				<UFormField label="Style" class="grow">
					<USelect
						v-model="state.layout.style"
						:items="['fancy', 'simple']"
						variant="soft"
						class="w-full"/>
				</UFormField>

				<UFormField label="Section Spacing" class="grow">
					<UInput
						v-model="state.layout.sectionSpacing"
						type="range"
						:min="1"
						:max="4"
						:step="0.5"/>
				</UFormField>

				<UFormField label="Show Background" class="grow">
					<USwitch v-model="state.layout.showBackground"/>
				</UFormField>
			</div>
		</UCard>

		<UCard class="bg-(--ui-bg)/20 backdrop-blur-xs">
			<template #header>
				<div class="flex items-center gap-2">
					<UIcon name="i-lucide-type" size="20"/>
					<h3 class="font-bold text-lg">Typography</h3>
				</div>
			</template>

			<div class="flex flex-wrap gap-4">
				<UFormField label="Font Family" class="grow">
					<USelect
						v-model="state.font.family"
						:items="['Inter', 'Public Sans', 'Roboto', 'Open Sans']"
						variant="soft"
						class="w-full"/>
				</UFormField>

				<UFormField label="Base Size" class="grow">
					<UInput
						v-model="state.font.size"
						type="range"
						:min="12"
						:max="18"
						:step="1"/>
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
						v-model="state.colors.bgPicked"
						:default-color="defaults.colors.bgPicked"/>
				</UFormField>

				<UFormField label="Elevated Background" class="grow">
					<FormPredefinedColorPicker
						v-model="state.colors.bgElevatedPicked"
						:default-color="defaults.colors.bgElevatedPicked"/>
				</UFormField>

				<UFormField label="Technology Logos" class="grow">
					<FormPredefinedColorPicker
						v-model="state.colors.techLogos"
						:default-color="defaults.colors.techLogos"/>
				</UFormField>

				<UFormField
					v-for="(level, key) in state.colors.skillLevels"
					:key="key"
					:label="`${key.charAt(0).toUpperCase() + key.slice(1)} Skills`"
					class="grow">
					<FormPredefinedColorPicker
						v-model="state.colors.skillLevels[key]"
						:default-color="defaults.colors.skillLevels[key]"/>
				</UFormField>
			</div>
		</UCard>

		<UCard class="bg-(--ui-bg)/20 backdrop-blur-xs">
			<template #header>
				<div class="flex items-center gap-2">
					<UIcon name="i-lucide-wand-2" size="20"/>
					<h3 class="font-bold text-lg">Effects</h3>
				</div>
			</template>

			<div class="flex flex-wrap gap-4">
				<UFormField label="Use Shades" class="grow">
					<USwitch v-model="state.effects.useShades"/>
				</UFormField>

				<UFormField label="Use Gradients" class="grow">
					<USwitch v-model="state.effects.useGradients"/>
				</UFormField>
			</div>
		</UCard>
	</UForm>
</template>

<style scoped>

</style>