<script setup lang="ts">
const route = useRoute()
const toast = useToast()

const signupSuccessModalOpen = ref(false)

onMounted(() => {
  const signup = route.query.signup as string
	const oAuthStatus = route.query.oAuthStatus as string
  
  // Check for successful signup confirmation
  if (signup === 'true') {
      signupSuccessModalOpen.value = true
      // Clean up the URL
      navigateTo('/me', { replace: true })
  }
  
  // Check for OAuth success
	if (oAuthStatus) {
		try {
			const decoded = atob(oAuthStatus)
			const [prefix, provider] = decoded.split(':')

			if (prefix === 'oauth_success' && provider) {
				toast.add({
					title: `Successfully logged in with ${provider}!`,
					color: 'success',
					icon: 'i-lucide-check'
				})

				// Redirect to landing page after OAuth login
				navigateTo('/', { replace: true })
			}
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (error) {
			toast.add({
				title: 'Error with OAuth login',
				description: 'Invalid OAuth status',
				color: 'error',
				icon: 'i-lucide-triangle-alert'
			})
		}
	}
})
</script>

<template>
    <UModal v-model:open="signupSuccessModalOpen">
        <template #content>
            <div class="flex flex-col h-full items-center justify-center gap-4 p-8">
                <UIcon name="i-lucide-check-circle" class="text-4xl text-(--ui-success)"/>
                <h3 class="font-medium text-lg">Account Confirmed!</h3>
                <p class="text-sm text-muted text-center">
                    Your email address has been confirmed. You are now able to use your account.
                </p>
                <UButton class="mt-2" label="Understood" @click="signupSuccessModalOpen = false"/>
            </div>
        </template>
    </UModal>
</template>

<style scoped>

</style>