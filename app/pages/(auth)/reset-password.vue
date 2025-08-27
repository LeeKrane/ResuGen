<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from "@nuxt/ui"

const supabase = useSupabaseClient()
const toast = useToast()

const fields = [{
	name: 'newPassword',
	type: 'password' as const,
	label: 'New Password',
	placeholder: 'Enter your new password',
}, {
	name: 'confirmPassword',
	label: 'Confirm Password',
	type: 'password' as const,
	placeholder: 'Confirm your new password',
}]

const loading = ref(false)

const schema = z.object({
	newPassword: z.string()
			.min(8, 'Must be at least 8 characters')
			.max(128, 'Must be at most 128 characters')
			.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 'Must contain at least one uppercase letter, one lowercase letter, one number and one special character'),
	confirmPassword: z.string()
}).superRefine((data, ctx) => {
	if (data.newPassword !== data.confirmPassword) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: 'Passwords do not match',
			path: ['confirmPassword']
		})
	}
})

type Schema = z.output<typeof schema>

async function onSubmit(payload: FormSubmitEvent<Schema>) {
	const pending = toast.add({ title: 'Updating password...', color: 'info', icon: 'i-lucide-loader', duration: 0 })
	loading.value = true

	const { error } = await supabase.auth.updateUser({ password: payload.data.newPassword })

	toast.remove(pending.id)
	loading.value = false

	if (error) {
		toast.add({
			title: 'Error updating password',
			description: error.message,
			color: 'error',
			icon: 'i-lucide-triangle-alert'
		})
	} else {
		toast.add({ title: 'Successfully updated password!', color: 'success', icon: 'i-lucide-check' })
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
			<UAuthForm
					:schema="schema"
					:fields="fields"
					:loading="loading"
					title="Update your password"
					icon="i-lucide-key-round"
					@submit="onSubmit">
				<template #description>
					Enter your new password below.
				</template>
			</UAuthForm>
		</UPageCard>
	</div>
</template>

<style scoped>

</style>