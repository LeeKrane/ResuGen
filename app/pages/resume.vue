<script setup lang="ts">
import {useElementSize, useMediaQuery, useWindowSize} from "@vueuse/core"
import {useVueToPrint} from "vue-to-print"

definePageMeta({
	layout: "resume-view"
})

const resumeContainer = ref<HTMLDivElement | null>(null)
const coverLetterContainer = ref<HTMLDivElement | null>(null)

const { handlePrint } = useVueToPrint({
	content: () => resumeContainer.value!,
	documentTitle: "Resume"
})

const { handlePrint: handlePrintCoverLetter } = useVueToPrint({
	content: () => coverLetterContainer.value!,
	documentTitle: "Cover_Letter"
})

const { hasCoverLetter } = useCoverLetter()
const resumeData = useRefResumeData()

// Computed properties to check if content is available for printing
const hasResumeContent = computed(() => {
	try {
		const data = resumeData
		if (!data) return false
		
		// Check basic fields first (most common case)
		if (data.name.value?.trim() || data.email.value?.trim() || data.phone.value?.trim() || data.summary.value?.trim()) {
			return true
		}
		
		// Check arrays only if basic fields are empty
		if (Array.isArray(data.experience.value) && data.experience.value.some(exp => exp?.position?.trim() || exp?.text?.trim())) {
			return true
		}
		
		if (Array.isArray(data.education.value) && data.education.value.some(edu => edu?.degree?.trim() || edu?.text?.trim())) {
			return true
		}
		
		if (Array.isArray(data.projects.value) && data.projects.value.some(proj => proj?.name?.trim() || proj?.description?.trim())) {
			return true
		}
		
		if (Array.isArray(data.skillCategories.value) && data.skillCategories.value.some(cat => 
			cat?.name?.trim() || (Array.isArray(cat?.skills) && cat.skills.some(skill => skill?.name?.trim()))
		)) {
			return true
		}
		
		return false
	} catch (error) {
		console.error('Error in hasResumeContent computed:', error)
		return false
	}
})

const hasCoverLetterContent = computed(() => hasCoverLetter.value)

const slideOverBody = ref<HTMLDivElement | null>(null)
const slideOverBodyWidth = useElementSize(slideOverBody).width

const mobile = useMediaQuery("(max-width: 640px)")
const styleSliderBottom = useMediaQuery("(max-width: 1024px)")

const stylingOpen = ref(false)
const isPrinting = ref(false)

let maxWidth = ref(10000)

const route = useRoute()
const isFromEdit = computed(() => !!route.query.print)

const goBackToEdit = () => {
	navigateTo('/edit')
}

onMounted(() => {
	maxWidth = computed (() => useWindowSize().width.value - (mobile.value ? 32 : slideOverBodyWidth.value + 32 + 48))
	
	// Handle auto-print from edit page
	if (route.query.print) {
		console.log('Auto-print triggered for:', route.query.print)
		console.log('hasResumeContent:', hasResumeContent.value)
		console.log('hasCoverLetterContent:', hasCoverLetterContent.value)
		
		// Wait a bit longer for components to fully render
		setTimeout(() => {
			try {
				if (route.query.print === 'resume' && hasResumeContent.value) {
					console.log('Attempting to print resume...')
					console.log('resumeContainer.value:', resumeContainer.value)
					handlePrint()
				} else if (route.query.print === 'cover-letter' && hasCoverLetterContent.value) {
					console.log('Attempting to print cover letter...')
					console.log('coverLetterContainer.value:', coverLetterContainer.value)
					handlePrintCoverLetter()
				}
			} catch (error) {
				console.error('Print error:', error)
			}
		}, 1000) // Wait 1 second for components to render
	}
})
</script>

<template>
	<div class="flex flex-col items-center justify-center gap-4">
		<UFieldGroup class="print:hidden sticky top-20 z-50">
			<!-- Back to Edit button when coming from edit page -->
			<UTooltip
				v-if="isFromEdit"
				text="Return to the resume editor"
				:delay-duration="0"
				arrow>
				<UButton
					label="Back to Edit"
					color="neutral"
					variant="soft"
					class="mx-auto cursor-pointer bg-(--ui-neutral)/20 backdrop-blur-sm transition-all duration-200 hover:bg-(--ui-neutral)/30 hover:scale-105"
					icon="i-lucide-arrow-left"
					@click="goBackToEdit"/>
			</UTooltip>
			<USlideover
				v-model:open="stylingOpen"
				:side="styleSliderBottom ? 'bottom' : 'right'"
				:overlay="false"
				:close-threshold="0.2">
				<UTooltip
					text="Customize the appearance and styling of your resume"
					:delay-duration="0"
					arrow>
					<UButton
						label="Configure Styling"
						color="info"
						variant="soft"
						class="mx-auto cursor-pointer bg-(--ui-info)/20 backdrop-blur-sm transition-all duration-200 hover:bg-(--ui-info)/30 hover:scale-105"
						icon="i-lucide-wand-2"/>
				</UTooltip>

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

			<UTooltip
				:text="hasResumeContent ? 'Download your resume as PDF' : 'Add content to your resume to enable printing'"
				:delay-duration="0"
				arrow>
				<UButton
					label="Print Resume"
					:color="hasResumeContent ? 'primary' : 'neutral'"
					variant="soft"
					:disabled="!hasResumeContent"
					:class="[
						'mx-auto backdrop-blur-sm transition-all duration-200',
						hasResumeContent 
							? 'cursor-pointer bg-(--ui-primary)/20 hover:bg-(--ui-primary)/30 hover:scale-105' 
							: 'cursor-not-allowed bg-(--ui-neutral)/10 text-(--ui-neutral)/50 opacity-60'
					]"
					icon="i-lucide-printer"
					@click="() => {
						console.log('Manual print resume clicked')
						console.log('resumeContainer.value:', resumeContainer.value)
						if (hasResumeContent) handlePrint()
					}"/>
			</UTooltip>
			
			<UTooltip
				:text="hasCoverLetterContent ? 'Download your cover letter as PDF' : 'Create a cover letter to enable printing'"
				:delay-duration="0"
				arrow>
				<UButton
					label="Print Cover Letter"
					:color="hasCoverLetterContent ? 'primary' : 'neutral'"
					variant="soft"
					:disabled="!hasCoverLetterContent"
					:class="[
						'mx-auto backdrop-blur-sm transition-all duration-200',
						hasCoverLetterContent 
							? 'cursor-pointer bg-(--ui-primary)/20 hover:bg-(--ui-primary)/30 hover:scale-105' 
							: 'cursor-not-allowed bg-(--ui-neutral)/10 text-(--ui-neutral)/50 opacity-60'
					]"
					icon="i-lucide-file-text"
					@click="() => {
						console.log('Manual print cover letter clicked')
						console.log('coverLetterContainer.value:', coverLetterContainer.value)
						if (hasCoverLetterContent) handlePrintCoverLetter()
					}"/>
			</UTooltip>
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