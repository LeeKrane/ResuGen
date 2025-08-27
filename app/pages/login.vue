<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from "@nuxt/ui"

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
}]

const loading = ref(false)

const schemaLogin = z.object({
	email: z.string().email('Invalid email'),
	password: z.string().min(8, 'Must be at least 8 characters')
})

type SchemaLogin = z.output<typeof schemaLogin>

function isUserLoggedIn() {
	if (useSupabaseUser().value) {
		toast.add({ title: 'Already logged in', color: 'info', icon: 'i-lucide-info' })
		navigateTo('/me')
		return true
	}
	return false
}

async function onSubmit(payload: FormSubmitEvent<SchemaLogin>) {
	if (isUserLoggedIn())
		return

	const pending = toast.add({ title: 'Logging in...', color: 'info', icon: 'i-lucide-loader', duration: 0 })
	loading.value = true

	const { error } = await useSupabaseClient().auth.signInWithPassword({
		email: payload.data.email,
		password: payload.data.password,
	})

	toast.remove(pending.id)
	loading.value = false

	if (error) {
		toast.add({ title: 'Error logging in', description: error.message, color: 'error', icon: 'i-lucide-alert-circle' })
		return
	} else {
		toast.add({ title: 'Successfully logged in', color: 'success', icon: 'i-lucide-check' })
		navigateTo('/me')
	}
}

const forgotPasswordModalOpen = ref(false)

const schemaResetPassword = z.object({
	email: z.string().email('Invalid email'),
})

type SchemaResetPassword = z.output<typeof schemaResetPassword>

const forgotPasswordState = reactive<Partial<SchemaResetPassword>>({
	email: undefined,
})

async function onForgotPassword(payload: FormSubmitEvent<SchemaResetPassword>) {
	forgotPasswordModalOpen.value = false

	if (isUserLoggedIn())
		return

	const pending = toast.add({
		title: 'Sending password reset email...',
		color: 'info',
		icon: 'i-lucide-loader',
		duration: 0
	})
	loading.value = true

	const { error } = await useSupabaseClient().auth.resetPasswordForEmail(payload.data.email)

	toast.remove(pending.id)
	loading.value = false

	if (error) {
		toast.add({
			title: 'Error sending password reset email',
			description: error.message,
			color: 'error',
			icon: 'i-lucide-alert-circle'
		})
		return
	} else {
		toast.add({ title: 'Password reset email sent', color: 'success', icon: 'i-lucide-check' })
	}
}
</script>

<template>
	<div class="flex flex-col h-full items-center justify-center gap-4 p-4">
		<UModal v-model:open="forgotPasswordModalOpen">
			<template #body>
				<div class="flex flex-col h-full items-center justify-center gap-4 p-4">
					<UForm
							:schema="schemaResetPassword"
							:state="forgotPasswordState"
							class="flex flex-col items-center gap-4 w-full"
							@submit="onForgotPassword"
					>
						<UFormField name="email" label="Email">
							<UInput v-model="forgotPasswordState.email" type="email"/>
						</UFormField>
						<UButton type="submit">
							Send Reset Email
						</UButton>
					</UForm>
				</div>
			</template>
		</UModal>

		<UPageCard
				class="w-full max-w-md bg-(--ui-bg-accented)"
				:spotlight="true"
				spotlight-color="primary">
			<UAuthForm
					:schema="schemaLogin"
					:fields="fields"
					:loading="loading"
					title="Welcome back!"
					icon="i-lucide-lock"
					@submit="onSubmit"
			>
				<template #description>
					Don't have an account?
					<ULink to="#" class="text-primary font-medium">Sign up</ULink>
					.
				</template>
				<template #password-hint>
					<UButton label="Forgot Password?" variant="link" tabindex="-1" @click="forgotPasswordModalOpen = true"/>
				</template>
			</UAuthForm>
		</UPageCard>
	</div>
</template>

<style scoped>

</style>