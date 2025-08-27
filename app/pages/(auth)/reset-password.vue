<script setup lang="ts">
import * as z from 'zod'

const supabase = useSupabaseClient()
const toast = useToast()

const schema = z.object({
	newPassword: z.string().min(8, 'Must be at least 8 characters'),
	confirmPassword: z.string().min(8, 'Must be at least 8 characters')
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
	newPassword: undefined,
	confirmPassword: undefined,
})

const passwordMismatch = computed(() => {
	return state.newPassword !== state.confirmPassword
})

async function updatePassword() {
	if (passwordMismatch.value) {
		toast.add({ title: 'Passwords do not match', color: 'error', icon: 'i-lucide-alert-circle' })
		return
	}

	const { error } = await supabase.auth.updateUser({ password: state.newPassword })

	if (error) {
		toast.add({
			title: 'Error updating password',
			description: error.message,
			color: 'error',
			icon: 'i-lucide-alert-circle'
		})
	} else {
		toast.add({ title: 'Password updated', color: 'success', icon: 'i-lucide-check' })
		navigateTo('/me')
	}
}
</script>

<template>
	<div class="flex flex-col h-full items-center justify-center gap-4 p-4">
		<UPageCard
				class="w-full max-w-md bg-(--ui-bg-accented)"
				:spotlight="true"
				spotlight-color="primary">
			<UForm
					:schema="schema"
					:state="state"
					class="flex flex-col items-center gap-4 w-full"
					@submit="updatePassword">
				<h2 class="text-2xl font-bold">Update your Password</h2>
				<UFormField label="New Password" class="w-full">
					<UInput v-model="state.newPassword" type="password" class="w-full"/>
				</UFormField>
				<UFormField label="Confirm New Password" class="w-full">
					<UInput v-model="state.confirmPassword" type="password" class="w-full"/>
				</UFormField>
				<div v-if="passwordMismatch" class="text-error">Passwords do not match</div>
				<UButton type="submit">Update Password</UButton>
			</UForm>
		</UPageCard>
	</div>
</template>

<style scoped>

</style>