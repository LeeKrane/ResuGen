<script setup lang="ts">
import {sleep} from "@antfu/utils";
</script>

<template>
	<UButtonGroup>
		<UButton
			label="Generate"
			icon="i-ri-ai-generate"
			to="/resume"
		/>
		<GeneralResumeLoader />
		<UButton
			label="Export"
			icon="i-material-symbols-file-export-rounded"
			variant="outline"
			loading-auto
			@click="async () => {await sleep(1000)}"
		/>
	</UButtonGroup>
</template>

<style scoped>

</style>