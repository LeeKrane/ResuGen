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
			backgroundColor: style.colors.bg || '#FFFFFF',
			fontSize: `${style.font.size}pt`,
			lineHeight: style.font.lineHeight,
			color: style.colors.text.base,
		}"
		class="flex flex-col not-print:w-3xl not-print:min-h-[calc(var(--container-3xl)*297/210)] print:w-[210mm] print:h-[297mm] overflow-y-clip"
		:style-2="`padding: ${style.layout.margin / 8 + 1.5}rem ${style.layout.margin / 8 + 2}rem`">

		<!-- Single-column ATS-friendly layout -->
		<div
			:style="{
				padding: `${style.layout.margin / 8 + 1.5}rem ${style.layout.margin / 8 + 2}rem`,
			}"
			class="flex flex-col flex-grow">

			<!-- Sender header block -->
			<div class="flex flex-col gap-0.5 mb-4">
				<h1
					:style="{
						fontSize: `${style.font.titleSizes.h1}pt`,
						color: style.colors.text.title,
					}"
					class="font-bold">
					{{ data.name.value || 'Your Name' }}
				</h1>

				<div class="flex flex-wrap items-center gap-x-3 gap-y-0.5"
					:style="{ color: style.colors.text.subtitle }">
					<span v-if="data.email.value" class="flex items-center gap-1">
						<UIcon name="i-lucide-mail" :size="style.font.size * 1.25" class="shrink-0"/>
						{{ data.email.value }}
					</span>
					<span v-if="data.phone.value" class="flex items-center gap-1">
						<UIcon name="i-lucide-phone" :size="style.font.size * 1.25" class="shrink-0"/>
						{{ data.phone.value }}
					</span>
					<span v-if="data.address.value" class="flex items-center gap-1">
						<UIcon name="i-lucide-map-pin" :size="style.font.size * 1.25" class="shrink-0"/>
						{{ data.address.value }}
					</span>
				</div>
			</div>

			<!-- Accent line separator -->
			<div
				class="h-0.5 w-full mb-4"
				:style="{ backgroundColor: style.colors.bgElevated || style.colors.text.title }"/>

			<!-- Date -->
			<div class="mb-4">
				{{ formattedDate }}
			</div>

			<!-- Recipient block -->
			<div
				v-if="data.coverLetter.value.recipientName || data.coverLetter.value.companyName"
				class="flex flex-col gap-0.5 mb-4">
				<span v-if="data.coverLetter.value.recipientName">
					{{ data.coverLetter.value.recipientName }}
				</span>
				<span v-if="data.coverLetter.value.companyName">
					{{ data.coverLetter.value.companyName }}
				</span>
			</div>

			<!-- Subject line -->
			<div v-if="data.coverLetter.value.position" class="mb-4">
				<span class="font-bold"
					:style="{ color: style.colors.text.title }">
					Re: Application for {{ data.coverLetter.value.position }}
				</span>
			</div>


			<div
				class="whitespace-pre-wrap flex-grow leading-relaxed"
				:style="{
					lineHeight: style.font.lineHeight,
				}">
				{{ data.coverLetter.value.content }}
			</div>

			<!-- Closing -->
			<div class="mt-8 flex flex-col gap-4">
				<div>Sincerely,</div>
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
