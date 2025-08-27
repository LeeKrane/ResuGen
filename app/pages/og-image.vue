<script setup lang="ts">
// Set page metadata for Open Graph
useHead({
	title: 'ResuGen - Craft Your Perfect Resume Instantly',
	meta: [
		{ name: 'robots', content: 'noindex, nofollow' },
		{ property: 'og:title', content: 'ResuGen - Craft Your Perfect Resume' },
		{ property: 'og:description', content: 'Build your professional resume with ResuGen' },
		{ property: 'og:type', content: 'website' },
		{ property: 'og:image', content: '/og-image' }
	]
})

// Use a minimal layout for this route
definePageMeta({
	layout: 'empty'
})
</script>

<template>
	<div class="og-container">
		<!-- Background with subtle particles effect -->
		<div class="absolute inset-0 bg-gradient-to-br from-slate-900 to-blue-900">
			<!-- Static particles background -->
			<div class="absolute inset-0 overflow-hidden">
				<div class="absolute top-16 left-64 w-1 h-1 bg-blue-400 rounded-full opacity-45"/>
				<div class="absolute top-56 right-56 w-2 h-2 bg-slate-500 rounded-full opacity-35"/>
				<div class="absolute bottom-32 left-96 w-1.5 h-1.5 bg-blue-600 rounded-full opacity-50"/>
				<div class="absolute bottom-44 right-72 w-1 h-1 bg-slate-400 rounded-full opacity-40"/>
				<div class="absolute top-40 left-40 w-2.5 h-2.5 bg-blue-500 rounded-full opacity-30"/>
				<div class="absolute top-20 right-80 w-1 h-1 bg-slate-600 rounded-full opacity-55"/>
				<div class="absolute bottom-20 left-120 w-1.5 h-1.5 bg-blue-300 rounded-full opacity-45"/>
				<div class="absolute top-60 right-40 w-1 h-1 bg-slate-300 rounded-full opacity-35"/>
				<div class="absolute bottom-40 left-32 w-2 h-2 bg-blue-700 rounded-full opacity-40"/>
				<div class="absolute top-16 right-150 w-1 h-1 bg-slate-700 rounded-full opacity-50"/>
				<div class="absolute bottom-60 left-160 w-1.5 h-1.5 bg-blue-200 rounded-full opacity-60"/>
				<div class="absolute top-80 right-32 w-1 h-1 bg-slate-200 rounded-full opacity-30"/>
				<div class="absolute bottom-16 right-132 w-2 h-2 bg-blue-800 rounded-full opacity-25"/>
				<div class="absolute top-20 left-150 w-1 h-1 bg-slate-800 rounded-full opacity-45"/>
				<div class="absolute bottom-20 right-160 w-1.5 h-1.5 bg-blue-100 rounded-full opacity-55"/>
				<div class="absolute top-66 left-40 w-1 h-1 bg-slate-100 rounded-full opacity-40"/>
				<div class="absolute bottom-52 left-132 w-2.5 h-2.5 bg-blue-600 rounded-full opacity-35"/>
				<div class="absolute top-40 right-50 w-1 h-1 bg-slate-500 rounded-full opacity-50"/>
				<div class="absolute bottom-33 left-166 w-1.5 h-1.5 bg-blue-400 rounded-full opacity-45"/>
				<div class="absolute top-83 right-80 w-1 h-1 bg-slate-400 rounded-full opacity-40"/>
				<div class="absolute bottom-60 left-24 w-2 h-2 bg-blue-500 rounded-full opacity-30"/>
				<div class="absolute top-12 right-166 w-1 h-1 bg-slate-600 rounded-full opacity-55"/>
				<div class="absolute bottom-75 left-80 w-1.5 h-1.5 bg-blue-300 rounded-full opacity-45"/>
				<div class="absolute top-75 right-24 w-1 h-1 bg-slate-300 rounded-full opacity-35"/>
				<div class="absolute bottom-12 right-120 w-2.5 h-2.5 bg-blue-700 rounded-full opacity-40"/>
				<div class="absolute top-28 left-100 w-1 h-1 bg-slate-700 rounded-full opacity-50"/>
				<div class="absolute top-12 right-66 w-1 h-1 bg-slate-400 rounded-full opacity-35"/>
				<div class="absolute bottom-16 left-50 w-1.5 h-1.5 bg-blue-500 rounded-full opacity-40"/>
				<div class="absolute top-33 left-24 w-2 h-2 bg-slate-600 rounded-full opacity-30"/>
				<div class="absolute bottom-25 right-24 w-1 h-1 bg-blue-300 rounded-full opacity-45"/>
				<div class="absolute top-37 right-74 w-1.5 h-1.5 bg-slate-500 rounded-full opacity-50"/>
				<div class="absolute bottom-62 left-74 w-1 h-1 bg-blue-600 rounded-full opacity-35"/>
				<div class="absolute top-87 left-174 w-2 h-2 bg-slate-300 rounded-full opacity-40"/>
				<div class="absolute bottom-87 right-174 w-1.5 h-1.5 bg-blue-400 rounded-full opacity-45"/>
				<div class="absolute top-24 left-124 w-1 h-1 bg-slate-700 rounded-full opacity-30"/>
				<div class="absolute bottom-24 right-124 w-1.5 h-1.5 bg-blue-200 rounded-full opacity-55"/>
				<div class="absolute top-62 left-66 w-2 h-2 bg-slate-400 rounded-full opacity-40"/>
				<div class="absolute bottom-37 right-66 w-1 h-1 bg-blue-700 rounded-full opacity-35"/>
				<div class="absolute top-36 right-124 w-1.5 h-1.5 bg-slate-600 rounded-full opacity-45"/>
				<div class="absolute bottom-36 left-124 w-1 h-1 bg-blue-500 rounded-full opacity-50"/>
				<div class="absolute top-48 left-174 w-2 h-2 bg-slate-200 rounded-full opacity-30"/>
				<div class="absolute bottom-48 right-24 w-1.5 h-1.5 bg-blue-300 rounded-full opacity-40"/>

				<!-- Shining particles -->
				<div class="absolute top-25 left-132 w-2 h-2 bg-blue-400 rounded-full opacity-75 shadow-lg shadow-blue-400/50"/>
				<div
						class="absolute bottom-25 right-132 w-1.5 h-1.5 bg-blue-300 rounded-full opacity-80 shadow-md shadow-blue-300/40"/>
				<div
						class="absolute top-60 left-24 w-2.5 h-2.5 bg-blue-500 rounded-full opacity-70 shadow-lg shadow-blue-500/60"/>
				<div
						class="absolute bottom-40 right-24 w-1.5 h-1.5 bg-blue-200 rounded-full opacity-85 shadow-md shadow-blue-200/50"/>
				<div class="absolute top-12 left-100 w-2 h-2 bg-blue-400 rounded-full opacity-75 shadow-lg shadow-blue-400/45"/>
				<div
						class="absolute bottom-87 right-100 w-1.5 h-1.5 bg-blue-300 rounded-full opacity-80 shadow-md shadow-blue-300/55"/>
			</div>
		</div>

		<!-- Main content -->
		<div class="relative z-10 flex flex-col justify-center h-full px-28 py-12 gap-16">
			<!-- Logo and Brand -->
			<div class="flex items-center justify-center -my-12">
				<img src="/logo.png" alt="ResuGen Logo" class="w-44 h-44 object-contain mr-8">
				<div class="text-center">
					<h1 class="text-8xl scale-110 p-8 font-bold">
						<span class="text-slate-200">Resu</span>
						<span class="text-(--ui-primary)">Gen</span>
					</h1>
				</div>
			</div>

			<div class="flex justify-between">
				<!-- Main headline -->
				<div class="flex flex-col justify-center gap-6">
					<h2 class="text-[3.25rem] font-bold text-slate-200 max-w-5xl leading-tight">
						Craft Your Perfect Resume
					</h2>

					<!-- Call to action -->
					<div class="flex gap-4 justify-center text-3xl font-semibold text-slate-300">
						<p>Build</p>
						<p>Yours</p>
						<p>Today</p>
					</div>
				</div>

				<!-- Mini resume preview -->
				<div class="flex items-center justify-center gap-2 -mt-2">
					<div
							class="bg-slate-800 rounded-xl shadow-2xl p-6 border border-slate-700 transform rotate-4">
						<div
								class="w-72 h-36 bg-gradient-to-br from-slate-700 to-blue-800 rounded-lg flex items-center justify-center">
							<div class="text-center">
								<div class="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-3"/>
								<div class="h-3 bg-slate-600 rounded w-32 mx-auto mb-2"/>
								<div class="h-3 bg-slate-600 rounded w-28 mx-auto"/>
							</div>
						</div>
					</div>
				</div>
			</div>


			<!-- Feature highlights -->
			<div class="flex justify-center space-x-16 -mt-4 text-3xl font-semibold text-slate-300">
				<div class="flex items-center space-x-4">
					<div
							class="w-12 h-12 bg-green-900 rounded-full flex items-center justify-center">
						<svg
								class="w-8 h-8 fill-green-400"
								viewBox="0 0 20 20">
							<path
									fill-rule="evenodd"
									d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
									clip-rule="evenodd"/>
						</svg>
					</div>
					<span>ATS-Friendly</span>
				</div>

				<div class="flex items-center space-x-4">
					<div
							class="w-12 h-12 bg-rose-900 rounded-full flex items-center justify-center">
						<svg
								class="w-8 h-8 fill-rose-400"
								viewBox="0 0 20 20">
							<path
									d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
						</svg>
					</div>
					<span>Customizable</span>
				</div>

				<div class="flex items-center space-x-4">
					<div
							class="w-12 h-12 bg-purple-900 rounded-full flex items-center justify-center">
						<svg
								class="w-8 h-8 fill-purple-400"
								viewBox="0 0 20 20">
							<path
									fill-rule="evenodd"
									d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
									clip-rule="evenodd"/>
						</svg>
					</div>
					<span>Modern Design</span>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.og-container {
	width: 1280px;
	height: 640px;
	position: relative;
	background: white;
}


/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
	.og-container {
		background: #0f172a;
	}
}

/* Print styles for image generation */
@media print {
	.og-container {
		width: 1280px;
		height: 640px;
		margin: 0;
		page-break-after: always;
	}
}
</style>