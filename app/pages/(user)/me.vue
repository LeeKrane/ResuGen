<script setup lang="ts">
const route = useRoute()
const toast = useToast()

// Check for OAuth success
onMounted(() => {
	const oAuthStatus = route.query.oAuthStatus as string
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

				// Clean up the URL
				navigateTo('/me', { replace: true })
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

</template>

<style scoped>

</style>