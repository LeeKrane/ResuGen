<script setup lang="ts">
/**
 * Resumes list page — shows all user resumes with CRUD actions.
 * Auth-protected: requires login.
 */

definePageMeta({ middleware: 'auth' })

const { resumes, loading, error, listResumes, createBlankResume, createResume, deleteResume, duplicateResume } = useResumeDB()
const { portfolio, load: loadPortfolio } = usePortfolio()

const creating = ref(false)
const createError = ref<string | null>(null)

onMounted(async () => {
  await listResumes()
  // Ensure portfolio is loaded (needed for "Create from portfolio")
  if (!portfolio.value) await loadPortfolio()
})

// ─── Create blank ───
async function handleCreateBlank() {
  creating.value = true
  createError.value = null
  try {
    const id = await createBlankResume('New Resume')
    await navigateTo(`/resumes/${id}`)
  } catch (e: any) {
    createError.value = e?.message ?? 'Failed to create resume'
  } finally {
    creating.value = false
  }
}

// ─── Create from portfolio ───
async function handleCreateFromPortfolio() {
  if (!portfolio.value) {
    createError.value = 'Portfolio not loaded yet. Please wait.'
    return
  }
  creating.value = true
  createError.value = null
  try {
    const id = await createResume('Resume from Portfolio', 'IT', portfolio.value)
    await navigateTo(`/resumes/${id}`)
  } catch (e: any) {
    createError.value = e?.message ?? 'Failed to create resume from portfolio'
  } finally {
    creating.value = false
  }
}

// ─── Delete ───
const deletingId = ref<string | null>(null)
async function handleDelete(id: string) {
  deletingId.value = id
  try {
    await deleteResume(id)
  } finally {
    deletingId.value = null
  }
}

// ─── Duplicate ───
const duplicatingId = ref<string | null>(null)
async function handleDuplicate(id: string, title: string) {
  duplicatingId.value = id
  try {
    await duplicateResume(id, `${title} (copy)`)
  } finally {
    duplicatingId.value = null
  }
}

// ─── Format date ───
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="flex flex-col mx-auto w-[clamp(24rem,65vw,56rem)] py-6 gap-6">

    <!-- Header -->
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-semibold">My Resumes</h1>
        <p class="text-sm text-(--ui-text-muted)">Create, edit, duplicate or export your resumes</p>
      </div>
      <div class="flex gap-2">
        <UButton
          label="Create Blank"
          icon="i-lucide-file-plus"
          variant="outline"
          :loading="creating"
          :disabled="creating"
          class="cursor-pointer"
          @click="handleCreateBlank"
        />
        <UButton
          label="From Portfolio"
          icon="i-lucide-user-check"
          color="primary"
          :loading="creating"
          :disabled="creating || !portfolio"
          class="cursor-pointer"
          @click="handleCreateFromPortfolio"
        />
      </div>
    </div>

    <!-- Create error -->
    <UAlert v-if="createError" color="error" :description="createError" icon="i-lucide-alert-circle" />

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <UIcon name="i-lucide-loader-circle" class="animate-spin text-4xl text-(--ui-text-muted)" />
    </div>

    <!-- DB error -->
    <UAlert v-else-if="error" color="error" :description="error" icon="i-lucide-alert-circle" />

    <!-- Empty state -->
    <div v-else-if="resumes.length === 0" class="flex flex-col items-center gap-4 py-16 text-(--ui-text-muted)">
      <UIcon name="i-lucide-file-text" class="text-5xl" />
      <p>No resumes yet. Create one to get started.</p>
    </div>

    <!-- Resume cards -->
    <div v-else class="flex flex-col gap-3">
      <UCard
        v-for="resume in resumes"
        :key="resume.id"
        class="flex items-center justify-between gap-4"
      >
        <template #default>
          <div class="flex items-center justify-between gap-4 w-full">
            <!-- Info -->
            <div class="flex flex-col gap-0.5 min-w-0">
              <span class="font-medium truncate">{{ resume.title }}</span>
              <div class="flex items-center gap-2 text-xs text-(--ui-text-muted)">
                <UBadge :label="resume.kind === 'it' ? 'IT' : 'Other'" variant="soft" size="xs" />
                <span>Updated {{ formatDate(resume.updatedAt) }}</span>
                <span v-if="resume.duplicatedFrom" class="italic">copy</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-1 shrink-0">
              <!-- Edit -->
              <UButton
                icon="i-lucide-pencil"
                variant="ghost"
                size="sm"
                class="cursor-pointer"
                :to="`/resumes/${resume.id}`"
              />
              <!-- Duplicate -->
              <UButton
                icon="i-lucide-copy"
                variant="ghost"
                size="sm"
                class="cursor-pointer"
                :loading="duplicatingId === resume.id"
                :disabled="!!duplicatingId"
                @click="handleDuplicate(resume.id, resume.title)"
              />
              <!-- Delete -->
              <UButton
                icon="i-lucide-trash-2"
                variant="ghost"
                size="sm"
                color="error"
                class="cursor-pointer"
                :loading="deletingId === resume.id"
                :disabled="!!deletingId"
                @click="handleDelete(resume.id)"
              />
            </div>
          </div>
        </template>
      </UCard>
    </div>

  </div>
</template>
