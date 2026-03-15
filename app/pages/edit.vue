<script setup lang="ts">
import { useVueToPrint } from "vue-to-print"

/*definePageMeta({
	layout: "data-edit"
})*/

const { isIT } = useJobField()
const activeTab = ref("0")

// Print functionality no refs needed since we navigate to resume page

// Print functionality, render components inline for printing
const resumeContainer = ref<HTMLDivElement | null>(null)
const coverLetterContainer = ref<HTMLDivElement | null>(null)
const showPrintModal = ref(false)
const printType = ref<'resume' | 'cover-letter'>('resume')

const { handlePrint: vueToPrintResume } = useVueToPrint({
	content: () => resumeContainer.value!,
	documentTitle: "Resume",
	onAfterPrint: () => {
		showPrintModal.value = false
	}
})

const { handlePrint: vueToPrintCoverLetter } = useVueToPrint({
	content: () => coverLetterContainer.value!,
	documentTitle: "Cover_Letter",
	onAfterPrint: () => {
		showPrintModal.value = false
	}
})

const handlePrint = () => {
	if (hasResumeContent.value) {
		printType.value = 'resume'
		showPrintModal.value = true
		nextTick(() => {
			setTimeout(() => {
				if (resumeContainer.value) {
					vueToPrintResume()
				}
			}, 1000)
		})
	}
}

const handlePrintCoverLetter = () => {
	if (hasCoverLetterContent.value) {
		printType.value = 'cover-letter'
		showPrintModal.value = true
		nextTick(() => {
			setTimeout(() => {
				if (coverLetterContainer.value) {
					vueToPrintCoverLetter()
				}
			}, 1000)
		})
	}
}

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

const tabItems = computed(() => {
	const baseTabs = [
		{
			label: "General",
			icon: "i-lucide-user",
			slot: "general",
		},
		{
			label: "Cover Letter",
			icon: "i-lucide-file-text",
			slot: "cover-letter",
		},
		{
			label: "Education",
			icon: "i-lucide-graduation-cap",
			slot: "education",
		},
		{
			label: "Experience",
			icon: "i-lucide-briefcase",
			slot: "experience",
		},
	]

	// Add Projects tab only for IT field
	if (isIT.value) {
		baseTabs.push({
			label: "Projects",
			icon: "i-lucide-code",
			slot: "projects",
		})
	}

	return baseTabs
})
</script>

<template>
	<div>
		<div class="flex flex-col mx-auto w-[clamp(24rem,65vw,56rem)]">
			<FormJobFieldSelector/>
		</div>

		<div class="sticky top-16 w-full z-40 flex justify-center">
			<UTabs
				v-model="activeTab"
				class="mx-auto w-[clamp(24rem,65vw,56rem)] bg-(--ui-bg)/20 backdrop-blur-xs pt-2"
				color="neutral"
				variant="pill"
				:items="tabItems"/>
		</div>

		<!-- Print Buttons -->
		<div class="sticky top-32 w-full z-30 flex justify-center mb-4">
			<UFieldGroup class="mx-auto bg-(--ui-bg)/20 backdrop-blur-xs">
				<UButton
					label="Print Resume"
					:color="hasResumeContent ? 'primary' : 'neutral'"
					variant="soft"
					:disabled="!hasResumeContent"
					:class="[
						'backdrop-blur-sm',
						hasResumeContent 
							? 'cursor-pointer bg-(--ui-primary)/20' 
							: 'cursor-not-allowed bg-(--ui-neutral)/10 text-(--ui-neutral)/50'
					]"
					icon="i-lucide-printer"
					@click="handlePrint"/>
				
				<UButton
					label="Print Cover Letter"
					:color="hasCoverLetterContent ? 'primary' : 'neutral'"
					variant="soft"
					:disabled="!hasCoverLetterContent"
					:class="[
						'backdrop-blur-sm',
						hasCoverLetterContent 
							? 'cursor-pointer bg-(--ui-primary)/20' 
							: 'cursor-not-allowed bg-(--ui-neutral)/10 text-(--ui-neutral)/50'
					]"
					icon="i-lucide-file-text"
					@click="handlePrintCoverLetter"/>
			</UFieldGroup>
		</div>

		<div class="flex flex-col mx-auto w-[clamp(24rem,65vw,56rem)]">
			<div :class="activeTab === '0' ? 'block' : 'hidden'">
				<FormGeneral/>
			</div>

			<div :class="activeTab === '1' ? 'block' : 'hidden'">
				<FormCoverLetter/>
			</div>

			<div :class="activeTab === '2' ? 'block' : 'hidden'">
				<FormEducation/>
			</div>

			<div :class="activeTab === '3' ? 'block' : 'hidden'">
				<FormExperience/>
			</div>

			<div v-if="isIT" :class="activeTab === '4' ? 'block' : 'hidden'">
				<FormProjects/>
			</div>
		</div>

		<!-- Hidden print containers - only visible during printing -->
		<div v-if="showPrintModal" class="hidden print:block">
			<div v-if="printType === 'resume'" ref="resumeContainer">
				<RCTwoColumn />
			</div>
			<div v-if="printType === 'cover-letter'" ref="coverLetterContainer">
				<RCoverLetter />
			</div>
		</div>
	</div>
</template>

<style scoped>

</style>