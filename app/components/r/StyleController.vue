<script setup lang="ts">
const state = useResumeStyle()
const defaults = useResumeStyleDefaults()

const showLayout = useState("showLayoutSC", () => true)
const showTypography = useState("showTypographySC", () => true)
const showColors = useState("showColorsSC", () => true)
const showSections = useState("showSectionsSC", () => true)
const showEffects = useState("showEffectsSC", () => true)
</script>

<template>
	<UForm :state="state" class="flex flex-col gap-8 p-2 max-w-xl mx-auto">
		<UCard>
			<template v-if="showLayout" #header>
				<div class="flex items-center gap-2">
					<UIcon name="i-lucide-layout" size="20"/>
					<h3 class="font-bold text-lg">Layout</h3>
					<span class="grow"/>
					<UButton
							class="cursor-pointer"
							icon="i-lucide-chevron-down"
							color="neutral"
							variant="ghost"
							@click="showLayout = !showLayout"/>
				</div>
			</template>

			<div v-if="!showLayout" class="flex items-center gap-2 -my-2">
				<UIcon name="i-lucide-layout" size="20"/>
				<h3 class="font-bold text-lg">Layout</h3>
				<span class="grow"/>
				<UButton
						class="cursor-pointer"
						icon="i-lucide-chevron-up"
						color="neutral"
						variant="ghost"
						@click="showLayout = !showLayout"/>
			</div>

			<div v-else class="flex flex-wrap gap-4">
				<UFormField label="Type" class="grow">
					<!-- :items="['single-column', 'two-column', 'compact']" -->
					<USelect
						v-model="state.layout.type"
						:items="['two-column']"
						variant="soft"
						class="w-full"/>

					<template #hint>
						<div class="flex items-center gap-1">
							<UTooltip text="The layout type defines the overall structure of your resume.">
								<UIcon name="i-lucide-help-circle" size="15"/>
							</UTooltip>
						</div>
					</template>
				</UFormField>

				<UFormField label="Style" class="grow">
					<USelect
						v-model="state.layout.style"
						:items="['fancy', 'simple']"
						variant="soft"
						class="w-full"/>

					<template #hint>
						<div class="flex items-center gap-1">
							<UTooltip text="The style defines the visual theme of your resume.">
								<UIcon name="i-lucide-help-circle" size="15"/>
							</UTooltip>
						</div>
					</template>
				</UFormField>

				<UFormField label="Section Spacing" class="grow min-w-36">
					<USlider
						v-model="state.layout.sectionSpacing"
						class="mt-2 z-10"
						:min="1"
						:max="16"
						:step="1"/>
					<div class="relative flex w-full pt-1">
						<span class="absolute w-full text-center text-(--ui-primary)">
							{{ state.layout.sectionSpacing }}
						</span>

						<span class="ml-1">1</span>
						<span class="grow"/>
						<span class="mr-1">16</span>
					</div>

					<template #hint>
						<div class="flex items-center gap-1">
							<UTooltip text="Section spacing refers to the space between different sections like personal information, languages, skills, etc. of your resume.">
								<UIcon name="i-lucide-help-circle" size="15"/>
							</UTooltip>
						</div>
					</template>
				</UFormField>

				<UFormField label="Margin" class="grow min-w-36">
					<USlider
							v-model="state.layout.margin"
							class="mt-2 z-10"
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

					<template #hint>
						<div class="flex items-center gap-1">
							<UTooltip text="The margin refers to the space between the edge of the page and the content of your resume.">
								<UIcon name="i-lucide-help-circle" size="15"/>
							</UTooltip>
						</div>
					</template>
				</UFormField>

				<UFormField label="Size Ratio" class="grow min-w-36">
					<USlider
							v-model="state.layout.sizeRatio"
							class="mt-2 z-10"
							:min="30"
							:max="40"
							:step="0.5"/>
					<div class="relative flex w-full pt-1">
						<span class="absolute w-full text-center text-(--ui-primary)">
							{{ state.layout.sizeRatio }}%
						</span>

						<span class="ml-1">30%</span>
						<span class="grow"/>
						<span class="mr-1">40%</span>
					</div>

					<template #hint>
						<div class="flex items-center gap-1">
							<UTooltip text="The size ratio refers to the size ratio of the main parts of your resume.">
								<UIcon name="i-lucide-help-circle" size="15"/>
							</UTooltip>
						</div>
					</template>
				</UFormField>

<!--				<UFormField label="Show Background" class="grow">-->
<!--					<USwitch v-model="state.layout.showBackground"/>-->
<!--				</UFormField>-->
			</div>
		</UCard>



		<UCard>
			<template v-if="showTypography" #header>
				<div class="flex items-center gap-2">
					<UIcon name="i-lucide-type" size="20"/>
					<h3 class="font-bold text-lg">Typography</h3>
					<span class="grow"/>
					<UButton
							class="cursor-pointer"
							icon="i-lucide-chevron-down"
							color="neutral"
							variant="ghost"
							@click="showTypography = !showTypography"/>
				</div>
			</template>

			<div v-if="!showTypography" class="flex items-center gap-2 -my-2">
				<UIcon name="i-lucide-type" size="20"/>
				<h3 class="font-bold text-lg">Typography</h3>
				<span class="grow"/>
				<UButton
						class="cursor-pointer"
						icon="i-lucide-chevron-up"
						color="neutral"
						variant="ghost"
						@click="showTypography = !showTypography"/>
			</div>

			<div v-else class="flex flex-wrap gap-4">
				<UFormField label="Base Size" class="grow min-w-36">
					<USlider
						v-model="state.font.size"
						class="mt-2 z-10"
						:min="8"
						:max="14"
						:step="0.25"/>
					<div class="relative flex w-full pt-1">
							<span class="absolute w-full text-center text-(--ui-primary)">
								{{ state.font.size }}
							</span>

						<span class="ml-1">8</span>
						<span class="grow"/>
						<span class="mr-1">14</span>
					</div>

					<template #hint>
						<div class="flex items-center gap-1">
							<UTooltip text="The base size refers to the font size of the main text in your resume.">
								<UIcon name="i-lucide-help-circle" size="15"/>
							</UTooltip>
						</div>
					</template>
				</UFormField>

				<UFormField label="Title" class="grow min-w-36">
					<USlider
						v-model="state.font.titleSizes.h1"
						class="mt-2 z-10"
						:min="10"
						:max="24"
						:step="0.25"/>
					<div class="relative flex w-full pt-1">
							<span class="absolute w-full text-center text-(--ui-primary)">
								{{ state.font.titleSizes.h1 }}
							</span>

						<span class="ml-1">10</span>
						<span class="grow"/>
						<span class="mr-1">24</span>
					</div>

					<template #hint>
						<div class="flex items-center gap-1">
							<UTooltip text="The title size refers to the font size of the main title in your resume.">
								<UIcon name="i-lucide-help-circle" size="15"/>
							</UTooltip>
						</div>
					</template>
				</UFormField>

				<UFormField label="Subtitle" class="grow min-w-36">
					<USlider
						v-model="state.font.titleSizes.h2"
						class="mt-2 z-10"
						:min="10"
						:max="24"
						:step="0.25"/>
					<div class="relative flex w-full pt-1">
							<span class="absolute w-full text-center text-(--ui-primary)">
								{{ state.font.titleSizes.h2 }}
							</span>

						<span class="ml-1">10</span>
						<span class="grow"/>
						<span class="mr-1">24</span>
					</div>

					<template #hint>
						<div class="flex items-center gap-1">
							<UTooltip text="The subtitle size refers to the font size of the main subtitle in your resume.">
								<UIcon name="i-lucide-help-circle" size="15"/>
							</UTooltip>
						</div>
					</template>
				</UFormField>

				<UFormField label="Section titles" class="grow min-w-36">
					<USlider
							v-model="state.font.titleSizes.h3"
							class="mt-2 z-10"
							:min="10"
							:max="20"
							:step="0.25"/>
					<div class="relative flex w-full pt-1">
							<span class="absolute w-full text-center text-(--ui-primary)">
								{{ state.font.titleSizes.h3 }}
							</span>

						<span class="ml-1">10</span>
						<span class="grow"/>
						<span class="mr-1">20</span>
					</div>

					<template #hint>
						<div class="flex items-center gap-1">
							<UTooltip text="The section title size refers to the font size of the titles of each section in your resume.">
								<UIcon name="i-lucide-help-circle" size="15"/>
							</UTooltip>
						</div>
					</template>
				</UFormField>

				<UFormField label="Line Height" class="grow min-w-36">
					<USlider
							v-model="state.font.lineHeight"
							class="mt-2 z-10"
							:min="1.25"
							:max="1.5"
							:step="0.025"/>
					<div class="relative flex w-full pt-1">
							<span class="absolute w-full text-center text-(--ui-primary)">
								{{ state.font.lineHeight }}
							</span>

						<span class="ml-1">1.25</span>
						<span class="grow"/>
						<span class="mr-1">1.5</span>
					</div>

					<template #hint>
						<div class="flex items-center gap-1">
							<UTooltip text="The line height refers to the height of each line of text in your resume.">
								<UIcon name="i-lucide-help-circle" size="15"/>
							</UTooltip>
						</div>
					</template>
				</UFormField>

<!--				<UFormField label="Font Family" class="grow">-->
<!--					<USelect-->
<!--						v-model="state.font.family"-->
<!--						:items="[-->
<!--							{ label: 'Inter', value: 'inter' },-->
<!--							{ label: 'Roboto', value: 'roboto' },-->
<!--							{ label: 'Public Sans', value: 'public-sans' },-->
<!--							{ label: 'Open Sans', value: 'open-sans' },-->
<!--							{ label: 'Lato', value: 'lato' },-->
<!--							{ label: 'Calibri', value: 'calibri' },-->
<!--							{ label: 'Garamond', value: 'garamond' },-->
<!--							{ label: 'Verdana', value: 'verdana' }-->
<!--						]"-->
<!--						variant="soft"-->
<!--						class="w-full"/>-->
<!--				</UFormField>-->
			</div>
		</UCard>



		<UCard>
			<template v-if="showColors" #header>
				<div class="flex items-center gap-2">
					<UIcon name="i-lucide-palette" size="20"/>
					<h3 class="font-bold text-lg">Colors</h3>
					<span class="grow"/>
					<UButton
							class="cursor-pointer"
							icon="i-lucide-chevron-down"
							color="neutral"
							variant="ghost"
							@click="showColors = !showColors"/>
				</div>
			</template>

			<div v-if="!showColors" class="flex items-center gap-2 -my-2">
				<UIcon name="i-lucide-palette" size="20"/>
				<h3 class="font-bold text-lg">Colors</h3>
				<span class="grow"/>
				<UButton
						class="cursor-pointer"
						icon="i-lucide-chevron-up"
						color="neutral"
						variant="ghost"
						@click="showColors = !showColors"/>
			</div>

			<div v-else class="flex flex-col gap-4">
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

					<UFormField label="Elevated Section Title" class="grow">
						<FormColorPicker
								v-model="state.colors.text.sectionTitleElevated"
								:default-color="defaults.colors.text.sectionTitleElevated"/>
					</UFormField>

					<UFormField label="Base Text" class="grow">
						<FormColorPicker
								v-model="state.colors.text.base"
								:default-color="defaults.colors.text.base"/>
					</UFormField>

					<UFormField label="Elevated Base Text" class="grow">
						<FormColorPicker
								v-model="state.colors.text.baseElevated"
								:default-color="defaults.colors.text.baseElevated"/>
					</UFormField>
				</div>

				<USeparator/>

				<div class="flex flex-wrap gap-4">
					<UFormField label="Language Badges" class="grow">
						<FormColorPicker
								v-model="state.colors.languageBadges"
								:default-color="defaults.colors.languageBadges"/>
					</UFormField>

					<UFormField label="Active Badge" class="grow">
						<FormColorPicker
								v-model="state.colors.active"
								:default-color="defaults.colors.active"/>
					</UFormField>

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



		<UCard>
			<template v-if="showSections" #header>
				<div class="flex items-center gap-2">
					<UIcon name="i-lucide-layout-grid" size="20"/>
					<h3 class="font-bold text-lg">Sections</h3>
					<span class="grow"/>
					<UButton
							class="cursor-pointer"
							icon="i-lucide-chevron-down"
							color="neutral"
							variant="ghost"
							@click="showSections = !showSections"/>
				</div>
			</template>

			<div v-if="!showSections" class="flex items-center gap-2 -my-2">
				<UIcon name="i-lucide-layout-grid" size="20"/>
				<h3 class="font-bold text-lg">Sections</h3>
				<span class="grow"/>
				<UButton
						class="cursor-pointer"
						icon="i-lucide-chevron-up"
						color="neutral"
						variant="ghost"
						@click="showSections = !showSections"/>
			</div>

			<div v-else class="flex flex-col gap-4">
				<h3>Minor Sections</h3>

				<div class="flex flex-col gap-2">
					<div
							v-for="(section, key) in state.sections.minor"
							:key="key"
							class="flex items-center gap-2">
						<USwitch v-model="section.enabled"/>
						<span>{{ key![0]!.toUpperCase() + key!.slice(1) }}</span>
						<span class="grow"/>
						<!-- todo: allow order changing (possible data structure change needed) -->
					</div>
				</div>

				<h3>Major Sections</h3>

				<div class="flex flex-col gap-2">
					<div
							v-for="(section, key) in state.sections.major"
							:key="key"
							class="flex items-center gap-2">
						<USwitch v-model="section.enabled"/>
						<span>{{ key![0]!.toUpperCase() + key!.slice(1) }}</span>
						<span class="grow"/>
						<!-- todo: allow order changing (possible data structure change needed) -->
					</div>
				</div>
			</div>
		</UCard>



		<UCard>
			<template v-if="showEffects" #header>
				<div class="flex items-center gap-2">
					<UIcon name="i-lucide-wand-2" size="20"/>
					<h3 class="font-bold text-lg">Effects</h3>
					<span class="grow"/>
					<UButton
							class="cursor-pointer"
							icon="i-lucide-chevron-down"
							color="neutral"
							variant="ghost"
							@click="showEffects = !showEffects"/>
				</div>
			</template>

			<div v-if="!showEffects" class="flex items-center gap-2 -my-2">
				<UIcon name="i-lucide-wand-2" size="20"/>
				<h3 class="font-bold text-lg">Effects</h3>
				<span class="grow"/>
				<UButton
						class="cursor-pointer"
						icon="i-lucide-chevron-up"
						color="neutral"
						variant="ghost"
						@click="showEffects = !showEffects"/>
			</div>

			<div v-else class="flex flex-col gap-4">
				<div class="flex flex-wrap gap-4">
					<UFormField label="Use Shades" class="grow">
						<USwitch v-model="state.effects.useShades"/>
					</UFormField>

					<UFormField label="Use Avatar Shade" class="grow">
						<USwitch v-model="state.effects.useAvatarShade"/>
					</UFormField>

					<UFormField label="Use Gradients" class="grow">
						<USwitch v-model="state.effects.useGradients"/>
					</UFormField>

					<UFormField label="Use Borders" class="grow">
						<USwitch v-model="state.effects.useBorders"/>
					</UFormField>

					<UFormField v-if="state.effects.useGradients" label="Project Gradient Base Color" class="grow">
						<FormColorPicker
								v-model="state.effects.projectGradientColor"
								:default-color="defaults.effects.projectGradientColor"/>
					</UFormField>
				</div>

				<div class="flex flex-wrap gap-4">
					<UFormField v-if="state.effects.useBorders" label="Border Width" class="grow">
						<USlider
							v-model="state.effects.borderWidth"
							class="mt-2 z-10"
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
	</UForm>
</template>

<style scoped>

</style>