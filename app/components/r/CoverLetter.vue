<script setup lang="ts">
const style = useResumeStyle()
const data = useRefResumeData()

const today = new Date()
const formattedDate = computed(() => {
	return today.toLocaleDateString('en-US', { 
		year: 'numeric', 
		month: 'long', 
		day: 'numeric' 
	})
})
</script>

<template>
	<div
		:style="{
			backgroundColor: `${style.layout.showBackground ? style.colors.bg : undefined}`,
			fontSize: `${style.font.size}pt`,
			lineHeight: style.font.lineHeight,
			color: style.colors.text.base,
		}"
		class="not-print:w-3xl not-print:min-h-[calc(var(--container-3xl)*297/210)] print:w-[210mm] print:h-[297mm]">
		
		<div
			:style="{
				padding: `${style.layout.margin/8 + 1}rem`,
				gap: `${style.layout.sectionSpacing/8}rem`,
			}"
			class="flex flex-col h-full">
			
			<!-- Header with sender info -->
			<div class="flex flex-col gap-1">
				<h1 
					:style="{ 
						fontSize: `${style.font.titleSizes.h1}pt`,
						color: style.colors.text.title 
					}"
					class="font-bold">
					{{ data.name.value || 'Your Name' }}
				</h1>
				<div 
					:style="{ color: style.colors.text.subtitle }"
					class="text-sm">
					<div v-if="data.email.value">{{ data.email.value }}</div>
					<div v-if="data.phone.value">{{ data.phone.value }}</div>
					<div v-if="data.address.value">{{ data.address.value }}</div>
				</div>
			</div>

			<!-- Date -->
			<div class="mt-4">
				{{ formattedDate }}
			</div>

			<!-- Recipient info -->
			<div v-if="data.coverLetter.value.recipientName || data.coverLetter.value.companyName" class="flex flex-col">
				<div v-if="data.coverLetter.value.recipientName">
					{{ data.coverLetter.value.recipientName }}
				</div>
				<div v-if="data.coverLetter.value.companyName">
					{{ data.coverLetter.value.companyName }}
				</div>
			</div>

			<!-- Subject line -->
			<div v-if="data.coverLetter.value.position" class="font-semibold mt-2">
				Re: {{ data.coverLetter.value.position }}
			</div>

			<!-- Cover letter content -->
			<div 
				class="mt-4 whitespace-pre-wrap flex-grow"
				:style="{ lineHeight: style.font.lineHeight }">
				{{ data.coverLetter.value.content }}
			</div>

			<!-- Signature -->
			<div class="mt-8">
				<div>Sincerely,</div>
				<div class="mt-4 font-semibold">{{ data.name.value || 'Your Name' }}</div>
			</div>
		</div>
	</div>
</template>

<style scoped>

</style>
