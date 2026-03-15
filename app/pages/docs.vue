<script setup lang="ts">

useSeoMeta({
  title: 'Documentation - ResuGen',
  description: 'Complete documentation for ResuGen - learn how to create professional resumes with our modern builder.'
})

const sections = ref([
  {
    icon: 'i-lucide-rocket',
    title: 'Getting Started',
    description: 'Learn the basics of creating your first resume with ResuGen\'s intuitive interface.'
  },
  {
    icon: 'i-lucide-palette',
    title: 'Customization Guide',
    description: 'Discover how to personalize your resume with custom colors, fonts, and layouts.'
  },
  {
    icon: 'i-lucide-download',
    title: 'Export Options',
    description: 'Understand the different ways to export and share your completed resume.'
  },
  {
    icon: 'i-lucide-shield-check',
    title: 'Best Practices',
    description: 'Tips and tricks for creating ATS-friendly resumes that get noticed by employers.'
  }
])

const quickLinks = ref([
  { label: 'Create Account', to: '/register', icon: 'i-lucide-user-plus' },
  { label: 'Login', to: '/login', icon: 'i-lucide-log-in' },
  { label: 'GitHub Repository', to: 'https://github.com/LeeKrane/ResuGen', icon: 'i-simple-icons-github', target: '_blank' }
])
</script>

<template>
  <div class="-mt-16 -mb-32">
    <!-- Hero Section -->
    <UPageHero
      title="Documentation"
      description="Everything you need to know about creating professional resumes with ResuGen.">
      
      <template #top>
        <LazyGeneralHeroBackgroundStars />
      </template>

      <template #links>
        <div class="flex flex-col items-center gap-6">
          <UAlert
            icon="i-lucide-construction"
			color="warning"
            variant="soft"
            title="Documentation Coming Soon"
            description="We're crafting comprehensive guides and tutorials to help you make the most of ResuGen."
            class="max-w-md items-center"
          />
          
		<div class="flex items-center gap-3 text-sm">
			<UButton label="Create Resume" color="primary" icon="i-lucide-square-pen"
				:to="useSupabaseUser().value ? '/resumes' : '/login'" />

			<div class="h-4 w-px bg-gray-200" />

			<UButton label="Back to Home" color="neutral" variant="ghost" icon="i-lucide-home" to="/" />
		</div>
        </div>
      </template>
    </UPageHero>

    <!-- What's Coming Section -->
    <UPageSection
      title="What's Coming"
      description="Our documentation will cover everything you need to create outstanding resumes with ResuGen."
    >
      <UPageGrid>
        <UPageCard
          v-for="section in sections"
          :key="section.title"
          :title="section.title"
          :description="section.description"
          :icon="section.icon"
          spotlight
        />
      </UPageGrid>
    </UPageSection>

    <!-- Quick Links Section -->
    <UPageSection
      title="Quick Links"
      description="While we're preparing the full documentation, here are some helpful links to get you started."
    >
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <UButton
          v-for="link in quickLinks"
          :key="link.label"
          :label="link.label"
          :icon="link.icon"
          :to="link.to"
          :target="link.target"
          color="neutral"
          variant="outline"
          class="justify-start"
          block
        />
      </div>
    </UPageSection>

    <!-- Temporary Help Section -->
    <UPageSection
      title="Need Help Right Now?"
      description="While our documentation is in progress, here are some ways to get assistance."
    >
      <div class="grid md:grid-cols-3 gap-6">
        <UCard>
          <template #header>
            <div class="flex items-center gap-3">
              <UIcon name="i-lucide-mail" class="w-5 h-5 text-primary"/>
              <h3 class="font-semibold">Contact Support</h3>
            </div>
          </template>
          <p class="text-gray-600 mb-4">Have questions? Reach out to our support team for assistance.</p>
          <UButton
            label="Send Email"
            icon="i-lucide-external-link"
            color="primary"
            variant="outline"
            to="mailto:support+resugen@krane.dev"
            size="sm"
          />
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center gap-3">
              <UIcon name="i-lucide-bug" class="w-5 h-5 text-primary"/>
              <h3 class="font-semibold">Report Issues</h3>
            </div>
          </template>
          <p class="text-gray-600 mb-4">Found a bug or have a feature request? Let us know on GitHub.</p>
          <UButton
            label="GitHub Issues"
            icon="i-lucide-external-link"
            color="primary"
            variant="outline"
            to="https://github.com/LeeKrane/ResuGen/issues"
            target="_blank"
            size="sm"
          />
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center gap-3">
              <UIcon name="i-lucide-code" class="w-5 h-5 text-primary"/>
              <h3 class="font-semibold">Source Code</h3>
            </div>
          </template>
          <p class="text-gray-600 mb-4">Explore the codebase and contribute to ResuGen's development.</p>
          <UButton
            label="View Repository"
            icon="i-lucide-external-link"
            color="primary"
            variant="outline"
            to="https://github.com/LeeKrane/ResuGen"
            target="_blank"
            size="sm"
          />
        </UCard>
      </div>
    </UPageSection>

    <!-- Background Section -->
    <div class="relative overflow-hidden py-16">
      <LazyGeneralStarsBg />
      <div class="relative z-10 text-center">
        <h2 class="text-2xl font-bold mb-4">Documentation in Progress</h2>
        <p class="text-gray-600 max-w-md mx-auto">
          Comprehensive guides and tutorials are being crafted to help you master ResuGen. 
          Check back soon for updates.
        </p>
      </div>
    </div>
  </div>
</template>