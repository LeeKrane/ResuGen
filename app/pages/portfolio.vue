<script setup lang="ts">
/**
 * Portfolio page — the user's single source-of-truth for applicant data.
 *
 * Strategy: load portfolio from DB → populate the shared useState slots used by
 * the existing form components (useRefResumeData) → reuse those components as-is.
 * On save, read back from those same slots and persist to DB via usePortfolio.save().
 *
 * This avoids duplicating form components while keeping the portfolio/resume
 * data flows cleanly separated.
 */

definePageMeta({ middleware: 'auth' })

const { portfolio, loading, error, load, save } = usePortfolio()
const state = useRefResumeData()
const { isIT } = useJobField()

const saving = ref(false)
const saveError = ref<string | null>(null)
const saveSuccess = ref(false)

// ─── Load portfolio into shared state on mount ───

onMounted(async () => {
  // Portfolio may already be loaded by the auth plugin — only fetch if null
  if (!portfolio.value) {
    await load()
  }
  if (portfolio.value) {
    _populateState(portfolio.value)
  }
})

// Also react if portfolio loads after mount (e.g. slow auth)
watch(portfolio, (p) => {
  if (p) _populateState(p)
}, { once: true })

/**
 * Populate the shared useState slots from a PortfolioData object.
 * The form components (FormGeneral, FormEducation, etc.) read from these slots.
 */
function _populateState(p: PortfolioData) {
  state.name.value = p.profile.subtitle ? '' : '' // name is not in portfolio profile
  state.subtitle.value = p.profile.subtitle ?? ''
  state.email.value = p.profile.email ?? ''
  state.phone.value = p.profile.phone ?? ''
  state.address.value = p.profile.address ?? ''
  state.summary.value = p.profile.summary ?? ''
  state.birthdate.value = p.profile.birthdate
  state.hobbies.value = p.profile.hobbies?.length ? p.profile.hobbies : ['']
  state.languages.value = p.languages?.length ? p.languages : [{ name: '' }]
  state.skillCategories.value = p.skillCategories?.length ? p.skillCategories : [{
    name: '',
    skills: [{ technology: { label: 'Custom', value: 'custom', icon: 'i-lucide-shapes' }, name: '', displayType: { label: 'Text', value: 'text', icon: 'i-lucide-letter-text' } }]
  }]
  state.links.value = p.links?.length ? p.links : [{ name: '', url: '' }]
  state.education.value = p.education?.length ? p.education : [{ degree: '', text: '', collapsibleOpen: true }]
  state.experience.value = p.experience?.length ? p.experience.map(e => ({ ...e, technologies: e.technologies ?? [] })) : [{ position: '', text: '', collapsibleOpen: true, technologies: [] }]
  state.projects.value = p.projects?.length ? p.projects.map(pr => ({ ...pr, technologies: pr.technologies ?? [] })) : [{ name: '', description: '', url: '', repoLink: { name: '', url: '' }, technologies: [] }]
  state.qualifications.value = p.certifications ?? []
  state.institutions.value = p.institutions?.length ? p.institutions : [{ name: '' }]
}

// ─── Save ───

async function savePortfolio() {
  saving.value = true
  saveError.value = null
  saveSuccess.value = false

  try {
    // Build PortfolioData from the current shared state
    const data: PortfolioData = {
      profile: {
        subtitle: state.subtitle.value,
        email: state.email.value,
        phone: state.phone.value,
        address: state.address.value,
        summary: state.summary.value,
        birthdate: state.birthdate.value,
        hobbies: state.hobbies.value.filter(h => h.trim()),
      },
      links: state.links.value,
      languages: state.languages.value,
      skillCategories: state.skillCategories.value,
      education: state.education.value,
      experience: state.experience.value,
      projects: state.projects.value,
      certifications: state.qualifications.value,
      institutions: state.institutions.value,
    }

    await save(data)
    saveSuccess.value = true
    // Clear success indicator after 3s
    setTimeout(() => { saveSuccess.value = false }, 3000)
  } catch (e: any) {
    saveError.value = e?.message ?? 'Failed to save portfolio'
  } finally {
    saving.value = false
  }
}

const activeTab = ref('0')

const tabItems = computed(() => {
  const tabs = [
    { label: 'General', icon: 'i-lucide-user', slot: 'general' },
    { label: 'Education', icon: 'i-lucide-graduation-cap', slot: 'education' },
    { label: 'Experience', icon: 'i-lucide-briefcase', slot: 'experience' },
    { label: 'Certifications', icon: 'i-lucide-award', slot: 'certifications' },
  ]
  if (isIT.value) {
    tabs.splice(3, 0, { label: 'Projects', icon: 'i-lucide-code', slot: 'projects' })
  }
  return tabs
})
</script>

<template>
  <div>
    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center items-center py-16">
      <UIcon name="i-lucide-loader-circle" class="animate-spin text-4xl text-(--ui-text-muted)" />
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="flex justify-center py-8">
      <UAlert color="error" :description="error" icon="i-lucide-alert-circle" />
    </div>

    <template v-else>
      <!-- Header: title + import CTA + save button -->
      <div class="flex flex-col mx-auto w-[clamp(24rem,65vw,56rem)] pt-4 pb-2 gap-3">
        <div class="flex items-center justify-between gap-4">
          <div>
            <h1 class="text-xl font-semibold">My Portfolio</h1>
            <p class="text-sm text-(--ui-text-muted)">Your personal data source for all resumes</p>
          </div>
          <div class="flex items-center gap-2">
            <!-- Import from file CTA -->
            <GeneralResumeLoader />
            <!-- Save button -->
            <UButton
              label="Save Portfolio"
              icon="i-lucide-save"
              color="primary"
              :loading="saving"
              :disabled="saving"
              class="cursor-pointer"
              @click="savePortfolio"
            />
          </div>
        </div>

        <!-- Save feedback -->
        <UAlert
          v-if="saveSuccess"
          color="success"
          description="Portfolio saved successfully."
          icon="i-lucide-check"
        />
        <UAlert
          v-if="saveError"
          color="error"
          :description="saveError"
          icon="i-lucide-alert-circle"
        />
      </div>

      <!-- Tab navigation -->
      <div class="sticky top-16 w-full z-40 flex justify-center">
        <UTabs
          v-model="activeTab"
          class="mx-auto w-[clamp(24rem,65vw,56rem)] bg-(--ui-bg)/20 backdrop-blur-xs pt-2"
          color="neutral"
          variant="pill"
          :items="tabItems"
        />
      </div>

      <!-- Tab content — reuse existing form components -->
      <div class="flex flex-col mx-auto w-[clamp(24rem,65vw,56rem)]">
        <div :class="activeTab === '0' ? 'block' : 'hidden'">
          <FormGeneral />
        </div>
        <div :class="activeTab === '1' ? 'block' : 'hidden'">
          <FormEducation />
        </div>
        <div :class="activeTab === '2' ? 'block' : 'hidden'">
          <FormExperience />
        </div>
        <div v-if="isIT" :class="activeTab === '3' ? 'block' : 'hidden'">
          <FormProjects />
        </div>
        <div :class="(isIT ? activeTab === '4' : activeTab === '3') ? 'block' : 'hidden'">
          <FormQualifications />
        </div>
      </div>
    </template>
  </div>
</template>
