<script setup lang="ts">
import { v7 } from 'uuid'
/**
 * Portfolio page — the user's single source-of-truth for applicant data.
 *
 * Strategy: load portfolio from DB → populate the shared useState slots used by
 * the existing form components (useRefResumeData) → reuse those components as-is.
 * On save, read back from those same slots and persist to DB via usePortfolio.save().
 */

definePageMeta({ middleware: 'auth' })

const { portfolio, error: portfolioError, load, save } = usePortfolio()
const state = useRefResumeData()
const { jobField, isIT } = useJobField()
const { isReady: keyReady } = useEncryption()

const saving = ref(false)
const saveError = ref<string | null>(null)
const saveSuccess = ref(false)
const pageReady = ref(false)
const pageError = ref<string | null>(null)

// ─── IT mode confirmation ───
const showITConfirm = ref(false)
const itConfirmedOnce = ref(false)

function handleJobFieldChange(val: string) {
  if (val === 'IT' && !itConfirmedOnce.value) {
    showITConfirm.value = true
    return
  }
  jobField.value = val as 'IT' | 'Other'
}

function confirmIT() {
  itConfirmedOnce.value = true
  showITConfirm.value = false
  jobField.value = 'IT'
}

function cancelIT() {
  showITConfirm.value = false
}

// ─── Wait for user + load portfolio ───

async function ensureLoaded() {
  try {
    const user = useSupabaseUser()
    if (!user.value) {
      await new Promise<void>((resolve) => {
        const stop = watch(user, (u) => { if (u) { stop(); resolve() } }, { immediate: true })
        setTimeout(() => { stop(); resolve() }, 5000)
      })
    }

    // Wait for encryption key to be derived before loading (avoids flash of error on hard reload)
    if (!keyReady.value) {
      await new Promise<void>((resolve) => {
        const stop = watch(keyReady, (ready) => { if (ready) { stop(); resolve() } }, { immediate: true })
        setTimeout(() => { stop(); resolve() }, 8000)
      })
    }

    await load()

    if (portfolioError.value) {
      pageError.value = portfolioError.value
    }

    if (portfolio.value) {
      _populateState(portfolio.value)
    }
  } catch (e: any) {
    pageError.value = e?.message ?? 'Failed to load portfolio'
  } finally {
    pageReady.value = true
  }
}

onMounted(ensureLoaded)

watch(portfolio, (p) => {
  if (p) {
    _populateState(p)
    pageReady.value = true
    pageError.value = null
  }
})

/**
 * Populate the shared useState slots from a PortfolioData object.
 */
function _populateState(p: PortfolioData) {
  state.name.value = p.profile.name ?? ''
  state.subtitle.value = p.profile.subtitle ?? ''
  state.email.value = p.profile.email ?? ''
  state.phone.value = p.profile.phone ?? ''
  state.address.value = p.profile.address ?? ''
  state.summary.value = p.profile.summary ?? ''
  const bd = p.profile.birthdate
  const bdValid = bd &&
    typeof bd.year === 'number' && isFinite(bd.year) &&
    typeof bd.month === 'number' && isFinite(bd.month) &&
    typeof bd.day === 'number' && isFinite(bd.day)
  state.birthdate.value = bdValid ? bd : undefined
  state.hobbies.value = p.profile.hobbies?.length ? p.profile.hobbies : ['']
  const previewImage = useState<string | null>('previewImage')
  if (p.profile.avatarData) {
    const mime = p.profile.avatarContentType ?? 'image/webp'
    previewImage.value = `data:${mime};base64,${p.profile.avatarData}`
  } else {
    previewImage.value = null
  }
  state.languages.value = p.languages?.length ? p.languages : [{ name: '' }]
  state.skillCategories.value = p.skillCategories?.length ? p.skillCategories : [{
    name: '',
    skills: [{ technology: { label: 'Custom', value: 'custom', icon: 'i-lucide-shapes' }, name: '', displayType: { label: 'Text', value: 'text', icon: 'i-lucide-letter-text' } }]
  }]
  state.links.value = p.links?.length ? p.links : [{ name: '', url: '' }]
  state.education.value = p.education?.length ? p.education : [{ degree: '', text: '', collapsibleOpen: true }]
  state.experience.value = p.experience?.length ? p.experience.map(e => ({ ...e, technologies: e.technologies ?? [] })) : [{ position: '', text: '', collapsibleOpen: true, technologies: [] }]
  state.projects.value = p.projects?.length ? p.projects.map(pr => ({ ...pr, technologies: pr.technologies ?? [], repoLink: pr.repoLink ?? { name: '', url: '' } })) : [{ name: '', description: '', url: '', repoLink: { name: '', url: '' }, technologies: [] }]
  state.qualifications.value = p.certifications ?? []
  // Populate separate institution lists
  const eduInst = p.educationInstitutions ?? []
  const expInst = p.experienceInstitutions ?? []

  state.educationInstitutions.value = eduInst.length ? eduInst : [{ uuid: v7(), name: '' }]
  state.experienceInstitutions.value = expInst.length ? expInst : [{ uuid: v7(), name: '' }]
  state.education.value = p.education?.length ? p.education : [{ degree: '', text: '', collapsibleOpen: true }]
  state.experience.value = p.experience?.length
    ? p.experience.map(e => ({ ...e, technologies: e.technologies ?? [] }))
    : [{ position: '', text: '', collapsibleOpen: true, technologies: [] }]
  // Set job field from portfolio (default to Other)
  jobField.value = p.jobField ?? 'Other'
  // If portfolio was already IT, mark as confirmed so modal doesn't show
  if (p.jobField === 'IT') itConfirmedOnce.value = true
}

// ─── Save ───

async function savePortfolio() {
  saving.value = true
  saveError.value = null
  saveSuccess.value = false

  try {
    const avatarFile = state.avatar.value
    let avatarData: string | undefined
    let avatarFilename: string | undefined
    let avatarContentType: string | undefined
    if (avatarFile) {
      const buf = await avatarFile.arrayBuffer()
      const bytes = new Uint8Array(buf)
      let binary = ''
      for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]!)
      avatarData = btoa(binary)
      avatarFilename = avatarFile.name
      avatarContentType = avatarFile.type
    } else {
      avatarData = portfolio.value?.profile.avatarData
      avatarFilename = portfolio.value?.profile.avatarFilename
      avatarContentType = portfolio.value?.profile.avatarContentType
    }

    const data: PortfolioData = {
      profile: {
        name: state.name.value,
        subtitle: state.subtitle.value,
        email: state.email.value,
        phone: state.phone.value,
        address: state.address.value,
        summary: state.summary.value,
        birthdate: state.birthdate.value,
        hobbies: state.hobbies.value.filter(h => h.trim()),
        avatarData,
        avatarFilename,
        avatarContentType,
      },
      links: state.links.value,
      languages: state.languages.value,
      skillCategories: state.skillCategories.value,
      education: state.education.value,
      experience: state.experience.value,
      projects: state.projects.value,
      certifications: state.qualifications.value,
      educationInstitutions: state.educationInstitutions.value,
      experienceInstitutions: state.experienceInstitutions.value,
      jobField: jobField.value,
    }

    await save(data)
    saveSuccess.value = true
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

const jobFieldOptions = [
  { value: 'Other', label: 'General', icon: 'i-lucide-briefcase' },
  { value: 'IT', label: 'IT / Developer', icon: 'i-lucide-code' },
]
</script>

<template>
  <div>
    <!-- Loading state -->
    <div v-if="!pageReady" class="flex justify-center items-center py-16">
      <UIcon name="i-lucide-loader-circle" class="animate-spin text-4xl text-(--ui-text-muted)" />
    </div>

    <!-- Error state -->
    <div v-else-if="pageError" class="flex justify-center py-8">
      <UAlert color="error" :description="pageError" icon="i-lucide-alert-circle" />
    </div>

    <template v-else>
      <!-- Header -->
      <div class="flex flex-col mx-auto w-[clamp(24rem,65vw,56rem)] pt-4 pb-2 gap-3">
        <div class="flex items-center justify-between gap-4">
          <div>
            <h1 class="text-xl font-semibold">My Portfolio</h1>
            <p class="text-sm text-(--ui-text-muted)">Your personal data source for all resumes</p>
          </div>
          <div class="flex items-center gap-2">
            <GeneralResumeLoader />
            <UButton
              label="Import from file"
              icon="i-lucide-file-plus"
              variant="outline"
              color="neutral"
              to="/import"
              class="cursor-pointer"
            />
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

        <!-- Job field toggle -->
        <div class="flex items-center gap-3">
          <span class="text-sm text-(--ui-text-muted)">Portfolio type:</span>
          <USelect
            :model-value="jobField"
            :items="jobFieldOptions"
            variant="soft"
            size="sm"
            class="w-48"
            :icon="jobField === 'IT' ? 'i-lucide-code' : 'i-lucide-briefcase'"
            @update:model-value="handleJobFieldChange"
          />
        </div>

        <!-- Save feedback -->
        <UAlert v-if="saveSuccess" color="success" description="Portfolio saved successfully." icon="i-lucide-check" />
        <UAlert v-if="saveError" color="error" :description="saveError" icon="i-lucide-alert-circle" />
      </div>

      <!-- IT confirmation modal -->
      <UModal v-model:open="showITConfirm">
        <template #content>
          <div class="p-6 flex flex-col gap-4">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-code" class="text-xl text-(--ui-primary)" />
              <h2 class="text-lg font-semibold">Switch to IT Portfolio?</h2>
            </div>
            <p class="text-sm text-(--ui-text-muted)">
              The IT portfolio includes additional fields for software developers and IT professionals,
              such as projects, technology stacks, and repository links.
            </p>
            <p class="text-sm text-(--ui-text-muted)">
              If you're not in the IT field, the regular portfolio covers everything you need.
              You can switch back at any time without losing data.
            </p>
            <div class="flex justify-end gap-2 mt-2">
              <UButton label="Stay on General" variant="outline" @click="cancelIT" class="cursor-pointer" />
              <UButton label="I understand, switch to IT" color="primary" @click="confirmIT" class="cursor-pointer" />
            </div>
          </div>
        </template>
      </UModal>

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

      <!-- Tab content -->
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
