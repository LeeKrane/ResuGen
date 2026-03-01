<script lang="ts" setup>
import * as z from 'zod'
import type { FormSubmitEvent } from "@nuxt/ui"

const supabase = useSupabaseClient()
const toast = useToast()

const fields = [{
	name: 'newEmail',
	type: 'email' as const,
	label: 'New Email',
	placeholder: 'Enter your new Email',
}, {
	name: 'confirmEmail',
	label: 'Confirm Email',
	type: 'email' as const,
	placeholder: 'Confirm your new email',
}]

const loading = ref(false)

const schema = z.object({
  newEmail: z.string('New email is required').
    .email("Invalid email address"),
  confirmEmail: z.string('Please confirm your new email')
}).superRefine((data, ctx) => {
  if (data.newEmail !== data.confirmEmail) {
    ctx.addIssue({
      code: "custom",
      message: "Emails do not match",
      path: ["confirmEmail"]
    });
  }
});

type Schema = z.output<typeof schema>

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  const pending = toast.add({ title: 'Updating email...', color: 'info', icon: 'i-lucide-loader', duration: 0 })
  loading.value = true

  const { error } = await supabase.auth.updateUser({ email: payload.data.newEmail })

  toast.remove(pending.id)
  loading.value = false

  if (error) {
    toast.add({
      title: 'Error updating email',
      description: error.message,
      color: 'error',
      icon: 'i-lucide-triangle-alert'
    })
  } else {
    toast.add({ title: 'Successfully updated email!', color: 'success', icon: 'i-lucide-check' })
    openModal.value = false
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
              title="Update your Email"
              icon="i-lucide-mail"
              @submit="onSubmit">
            <template #description>
              Enter your new Email below.
            </template>
          </UAuthForm>
        </UPageCard>
      </div>
    </template>
  </UModal>
</template>

<style>

</style>