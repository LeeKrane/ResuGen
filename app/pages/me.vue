<script setup lang="ts">
useSeoMeta({
	title: 'My Profile - ResuGen',
	description: 'Manage your ResuGen profile, view your resumes, and customize your account settings.'
})

const user = useSupabaseUser()

const profileFeatures = ref([
	{
		icon: 'i-lucide-file-text',
		title: 'Resume Management',
		description: 'View, edit, and organize all your resumes in one centralized dashboard.',
		action: 'View Resumes',
		to: '/resumes'
	},
	{
		icon: 'i-lucide-settings',
		title: 'Account Settings',
		description: 'Customize your profile, preferences, and account security settings.',
		action: 'Manage Settings',
		to: '/settings'
	},
	{
		icon: 'i-lucide-download-cloud',
		title: 'Export History',
		description: 'Access your download history and re-export previous resume versions.',
		action: 'Coming Soon',
		disabled: true
	},
	{
		icon: 'i-lucide-bar-chart-3',
		title: 'Analytics & Insights',
		description: 'Track resume performance and get insights on your job application success.',
		action: 'Coming Soon',
		disabled: true
	}
])
</script>

<template>
	<div class="-mt-16 -mb-32">
		<!-- Hero Section -->
		<UPageHero 
			:title="`Welcome back${user?.user_metadata?.full_name ? ', ' + user.user_metadata.full_name : ''}!`"
			description="Manage your resumes, track your progress, and take control of your career journey.">

			<template #top>
				<LazyGeneralHeroBackgroundStars />
			</template>

			<template #links>
				<div class="flex flex-col items-center gap-6">
					<UAlert 
						icon="i-lucide-wrench" 
						color="info" 
						variant="soft" 
						title="Profile Dashboard Coming Soon"
						description="We're building a comprehensive dashboard to help you manage your career tools and track your success."
						class="max-w-lg items-center" />
				</div>
			</template>
		</UPageHero>

		<!-- Profile Features Section -->
		<UPageSection 
			title="Your Profile Dashboard"
			description="Everything you need to manage your professional presence and career tools in one place.">
			<UPageGrid>
				<UPageCard 
					v-for="feature in profileFeatures" 
					:key="feature.title"
					:title="feature.title"
					:description="feature.description" 
					:icon="feature.icon"
					spotlight>
					<template #footer>
						<UButton 
							:label="feature.action"
							:to="feature.to"
							:disabled="feature.disabled"
							color="primary"
							variant="ghost"
							size="sm"
							class="w-full justify-center" />
					</template>
				</UPageCard>
			</UPageGrid>
		</UPageSection>

		<!-- Current Status Section -->
		<UPageSection 
			title="What's Available Now"
			description="While we build your complete profile dashboard, here's what you can do today.">
			<div class="grid md:grid-cols-2 gap-6">
				<UCard>
					<template #header>
						<div class="flex items-center gap-3">
							<UIcon name="i-lucide-check-circle" class="w-5 h-5 text-green-500" />
							<h3 class="font-semibold text-green-700">Ready to Use</h3>
						</div>
					</template>
					<div class="space-y-3">
						<div class="flex items-center gap-2 text-sm">
							<UIcon name="i-lucide-file-plus" class="w-4 h-4 text-gray-500" />
							<span>Create and edit resumes</span>
						</div>
						<div class="flex items-center gap-2 text-sm">
							<UIcon name="i-lucide-palette" class="w-4 h-4 text-gray-500" />
							<span>Customize themes and layouts</span>
						</div>
						<div class="flex items-center gap-2 text-sm">
							<UIcon name="i-lucide-download" class="w-4 h-4 text-gray-500" />
							<span>Export to PDF and other formats</span>
						</div>
						<div class="flex items-center gap-2 text-sm">
							<UIcon name="i-lucide-upload" class="w-4 h-4 text-gray-500" />
							<span>Import existing resumes</span>
						</div>
					</div>
				</UCard>

				<UCard>
					<template #header>
						<div class="flex items-center gap-3">
							<UIcon name="i-lucide-clock" class="w-5 h-5 text-blue-500" />
							<h3 class="font-semibold text-blue-700">Coming Soon</h3>
						</div>
					</template>
					<div class="space-y-3">
						<div class="flex items-center gap-2 text-sm text-gray-600">
							<UIcon name="i-lucide-user-circle" class="w-4 h-4" />
							<span>Detailed profile management</span>
						</div>
						<div class="flex items-center gap-2 text-sm text-gray-600">
							<UIcon name="i-lucide-trending-up" class="w-4 h-4" />
							<span>Resume performance analytics</span>
						</div>
						<div class="flex items-center gap-2 text-sm text-gray-600">
							<UIcon name="i-lucide-history" class="w-4 h-4" />
							<span>Version history and backups</span>
						</div>
						<div class="flex items-center gap-2 text-sm text-gray-600">
							<UIcon name="i-lucide-share-2" class="w-4 h-4" />
							<span>Portfolio and sharing tools</span>
						</div>
					</div>
				</UCard>
			</div>
		</UPageSection>

		<!-- Account Overview -->
		<UPageSection 
			title="Account Overview"
			description="Quick access to your account information and settings.">
			<div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<UCard class="text-center">
					<div class="flex flex-col items-center gap-2">
						<UAvatar 
							:alt="user?.user_metadata?.full_name || user?.email || 'User'"
							:src="user?.user_metadata?.avatar_url"
							size="lg" />
						<div>
							<p class="font-medium">{{ user?.user_metadata?.full_name || 'User' }}</p>
							<p class="text-sm text-gray-500">{{ user?.email }}</p>
						</div>
					</div>
				</UCard>

				<UButton 
					label="View All Resumes"
					icon="i-lucide-folder"
					color="neutral"
					variant="outline"
					to="/resumes"
					class="h-full justify-center" />

				<UButton 
					label="Account Settings"
					icon="i-lucide-settings"
					color="neutral"
					variant="outline"
					to="/settings"
					class="h-full justify-center" />

				<UButton 
					label="Get Help"
					icon="i-lucide-help-circle"
					color="neutral"
					variant="outline"
					to="/docs"
					class="h-full justify-center" />
			</div>
		</UPageSection>

		<!-- Background Section -->
		<div class="relative overflow-hidden py-16">
			<LazyGeneralStarsBg />
			<div class="relative z-10 text-center">
				<h2 class="text-2xl font-bold mb-4">Your Career Journey Starts Here</h2>
				<p class="text-gray-600 max-w-lg mx-auto">
					We're building powerful tools to help you track your progress, analyze your success, 
					and take control of your professional growth.
				</p>
			</div>
		</div>
	</div>
</template>