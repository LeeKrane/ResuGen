<script setup lang="ts">
const features = [
  {
    icon: 'i-lucide-wand-2',
    title: 'Easy to Use',
    description: 'Intuitive form-based editor that guides you through every step'
  },
  {
    icon: 'i-lucide-palette',
    title: 'Customizable',
    description: 'Personalize colors, layout, and sections to match your style'
  },
  {
    icon: 'i-lucide-download',
    title: 'Export Ready',
    description: 'Download your resume as PDF or HTML with one click'
  },
  {
    icon: 'i-lucide-layout-template',
    title: 'Modern Templates',
    description: 'Professional designs that stand out from traditional formats'
  },
  {
    icon: 'i-lucide-shield-check',
    title: 'ATS Friendly',
    description: 'Optimized for Applicant Tracking Systems to improve visibility'
  },
  {
    icon: 'i-lucide-refresh-ccw',
    title: 'Real-time Preview',
    description: 'See changes instantly as you build your perfect resume'
  }
]
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[85vh] gap-4 px-4">
    <!-- Hero Section -->
    <div class="text-center max-w-3xl mx-auto">
      <h1 class="flex items-center justify-center font-bold text-6xl mb-6">
        <span class="text-(--ui-text)">Resu</span>
        <span class="text-(--ui-primary)">Gen</span>
      </h1>

      <p class="text-xl text-gray-600 mt-2 mb-8">
        Create professional resumes effortlessly with our modern, customizable resume generator.
        Stand out from the crowd with ATS-friendly templates.
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
            label="Source Code"
            color="neutral"
            variant="ghost"
            icon="i-lucide-code"
            to="https://gitlab.com/LeeKrane/kranes-resume-generator"
            target="_blank"
          />
        </div>
      </div>
    </div>

    <!-- Features Grid -->
    <div class="mt-20 w-full max-w-6xl">
      <h2 class="text-2xl font-semibold text-center mb-12">Why Choose ResuGen?</h2>
      <div class="grid md:grid-cols-3 gap-8 px-4">
        <div v-for="feature in features" :key="feature.title" 
             class="flex flex-col items-center gap-3 p-6 rounded-xl border border-(--ui-border) hover:shadow-lg transition-shadow bg-(--ui-bg)/20 backdrop-blur-xs">
          <UIcon :name="feature.icon" class="text-3xl text-(--ui-primary)"/>
          <h3 class="font-medium text-lg">{{ feature.title }}</h3>
          <p class="text-sm text-gray-500 text-center">{{ feature.description }}</p>
        </div>
      </div>
    </div>

    <!-- How It Works -->
    <div class="mt-20 w-full max-w-4xl">
      <h2 class="text-2xl font-semibold text-center mb-12">How It Works</h2>
      <div class="grid md:grid-cols-3 gap-8 px-4">
        <div class="flex flex-col items-center text-center">
          <div class="w-12 h-12 rounded-full bg-(--ui-primary) text-white flex items-center justify-center mb-4">1</div>
          <h3 class="font-medium mb-2">Fill Your Details</h3>
          <p class="text-sm text-gray-500">Enter your information using our intuitive form-based editor</p>
        </div>
        <div class="flex flex-col items-center text-center">
          <div class="w-12 h-12 rounded-full bg-(--ui-primary) text-white flex items-center justify-center mb-4">2</div>
          <h3 class="font-medium mb-2">Customize Design</h3>
          <p class="text-sm text-gray-500">Choose colors and layout that match your style</p>
        </div>
        <div class="flex flex-col items-center text-center">
          <div class="w-12 h-12 rounded-full bg-(--ui-primary) text-white flex items-center justify-center mb-4">3</div>
          <h3 class="font-medium mb-2">Export & Apply</h3>
          <p class="text-sm text-gray-500">Download your professional resume and start applying</p>
        </div>
      </div>
    </div>

    <!-- CTA Section -->
    <div class="mt-20 mb-12 text-center">
      <h2 class="text-2xl font-semibold mb-4">Ready to Create Your Professional Resume?</h2>
      <p class="text-gray-500 mb-8">Join thousands of job seekers who have successfully landed their dream jobs</p>
      <UButton
        label="Get Started Now"
        to="/edit"
        icon="i-lucide-arrow-right"
        size="xl"
      />
    </div>
  </div>
</template>
