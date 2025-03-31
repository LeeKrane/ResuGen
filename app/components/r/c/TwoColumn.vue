<script setup lang="ts">
const previewImage = useState<string | null>("previewImage", () => null)
const style = useResumeStyle()
const data = useRefResumeData()
</script>

<template>
	<div
			:style="{
				backgroundColor: `${style.layout.showBackground ? style.colors.bg : undefined}`
			}"
			class="flex not-print:w-3xl not-print:h-[calc(var(--container-3xl)*297/210)]">
		<div
				:style="{
					width: `${(style.layout.margin/8+12)*10.25*2}px`,
					padding: `${style.layout.margin/8 + 1}rem`,
					backgroundColor: `${style.layout.showBackground ? style.colors.bgElevated : undefined}`,
				}"
				class="flex flex-col flex-wrap gap-2 h-full">
			<UAvatar
					v-if="previewImage"
					:src="previewImage"
					class="m-2 w-48 h-48 rounded-full"/>
			<h1>Personal Information</h1>
			<USeparator color="warning"/>
			<ULink
					class="flex items-center gap-2"
					:to="`mailto:${data.email.value}`">
				<UIcon name="i-lucide-mail" size="20"/>
				<span class="shrink">{{ data.email }}</span>
			</ULink>
			<ULink
					class="flex items-center gap-2"
					:to="`tel:${data.phone.value}`">
				<UIcon name="i-lucide-phone" size="20"/>
				<span class="shrink">{{ data.phone }}</span>
			</ULink>
			<ULink
					class="flex items-center gap-2"
					:to="`https://maps.google.com/?q=${data.address.value}`">
				<UIcon name="i-lucide-map-pin" size="20"/>
				<span class="shrink">{{ data.address }}</span>
			</ULink>
		</div>
		<div
				:style="{
					padding: `${style.layout.margin/8}rem`,
				}"
				class="h-full">

		</div>
	</div>
</template>

<style scoped>

</style>