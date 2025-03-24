<script setup lang="ts">

</script>

<template>
	<div class="flex flex-col items-center justify-center h-full gap-4">
		<h1 class="flex items-center font-bold text-4xl">
			<span class="text-(--ui-text)">Resu</span>
			<span class="text-(--ui-primary)">Gen</span>
		</h1>

		<p class="text-lg text-gray-500 mt-2 mb-6 text-center max-w-lg">
			Create professional resumes effortlessly with our modern, customizable resume generator
		</p>

		<div class="flex flex-col items-center gap-6">
			<UButton
				label="Create Resume"
				to="/edit"
				icon="i-lucide-square-pen"
				size="xl"
			/>

			<div class="flex items-center gap-3 text-sm">
				<UButton
					label="View Demo"
					color="neutral"
					variant="ghost"
					icon="i-lucide-presentation"
					to="/demo"
				/>

				<div class="h-4 w-px bg-gray-200"/>

				<UButton
					label="Source"
					color="neutral"
					variant="ghost"
					icon="i-simple-icons-gitlab"
					to="https://gitlab.com/LeeKrane/kranes-resume-generator"
					target="_blank"
				/>
			</div>
		</div>

		<div class="mt-12 flex flex-col items-center gap-4">
			<div class="grid grid-cols-3 gap-8 text-center">
				<div class="flex flex-col items-center gap-2">
					<UIcon name="i-lucide-wand-2" class="text-2xl text-(--ui-primary)"/>
					<h3 class="font-medium">Easy to Use</h3>
					<p class="text-sm text-gray-500">Intuitive form-based editor</p>
				</div>

				<div class="flex flex-col items-center gap-2">
					<UIcon name="i-lucide-palette" class="text-2xl text-(--ui-primary)"/>
					<h3 class="font-medium">Customizable</h3>
					<p class="text-sm text-gray-500">Personalize colors and layout</p>
				</div>

				<div class="flex flex-col items-center gap-2">
					<UIcon name="i-lucide-download" class="text-2xl text-(--ui-primary)"/>
					<h3 class="font-medium">Export Ready</h3>
					<p class="text-sm text-gray-500">Download as PDF or HTML</p>
				</div>
			</div>
		</div>
	</div>
</template>
