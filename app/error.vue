<script setup lang="ts">
defineProps<{
	error: {
		statusCode: number
		message?: string
	}
}>()
</script>

<template>
	<div class="min-h-[80vh] flex flex-col items-center justify-center gap-6 p-8">
		<!-- Error Icon -->
		<div class="relative">
			<UIcon
				:name="error.statusCode === 404 ? 'i-lucide-file-question' : 'i-lucide-alert-circle'"
				:class="[
					'text-8xl opacity-10',
					error.statusCode === 404 ? 'text-(--ui-primary)' : 'text-red-500'
				]"
			/>
			<span
				:class="[
					'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-mono font-bold text-2xl',
					error.statusCode === 404 ? 'text-(--ui-primary)' : 'text-red-500'
				]"
			>
				{{ error.statusCode }}
			</span>
		</div>

		<!-- Error Message -->
		<div class="text-center">
			<h1 class="text-2xl font-semibold mb-2">
				{{
					error.statusCode === 404
						? 'Page Not Found'
						: error.statusCode === 403
							? 'Access Denied'
							: 'An Error Occurred'
				}}
			</h1>
			<p class="text-gray-500 max-w-md">
				{{
					error.message ||
					(error.statusCode === 404
							? 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.'
							: error.statusCode === 403
								? 'You don\'t have permission to access this page.'
								: 'Something went wrong. Please try again later.'
					)
				}}
			</p>
		</div>

		<!-- Suggestions (Only for 404) -->
		<div v-if="error.statusCode === 404" class="text-center text-sm text-gray-500 max-w-md">
			<p>You might want to:</p>
			<ul class="mt-2 space-y-1">
				<li>• Check the URL for typos</li>
				<li>• Go back to the previous page</li>
				<li>• Start from the homepage</li>
			</ul>
		</div>

		<!-- Action Buttons -->
		<div class="flex items-center gap-4 mt-4">
			<UButton
				label="Go Home"
				to="/"
				icon="i-lucide-home"
				:color="error.statusCode === 404 ? 'primary' : 'red'"
			/>
			<UButton
				label="Go Back"
				icon="i-lucide-arrow-left"
				color="gray"
				variant="soft"
				@click="() => window.history.back()"
			/>
		</div>

		<!-- Support Link -->
		<div class="flex flex-col items-center gap-2 mt-8">
			<p v-if="error.statusCode === 404" class="text-sm text-gray-400">
				Looking for something specific? Try the
				<NuxtLink
					to="/docs"
					class="text-(--ui-primary) hover:underline"
				>
					documentation
				</NuxtLink>
			</p>
			<p class="text-sm text-gray-400">
				Need help?
				<a
					href="mailto:support+resugen@krane.dev"
					:class="[
						'hover:underline',
						error.statusCode === 404 ? 'text-(--ui-primary)' : 'text-red-500'
					]"
				>
					Contact support
				</a>
			</p>
		</div>
	</div>
</template>
