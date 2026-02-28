<script setup lang="ts">

const supabase = useSupabaseClient()
const toast = useToast()
const route = useRoute()

function safeRedirect(p: string) {
  return p.startsWith('/') ? p : '/me'
}

const redirect = computed(() => {
  const q = route.query.redirect
  return typeof q === 'string' ? q : '/me'
})

const code = ref('')
const loading = ref(false)

const {data: factors, error: factorsError} = await supabase.auth.mfa.listFactors()

if (factorsError) {
  toast.add({title: 'Error fetching MFA factors', description: factorsError.message, color: 'error'})
}

type UiFactor = {
  id: string
  type: 'totp'
  friendlyName: string
  status: 'verified' | 'unverified'
}

const allFactors = computed<UiFactor[]>(() => {
  const out: UiFactor[] = []

  // TOTP factors
  for (const f of (factors?.totp ?? [])) {
    out.push({
      id: f.id,
      type: 'totp',
      friendlyName: f.friendly_name ?? 'Authenticator app',
      status: (f.status as 'verified' | 'unverified') ?? 'verified',
    })
  }
  return out
})

const selectedFactorId = ref<string | null>(allFactors.value[0]?.id ?? null)

watchEffect(() => {
  if (!selectedFactorId.value && allFactors.value.length > 0) {
    selectedFactorId.value = allFactors.value[0].id
  }
})

const selectedFactor = computed(() =>
    allFactors.value.find(f => f.id === selectedFactorId.value) ?? null
)

// language is hardcoded to english for now
async function onVerify() {
  if (!selectedFactor.value) {
    toast.add({title: 'No TOTP factor found', color: 'error'})
    return
  }

  // Optional: block unverified factors (depends on what you want)
  if (selectedFactor.value.status !== 'verified') {
    toast.add({title: 'Selected factor is not verified', color: 'error'})
    return
  }

  loading.value = true
  try {
    const {error} = await supabase.auth.mfa.challengeAndVerify({
      factorId: selectedFactor.value.id,
      code: code.value
    })

    if (error) {
      toast.add({title: 'Invalid code', description: error.message, color: 'error'})
      return
    }

    toast.add({title: 'MFA verified', color: 'success'})
    await navigateTo(safeRedirect(redirect.value))
  } finally {
    loading.value = false
  }
}

const recoveryCode = ref('')

async function useRecoveryCode() {
  loading.value = true
  try {
    const res = await $fetch<{ ok: boolean }>('/api/recovery-codes/verify', {
      method: 'POST',
      body: { code: recoveryCode.value.trim() },
    })
    if (!res.ok) {
      toast.add({title: 'Invalid recovery code', color: 'error'})
      return
    }
    toast.add({
      title: 'Recovery code accepted',
      description: 'You have 10 mintues to update your 2FA settings.',
      color: 'success'
    })

    await navigateTo('/settings/security')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="p-6 w-full max-w-sm mx-auto flex flex-col gap-4">
    <h1 class="text-lg font-medium">Multi-factor authentication</h1>
    <div v-if="typeof route.query.redirect === 'string'" class="rounded-md border border-red-500 p-3 text-sm">
      Two-factor authentication required. <br /> Please verify to continue.
    </div>
    <UFormField label="Choose a verification method">
      <USelect
          class="w-full"
          v-model="selectedFactorId"
          :items="allFactors.map(f => ({
          label: `${f.friendlyName} (${f.type.toUpperCase()})${f.status !== 'verified' ? ' - unverified' : ''}`,
          value: f.id
        }))"
          placeholder="Select a factor"
      />
      <p v-if="selectedFactor" class="text-xs text-gray-500 mt-1">
        Selected: <span class="font-medium">{{ selectedFactor.friendlyName }}</span>
      </p>
    </UFormField>

    <UFormField label="Authentication code">
      <UInput v-model="code" placeholder="123456" inputmode="numeric" autocomplete="one-time-code" />
    </UFormField>

    <UButton :loading="loading" :disabled="!selectedFactorId || !code" @click="onVerify">
      Verify
    </UButton>

    <!-- Optional: show raw list for debugging/UX transparency -->
    <div v-if="allFactors.length" class="text-sm opacity-80">
      <p class="font-medium mb-2">Available factors</p>
      <ul class="list-disc pl-5 space-y-1">
        <li v-for="f in allFactors" :key="f.id">
          {{ f.friendlyName }} — {{ f.type }} — {{ f.status }}
        </li>
      </ul>
    </div>

    <div v-else class="text-sm opacity-80">
      No MFA factors found for this account.
    </div>


    <UDivider label="or" />

    <UFormField label="Recovery code" >
      <UInput v-model="recoveryCode" placeholder="XXXX-XXXX-XXXX" autocomplete="off" />
    </UFormField>

    <UButton variant="outline" :loading="loading" :disabled="!recoveryCode" @click="useRecoveryCode">
      Use recovery code
    </UButton>
  </div>
</template>