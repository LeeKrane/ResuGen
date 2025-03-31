<script setup lang="ts">
const state = useResumeStyle()
const defaults = useResumeStyleDefaults()
</script>

<template>
	<UForm :state="state" class="flex flex-col gap-8 p-4 max-w-3xl mx-auto">
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

				<UFormField label="Section Spacing" class="grow min-w-36">
					<USlider
						v-model="state.layout.sectionSpacing"
						class="mt-2"
						:min="1"
						:max="8"
						:step="1"/>
					<div class="relative flex w-full pt-1">
						<span class="absolute w-full text-center text-(--ui-primary)">
							{{ state.layout.sectionSpacing }}
						</span>

						<span class="ml-1">1</span>
						<span class="grow"/>
						<span class="mr-1">8</span>
					</div>
				</UFormField>

				<UFormField label="Margin" class="grow min-w-36">
					<USlider
						v-model="state.layout.margin"
						class="mt-2"
						:min="1"
						:max="16"
						:step="1"/>
					<div class="relative flex w-full pt-1">
						<span class="absolute w-full text-center text-(--ui-primary)">
							{{ state.layout.margin }}
						</span>

						<span class="ml-1">1</span>
						<span class="grow"/>
						<span class="mr-1">16</span>
					</div>
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
				<UFormField label="Base Size" class="grow min-w-36">
					<USlider
						v-model="state.font.size"
						class="mt-2"
						:min="10"
						:max="20"
						:step="1"/>
					<div class="relative flex w-full pt-1">
							<span class="absolute w-full text-center text-(--ui-primary)">
								{{ state.font.size }}
							</span>

						<span class="ml-1">10</span>
						<span class="grow"/>
						<span class="mr-1">20</span>
					</div>
				</UFormField>

				<UFormField label="Title" class="grow min-w-36">
					<USlider
						v-model="state.font.titleSizes.h1"
						class="mt-2"
						:min="12"
						:max="36"
						:step="1"/>
					<div class="relative flex w-full pt-1">
							<span class="absolute w-full text-center text-(--ui-primary)">
								{{ state.font.titleSizes.h1 }}
							</span>

						<span class="ml-1">12</span>
						<span class="grow"/>
						<span class="mr-1">36</span>
					</div>
				</UFormField>

				<UFormField label="Subtitle" class="grow min-w-36">
					<USlider
						v-model="state.font.titleSizes.h2"
						class="mt-2"
						:min="12"
						:max="36"
						:step="1"/>
					<div class="relative flex w-full pt-1">
							<span class="absolute w-full text-center text-(--ui-primary)">
								{{ state.font.titleSizes.h2 }}
							</span>

						<span class="ml-1">12</span>
						<span class="grow"/>
						<span class="mr-1">36</span>
					</div>
				</UFormField>

				<UFormField label="Section titles" class="grow min-w-36">
					<USlider
						v-model="state.font.titleSizes.h3"
						class="mt-2"
						:min="12"
						:max="36"
						:step="1"/>
					<div class="relative flex w-full pt-1">
							<span class="absolute w-full text-center text-(--ui-primary)">
								{{ state.font.titleSizes.h3 }}
							</span>

						<span class="ml-1">12</span>
						<span class="grow"/>
						<span class="mr-1">36</span>
					</div>
				</UFormField>

				<UFormField label="Font Family" class="grow">
					<USelect
						v-model="state.font.family"
						:items="[
							{ label: 'Inter', value: 'inter' },
							{ label: 'Roboto', value: 'roboto' },
							{ label: 'Public Sans', value: 'public-sans' },
							{ label: 'Open Sans', value: 'open-sans' },
							{ label: 'Lato', value: 'lato' },
							{ label: 'Calibri', value: 'calibri' },
							{ label: 'Garamond', value: 'garamond' },
							{ label: 'Verdana', value: 'verdana' }
						]"
						variant="soft"
						class="w-full"/>
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

			<div class="flex flex-col gap-4">
				<div class="flex flex-wrap gap-4">
					<UFormField label="Background" class="grow">
						<FormColorPicker
							v-model="state.colors.bg"
							:default-color="defaults.colors.bg"/>
					</UFormField>

					<UFormField label="Elevated Background" class="grow">
						<FormColorPicker
							v-model="state.colors.bgElevated"
							:default-color="defaults.colors.bgElevated"/>
					</UFormField>
				</div>

				<USeparator/>

				<div class="flex flex-wrap gap-4">
					<UFormField label="Title" class="grow">
						<FormColorPicker
							v-model="state.colors.text.title"
							:default-color="defaults.colors.text.title"/>
					</UFormField>

					<UFormField label="Subtitle" class="grow">
						<FormColorPicker
							v-model="state.colors.text.subtitle"
							:default-color="defaults.colors.text.subtitle"/>
					</UFormField>

					<UFormField label="Section Title" class="grow">
						<FormColorPicker
							v-model="state.colors.text.sectionTitle"
							:default-color="defaults.colors.text.sectionTitle"/>
					</UFormField>

					<UFormField label="Base" class="grow">
						<FormColorPicker
							v-model="state.colors.text.base"
							:default-color="defaults.colors.text.base"/>
					</UFormField>
				</div>

				<USeparator/>

				<div class="flex flex-wrap gap-4">
					<UFormField label="Technology Logos" class="grow">
						<FormColorPicker
							v-model="state.colors.techLogos"
							:default-color="defaults.colors.techLogos"/>
					</UFormField>

					<UFormField label="Internship Badge" class="grow">
						<FormColorPicker
							v-model="state.colors.internship"
							:default-color="defaults.colors.internship"/>
					</UFormField>

					<UFormField label="Open Source Badge" class="grow">
						<FormColorPicker
							v-model="state.colors.openSource"
							:default-color="defaults.colors.openSource"/>
					</UFormField>
				</div>

				<USeparator/>

				<div class="flex flex-wrap gap-4">
					<UFormField
						v-for="(level, key) in state.colors.skillLevels"
						:key="key"
						:label="`${key.charAt(0).toUpperCase() + key.slice(1)} Skills`"
						class="grow">
						<FormColorPicker
							v-model="state.colors.skillLevels[key]"
							:default-color="defaults.colors.skillLevels[key]"/>
					</UFormField>
				</div>
			</div>
		</UCard>

		<UCard class="bg-(--ui-bg)/20 backdrop-blur-xs">
			<template #header>
				<div class="flex items-center gap-2">
					<UIcon name="i-lucide-wand-2" size="20"/>
					<h3 class="font-bold text-lg">Effects</h3>
				</div>
			</template>

			<div class="flex flex-col gap-4">
				<div class="flex flex-wrap gap-4">
					<UFormField label="Use Shades" class="grow">
						<USwitch v-model="state.effects.useShades"/>
					</UFormField>

					<UFormField label="Use Gradients" class="grow">
						<USwitch v-model="state.effects.useGradients"/>
					</UFormField>

					<UFormField label="Use Borders" class="grow">
						<USwitch v-model="state.effects.useBorders"/>
					</UFormField>
				</div>

				<div class="flex flex-wrap gap-4">
					<UFormField v-if="state.effects.useBorders" label="Border Width" class="grow">
						<USlider
							v-model="state.effects.borderWidth"
							class="mt-2"
							:min="1"
							:max="4"
							:step="1"/>
						<div class="relative flex w-full pt-1">
							<span class="absolute w-full text-center text-(--ui-primary)">
								{{ state.effects.borderWidth }}
							</span>

							<span class="ml-1">1</span>
							<span class="grow"/>
							<span class="mr-1">4</span>
						</div>
					</UFormField>

					<UFormField v-if="state.effects.useBorders" label="Border Color" class="grow">
						<FormColorPicker
							v-model="state.effects.borderColor"
							:default-color="defaults.effects.borderColor"/>
					</UFormField>
				</div>
			</div>
		</UCard>

		<UCard class="bg-(--ui-bg)/20 backdrop-blur-xs">
			<template #header>
				<div class="flex items-center gap-2">
					<UIcon name="i-lucide-layout-grid" size="20"/>
					<h3 class="font-bold text-lg">Additional Sections</h3>
				</div>
			</template>

			<div class="flex flex-col gap-4">
				<div class="flex flex-wrap gap-4">
					<UFormField
						v-for="(value, key) in state.layout.additionalSections"
						:key="key"
						:label="state.layout.additionalSections[key]!.id"
						class="grow">
						<USwitch v-model="state.layout.additionalSections[key]!.enabled"/>
					</UFormField>
				</div>
			</div>
		</UCard>
	</UForm>
</template>

<style scoped>

</style>