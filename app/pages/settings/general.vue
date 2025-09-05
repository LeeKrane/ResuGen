<script lang="ts" setup>
	definePageMeta({
		layout: "settings"
	})

	const supabase = useSupabaseClient()
	const user = useSupabaseUser()

	// START OF "NOT THE BEST SOLUTION"
	import { useUserState } from '~/composables/useUserState'
	const { userState, setUserState } = await useUserState();

	const userId = userState.value.uid
	const userUsername = ref(userState.value.fullName || '')
	const userEmail = userState.value.email || ''
	const userEmailverified = computed(() => userState.value.emailConfirmed);


	// Avatar
	const Avatar = computed(() => {
		const url = userState.value.avatarUrl || userState.value.picture || '';

		if (url) {
			return `${url}?t=${Date.now()}`;
		}
	return null;
	});
	const newAvatar = ref(userState.value.avatarUrl || userState.value.picture || '')


	// Watcher for new Information inside of userState
	watch(() => userState.value, (newState) => {
		newAvatar.value = newState.avatarUrl || '';
	}, { immediate: true });
	// END OF "NOT THE BEST SOLUTION"

	// EMAIL REGEX
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	const isEmailValid = computed(() => emailRegex.test(userEmail))

	// AVATAR
	const uploading = ref(false)
	const onFileChange = async (event) => {
		if (!user.value) return
		const file = event.target.files[0]
		if (!file) return

		uploading.value = true

		try { 
			const { error: uploadError } = await supabase.storage.from('avatars').upload(`${userId}.png`, file, { upsert: true })

			if (uploadError) console.log('Error uploading avatar:', uploadError)

			const { data }  = supabase.storage.from('avatars').getPublicUrl(`${userId}.png`)
			const userPublicUrl = data.publicUrl

			const { data: {user} } = await useSupabaseClient().auth.updateUser({
				data: { picture: userPublicUrl, avatar_url: userPublicUrl }
			})
			setUserState(user)
		} catch (err) {
			useToast().add({ title: 'Error – Uploading Avatar failed', color: 'error', icon: 'i-lucide-alert-circle' })
		} finally {
			useToast().add({ title: 'Success – Uploading Avatar finished', color: 'success', icon: 'i-lucide-check-circle' })
			uploading.value = false
		}
	}
	const removeUserAvatar = async () => {
		if (!user.value) return

		try {
			const { error: deleteError } = await supabase.storage.from('avatars').remove([`${userId}.png`])
			if (deleteError) console.log('Error deleting avatar from storage:', deleteError)

			const { data } = await useSupabaseClient().auth.updateUser({
				data: { picture: '', avatar_url: '' }
			})
			setUserState(data.user);
		} catch (err) {
			useToast().add({ title: 'Error – Removing Avatar failed', color: 'error', icon: 'i-lucide-alert-circle' })
		} finally {
			useToast().add({ title: 'Success – Avatar removed', color: 'success', icon: 'i-lucide-check-circle' })
		}
	}
	const avatarInput = ref<HTMLInputElement | null>(null)


	// CHANGE NAME
	async function onChangeName() {
		try {
			const { data } = await useSupabaseClient().auth.updateUser({
				data: { full_name: userUsername.value }
			})
			setUserState(data.user);
			useToast().add({ title: 'Name updated', color: 'success', icon: 'i-lucide-check-circle' })
		} catch (error) {
			console.log(error)
			useToast().add({ title: 'Error updating name', color: 'error', icon: 'i-lucide-alert-circle' })
		}
		
	}
</script>

<template>
  <div class="flex flex-col gap-4 m-4">
		<div class="flex gap-4">
			<div class="flex flex-col grow gap-4">

				<UFormField label="Name">
					<UFieldGroup class="w-full">
						<UInput
							v-model="userUsername"
							class="w-full"
							variant="soft"
							placeholder="Username"
							icon="i-lucide-user"
							@keypress.enter="onChangeName"/>
							<UButton
								variant="soft"
								size="sm"
								label="Change Name"
								icon="i-lucide-pen"
								@click="onChangeName"/>
					</UFieldGroup>
				</UFormField>

				<UFormField label="Email" :error="userEmail !== '' && !isEmailValid">
					<UFieldGroup class="w-full">
						<UInput
							disabled
							v-model="userEmail"
							class="w-full"
							variant="soft"
							placeholder="john.doe@example.com"
							icon="i-lucide-at-sign">
							
							<template #trailing>
								<div v-if="userEmailverified" class="flex gap-1.5 justify-center">
									<span class="text-success/75">
										Verified
									</span>
									<UIcon  name="i-lucide-badge-check" class="size-5 opacity-75" style="color: var(--ui-success);"/>
								</div>
								<div v-else class="flex gap-1.5 justify-center">
									<span class="text-error/75">
										not Verified
									</span>
									<UIcon name="i-lucide-badge-check" class="size-5 opacity-75" style="color: var(--ui-error);" />
								</div>
							</template>
						</UInput>
						<template #hint>
							<span v-if="userEmail !== '' && !isEmailValid" class="text-(--ui-error)">Please enter a valid email address.</span>
						</template>
						<UButton
							variant="soft"
							size="sm"
							label="Change Email"
							icon="i-lucide-pen"/>
					</UFieldGroup>
				</UFormField>
			</div>

			<UFormField label="Avatar">
				<div class="flex flex-col items-start gap-4">
					<NuxtImg
						v-if="Avatar"
						:src="Avatar"
						class="w-32 h-32 rounded-lg"/>
					<GeneralPlaceholder
						v-else
						class="w-32 h-32"
					/>
					<UFieldGroup class="w-full">
						<UButton
							icon="i-lucide-upload"
							variant="soft"
							placeholder="Upload Avatar"
							class="cursor-pointer grow"
							label="Upload"
							@click="avatarInput!.click()"/>
						<FormClearInputButton
							v-if="Avatar"
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
						@change="onFileChange">
				</div>
			</UFormField>
		</div>
	</div>
</template>