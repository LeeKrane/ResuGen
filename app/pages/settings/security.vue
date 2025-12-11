<script setup lang="ts">
import SettingsCard from '~/components/settings/SettingsCard.vue'
import { useUserState } from '~/composables/useUserState'
const { userState } = useUserState()

// Import Email Modal
import ChangeEmail from '~/components/settings/changeEmail.vue'
const changeEmailModal = ref(false)

// Import Password Modal
import ChangePassword from '~/components/settings/changePassword.vue'
const changePasswordModal = ref(false)

// Dummy data for connected accounts and 2FA status
const GitHubConnect = false
const GoogleConnect = false
const twoFactorMethodsConfigured = false
const recoveryCodesAvailable = false
const recoveryCodesCount = 0


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

const twoFactorMethods = [
  {
    icon: "i-lucide-scan-face",
    title: "Authenticator app",
    description: `${twoFactorMethodsConfigured ? 'Two-factor Authentication has been configured' : 'For optimal security, enable the Two-Factor Authentication'}`,
    action: `${twoFactorMethodsConfigured ? 'Manage' : 'Enable'}`,
    onClick: () => {
      // Navigate to 2FA configuration page
      alert('Open Modal for 2FA with Security (Request Password) functionality to be implemented.')
    }
  },
  {
    icon: "i-lucide-save-all",
    title: "Recovery codes",
    description: "Recovery codes can be used to access your account without your two-factor authentication codes.",
    action: `${twoFactorMethodsConfigured ? `${recoveryCodesAvailable ? "View" : "Generate"}` : 'Enable 2FA first'}`,
  // Update to reflect actual count // Color spectrum: 6-5 codes: primary or success, 4-3 codes: warning, 2-0 codes: danger
    badge: recoveryCodesAvailable
      ? { text: `${recoveryCodesCount} codes left`, color: (recoveryCodesCount >= 5 ? "primary" : recoveryCodesCount >= 3 ? "warning" : "error") as BadgeColor }
      : { text: "Not generated", color: "error" as BadgeColor },
    onClick: () => {
      // Navigate to view recovery codes page
      alert('Open Modal for Recovery codes with Security (Request Password/2FA) functionality to be implemented.')
    }
  },
]
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
                <div v-if="item.badge" class="flex flex-col pb-2 gap-2">
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
            <UButton size="sm" variant="subtle" @click="item.onClick">{{ item.action }}</UButton>
          </div>
        </div>
      </div>
    </div>

    <ChangeEmail v-model="changeEmailModal" />
    <ChangePassword v-model="changePasswordModal" />
  </SettingsCard>
</template>
