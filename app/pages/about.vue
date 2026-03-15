<script setup lang="ts">
useSeoMeta({
	title: 'About ResuGen',
	description: 'Learn more about ResuGen - the modern resume builder focused on simplicity and professional design.'
})

const features = ref([
	{
		icon: 'i-lucide-users',
		title: 'Our Mission',
		description: 'Empowering job seekers with professional resume creation tools that stand out in today\'s competitive market.'
	},
	{
		icon: 'i-lucide-code',
		title: 'Built with Modern Tech',
		description: 'Developed using Nuxt 3, Vue 3, and NuxtUI for a fast, responsive, and intuitive user experience.'
	},
	{
		icon: 'i-lucide-heart',
		title: 'Made with Care',
		description: 'Crafted by developers who understand the importance of a great first impression in your career journey.'
	}
])
</script>

<template>
	<div class="-mt-16 -mb-32">
		<!-- Hero Section -->
		<UPageHero title="About ResuGen"
			description="Learn more about our mission to revolutionize resume creation with modern, user-friendly tools.">

			<template #top>
				<LazyGeneralHeroBackgroundStars />
			</template>

			<template #links>
				<div class="flex flex-col items-center gap-6">
					<UAlert 
						icon="i-lucide-construction" 
						color="warning" 
						variant="soft" 
						title="Under Construction"
						description="We're working hard to bring you detailed information about ResuGen. Check back soon!"
						class="max-w-md items-center" />

					<div class="flex items-center gap-3 text-sm">
						<UButton label="Create Resume" color="primary" icon="i-lucide-square-pen"
							:to="useSupabaseUser().value ? '/resumes' : '/login'" />

						<div class="h-4 w-px bg-gray-200" />

						<UButton label="Back to Home" color="neutral" variant="ghost" icon="i-lucide-home" to="/" />
					</div>
				</div>
			</template>
		</UPageHero>

		<!-- What We're Building Section -->
		<UPageSection title="What We're Building"
			description="ResuGen is more than just a resume builder - it's a comprehensive platform designed to help you succeed in your career journey.">
			<UPageGrid>
				<UPageCard v-for="feature in features" :key="feature.title" :title="feature.title"
					:description="feature.description" :icon="feature.icon" spotlight />
			</UPageGrid>
		</UPageSection>

		<!-- Coming Soon Section -->
		<UPageSection title="Coming Soon"
			description="We're working on exciting features and detailed information to share with you.">
			<div class="grid md:grid-cols-2 gap-6">
				<UCard>
					<template #header>
						<div class="flex items-center gap-3">
							<UIcon name="i-lucide-timeline" class="w-5 h-5 text-primary" />
							<h3 class="font-semibold">Our Story</h3>
						</div>
					</template>
					<p class="text-gray-600">Learn about the journey that led to creating ResuGen and our vision for the
						future
						of resume building.</p>
				</UCard>

				<UCard>
					<template #header>
						<div class="flex items-center gap-3">
							<UIcon name="i-lucide-team" class="w-5 h-5 text-primary" />
							<h3 class="font-semibold">Meet the Team</h3>
						</div>
					</template>
					<p class="text-gray-600">Get to know the developers and designers behind ResuGen and their passion
						for
						helping job seekers succeed.</p>
				</UCard>
			</div>
		</UPageSection>

		<!-- Background Section -->
		<div class="relative overflow-hidden py-16">
			<LazyGeneralStarsBg />
			<div class="relative z-10 text-center">
				<h2 class="text-2xl font-bold mb-4">Stay Tuned</h2>
				<p class="text-gray-600 max-w-md mx-auto">
					We're excited to share more about ResuGen's story and the team behind it.
					Follow our progress and updates.
				</p>
			</div>
		</div>
	</div>
</template>