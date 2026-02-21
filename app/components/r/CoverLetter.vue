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
		}"
		class="flex not-print:w-3xl not-print:min-h-[calc(var(--container-3xl)*297/210)] print:w-[210mm] print:h-[297mm] overflow-y-clip">

		<!-- Left sidebar matching resume style -->
		<div
			:style="{
				width: `${(style.layout.margin/8*32.5 + 250) * (style.layout.sizeRatio / 100) * 3}px`,
				padding: `${style.layout.margin/8 + 1}rem`,
				paddingRight: style.layout.style === 'fancy' ? `${style.layout.margin/8}rem` : `${style.layout.margin/8 + 1}rem`,
				backgroundColor: `${style.layout.showBackground ? style.colors.bgElevated : undefined}`,
				gap: `${style.layout.sectionSpacing/8}rem`,
				color: style.colors.text.baseElevated,
			}"
			class="flex flex-col">
			
			<!-- Personal info matching resume -->
			<div class="flex flex-col gap-2">
				<h1 
					:style="{ 
						fontSize: `${style.font.titleSizes.h1}pt`,
						color: style.colors.text.sectionTitleElevated 
					}"
					class="font-bold">
					{{ data.name.value || 'Your Name' }}
				</h1>
				
				<!-- Contact info with icons like resume -->
				<div class="flex flex-col gap-1">
					<div v-if="data.email.value" class="flex items-center gap-2">
						<UIcon name="i-lucide-mail" :size="style.font.size * 1.5" class="shrink-0"/>
						<span class="shrink">{{ data.email.value }}</span>
					</div>
					<div v-if="data.phone.value" class="flex items-center gap-2">
						<UIcon name="i-lucide-phone" :size="style.font.size * 1.5" class="shrink-0"/>
						<span class="shrink">{{ data.phone.value }}</span>
					</div>
					<div v-if="data.address.value" class="flex items-center gap-2">
						<UIcon name="i-lucide-map-pin" :size="style.font.size * 1.5" class="shrink-0"/>
						<span class="shrink">{{ data.address.value }}</span>
					</div>
				</div>
			</div>

			<!-- Date -->
			<div class="mt-4">
				<h3 
					:style="{ 
						fontSize: `${style.font.titleSizes.h3}pt`,
						color: style.colors.text.sectionTitleElevated 
					}"
					class="font-bold mb-2">
					Date
				</h3>
				<div>{{ formattedDate }}</div>
			</div>

			<!-- Recipient info -->
			<div v-if="data.coverLetter.value.recipientName || data.coverLetter.value.companyName" class="mt-4">
				<h3 
					:style="{ 
						fontSize: `${style.font.titleSizes.h3}pt`,
						color: style.colors.text.sectionTitleElevated 
					}"
					class="font-bold mb-2">
					Recipient
				</h3>
				<div class="flex flex-col gap-1">
					<div v-if="data.coverLetter.value.recipientName">
						{{ data.coverLetter.value.recipientName }}
					</div>
					<div v-if="data.coverLetter.value.companyName">
						{{ data.coverLetter.value.companyName }}
					</div>
				</div>
			</div>
		</div>

		<!-- Main content area -->
		<div
			:style="{
				padding: `${style.layout.margin/8 + 1}rem`,
				gap: `${style.layout.sectionSpacing/8}rem`,
				color: style.colors.text.base,
			}"
			class="flex flex-col flex-grow">
			
			<!-- Subject line -->
			<div v-if="data.coverLetter.value.position" class="mb-4">
				<h2 
					:style="{ 
						fontSize: `${style.font.titleSizes.h2}pt`,
						color: style.colors.text.title 
					}"
					class="font-bold">
					Re: {{ data.coverLetter.value.position }}
				</h2>
			</div>

			<!-- Cover letter content -->
			<div 
				class="whitespace-pre-wrap flex-grow"
				:style="{ 
					lineHeight: style.font.lineHeight,
					color: style.colors.text.base 
				}">
				{{ data.coverLetter.value.content }}
			</div>

			<!-- Signature (removed "Sincerely") -->
			<div class="mt-8">
				<div 
					:style="{ color: style.colors.text.title }"
					class="font-semibold">
					{{ data.name.value || 'Your Name' }}
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>

</style>
