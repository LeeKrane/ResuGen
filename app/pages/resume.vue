<script setup lang="ts">
import {useElementSize, useMediaQuery, useWindowSize} from "@vueuse/core"
import {useVueToPrint} from "vue-to-print"

definePageMeta({
	layout: "resume-view"
})

const resumeContainer = ref<HTMLDivElement | null>(null)
const coverLetterContainer = ref<HTMLDivElement | null>(null)

const { handlePrint } = useVueToPrint({
	content: resumeContainer,
	documentTitle: "Resume"
})

const { handlePrint: handlePrintCoverLetter } = useVueToPrint({
	content: coverLetterContainer,
	documentTitle: "Cover_Letter"
})

const { hasCoverLetter } = useCoverLetter()

const slideOverBody = ref<HTMLDivElement | null>(null)
const slideOverBodyWidth = useElementSize(slideOverBody).width

const mobile = useMediaQuery("(max-width: 640px)")
const styleSliderBottom = useMediaQuery("(max-width: 1024px)")

const stylingOpen = ref(false)
const isPrinting = ref(false)

let maxWidth = ref(10000)

onMounted(() => {
	maxWidth = computed (() => useWindowSize().width.value - (mobile.value ? 32 : slideOverBodyWidth.value + 32 + 48))
})
</script>

<template>
	<div class="flex flex-col items-center justify-center gap-4">
		<UFieldGroup class="print:hidden sticky top-20 z-50">
			<USlideover
				v-model:open="stylingOpen"
				:side="styleSliderBottom ? 'bottom' : 'right'"
				:overlay="false"
				:close-threshold="0.2">
				<UButton
					label="Configure Styling"
					color="info"
					variant="soft"
					class="mx-auto cursor-pointer bg-(--ui-info)/20 backdrop-blur-sm"
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
						<RStyleController/>
					</div>
				</template>
			</USlideover>

			<UButton
				label="Print Resume"
				color="primary"
				variant="soft"
				class="mx-auto cursor-pointer bg-(--ui-primary)/20 backdrop-blur-sm"
				icon="i-lucide-printer"
				@click="handlePrint"/>
			
			<UButton
				label="Print Cover Letter"
				color="primary"
				variant="soft"
				class="mx-auto cursor-pointer bg-(--ui-primary)/20 backdrop-blur-sm"
				icon="i-lucide-file-text"
				@click="handlePrintCoverLetter"/>
		</UFieldGroup>

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
			class="max-h-[calc(100vh-13rem)] print:w-[210mm] print:h-[297mm] not-print:w-3xl not-print:h-[calc(var(--container-3xl)*297/210)] shadow-xl mx-auto origin-top-left print:shadow-none not-print:m-4 transition-transform overflow-scroll">
			<div ref="resumeContainer">
				<RCTwoColumn />
			</div>
		</div>

		<!-- Cover Letter Preview -->
		<div
			v-if="hasCoverLetter && !mobile"
			:style="!isPrinting && {
				maxWidth: `${maxWidth}px`,
				transform: `translateX(${-(!styleSliderBottom && slideOverBodyWidth > 0 ? slideOverBodyWidth + 48 : 0)/2}px)`,
			}"
			class="max-h-[calc(100vh-13rem)] print:w-[210mm] print:h-[297mm] not-print:w-3xl not-print:h-[calc(var(--container-3xl)*297/210)] shadow-xl mx-auto origin-top-left print:shadow-none not-print:m-4 transition-transform overflow-scroll">
			<div ref="coverLetterContainer">
				<RCoverLetter />
			</div>
		</div>
	</div>
</template>

<style scoped>

</style>