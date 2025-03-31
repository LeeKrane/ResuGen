<script setup lang="ts">
import {useElementSize, useMediaQuery, useWindowSize} from "@vueuse/core";
import {onMounted, onUnmounted, ref} from "vue";

definePageMeta({
	layout: "resume-view"
})

const slideOverBody = ref<HTMLDivElement | null>(null)
const slideOverBodyWidth = useElementSize(slideOverBody).width

const mobile = useMediaQuery("(max-width: 640px)")
const stylingOpen = ref(false)
const isPrinting = ref(false)

const width = ref(210*4)
const height = ref(297*4)

const updateSize = () => {
	width.value = Math.max(1, (useWindowSize().width.value - 32))
	height.value = Math.max(1, (((useWindowSize().width.value / 210) * 297) - 32))
}

watch(stylingOpen, () => updateSize())

onMounted(() => {
	window.addEventListener('resize', updateSize)
	setTimeout(() => {updateSize()}, 1000)
})

onUnmounted(() => window.removeEventListener('resize', updateSize))

</script>

<template>
	<div class="flex flex-col items-center justify-center gap-4">
		<UButtonGroup class="print:hidden sticky top-20 z-50">
			<USlideover
				v-model:open="stylingOpen"
				:side="mobile ? 'bottom' : 'right'"
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
							'max-h-[50dvh]': mobile,
							'max-h-full': !mobile
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
				icon="i-lucide-printer"/>

		</UButtonGroup>

		<div
				:style="!isPrinting && {
					width: `${width - slideOverBodyWidth}px`,
					height: `${height - slideOverBodyWidth}px`
				}"
				class="print:w-[210mm] print:h-[297mm] max-w-3xl max-h-[calc(var(--container-3xl)*297/210)] bg-(--ui-primary) shadow-xl mx-auto origin-top-left print:shadow-none not-print:m-4 not-print:rounded-lg">
			Content
		</div>
	</div>
</template>

<style scoped>

</style>