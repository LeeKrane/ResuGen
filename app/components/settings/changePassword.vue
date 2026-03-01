<script lang="ts" setup>
import * as z from 'zod'
import type { FormSubmitEvent } from "@nuxt/ui"

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const toast = useToast()
const logout = useLogout()

const fields = [
{
	name: 'currentPassword',
	type: 'password' as const,
	label: 'Current Password',
	placeholder: 'Enter your current password',
},
{
	name: 'newPassword',
	type: 'password' as const,
	label: 'New Password',
	placeholder: 'Enter your new Password',
}, {
	name: 'confirmPassword',
	label: 'Confirm Password',
	type: 'password' as const,
	placeholder: 'Confirm your new Password',
}]

const loading = ref(false)

const schema = z.object({
  currentPassword: z.string('Current password is required'),
	newPassword: z.string('New password is required')
			.min(8, 'Must be at least 8 characters')
			.max(128, 'Must be at most 128 characters')
			.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/, 'Your password needs at least one uppercase letter, one lowercase letter, and one number.')
			.regex(/^(?=.*[!@#$%^&*()_+\-=[\]{}|;:'",.<>/?~`]).*$/, 'Your password needs at least one special character: !@#$%^&*()_+-=[]{}|;:\'",.<>?~`'),
	confirmPassword: z.string('Please confirm your new password')
}).superRefine((data, ctx) => {
  if (data.currentPassword === data.newPassword) {
    ctx.addIssue({
      code: "custom",
      message: "New password must be different from current password",
      path: ['newPassword']
    });
  } else if (data.newPassword !== data.confirmPassword) {
		ctx.addIssue({
			code: "custom",
			message: 'Passwords do not match',
			path: ['confirmPassword']
		})
	}
})

type Schema = z.output<typeof schema>

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  if (!user.value || !user.value.email) return

  const pendingLogin = toast.add({ title: 'Checking current Password...', color: 'info', icon: 'i-lucide-loader', duration: 0 })
  loading.value = true
  const { data, error } = await supabase.auth.signInWithPassword({
    email: user.value.email,
    password: payload.data.currentPassword
  })

  toast.remove(pendingLogin.id)
  loading.value = false

  if (error || !data.user) {
    toast.add({
      title: 'Error updating password',
      description: 'Current password is incorrect',
      color: 'error',
      icon: 'i-lucide-triangle-alert'
    })
    return
  } else {
    const pendingChangePassword = toast.add({ title: 'Updating password...', color: 'info', icon: 'i-lucide-loader', duration: 0 })
    loading.value = true

    const { error } = await supabase.auth.updateUser({ password: payload.data.newPassword })

    toast.remove(pendingChangePassword.id)
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
      openModal.value = false
      
      logout()
    }
  }
}

const props = defineProps({
  modelValue: { type: Boolean, required: true }
})
const emit = defineEmits(['update:modelValue'])

const openModal = ref(props.modelValue)
watch(openModal, (val) => emit('update:modelValue', val))
watch(() => props.modelValue, (val) => (openModal.value = val))

</script>

<template>
  <UModal :closeable="true"
    v-model:open="openModal">
    <template #content>
      <div class="flex flex-col h-full items-center justify-center gap-4 p-4">
        <UPageCard
            class="w-full bg-(--ui-bg-accented)"
            :spotlight="true"
            spotlight-color="primary">
          <UAuthForm
              :schema="schema"
              :fields="fields"
              :loading="loading"
              title="Update your Password"
              icon="i-lucide-rotate-ccw-key"
              @submit="onSubmit">
            <template #description>
              Enter your new Password below.
            </template>
          </UAuthForm>
        </UPageCard>
      </div>
    </template>
  </UModal>
</template>

<style>

</style>