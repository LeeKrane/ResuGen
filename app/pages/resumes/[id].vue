<script setup lang="ts">
/**
 * Resume edit page — loads a resume by ID, populates the shared useState slots,
 * and reuses the existing form components (same pattern as portfolio.vue).
 */

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const resumeId = route.params.id as string

const { loadResume, saveResume, listResumes } = useResumeDB()
const state = useRefResumeData()
const { isIT } = useJobField()

const loading = ref(true)
const loadError = ref<string | null>(null)
const saving = ref(false)
const saveError = ref<string | null>(null)
const saveSuccess = ref(false)
const resumeTitle = ref('Untitled Resume')

onMounted(async () => {
  try {
    const data = await loadResume(resumeId)
    if (!data) {
      loadError.value = 'Resume not found or you do not have access.'
      return
    }
    resumeTitle.value = data.name || 'Untitled Resume'
    _populateState(data)
  } catch (e: any) {
    loadError.value = e?.message ?? 'Failed to load resume'
  } finally {
    loading.value = false
  }
})

/**
 * Populate shared useState slots from a ResumeData object.
 */
function _populateState(data: ResumeData) {
  state.name.value = data.name ?? ''
  state.subtitle.value = data.subtitle ?? ''
  state.email.value = data.email ?? ''
  state.phone.value = data.phone ?? ''
  state.address.value = data.address ?? ''
  state.summary.value = data.summary ?? ''
  state.birthdate.value = data.birthdate
  state.hobbies.value = data.hobbies?.length ? data.hobbies : ['']
  state.languages.value = data.languages?.length ? data.languages : [{ name: '' }]
  state.skillCategories.value = data.skillCategories?.length ? data.skillCategories : [{
    name: '',
    skills: [{ technology: { label: 'Custom', value: 'custom', icon: 'i-lucide-shapes' }, name: '', displayType: { label: 'Text', value: 'text', icon: 'i-lucide-letter-text' } }]
  }]
  state.links.value = data.links?.length ? data.links : [{ name: '', url: '' }]
  state.institutions.value = data.institutions?.length ? data.institutions : [{ name: '' }]
  state.education.value = data.education?.length ? data.education : [{ degree: '', text: '', collapsibleOpen: true }]
  state.experience.value = data.experience?.length ? data.experience : [{ position: '', text: '', collapsibleOpen: true, technologies: [] }]
  state.projects.value = data.projects?.length ? data.projects : [{ name: '', description: '', url: '', repoLink: { name: '', url: '' }, technologies: [] }]
  state.qualifications.value = data.qualifications ?? []
  state.coverLetter.value = data.coverLetter ?? { content: '', recipientName: '', companyName: '', position: '' }
  state.jobField.value = data.jobField ?? 'IT'
}

// ─── Save ───
async function handleSave() {
  saving.value = true
  saveError.value = null
  saveSuccess.value = false
  try {
    const data: ResumeData = {
      name: state.name.value,
      subtitle: state.subtitle.value,
      email: state.email.value,
      phone: state.phone.value,
      address: state.address.value,
      summary: state.summary.value,
      birthdate: state.birthdate.value,
      hobbies: state.hobbies.value,
      languages: state.languages.value,
      skillCategories: state.skillCategories.value,
      links: state.links.value,
      institutions: state.institutions.value,
      education: state.education.value,
      experience: state.experience.value,
      projects: state.projects.value,
      jobField: state.jobField.value,
      qualifications: state.qualifications.value,
      coverLetter: state.coverLetter.value,
    }
    await saveResume(resumeId, data, state.name.value || resumeTitle.value)
    resumeTitle.value = state.name.value || resumeTitle.value
    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 3000)
  } catch (e: any) {
    saveError.value = e?.message ?? 'Failed to save resume'
  } finally {
    saving.value = false
  }
}

const activeTab = ref('0')

const tabItems = computed(() => {
  const tabs = [
    { label: 'General', icon: 'i-lucide-user', slot: 'general' },
    { label: 'Cover Letter', icon: 'i-lucide-file-text', slot: 'cover-letter' },
    { label: 'Education', icon: 'i-lucide-graduation-cap', slot: 'education' },
    { label: 'Experience', icon: 'i-lucide-briefcase', slot: 'experience' },
  ]
  if (isIT.value) {
    tabs.push({ label: 'Projects', icon: 'i-lucide-code', slot: 'projects' })
  }
  return tabs
})
</script>

<template>
  <div>
    <!-- Loading -->
    <div v-if="loading" class="flex justify-center items-center py-16">
      <UIcon name="i-lucide-loader-circle" class="animate-spin text-4xl text-(--ui-text-muted)" />
    </div>

    <!-- Load error -->
    <div v-else-if="loadError" class="flex flex-col items-center gap-4 py-12 mx-auto w-[clamp(24rem,65vw,56rem)]">
      <UAlert color="error" :description="loadError" icon="i-lucide-alert-circle" />
      <UButton label="Back to Resumes" icon="i-lucide-arrow-left" variant="outline" to="/resumes" />
    </div>

    <template v-else>
      <!-- Header -->
      <div class="flex flex-col mx-auto w-[clamp(24rem,65vw,56rem)] pt-4 pb-2 gap-3">
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <UButton icon="i-lucide-arrow-left" variant="ghost" size="sm" to="/resumes" class="cursor-pointer" />
            <div>
              <h1 class="text-xl font-semibold">{{ resumeTitle }}</h1>
              <p class="text-sm text-(--ui-text-muted)">Edit resume</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <!-- Export ZIP -->
            <GeneralImportExportMenu />
            <!-- Save -->
            <UButton
              label="Save"
              icon="i-lucide-save"
              color="primary"
              :loading="saving"
              :disabled="saving"
              class="cursor-pointer"
              @click="handleSave"
            />
          </div>
        </div>

        <UAlert v-if="saveSuccess" color="success" description="Resume saved." icon="i-lucide-check" />
        <UAlert v-if="saveError" color="error" :description="saveError" icon="i-lucide-alert-circle" />
      </div>

      <!-- Job field selector -->
      <div class="flex flex-col mx-auto w-[clamp(24rem,65vw,56rem)]">
        <FormJobFieldSelector />
      </div>

      <!-- Tabs -->
      <div class="sticky top-16 w-full z-40 flex justify-center">
        <UTabs
          v-model="activeTab"
          class="mx-auto w-[clamp(24rem,65vw,56rem)] bg-(--ui-bg)/20 backdrop-blur-xs pt-2"
          color="neutral"
          variant="pill"
          :items="tabItems"
        />
      </div>

      <!-- Tab content -->
      <div class="flex flex-col mx-auto w-[clamp(24rem,65vw,56rem)]">
        <div :class="activeTab === '0' ? 'block' : 'hidden'">
          <FormGeneral />
        </div>
        <div :class="activeTab === '1' ? 'block' : 'hidden'">
          <FormCoverLetter />
        </div>
        <div :class="activeTab === '2' ? 'block' : 'hidden'">
          <FormEducation />
        </div>
        <div :class="activeTab === '3' ? 'block' : 'hidden'">
          <FormExperience />
        </div>
        <div v-if="isIT" :class="activeTab === '4' ? 'block' : 'hidden'">
          <FormProjects />
        </div>
      </div>
    </template>
  </div>
</template>
