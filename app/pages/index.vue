<script setup lang="ts">

// Showcase items for "Created by Developers, for Developers" section
const showcase = ref([
  {
    title: 'User-Friendly Interface',
    description: 'Intuitive design that makes resume creation simple and efficient.',
    icon: 'i-lucide-square-mouse-pointer',
  },
  {
    title: 'Customizable Templates',
    description: 'A variety of modern templates that can be tailored to your style.',
    icon: 'i-lucide-layout',
  },
  {
    title: 'Cloud Storage',
    description: 'Save and access your resumes from anywhere with our secure cloud storage.',
    icon: 'i-lucide-cloud',
  }
])

// Features for Feature Section
const features = ref([
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
])


// Stepper items for "How It Works" section
import type { StepperItem } from '@nuxt/ui'

const items: StepperItem[] = [
  {
    title: 'Fill your Information',
    description: 'Enter your personal, educational, and professional details using our intuitive form-based editor',
    icon: 'i-lucide-edit'
  }, {
    title: 'Customize your Style of the Resume',
    description: 'Choose from a variety of modern templates and personalize colors, fonts, and layout to match your style',
    icon: 'i-lucide-truck'
  }, {
    title: 'Export your Resume and Apply',
    description: 'Download your resume in PDF or HTML format with a single click, ready to impress potential employers',
    icon: 'i-lucide-download'
  }
]

const active = ref(3)
</script>

<template>
  <div class="-mt-16 -mb-32">

    <!-- Title/Hero Section -->
    <UPageHero
      title="Welcome to ResuGen"
      description="Create stunning resumes effortlessly with our intuitive resume builder.">

      <template #top>
        <LazyGeneralHeroBackgroundStars />
      </template>

      <template #links>
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
              to="https://github.com/LeeKrane/ResuGen"
              target="_blank"
            />
          </div>
        </div>
      </template>
    </UPageHero>
    
    <!-- Picture Marquee -->
    <UPageSection>
      <div class="relative w-full h-[400px] bg-muted overflow-hidden rounded-lg ">
        <UMarquee
          reverse
          orientation="vertical"
          :overlay="false"
          :ui="{
            root: '[--duration:40s] absolute w-[460px] -left-[100px] -top-[300px] h-[940px] transform-3d rotate-x-55 rotate-y-0 rotate-z-30'
          }"
        >
          <img
            v-for="i in 4"
            :key="i"
            :src="`https://ui.nuxt.com/blocks/image${i}.png`"
            width="460"
            height="258"
            :alt="`Nuxt UI Screenshot ${i}`"
            class="aspect-video border border-default rounded-lg bg-white"
          />
        </UMarquee>
        <UMarquee
          orientation="vertical"
          :overlay="false"
          :ui="{
            root: '[--duration:40s] absolute w-[460px] -top-[400px] left-[480px] h-[1160px] transform-3d rotate-x-55 rotate-y-0 rotate-z-30'
          }">
          <img
            v-for="i in [5, 6, 7, 8]"
            :key="i"
            :src="`https://ui.nuxt.com/blocks/image${i}.png`"
            width="460"
            height="258"
            :alt="`Nuxt UI Screenshot ${i}`"
            class="aspect-video border border-default rounded-lg bg-white"/>
        </UMarquee>
        <UMarquee
          reverse
          orientation="vertical"
          :overlay="false"
          :ui="{
            root: 'hidden md:flex [--duration:40s] absolute w-[460px] -top-[300px] left-[1020px] h-[1060px] transform-3d rotate-x-55 rotate-y-0 rotate-z-30'
          }">
          <img
            v-for="i in [9, 10, 11, 12]"
            :key="i"
            :src="`https://ui.nuxt.com/blocks/image${i}.png`"
            width="460"
            height="258"
            :alt="`Nuxt UI Screenshot ${i}`"
            class="aspect-video border border-default rounded-lg bg-white"/>
        </UMarquee>
      </div>
    </UPageSection>

    <!-- Showcase Section -->
    <UPageSection
      title="Created by Developers, for Developers"
      description="ResuGen is built with modern web technologies to ensure a seamless and efficient resume-building experience."
      icon="i-lucide-rocket"
      orientation="horizontal"
      :features="showcase">
      <img
        src="https://picsum.photos/800/600"
        alt="Illustration"
        class=" max-h-fit rounded-lg"/>
    </UPageSection>

    <!-- Feature Section -->
    <UPageSection
      title="Why Choose ResuGen?"
      description="Discover the benefits that make ResuGen the ideal choice for creating your professional resume."
    >
      <UPageGrid>
        <UPageCard
          v-for="feature in features"
          :key="feature.title"
          :title="feature.title"
          :description="feature.description"
          :icon="feature.icon"
          spotlight/>
      </UPageGrid>
    </UPageSection>

    <!-- How It Works Section -->
    <UPageSection
      title="How It Works">
      <template #description>
        Creating your resume with ResuGen is simple and straightforward.
        <br />
        Follow these easy steps to get started.
      </template>
      <UStepper v-model="active" :items="items" class="w-full hidden md:flex" disabled/>
      <UStepper v-model="active" :items="items" class="w-full flex md:hidden" orientation="vertical" disabled/>
    </UPageSection>

    <!-- Ready to Get Started Section -->
    <USeparator />
    <UPageCTA
      title="Ready to Create Your Professional Resume?"
      description="Join thousands of job seekers who have successfully landed their dream jobs with ResuGen."
      :links="[
        {
          label: 'Get started',
          color: 'primary',
          icon: 'i-lucide-square-pen',
          trailingIcon: 'i-lucide-arrow-right',
          to: '/edit'
        },
        {
          label: 'Learn more about ResuGen',
          variant: 'subtle',
          icon: 'i-simple-icons-github',
          to: 'https://github.com/LeeKrane/ResuGen',
        }
      ]"
      variant="naked"
      class="overflow-hidden">
      <LazyGeneralStarsBg />
    </UPageCTA>
  </div>
</template>
