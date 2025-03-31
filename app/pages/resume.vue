<script setup lang="ts">
import {useElementSize, useMediaQuery, useWindowSize} from "@vueuse/core"
import {useVueToPrint} from "vue-to-print"

definePageMeta({
	layout: "resume-view"
})

const resumeContainer = ref<HTMLDivElement | null>(null)
const { handlePrint } = useVueToPrint({
	content: resumeContainer,
	documentTitle: "Resume"
})

const slideOverBody = ref<HTMLDivElement | null>(null)
const slideOverBodyWidth = useElementSize(slideOverBody).width

const mobile = useMediaQuery("(max-width: 640px)")
const styleSliderBottom = useMediaQuery("(max-width: 1024px)")

const stylingOpen = ref(false)
const isPrinting = ref(false)

const maxWidth = computed (() => useWindowSize().width.value - (mobile.value ? 32 : slideOverBodyWidth.value + 32 + 48))
</script>

<template>
	<div class="flex flex-col items-center justify-center gap-4">
		<UButtonGroup class="print:hidden sticky top-20 z-50">
			<USlideover
				v-model:open="stylingOpen"
				:side="styleSliderBottom ? 'bottom' : 'right'"
				:overlay="false"
				:close-threshold="0.2">
				<UButton
					label="Configure Styling"
					color="info"
					variant="soft"
					class="mx-auto cursor-pointer"
					icon="i-lucide-wand-2"/>

				<template #header>
					<div class="flex grow items-center gap-2 -mr-2">
						<UIcon name="i-lucide-wand-2" size="20"/>
						<h3 class="font-bold text-lg">Resume Styling</h3>
						<span class="grow"/>
						<UButton
							icon="i-lucide-x"
							color="neutral"
							variant="ghost"
							@click="stylingOpen = false"/>
					</div>
				</template>

				<template #body>
					<div
						ref="slideOverBody"
						class="overflow-auto w-full"
						:class="{
							'max-h-[50dvh]': styleSliderBottom,
							'max-h-full': !styleSliderBottom
						}"
					>
						<ResumeStyleController/>
					</div>
				</template>
			</USlideover>

			<UButton
				label="Print"
				color="primary"
				variant="soft"
				class="mx-auto cursor-pointer"
				icon="i-lucide-printer"
				@click="handlePrint"/>
		</UButtonGroup>

		<div v-if="mobile" class="flex flex-col items-center justify-center gap-4 px-4 py-16 text-center">
			<UIcon name="i-lucide-smartphone" class="text-4xl text-(--ui-primary)"/>
			<h3 class="font-medium text-lg">Mobile Preview Unavailable</h3>
			<p class="text-sm text-gray-500">Please use a larger screen to preview and edit your resume. The current viewport is too small to display the resume properly.</p>
			<p class="text-xs text-gray-400">Recommended minimum width: 640px</p>
		</div>
		<div
			v-else
			:style="!isPrinting && {
				maxWidth: `${maxWidth}px`,
				transform: `translateX(${-(!styleSliderBottom && slideOverBodyWidth > 0 ? slideOverBodyWidth + 48 : 0)/2}px)`,
			}"
			class="max-h-[calc(100vh-13rem)] print:w-[210mm] print:h-[297mm] not-print:w-3xl not-print:h-[calc(var(--container-3xl)*297/210)] shadow-xl mx-auto origin-top-left print:shadow-none not-print:m-4 not-print:rounded-lg transition-transform overflow-scroll">
			<div ref="resumeContainer" class="not-print:w-3xl not-print:h-[calc(var(--container-3xl)*297/210)]">

			</div>
		</div>
	</div>
</template>

<style scoped>

</style>