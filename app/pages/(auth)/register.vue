<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from "@nuxt/ui"

definePageMeta({
	middleware: ["logged-out"]
})

const toast = useToast()

const fields = [{
	name: 'email',
	type: 'text' as const,
	label: 'Email',
	placeholder: 'Enter your email',
}, {
	name: 'password',
	label: 'Password',
	type: 'password' as const,
	placeholder: 'Enter your password',
}, {
	name: 'confirmPassword',
	label: 'Confirm Password',
	type: 'password' as const,
	placeholder: 'Confirm your password',
}]

const loading = ref(false)

const schemaRegister = z.object({
	email: z.string().email('Invalid email'),
	password: z.string()
			.min(8, 'Must be at least 8 characters')
			.max(128, 'Must be at most 128 characters')
			.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 'Must contain at least one uppercase letter, one lowercase letter, one number and one special character'),
	confirmPassword: z.string()
}).superRefine((data, ctx) => {
	if (data.password !== data.confirmPassword) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: 'Passwords do not match',
			path: ['confirmPassword']
		})
	}
})

type SchemaRegister = z.output<typeof schemaRegister>

async function onSubmit(payload: FormSubmitEvent<SchemaRegister>) {
	const pending = toast.add({ title: 'Creating account...', color: 'info', icon: 'i-lucide-loader', duration: 0 })
	loading.value = true

	const { error } = await useSupabaseClient().auth.signUp({
		email: payload.data.email,
		password: payload.data.password,
	})

	toast.remove(pending.id)
	loading.value = false

	if (error) {
		toast.add({ title: 'Error creating account', description: error.message, color: 'error', icon: 'i-lucide-alert-circle' })
		return
	} else {
		toast.add({ title: 'Successfully created account', color: 'success', icon: 'i-lucide-check' })
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
					:schema="schemaRegister"
					:fields="fields"
					:loading="loading"
					title="Register"
					icon="i-lucide-user-plus"
					@submit="onSubmit"
			>
				<template #description>
					Already have an account?
					<ULink to="/login" class="text-primary font-medium">Login here</ULink>
					.
				</template>
			</UAuthForm>
		</UPageCard>
	</div>
</template>

<style scoped>

</style>