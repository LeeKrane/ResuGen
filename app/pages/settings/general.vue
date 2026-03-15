<script setup lang="ts">
import { useUserState } from '~/composables/useUserState'
import type { User } from '@supabase/supabase-js'
import SettingsCard from '~/components/settings/SettingsCard.vue'

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const { userState, setUserState } = useUserState()

const userId = computed(() => userState.value.uid)
const userUsername = ref(userState.value.fullName || '')
const userEmail = computed(() => userState.value.email || '')
const userEmailVerified = computed(() => userState.value.emailConfirmed)


// Avatar Source
const avatarSource = computed(() =>
  userState.value.avatarUrl || userState.value.picture || null
)

// Avatar (cached in state)
const avatarBlob = ref('')
let lastObjectUrl: string | null = null
async function loadAvatar(url: string | null) {
  if (lastObjectUrl) {
    URL.revokeObjectURL(lastObjectUrl)
    lastObjectUrl = null
  }
  if (!url) {
    avatarBlob.value = ''
    return
  }
  try {
    const res = await fetch(url, { cache: 'no-cache' })
    const blob = await res.blob()
    lastObjectUrl = URL.createObjectURL(blob)
    avatarBlob.value = lastObjectUrl
  } catch {
    avatarBlob.value = ''
  }
}

watch(avatarSource, loadAvatar, { immediate: true })

onBeforeUnmount(() => {
  if (lastObjectUrl) URL.revokeObjectURL(lastObjectUrl)
})

const orientation = ref<'vertical' | 'horizontal' | undefined>('vertical')

onMounted(() => {
  const update = () => {
    orientation.value = window.matchMedia('(min-width: 48rem)').matches
      ? 'horizontal'
      : 'vertical'
  }

  update()
  window.addEventListener('resize', update)
})

// Avatar upload
const uploading = ref(false)
const avatarInput = ref<HTMLInputElement | null>(null)

async function onFileChange(event: Event) {
  if (!user.value || !userId.value) return
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  uploading.value = true
  try {
    const timestamp = Date.now()
    const fileName = `${userId.value}_${timestamp}.png`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true })
    if (uploadError) throw uploadError

    const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
    const publicUrl = data.publicUrl

    const oldUrl = userState.value.avatarUrl
    if (oldUrl) {
      const oldName = oldUrl.split('/').pop()
      if (oldName) {
        await supabase.storage.from('avatars').remove([oldName])
      }
    }

    const { data: update } = await supabase.auth.updateUser({
      data: { picture: publicUrl, avatar_url: publicUrl },
    })
    if (update?.user) setUserState(update.user as User)

    useToast().add({
      title: 'Avatar updated',
      color: 'success',
      icon: 'i-lucide-check-circle',
    })
  } catch (err) {
    console.error(err)
    useToast().add({
      title: 'Error uploading avatar',
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
  } finally {
    uploading.value = false
  }
}

// Avatar remove
async function removeUserAvatar() {
  if (!user.value) return
  try {
    const oldUrl = userState.value.avatarUrl
    if (oldUrl) {
      const oldName = oldUrl.split('/').pop()
      if (oldName) {
        await supabase.storage.from('avatars').remove([oldName])
      }
    }

    const { data } = await supabase.auth.updateUser({
      data: { picture: '', avatar_url: '' },
    })
    if (data.user) setUserState(data.user)

    useToast().add({
      title: 'Avatar removed',
      color: 'success',
      icon: 'i-lucide-check-circle',
    })
  } catch (err) {
    console.error(err)
    useToast().add({
      title: 'Error removing avatar',
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
  }
}



// Name change
async function onChangeName() {
  try {
    const { data } = await supabase.auth.updateUser({
      data: { full_name: userUsername.value },
    })
    if (data.user) setUserState(data.user)
    useToast().add({
      title: 'Name updated',
      color: 'success',
      icon: 'i-lucide-check-circle',
    })
  } catch (err) {
    console.error(err)
    useToast().add({
      title: 'Error updating name',
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
  }
}
</script>

<template>
  <SettingsCard>
    <div class="flex flex-col gap-4">
      <div class="flex gap-4 flex-col md:flex-row">


        <div class="flex flex-col grow gap-4">
          <UFormField label="Name">
            <UFieldGroup class="w-full" :orientation="orientation">
              <UInput
                v-model="userUsername"
                class="w-full"
                variant="soft"
                placeholder="Username"
                icon="i-lucide-user"
                @keypress.enter="onChangeName"
              />
              <UButton
                variant="soft"
                size="sm"
                label="Change Name"
                icon="i-lucide-pen"
                @click="onChangeName"
              />
            </UFieldGroup>
          </UFormField>


          <UFormField label="Email">
            <UFieldGroup class="w-full" :orientation="orientation">
              <UInput
                disabled
                v-model="userEmail"
                class="w-full"
                variant="soft"
                placeholder="john.doe@example.com"
                icon="i-lucide-at-sign"
              >
                <template #trailing>
                  <div v-if="userEmailVerified" class="flex gap-1.5 justify-center">
                    <span class="text-success/75">Verified</span>
                    <UIcon
                      name="i-lucide-badge-check"
                      class="size-5 opacity-75"
                      style="color: var(--ui-success)"
                    />
                  </div>
                  <div v-else class="flex gap-1.5 justify-center">
                    <span class="text-error/75">Not Verified</span>
                    <UIcon
                      name="i-lucide-badge-check"
                      class="size-5 opacity-75"
                      style="color: var(--ui-error)"
                    />
                  </div>
                </template>
              </UInput>
              
              <UButton
                variant="soft"
                size="sm"
                label="Change Email"
                icon="i-lucide-pen"
                @click="navigateTo('/settings/security')"/>
            </UFieldGroup>
          </UFormField>
        </div>

        
        <UFormField label="Avatar">
          <div class="flex flex-col items-center gap-4">
            <UAvatar v-if="avatarBlob" :src="avatarBlob" class="w-fit h-fit max-h-80 max-w-80 rounded-lg aspect-square"/>
            <GeneralPlaceholder v-else class="w-80 h-80 max-h-80 max-w-80" />

            <UFieldGroup class="w-full">
              <UButton
                icon="i-lucide-upload"
                variant="soft"
                class="cursor-pointer grow"
                label="Upload"
                :loading="uploading"
                @click="avatarInput?.click()"
              />
              <FormClearInputButton
                v-if="avatarBlob"
                :fn="removeUserAvatar"
                error
                soft
              />
            </UFieldGroup>

            <input
              ref="avatarInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="onFileChange"
            />
          </div>
        </UFormField>
      </div>
    </div>
  </SettingsCard>
</template>
