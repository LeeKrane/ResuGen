<script setup lang="ts">
/**
 * Resumes list page - shows all user resumes with CRUD actions.
 * Auth-protected: requires login.
 */

definePageMeta({ middleware: 'auth' })

const { resumes, listResumes, createBlankResume, createResume, deleteResume, duplicateResume, saveResume } = useResumeDB()
const { portfolio, load: loadPortfolio } = usePortfolio()
const { isReady } = useEncryption()

const creating = ref(false)
const createError = ref<string | null>(null)
const pageReady = ref(false)
const pageError = ref<string | null>(null)

//  ZIP Import 
const showImportModal = ref(false)
const importError = ref<string | null>(null)
const importing = ref(false)
const importFileInput = ref<HTMLInputElement | null>(null)

function openImportModal() {
  importError.value = null
  showImportModal.value = true
}

async function onImportFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  importing.value = true
  importError.value = null

  try {
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()
    const loaded = await zip.loadAsync(file)

    const jsonStr = await loaded.file('resume-data.json')?.async('string')
    if (!jsonStr) throw new Error('resume-data.json not found in ZIP')

    let resumeData: ResumeData
    try { resumeData = JSON.parse(jsonStr) } catch { throw new Error('Failed to parse resume-data.json') }

    const kind: 'IT' | 'Other' = resumeData.jobField === 'IT' ? 'IT' : 'Other'
    const title = generateTitle('Import_Resume')

    // Create the resume row (blank - we'll save data next)
    const newId = await createResume(title, kind)

    // Extract avatar if present
    const avatarBytes = await loaded.file('resume-avatar.webp')?.async('uint8array')
    let avatarData: string | undefined
    let avatarContentType: string | undefined
    if (avatarBytes) {
      const binary = Array.from(avatarBytes).map(b => String.fromCharCode(b)).join('')
      avatarData = btoa(binary)
      avatarContentType = 'image/webp'
    }

    // Save all resume data including avatar
    await saveResume(newId, { ...resumeData, avatarData, avatarContentType }, title)

    showImportModal.value = false
    await navigateTo(`/resumes/${newId}`)
  } catch (e: any) {
    importError.value = e?.message ?? 'Failed to import ZIP'
  } finally {
    importing.value = false
    // Reset file input so the same file can be re-selected
    if (importFileInput.value) importFileInput.value.value = ''
  }
}

//  Kind selection modal 
const showKindModal = ref(false)
const pendingAction = ref<'blank' | 'portfolio' | null>(null)

function promptCreateBlank() {
  pendingAction.value = 'blank'
  showKindModal.value = true
}

function promptCreateFromPortfolio() {
  if (!portfolio.value) {
    createError.value = 'Portfolio not loaded yet. Please wait.'
    return
  }
  pendingAction.value = 'portfolio'
  showKindModal.value = true
}

async function confirmCreate(kind: 'IT' | 'Other') {
  showKindModal.value = false
  creating.value = true
  createError.value = null
  try {
    let id: string
    if (pendingAction.value === 'portfolio' && portfolio.value) {
      id = await createResume(generateTitle('Resume'), kind, portfolio.value)
    } else {
      id = await createBlankResume(generateTitle('Resume'), kind)
    }
    await navigateTo(`/resumes/${id}`)
  } catch (e: any) {
    createError.value = e?.message ?? 'Failed to create resume'
  } finally {
    creating.value = false
    pendingAction.value = null
  }
}

/**
 * Generate a title with a given prefix like Prefix_2026-02-19_1, incrementing per day.
 */
function generateTitle(prefix: string = 'Resume'): string {
  const today = new Date()
  const dateStr = today.toISOString().slice(0, 10) // YYYY-MM-DD
  const fullPrefix = `${prefix}_${dateStr}_`
  const existing = resumes.value
    .map(r => r.title)
    .filter(t => t.startsWith(fullPrefix))
    .map(t => parseInt(t.replace(fullPrefix, ''), 10))
    .filter(n => !isNaN(n))
  const next = existing.length ? Math.max(...existing) + 1 : 1
  return `${fullPrefix}${next}`
}

//  Delete 
const showDeleteConfirm = ref(false)
const deleteTarget = ref<ResumeSummary | null>(null)

function promptDelete(resume: ResumeSummary) {
  deleteTarget.value = resume
  showDeleteConfirm.value = true
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  showDeleteConfirm.value = false
  try {
    await deleteResume(deleteTarget.value.id)
  } catch (e: any) {
    createError.value = e?.message ?? 'Failed to delete resume'
  } finally {
    deleteTarget.value = null
  }
}

//  Duplicate 
async function handleDuplicate(resume: ResumeSummary) {
  creating.value = true
  createError.value = null
  try {
    await duplicateResume(resume.id)
  } catch (e: any) {
    createError.value = e?.message ?? 'Failed to duplicate resume'
  } finally {
    creating.value = false
  }
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch { return iso }
}

//  Init 
onMounted(async () => {
  try {
    const user = useSupabaseUser()
    if (!user.value) {
      await new Promise<void>((resolve) => {
        const stop = watch(user, (u) => { if (u) { stop(); resolve() } }, { immediate: true })
        setTimeout(() => { stop(); resolve() }, 5000)
      })
    }
    // Wait for key to be ready (may already be derived by init-user plugin)
    if (!isReady.value) {
      await new Promise<void>((resolve) => {
        const stop = watch(isReady, (ready) => { if (ready) { stop(); resolve() } }, { immediate: true })
        setTimeout(() => { stop(); resolve() }, 8000)
      })
    }
    await Promise.all([listResumes(), loadPortfolio()])
  } catch (e: any) {
    pageError.value = e?.message ?? 'Failed to load resumes'
  } finally {
    pageReady.value = true
  }
})
</script>

<template>
  <div>
    <!-- Loading -->
    <div v-if="!pageReady" class="flex justify-center items-center py-16">
      <UIcon name="i-lucide-loader-circle" class="animate-spin text-4xl text-(--ui-text-muted)" />
    </div>

    <!-- Error -->
    <div v-else-if="pageError" class="flex justify-center py-8">
      <UAlert color="error" :description="pageError" icon="i-lucide-alert-circle" />
    </div>

    <template v-else>
      <!-- Header -->
      <div class="flex flex-col mx-auto w-[clamp(24rem,65vw,56rem)] pt-4 pb-2 gap-3">
        <div class="flex items-center justify-between gap-4">
          <div>
            <h1 class="text-xl font-semibold">My Resumes</h1>
            <p class="text-sm text-(--ui-text-muted)">Create, edit, and manage your resumes</p>
          </div>
          <div class="flex items-center gap-2">
            <UButton
              label="Import ZIP"
              icon="i-material-symbols-upload-file"
              variant="outline"
              :disabled="creating"
              class="cursor-pointer"
              @click="openImportModal"
            />
            <UButton
              label="From Portfolio"
              icon="i-lucide-file-plus"
              variant="outline"
              :loading="creating"
              :disabled="creating"
              class="cursor-pointer"
              @click="promptCreateFromPortfolio"
            />
            <UButton
              label="Create Blank"
              icon="i-lucide-plus"
              color="primary"
              :loading="creating"
              :disabled="creating"
              class="cursor-pointer"
              @click="promptCreateBlank"
            />
          </div>
        </div>
        <UAlert v-if="createError" color="error" :description="createError" icon="i-lucide-alert-circle" />
      </div>

      <!-- Import ZIP modal -->
      <UModal v-model:open="showImportModal" title="Import resume from ZIP">
        <template #content>
          <div class="p-6 flex flex-col gap-4">
            <h2 class="text-lg font-semibold">Import resume from ZIP</h2>
            <p class="text-sm text-(--ui-text-muted)">
              Select a previously exported Resume .zip file.
            </p>
            <input
              ref="importFileInput"
              type="file"
              accept=".zip"
              class="hidden"
              @change="onImportFile"
            />
            <UButton
              label="Choose ZIP file"
              icon="i-material-symbols-upload-file"
              variant="outline"
              :loading="importing"
              :disabled="importing"
              class="cursor-pointer"
              @click="importFileInput?.click()"
            />
            <UAlert v-if="importError" color="error" :description="importError" icon="i-lucide-alert-circle" />
            <div class="flex justify-end">
              <UButton label="Cancel" variant="ghost" size="sm" class="cursor-pointer" @click="showImportModal = false" />
            </div>
          </div>
        </template>
      </UModal>

      <!-- Kind selection modal -->
      <UModal v-model:open="showKindModal">
        <template #content>
          <div class="p-6 flex flex-col gap-4">
            <h2 class="text-lg font-semibold">Choose resume type</h2>
            <p class="text-sm text-(--ui-text-muted)">
              This determines which fields are available. The type cannot be changed after creation.
            </p>
            <div class="grid grid-cols-2 gap-3 mt-2">
              <button
                class="flex flex-col items-center gap-2 p-4 rounded-lg border border-(--ui-border) hover:border-(--ui-primary) hover:bg-(--ui-bg-elevated) transition-colors cursor-pointer"
                @click="confirmCreate('Other')"
              >
                <UIcon name="i-lucide-briefcase" class="text-2xl" />
                <span class="font-medium">General</span>
                <span class="text-xs text-(--ui-text-muted)">Standard resume fields</span>
              </button>
              <button
                class="flex flex-col items-center gap-2 p-4 rounded-lg border border-(--ui-border) hover:border-(--ui-primary) hover:bg-(--ui-bg-elevated) transition-colors cursor-pointer"
                @click="confirmCreate('IT')"
              >
                <UIcon name="i-lucide-code" class="text-2xl" />
                <span class="font-medium">IT / Developer</span>
                <span class="text-xs text-(--ui-text-muted)">Includes projects &amp; tech stacks</span>
              </button>
            </div>
            <div class="flex justify-end mt-1">
              <UButton label="Cancel" variant="ghost" size="sm" class="cursor-pointer" @click="showKindModal = false" />
            </div>
          </div>
        </template>
      </UModal>

      <!-- Delete confirmation modal -->
      <UModal v-model:open="showDeleteConfirm">
        <template #content>
          <div class="p-6 flex flex-col gap-4">
            <h2 class="text-lg font-semibold">Delete resume?</h2>
            <p class="text-sm text-(--ui-text-muted)">
              "{{ deleteTarget?.title }}" will be permanently deleted. This cannot be undone.
            </p>
            <div class="flex justify-end gap-2 mt-2">
              <UButton label="Cancel" variant="outline" class="cursor-pointer" @click="showDeleteConfirm = false" />
              <UButton label="Delete" color="error" class="cursor-pointer" @click="confirmDelete" />
            </div>
          </div>
        </template>
      </UModal>

      <!-- Resume list -->
      <div class="flex flex-col mx-auto w-[clamp(24rem,65vw,56rem)] py-4 gap-3">
        <div v-if="!resumes.length" class="flex flex-col items-center gap-4 py-12 text-center">
          <UIcon name="i-lucide-file-text" class="text-5xl text-(--ui-text-muted)" />
          <p class="text-(--ui-text-muted)">No resumes yet. Create one to get started.</p>
        </div>

        <div
          v-for="resume in resumes"
          :key="resume.id"
          class="flex items-center justify-between p-4 rounded-lg border border-(--ui-border) hover:bg-(--ui-bg-elevated) transition-colors"
        >
          <NuxtLink :to="`/resumes/${resume.id}`" class="flex-1 min-w-0 cursor-pointer">
            <div class="flex items-center gap-2">
              <span class="font-medium truncate">{{ resume.title }}</span>
              <UBadge
                :label="resume.kind === 'it' ? 'IT' : 'General'"
                :color="resume.kind === 'it' ? 'info' : 'neutral'"
                size="xs"
                variant="subtle"
              />
            </div>
            <p class="text-xs text-(--ui-text-muted) mt-1">
              Updated {{ formatDate(resume.updatedAt) }}
            </p>
          </NuxtLink>
          <div class="flex items-center gap-1 ml-3">
            <UButton
              icon="i-lucide-copy"
              variant="ghost"
              size="xs"
              class="cursor-pointer"
              title="Duplicate"
              @click.prevent="handleDuplicate(resume)"
            />
            <UButton
              icon="i-lucide-trash-2"
              variant="ghost"
              size="xs"
              color="error"
              class="cursor-pointer"
              title="Delete"
              @click.prevent="promptDelete(resume)"
            />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
