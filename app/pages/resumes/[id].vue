<script setup lang="ts">
import { v7 } from 'uuid'
import { buildSkillFromName } from '~/utils/technologyMatcher'
/**
 * Resume edit page - loads a resume by ID, populates the shared useState slots,
 * and reuses the existing form components (same pattern as portfolio.vue).
 */

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const resumeId = route.params.id as string

const { loadResume, saveResume, listResumes, resumes } = useResumeDB()
const state = useRefResumeData()
const { isIT } = useJobField()
const { isReady: keyReady } = useEncryption()

const loading = ref(true)
const loadError = ref<string | null>(null)
const saving = ref(false)
const saveError = ref<string | null>(null)
const saveSuccess = ref(false)
const resumeTitle = ref('Untitled Resume')
const editingTitle = ref(false)
const resumeKind = ref<'it' | 'other'>('other')

onMounted(async () => {
  // Wait for session if needed before loading resume
  const user = useSupabaseUser()
  if (!user.value) {
    await new Promise<void>((resolve) => {
      const stop = watch(user, (u) => { if (u) { stop(); resolve() } }, { immediate: true })
      setTimeout(() => { stop(); resolve() }, 5000)
    })
  }

  // Wait for encryption key before loading (avoids flash of error on hard reload)
  if (!keyReady.value) {
    await new Promise<void>((resolve) => {
      const stop = watch(keyReady, (ready) => { if (ready) { stop(); resolve() } }, { immediate: true })
      setTimeout(() => { stop(); resolve() }, 8000)
    })
  }

  // Clear stale data from shared useState slots immediately
  _clearState()

  try {
    // Ensure resume list is loaded so we can get the title
    if (!resumes.value.length) await listResumes()
    const summary = resumes.value.find(r => r.id === resumeId)
    if (summary) {
      resumeTitle.value = summary.title
      resumeKind.value = summary.kind
      // Set jobField from the locked kind so isIT computed works correctly
      state.jobField.value = summary.kind === 'it' ? 'IT' : 'Other'
    }

    const data = await loadResume(resumeId)
    if (!data) {
      loadError.value = 'Resume not found or you do not have access.'
      return
    }
    _populateState(data)
  } catch (e: any) {
    loadError.value = e?.message ?? 'Failed to load resume'
  } finally {
    loading.value = false
  }
})

/**
 * Reset all shared useState slots to empty defaults.
 * Prevents stale data from a previous resume/portfolio from bleeding through.
 */
function _clearState() {
  state.name.value = ''
  state.subtitle.value = ''
  state.email.value = ''
  state.phone.value = ''
  state.address.value = ''
  state.summary.value = ''
  state.birthdate.value = undefined
  state.hobbies.value = ['']
  state.languages.value = [{ name: '' }]
  state.skillCategories.value = [{
    name: '',
    skills: [{ technology: { label: 'Custom', value: 'custom', icon: 'i-lucide-shapes' }, name: '', displayType: { label: 'Text', value: 'text', icon: 'i-lucide-letter-text' } }]
  }]
  state.links.value = [{ name: '', url: '' }]
  state.educationInstitutions.value = [{ uuid: v7(), name: '' }]
  state.experienceInstitutions.value = [{ uuid: v7(), name: '' }]
  state.education.value = [{ degree: '', text: '', collapsibleOpen: true }]
  state.experience.value = [{ position: '', text: '', collapsibleOpen: true, technologies: [] }]
  state.projects.value = [{ name: '', description: '', url: '', repoLink: { name: '', url: '' }, technologies: [] }]
  state.qualifications.value = []
  state.coverLetter.value = { content: '', recipientName: '', companyName: '', position: '' }
  state.avatar.value = null
  // Clear the avatar preview image (shared useState)
  const previewImage = useState<string | null>('previewImage')
  previewImage.value = null
}

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
  // Guard: only set birthdate if it has at least one defined field (avoids DatePicker crash)
  const bd = data.birthdate
  state.birthdate.value = (bd && (bd.year != null || bd.month != null || bd.day != null)) ? bd : undefined
  state.hobbies.value = data.hobbies?.length ? data.hobbies : ['']
  state.languages.value = data.languages?.length ? data.languages : [{ name: '' }]
  state.skillCategories.value = data.skillCategories?.length ? data.skillCategories.map(cat => ({
    ...cat,
    skills: cat.skills.map(s => s.technology ? s : buildSkillFromName(s.name)),
  })) : [{
    name: '',
    skills: [{ technology: { label: 'Custom', value: 'custom', icon: 'i-lucide-shapes' }, name: '', displayType: { label: 'Text', value: 'text', icon: 'i-lucide-letter-text' } }]
  }]
  state.links.value = data.links?.length ? data.links : [{ name: '', url: '' }]
  // Populate separate institution lists
  const eduInst = data.educationInstitutions ?? []
  const expInst = data.experienceInstitutions ?? []

  state.educationInstitutions.value = eduInst.length ? eduInst : [{ uuid: v7(), name: '' }]
  state.experienceInstitutions.value = expInst.length ? expInst : [{ uuid: v7(), name: '' }]
  state.education.value = data.education?.length ? data.education : [{ degree: '', text: '', collapsibleOpen: true }]
  state.experience.value = data.experience?.length
    ? data.experience.map(e => ({ ...e, technologies: e.technologies ?? [] }))
    : [{ position: '', text: '', collapsibleOpen: true, technologies: [] }]
  state.projects.value = data.projects?.length ? data.projects : [{ name: '', description: '', url: '', repoLink: { name: '', url: '' }, technologies: [] }]
  state.qualifications.value = data.qualifications ?? []
  state.coverLetter.value = data.coverLetter ?? { content: '', recipientName: '', companyName: '', position: '' }
  state.jobField.value = data.jobField ?? 'IT'
  // Restore avatar preview from DB data
  const previewImage = useState<string | null>('previewImage')
  if (data.avatarData) {
    const mime = data.avatarContentType ?? 'image/webp'
    previewImage.value = `data:${mime};base64,${data.avatarData}`
  } else {
    previewImage.value = null
  }
}

//  Save 
async function handleSave() {
  saving.value = true
  saveError.value = null
  saveSuccess.value = false
  try {
    // Extract avatar from the shared previewImage state (data URI → base64 + mime)
    const previewImage = useState<string | null>('previewImage')
    let avatarData: string | undefined
    let avatarContentType: string | undefined
    if (previewImage.value) {
      const match = previewImage.value.match(/^data:([^;]+);base64,(.+)$/)
      if (match) {
        avatarContentType = match[1]
        avatarData = match[2]
      }
    }

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
      educationInstitutions: state.educationInstitutions.value,
      experienceInstitutions: state.experienceInstitutions.value,
      education: state.education.value,
      experience: state.experience.value,
      projects: state.projects.value,
      jobField: state.jobField.value,
      qualifications: state.qualifications.value,
      coverLetter: state.coverLetter.value,
      avatarData,
      avatarContentType,
    }
    await saveResume(resumeId, data, resumeTitle.value || 'Untitled Resume')
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
  tabs.push({ label: 'Certifications', icon: 'i-lucide-award', slot: 'certifications' })
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
              <div v-if="editingTitle" class="flex items-center gap-1">
                <UInput
                  v-model="resumeTitle"
                  size="sm"
                  autofocus
                  class="font-semibold"
                  @blur="editingTitle = false"
                  @keydown.enter="editingTitle = false"
                  @keydown.escape="editingTitle = false"
                />
              </div>
              <div v-else class="flex items-center gap-1 cursor-pointer group" @click="editingTitle = true">
                <h1 class="text-xl font-semibold">{{ resumeTitle }}</h1>
                <UIcon name="i-lucide-pencil" class="text-xs text-(--ui-text-muted) opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div class="flex items-center gap-2 mt-0.5">
                <UBadge
                  :label="resumeKind === 'it' ? 'IT' : 'General'"
                  :color="resumeKind === 'it' ? 'info' : 'neutral'"
                  size="xs"
                  variant="subtle"
                />
                <p class="text-sm text-(--ui-text-muted)">Edit resume</p>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <!-- Preview & Print -->
            <UButton
              label="Preview & Print"
              icon="i-lucide-eye"
              variant="outline"
              color="neutral"
              to="/resume"
              class="cursor-pointer"
            />
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
        <div :class="activeTab === String(isIT ? 5 : 4) ? 'block' : 'hidden'">
          <FormQualifications />
        </div>
      </div>
    </template>
  </div>
</template>
