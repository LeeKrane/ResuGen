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

const recoveryCode = ref('')
const loading = ref(false)

const { data: factors } = await supabase.auth.mfa.listFactors()
// aktuell erster TOTP-Faktor -> später auf Liste erweitern
const totpFactor = computed(() => factors?.totp?.[0])

// language is hardcoded to english for now
async function onVerify() {
  if (!totpFactor.value) {
    toast.add({ title: 'No TOTP factor fount', color: 'error'})
    return
  }

  loading.value = true
  const { error } = await supabase.auth.mfa.challengeAndVerify({
    factorId: totpFactor.value.id,
    code: recoveryCode.value
  })

  if (error) {
    toast.add({ title: 'Invalid code', description: error.message, color: 'error' })
    return
  }

  toast.add({ title: 'MFA verified', color: 'success'})
  await navigateTo(safeRedirect(redirect.value))
}

</script>

<template>

  <div vlass="p-6 max-w-sm mx-auto flex flex-col gap-3">
    <UInput v-model="recoveryCode" placeholder="132465" inputmode="numeric" />
    <UButton :loading="loading" @click="onVerify"></UButton>
  </div>

</template>

<style scoped>

</style>