<script setup lang="ts">
/**
 * AI Generate page — takes a job description, calls AI endpoints to extract
 * requirements and generate a tailored resume draft from the user's portfolio.
 *
 * Job text is stored in a Vue ref() ONLY — never persisted to any storage.
 * All error handlers use redactJobText() before logging or displaying errors.
 */

import { redactJobText } from '../utils/redactJobText'

definePageMeta({ middleware: 'auth' })

const { portfolio, load: loadPortfolio } = usePortfolio()
const { createResume, saveResume } = useResumeDB()
const router = useRouter()

// ─── Ephemeral job text (never persisted) ───
const jobText = ref('')

// ─── Step state ───
type Step = 'input' | 'requirements' | 'draft' | 'saving'
const step = ref<Step>('input')

// ─── Requirements extraction ───
const extracting = ref(false)
const extractError = ref<string | null>(null)
const requirements = ref<ExtractRequirementsResponse | null>(null)

// ─── Draft generation ───
const generating = ref(false)
const generateError = ref<string | null>(null)
const draft = ref<GenerateResumeDraftResponse | null>(null)

// ─── Save ───
const saving = ref(false)
const saveError = ref<string | null>(null)

// ─── Ensure portfolio is loaded ───
onMounted(async () => {
  if (!portfolio.value) {
    await loadPortfolio()
  }
})

// ─── Step 1: Extract requirements ───
async function analyzeJob() {
  if (!jobText.value.trim()) return
  extracting.value = true
  extractError.value = null
  requirements.value = null

  try {
    const res = await $fetch<ExtractRequirementsResponse>('/api/ai/extract-requirements', {
      method: 'POST',
      body: { jobText: jobText.value },
    })
    requirements.value = res
    step.value = 'requirements'
  } catch (e: any) {
    const raw = e?.message ?? 'Failed to analyze job description'
    extractError.value = redactJobText(raw, jobText.value)
  } finally {
    extracting.value = false
  }
}

// ─── Step 2: Generate resume draft ───
async function generateDraft() {
  if (!portfolio.value) {
    generateError.value = 'Portfolio not loaded. Please try again.'
    return
  }
  generating.value = true
  generateError.value = null
  draft.value = null

  try {
    const res = await $fetch<GenerateResumeDraftResponse>('/api/ai/generate-resume-draft', {
      method: 'POST',
      body: { jobText: jobText.value, portfolio: portfolio.value },
    })
    draft.value = res
    step.value = 'draft'
  } catch (e: any) {
    const raw = e?.message ?? 'Failed to generate resume draft'
    generateError.value = redactJobText(raw, jobText.value)
  } finally {
    generating.value = false
  }
}

// ─── Step 3: Save draft as new resume ───
async function saveDraft() {
  if (!draft.value?.resumeData) return
  saving.value = true
  saveError.value = null
  step.value = 'saving'

  try {
    const title = draft.value.title || 'AI Generated Resume'
    const id = await createResume(title, 'IT', portfolio.value ?? undefined)
    await saveResume(id, draft.value.resumeData, title)
    router.push(`/resumes/${id}`)
  } catch (e: any) {
    const raw = e?.message ?? 'Failed to save resume'
    saveError.value = redactJobText(raw, jobText.value)
    step.value = 'draft'
  } finally {
    saving.value = false
  }
}

function reset() {
  step.value = 'input'
  requirements.value = null
  draft.value = null
  extractError.value = null
  generateError.value = null
  saveError.value = null
  // Note: jobText is intentionally NOT cleared — user may want to re-analyze
}
</script>

<template>
  <div class="flex flex-col mx-auto w-[clamp(24rem,65vw,56rem)] pt-4 pb-12 gap-6">

    <!-- Header -->
    <div>
      <h1 class="text-xl font-semibold">AI Resume Generator</h1>
      <p class="text-sm text-(--ui-text-muted)">Paste a job description and generate a tailored resume from your portfolio</p>
    </div>

    <!-- Step 1: Job description input -->
    <div v-if="step === 'input' || step === 'requirements'" class="flex flex-col gap-4">
      <UFormField label="Job Description" description="Paste the full job posting text. It will not be saved anywhere.">
        <UTextarea
          v-model="jobText"
          placeholder="Paste job description here..."
          :rows="10"
          class="w-full font-mono text-sm"
          :disabled="extracting"
        />
      </UFormField>

      <UAlert
        v-if="extractError"
        color="error"
        :description="extractError"
        icon="i-lucide-alert-circle"
      />

      <div class="flex justify-end">
        <UButton
          label="Analyze Job"
          icon="i-ri-ai-generate"
          color="primary"
          :loading="extracting"
          :disabled="extracting || !jobText.trim()"
          class="cursor-pointer"
          @click="analyzeJob"
        />
      </div>
    </div>

    <!-- Step 2: Requirements review -->
    <template v-if="step === 'requirements' && requirements">
      <USeparator />

      <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <h2 class="text-base font-semibold">Extracted Requirements</h2>
          <UButton label="Re-analyze" icon="i-lucide-refresh-cw" variant="ghost" size="sm" class="cursor-pointer" @click="reset" />
        </div>

        <!-- Keywords -->
        <div v-if="requirements.keywords?.length" class="flex flex-col gap-1">
          <p class="text-sm font-medium">Keywords</p>
          <div class="flex flex-wrap gap-2">
            <UBadge v-for="kw in requirements.keywords" :key="kw" :label="kw" color="primary" variant="soft" />
          </div>
        </div>

        <!-- Must-haves -->
        <div v-if="requirements.mustHaves?.length" class="flex flex-col gap-1">
          <p class="text-sm font-medium">Must-haves</p>
          <ul class="list-disc list-inside text-sm text-(--ui-text-muted) space-y-0.5">
            <li v-for="item in requirements.mustHaves" :key="item">{{ item }}</li>
          </ul>
        </div>

        <!-- Nice-to-haves -->
        <div v-if="requirements.niceToHaves?.length" class="flex flex-col gap-1">
          <p class="text-sm font-medium">Nice-to-haves</p>
          <ul class="list-disc list-inside text-sm text-(--ui-text-muted) space-y-0.5">
            <li v-for="item in requirements.niceToHaves" :key="item">{{ item }}</li>
          </ul>
        </div>

        <UAlert
          v-if="generateError"
          color="error"
          :description="generateError"
          icon="i-lucide-alert-circle"
        />

        <div class="flex justify-end">
          <UButton
            label="Generate Resume Draft"
            icon="i-lucide-wand-2"
            color="primary"
            :loading="generating"
            :disabled="generating"
            class="cursor-pointer"
            @click="generateDraft"
          />
        </div>
      </div>
    </template>

    <!-- Step 3: Draft review -->
    <template v-if="step === 'draft' && draft">
      <USeparator />

      <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <h2 class="text-base font-semibold">Resume Draft</h2>
          <UButton label="Start over" icon="i-lucide-arrow-left" variant="ghost" size="sm" class="cursor-pointer" @click="reset" />
        </div>

        <!-- Missing info warnings -->
        <UAlert
          v-if="draft.missing_info?.length"
          color="warning"
          icon="i-lucide-alert-circle"
          title="Missing information"
          :description="`The following could not be filled from your portfolio: ${draft.missing_info.join(', ')}`"
        />

        <!-- Draft summary -->
        <div class="rounded-lg border border-(--ui-border) p-4 flex flex-col gap-3 text-sm">
          <div v-if="draft.title" class="flex gap-2">
            <span class="font-medium w-28 shrink-0">Title</span>
            <span class="text-(--ui-text-muted)">{{ draft.title }}</span>
          </div>
          <div v-if="draft.resumeData?.summary" class="flex gap-2">
            <span class="font-medium w-28 shrink-0">Summary</span>
            <span class="text-(--ui-text-muted)">{{ draft.resumeData.summary }}</span>
          </div>
          <div v-if="draft.provenance?.length" class="flex gap-2">
            <span class="font-medium w-28 shrink-0">Based on</span>
            <div class="flex flex-wrap gap-1">
              <UBadge v-for="p in draft.provenance" :key="p" :label="p" color="neutral" variant="soft" size="sm" />
            </div>
          </div>
        </div>

        <UAlert
          v-if="saveError"
          color="error"
          :description="saveError"
          icon="i-lucide-alert-circle"
        />

        <div class="flex justify-end gap-2">
          <UButton
            label="Discard"
            icon="i-lucide-x"
            variant="outline"
            color="neutral"
            class="cursor-pointer"
            @click="reset"
          />
          <UButton
            label="Save as New Resume"
            icon="i-lucide-save"
            color="primary"
            :loading="saving"
            :disabled="saving"
            class="cursor-pointer"
            @click="saveDraft"
          />
        </div>
      </div>
    </template>

    <!-- Saving spinner -->
    <div v-if="step === 'saving'" class="flex justify-center items-center py-16">
      <UIcon name="i-lucide-loader-circle" class="animate-spin text-4xl text-(--ui-text-muted)" />
    </div>

  </div>
</template>
