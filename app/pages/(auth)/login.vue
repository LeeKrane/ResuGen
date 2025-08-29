<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from "@nuxt/ui"

definePageMeta({
	middleware: ["logged-out"]
})

const supabase = useSupabaseClient()
const requestURL = useRequestURL()
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

async function onOAuthLogin(provider: 'Google' | 'GitHub') {
	toast.add({
		title: `Redirecting to ${provider}...`,
		color: 'info', 
		icon: 'i-lucide-loader', 
		duration: 0 
	})
	
	const { error } = await supabase.auth.signInWithOAuth({
		provider: provider.toLowerCase() as 'google' | 'github',
		options: {
			redirectTo: `${requestURL.origin}/me?oAuthStatus=${btoa('oauth_success:' + provider)}`,
		}
	})
	
	if (error) {
		toast.add({ 
			title: `Error with ${provider} login`,
			description: error.message, 
			color: 'error', 
			icon: 'i-lucide-triangle-alert' 
		})
	}
}

const providers = [{
	label: 'Google',
	icon: 'i-simple-icons-google',
	onClick: () => onOAuthLogin('Google')
}, {
	label: 'GitHub',
	icon: 'i-simple-icons-github',
	onClick: () => onOAuthLogin('GitHub')
}]

const loading = ref(false)

const schemaLogin = z.object({
	email: z.string().email('Invalid email'),
	password: z.string()
})

type SchemaLogin = z.output<typeof schemaLogin>

async function onSubmit(payload: FormSubmitEvent<SchemaLogin>) {
	const pending = toast.add({ title: 'Logging in...', color: 'info', icon: 'i-lucide-loader', duration: 0 })
	loading.value = true

	const { error } = await supabase.auth.signInWithPassword({
		email: payload.data.email,
		password: payload.data.password,
	})

	toast.remove(pending.id)
	loading.value = false

	if (error) {
		toast.add({ title: 'Error logging in', description: error.message, color: 'error', icon: 'i-lucide-triangle-alert' })
		return
	} else {
		toast.add({ title: 'Successfully logged in!', color: 'success', icon: 'i-lucide-check' })
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

	const pending = toast.add({
		title: 'Sending password reset email...',
		color: 'info',
		icon: 'i-lucide-loader',
		duration: 0
	})
	loading.value = true

	const { error } = await supabase.auth.resetPasswordForEmail(payload.data.email, {
		redirectTo: `${requestURL.origin}/reset-password`
	})

	toast.remove(pending.id)
	loading.value = false

	if (error) {
		toast.add({
			title: 'Error sending password reset email',
			description: error.message,
			color: 'error',
			icon: 'i-lucide-triangle-alert'
		})
	} else {
		toast.add({ title: 'Successfully sent password reset email!', color: 'success', icon: 'i-lucide-check' })
	}
}

const freshlyRegisteredEmail = useRoute().query.freshlyRegisteredEmail as string | undefined
const verifyEmailModalOpen = ref(freshlyRegisteredEmail !== undefined)
</script>

<template>
	<div class="flex flex-col h-full items-center justify-center gap-4 p-4">
		<UModal v-model:open="forgotPasswordModalOpen" title="Forgot your password?">
			<template #body>
				<div class="flex flex-col h-full items-center justify-center gap-4 p-4">
					<p class="text-center">
						Enter your email address and we will send you a one time login link, so that you can reset your password.
					</p>
					<UForm
							:schema="schemaResetPassword"
							:state="forgotPasswordState"
							class="flex flex-col items-center gap-4 w-full"
							@submit="onForgotPassword"
					>
						<UFormField name="email" label="Email" class="w-full">
							<UInput v-model="forgotPasswordState.email" type="email" class="w-full"/>
						</UFormField>
						<UButton type="submit">
							Continue
						</UButton>
					</UForm>
				</div>
			</template>
		</UModal>

		<UModal v-model:open="verifyEmailModalOpen">
			<template #content>
				<div class="flex flex-col h-full items-center justify-center gap-4 p-8">
					<UIcon name="i-lucide-circle-alert" class="text-4xl text-(--ui-warning)"/>
					<h3 class="font-medium text-lg">Verify your email</h3>
					<p class="text-sm text-muted text-center">
						Before being able to use your account, you need to verify your email address. We sent you an email to <span class="text-primary">{{ freshlyRegisteredEmail || '??' }}</span>. Please click the link in the email to verify your account.
					</p>
					<UButton class="mt-2" label="Understood" @click="verifyEmailModalOpen = false"/>
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
					:providers="providers"
					:loading="loading"
					title="Welcome back!"
					icon="i-lucide-user"
					@submit="onSubmit">
				<template #description>
					Enter your credentials to access your account.
					<br>
					Don't have an account?
					<ULink to="/register" class="text-primary font-medium">Register here</ULink>.
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