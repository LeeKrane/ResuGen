<script setup lang="ts">
import SettingsCard from '~/components/settings/SettingsCard.vue'
import type { UiFactor } from '~/types/UiFactor'
import { useUserState } from '~/composables/useUserState'

// Import Email Modal
import ChangeEmail from '~/components/settings/changeEmail.vue'

// Import Password Modal
import ChangePassword from '~/components/settings/changePassword.vue'
const { userState } = useUserState()

const supabase = useSupabaseClient()
const toast = useToast()

const manage2FAModal = ref(false)

const recoveryCodesModal = ref(false)
const generatedRecoveryCodes = ref<string[]>([])
const savedConfirmation = ref(false)

function openRecoveryCodesModal(codes: string[]) {
  if (!codes?.length) return
  generatedRecoveryCodes.value = codes
  savedConfirmation.value = false
  recoveryCodesModal.value = true
}

function closeRecoveryCodesModal() {
  recoveryCodesModal.value = false
  // clear plaintext from memory after closing
  generatedRecoveryCodes.value = []
  savedConfirmation.value = false
}

function downloadRecoveryCodes(codes: string[]) {
  const content = codes.join('\n') + '\n'
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = 'resugen-recovery-codes.txt'
  a.click()

  URL.revokeObjectURL(url)
}

async function copyRecoveryCodes(codes: string[]) {
  await navigator.clipboard.writeText(codes.join('\n'))
  toast.add({ title: 'Copied to clipboard', color: 'success' })
}

const changeEmailModal = ref(false)
const changePasswordModal = ref(false)

// Dummy data for connected accounts and 2FA status
const GitHubConnect = false
const GoogleConnect = false

const recoveryCodesAvailable = ref(false)
const recoveryCodesCount = ref(0)

async function refreshRecoveryStatus() {
  if (!twoFactorMethodsConfigured.value) {
    recoveryCodesAvailable.value = false
    recoveryCodesCount.value = 0
    return
  }
  const status = await $fetch<{ available: boolean, count: number }>('/api/recovery-codes/status')
  recoveryCodesAvailable.value = status.available
  recoveryCodesCount.value = status.count
}

async function generateRecoveryCodes() {
  const res = await $fetch<{ codes: string[] }>('/api/recovery-codes/generate', { method: 'POST' })

  toast.add({
    title: 'Recovery codes generated',
    description: 'Store them in a safe place. Each code can be used once.',
    color: 'success',
  })

  openRecoveryCodesModal(res.codes)
  await refreshRecoveryStatus()
}

async function regenerateRecoveryCodes() {
  const res = await $fetch<{ codes: string[] }>('/api/recovery-codes/regenerate', {method: 'POST'})

  toast.add({
    title: 'Old recovery codes stopped working immediately',
    description: 'Your old recovery codes have been invalidated and new ones have been generated. Please store them in a safe place.',
    color: 'warning'
  })

  openRecoveryCodesModal(res.codes)
  await refreshRecoveryStatus()
}

const factorsLoading = ref(false)
const allFactors = ref<UiFactor[]>([])

const twoFactorMethodsConfigured = computed(() => allFactors.value.length > 0)

async function refreshFactors() {
  factorsLoading.value = true
  try {
    const {data, error} = await supabase.auth.mfa.listFactors()
    if (error) throw error

    const out: UiFactor[] = []

    for (const f of (data?.totp ?? [])) {
      out.push({
        id: f.id,
        type: 'totp',
        friendlyName: f.friendly_name ?? 'Authenticator app',
        status: (f.status as 'verified' | 'unverified') ?? 'verified',
      })
    }
    allFactors.value = out
  } catch (e: any) {
    toast.add({title: 'Error fetching 2FA factors', description: e?.message ?? String(e), color: 'error'})
    allFactors.value = []
  } finally {
    factorsLoading.value = false
  }
}

async function deleteFactor(factorId: string) {
  const { error } = await supabase.auth.mfa.unenroll({ factorId })
  if (error) {
    toast.add({ title: 'Could not remove factor', description: error.message, color: 'error' })
    return
  }
  await refreshFactors()

  if (allFactors.value.length === 0) {
    await $fetch('/api/recovery-codes/invalidate', { method: 'POST' })
    await refreshRecoveryStatus()
    manage2FAModal.value = false
    toast.add({ title: 'Recovery codes invalidated', description: 'Since you have removed all 2FA factors, your recovery codes have been invalidated for security reasons. Please generate new recovery codes if you set up 2FA again.', color: 'warning' })
  }

  toast.add({ title: 'Factor removed', color: 'success' })
}

// Settings data
const signInMethods = [
  {
    icon: "i-lucide-mail",
    title: "Email",
    description: `${userState.value.email} (${userState.value.emailConfirmed ? 'Verified' : 'Unverified'})`,
    action: "Change Email",
    onClick: () => {
      changeEmailModal.value = true
    }
  },
  {
    icon: "i-lucide-key-round",
    title: "Password",
    description: `${useSupabaseUser().value?.identities?.some(id => id.provider === 'email') ? 'Change your password' : 'Add a password to log in with your email'}`,
    action: `${useSupabaseUser().value?.identities?.some(id => id.provider === 'email') ? 'Change password' : 'Add password'}`,
    onClick: () => {
      if (useSupabaseUser().value?.identities?.some(id => id.provider === 'email')) {
        changePasswordModal.value = true
      } else {
        // Redirect to set password flow if no password is set
        alert('Redirect to set password flow functionality to be implemented.')
      }
    }
  },
  {
    icon: "i-simple-icons-github",
    title: "GitHub",
    description: `${GitHubConnect ? 'You are connected with your GitHub profile' : 'Sign in with your GitHub account'}`,
    action: `${GitHubConnect ? 'Disconnect' : 'Connect'}`,
    onClick: () => {
      // Connect GitHub account
      // Placeholder for actual implementation
      alert('Connect GitHub account functionality to be implemented.')
    }
  },
  {
    icon: "i-simple-icons-google",
    title: "Google",
    description: `${GoogleConnect ? 'You are connected with your Google profile' : 'Sign in with your Google account'}`,
    action: `${GoogleConnect ? 'Disconnect' : 'Connect'}`,
    onClick: () => {
      // Connect Google account
      // Placeholder for actual implementation
      alert('Connect Google account functionality to be implemented.')
    }
  },
]

type BadgeColor = "error" | "primary" | "secondary" | "success" | "info" | "warning" | "neutral" | undefined

const recoveryBadge = computed(() => {
  if (!twoFactorMethodsConfigured.value) return { text: 'Enable 2FA', color: 'neutral' as BadgeColor }
  
  if (!recoveryCodesAvailable.value) return { text: 'Not generated', color: 'error' as BadgeColor }
  
  const c = recoveryCodesCount.value
  return { text: `${c} codes left`, color: (c >= 5 ? 'primary' : c >= 3 ? 'warning' : 'error') as BadgeColor }
})

const twoFactorMethods = computed(() => [
  {
    icon: "i-lucide-scan-face",
    title: "Authenticator app",
    description: twoFactorMethodsConfigured.value ? 'Two-factor Authentication is enabled. Manage your factors.' : 'For optimal security, enable the Two-Factor Authentication',
    action: twoFactorMethodsConfigured.value ? 'Manage' : 'Enable',
    onClick: async () => {
      if (twoFactorMethodsConfigured.value) {
        manage2FAModal.value = true
      } else {
        await refreshFactors()
        openEnrollModal()
      }
    }
  },
  {
    icon: "i-lucide-save-all",
    title: "Recovery codes",
    description: "Recovery codes can be used to access your account without your two-factor authentication codes. Generating/Regenerating them can take some time.",
    action: !twoFactorMethodsConfigured.value ? 'Enable 2FA first' : recoveryCodesAvailable.value ? 'Regenerate' : 'Generate',
  // Update to reflect actual count // Color spectrum: 6-5 codes: primary or success, 4-3 codes: warning, 2-0 codes: danger
    badge: recoveryBadge.value,
    disabled: !twoFactorMethodsConfigured.value,
    onClick: async () => {
      if (!twoFactorMethodsConfigured.value) return

      if (recoveryCodesAvailable.value) {
        await regenerateRecoveryCodes()
      } else {
        await generateRecoveryCodes()
      }
    }
  },
])

const enrollTotpSecret = ref<string | null>(null)
const enrollTotpUri = ref<string | null>(null)
const showManualSetup = ref(false)

const enroll2FAModal = ref(false)
const enrollLoading = ref(false)
const enrollQrSvg = ref<string | null>(null)
const enrollFactorId = ref<string | null>(null)
const enrollCode = ref('')
const enrollFriendlyName = ref('')

const qrReady = computed(() => !!enrollQrSvg.value && !!enrollFactorId.value)

async function generateQr() {
  const name = enrollFriendlyName.value.trim()
  if (!name) {
    toast.add({ title: 'Please enter a name', color: 'error' })
    return
  }

  enrollLoading.value = true
  try {
    if  (enrollFactorId.value) {
      await supabase.auth.mfa.unenroll({ factorId: enrollFactorId.value })
      enrollFactorId.value = null
      enrollQrSvg.value = null
      enrollCode.value = ''
      enrollTotpSecret.value = null
      enrollTotpUri.value = null
      showManualSetup.value = false
    }

    await cleanupUnverifiedFactors()
    await refreshFactors()

    const nameTaken = allFactors.value.some(
      f => f.id !== enrollFactorId.value && (f.friendlyName ?? '').toLowerCase() === name.toLowerCase()
    )
    if (nameTaken) {
      toast.add({ title: 'Name already used', description: 'Choose a different name.', color: 'error' })
      return
    }

    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: name,
    })

    if (error) throw error

    enrollFactorId.value = data.id
    enrollQrSvg.value = data.totp?.qr_code ?? null
    enrollTotpSecret.value = (data as any).totp?.secret ?? null
    enrollTotpUri.value = (data as any).totp?.uri ?? (data as any).totp?.otpauth_url ?? null
    showManualSetup.value = false
  } catch (e: any) {
    toast.add({ title: 'Could not generate QR', description: e?.message ?? String(e), color: 'error' })
  } finally {
    enrollLoading.value = false
  }
}

function openEnrollModal() {
  enrollLoading.value = false
  enrollCode.value = ''
  enrollQrSvg.value = null
  enrollFactorId.value = null
  enrollTotpSecret.value = null
  enrollTotpUri.value = null
  showManualSetup.value = false

  const nextIndex = allFactors.value.filter(f => f.type === 'totp').length + 1
  enrollFriendlyName.value = `Authenticator ${nextIndex}`

  enroll2FAModal.value = true
}

async function cancelEnroll() {
  // if a factor was created but not verified yet, remove it
  if (enrollFactorId.value) {
    await supabase.auth.mfa.unenroll({ factorId: enrollFactorId.value })
  }

  enrollFriendlyName.value = ''
  enroll2FAModal.value = false
  enrollCode.value = ''
  enrollQrSvg.value = ''
  enrollFactorId.value = null
  enrollTotpSecret.value = null
  enrollTotpUri.value = null
  showManualSetup.value = false

  await refreshFactors()
}

async function cleanupUnverifiedFactors() {
  const { data, error } = await supabase.auth.mfa.listFactors()
  if (error) throw error

  for (const f of (data?.totp ?? [])) {
    if (f.status !== 'verified') {
      await supabase.auth.mfa.unenroll({ factorId: f.id })
    }
  }
}

async function verifyTotpEnroll() {
  if (!enrollFactorId.value) return

  enrollLoading.value = true
  try {
    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId: enrollFactorId.value,
      code: enrollCode.value.trim()
    })
    if (error) throw error

    toast.add({ title: '2FA enabled', color: 'success' })
    enroll2FAModal.value = false
    enrollCode.value = ''
    enrollQrSvg.value = null
    enrollFactorId.value = null
    enrollFriendlyName.value = ''
    enrollTotpSecret.value = null
    enrollTotpUri.value = null
    showManualSetup.value = false

    await refreshFactors()
    await refreshRecoveryStatus()

    if (!recoveryCodesAvailable.value) {
      await generateRecoveryCodes()
    }

  } catch (e: any) {
    toast.add({ title: 'Invalid code', description: e?.message ?? String(e), color: 'error' })
  } finally {
    enrollLoading.value = false
  }
}

watch(enroll2FAModal, async (isOpen, wasOpen) => {
  // If modal just got closed AND there is an unverified factor
  if (wasOpen && !isOpen && enrollFactorId.value) {
    try {
      await supabase.auth.mfa.unenroll({ factorId: enrollFactorId.value })
    } catch (e: any) {
      toast.add({ title: 'Error cleaning up unverified factor', description: e?.message ?? String(e), color: 'error' })
    }

    enrollCode.value = ''
    enrollQrSvg.value = ''
    enrollFactorId.value = null

    await refreshFactors()
  }
})

watch(enrollFriendlyName, async (newVal, oldVal) => {
  if (!enroll2FAModal.value) return
  if (!qrReady.value) return
  if (newVal.trim() === oldVal.trim()) return

  // You can only "rename" by creating a new factor
  try {
    if (enrollFactorId.value) {
      await supabase.auth.mfa.unenroll({ factorId: enrollFactorId.value })
    }
  } catch (e) {
    // ignore; we'll just overwrite state
  } finally {
    enrollFactorId.value = null
    enrollQrSvg.value = null
    enrollCode.value = ''
    toast.add({
      title: 'Name changed',
      description: 'QR code was reset. Please generate a new QR code.',
      color: 'info',
    })
  }
})

const closePreventToastLock = ref(false)

function onRecoveryClosePrevent() {
  if (closePreventToastLock.value) return
  closePreventToastLock.value = true

  toast.add({
    title: 'Please confirm you stored the codes and press Done.',
    color: 'warning',
  })

  // unlock shortly after (covers the double event from backdrop click)
  setTimeout(() => {
    closePreventToastLock.value = false
  }, 250)
}

onMounted(async () => {
  await refreshFactors()
  await refreshRecoveryStatus()
})
</script>

<template>
  <SettingsCard>
    <div class="flex flex-col grow gap-16">

      <!-- Sign in methods -->
      <div class="flex flex-col gap-4">
        <h2 class="text-lg font-semibold pl-4">Sign in methods</h2>
        <div
          class="grid border divide-solid divide-y rounded-lg border-(--ui-text-muted)/25 divide-(--ui-text-muted)/25 bg-(--ui-bg)/35"
        >
          <div
            v-for="(item, i) in signInMethods"
            :key="i"
            class="flex items-center justify-between p-4"
          >
            <div class="flex flex-row gap-4">
              <UIcon :name="item.icon" class="size-5 shrink-0 self-center" />
              <div>
                <p class="text-sm md:text-base font-medium">{{ item.title }}</p>
                <p class="text-xs md:text-sm text-gray-500">{{ item.description }}</p>
              </div>
            </div>
            <UButton size="sm" variant="subtle" @click="item.onClick">{{ item.action }}</UButton>
          </div>
        </div>
      </div>

      <!-- Two-factor -->
      <div class="flex flex-col gap-4">
        <h2 class="text-lg font-semibold pl-4">Two-factor Authentication</h2>
        <div
          class="grid border divide-solid divide-y rounded-lg border-(--ui-text-muted)/25 divide-(--ui-text-muted)/25 bg-(--ui-bg)/35"
        >
          <div
            v-for="(item, i) in twoFactorMethods"
            :key="i"
            class="flex items-center justify-between p-4 gap-4"
          >
            <div class="flex flex-row gap-4">
              <UIcon :name="item.icon" class="size-5 shrink-0 self-center" />
              <div>
                <div v-if="item.badge" class="flex flex-col md:flex-row pb-2 md:pb-0 gap-2">
                  <p class="text-sm md:text-base font-medium">{{ item.title }}</p>
                  <UBadge
                    size="sm"
                    variant="soft"
                    :color="item.badge.color">
                    {{ item.badge.text }}
                  </UBadge>
                </div>
                <p v-else class="text-sm md:text-base font-medium">{{ item.title }}</p>
                <p class="text-xs md:text-sm text-gray-500">{{ item.description }}</p>
              </div>
            </div>
            <UButton size="sm" variant="subtle" :disabled="item.disabled" @click="item.onClick">{{ item.action }}</UButton>
          </div>
        </div>
      </div>
    </div>

    <ChangeEmail v-model="changeEmailModal" />
    <ChangePassword v-model="changePasswordModal" />

    <UModal v-model:open="manage2FAModal" title="Manage two-factor authentication">
      <template #body>
        <div class="flex flex-col gap-4 p-2">
          <div v-if="factorsLoading" class="text-sm text-muted">
            Loading factors...
          </div>

          <div v-else-if="allFactors.length === 0" class="text-sm text-muted">
            No factors configured.
          </div>

          <div v-else class="flex flex-col gap-2">
            <div
                v-for="f in allFactors"
                :key="f.id"
                class="flex items-center justify-between border rounded-md p-3 border-(--ui-text-muted)/25"
            >
              <div class="flex flex-col">
                <p class="font-medium text-sm">{{ f.friendlyName }}</p>
                <p class="text-xs text-gray-500">
                  {{ f.type.toUpperCase() }} · {{ f.status }}
                </p>
              </div>

              <UButton size="sm" color="error" variant="soft" @click="deleteFactor(f.id)">
                Remove
              </UButton>
            </div>
          </div>

          <UButton variant="outline" @click="async () => { await refreshFactors(); openEnrollModal() }">
            Add another authenticator app
          </UButton>
        </div>
      </template>
    </UModal>

    <UModal
        v-model:open="recoveryCodesModal"
        title="Recovery codes"
        :dismissible="false"
        :close="false"
        @close:prevent="onRecoveryClosePrevent"
    >
      <template #body>
        <div class="flex flex-col gap-4 p-2">
          <p class="text-sm text-gray-500">
            These recovery codes are shown <b>only once</b>. Store them safely.
          </p>

          <div class="bg-(--ui-bg-accented) rounded-md p-3 font-mono text-sm whitespace-pre">
            {{ generatedRecoveryCodes.join('\n') }}
          </div>

          <div class="flex gap-2">
            <UButton variant="outline" @click="copyRecoveryCodes(generatedRecoveryCodes)">
              Copy
            </UButton>
            <UButton variant="outline" @click="downloadRecoveryCodes(generatedRecoveryCodes)">
              Download
            </UButton>
          </div>

          <UCheckbox v-model="savedConfirmation" label="I have stored these recovery codes safely." />

          <UButton color="primary" :disabled="!savedConfirmation" @click="closeRecoveryCodesModal">
            Done
          </UButton>
        </div>
      </template>
    </UModal>
    <UModal v-model:open="enroll2FAModal" title="Enable two-factor authentication">
      <template #body>
        <div class="flex flex-col gap-4 p-2">
          <p class="text-sm text-gray-500 text-center">
            Choose a name for your authenticator app, then scan the QR code with your authenticator app and enter the 6-digit code.
          </p>

          <div class="flex flex-col items-center gap-2 pt-2">
            <UInput v-model="enrollFriendlyName" class="w-72 text-center" placeholder="e.g. My Authenticator App" autocomplete="off" />
          </div>

          <div class="flex flex-col items-center gap-2">
            <UButton class="w-72" :loading="enrollLoading" :disabled="!enrollFriendlyName.trim() || enrollLoading" @click="generateQr">
              {{ qrReady ? 'Regenerate QR code' : 'Generate QR code' }}
            </UButton>
          </div>

          <div class="flex flex-col items-center gap-2">
            <div v-if="enrollLoading" class="text-sm text-gray-500 text-center">
              Generating QR code...
            </div>

            <img v-else-if="enrollQrSvg" :src="enrollQrSvg" class="w-48 h-48" />
          </div>

          <div v-if="qrReady" class="flex flex-col items-center gap-2">
            <UButton variant="outline" class="w-72" @click="showManualSetup = !showManualSetup">
              {{ showManualSetup ? 'Hide manual setup' : 'Can’t scan QR? Enter code manually' }}
            </UButton>

            <div v-if="showManualSetup" class="w-full max-w-md mt-2 space-y-3">
              <div v-if="enrollTotpSecret" class="rounded-md border p-3">
                <p class="text-xs text-gray-500 mb-1">Secret</p>
                <p class="font-mono text-sm break-all">{{ enrollTotpSecret }}</p>
              </div>

              <div v-else class="text-xs text-gray-500 text-center">
                Secret not available from SDK response.
              </div>

              <div v-if="enrollTotpUri" class="rounded-md border p-3">
                <p class="text-xs text-gray-500 mb-1">OTPAuth URI</p>
                <p class="font-mono text-xs break-all">{{ enrollTotpUri }}</p>
              </div>
            </div>
          </div>

          <UInput v-model="enrollCode" placeholder="123456" inputmode="numeric" autocomplete="one-time-code" />

          <div class="flex gap-2">
            <UButton variant="outline" :disabled="enrollLoading" @click="cancelEnroll">
              Cancel
            </UButton>
            <UButton :loading="enrollLoading" :disabled="!qrReady || !enrollCode || enrollCode.length < 6" @click="verifyTotpEnroll">
              Verify & enable
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

  </SettingsCard>
</template>
