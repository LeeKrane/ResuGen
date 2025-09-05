<script setup lang="ts"> 
const sideNavOpen = ref(false)

useRouter().beforeEach(() => {
	sideNavOpen.value = false
})

const navItems = useNavItems()

const logout = async () => {
	await useSupabaseClient().auth.signOut()
	navigateTo('/')
	useToast().add({ title: 'Successfully logged out', color: 'info', icon: 'i-lucide-info' })
}

const user = useSupabaseUser()
const role = user.value?.role || undefined // Does not exist currently.

// START OF "NOT THE BEST SOLUTION"
import { useUserState } from '~/composables/useUserState'
const { userState } = await useUserState();

// Username
const Username = computed(() => {
  return userState.value.fullName || userState.value.username || userState.value.email || 'Fallback User';
});
const newUsername = ref(userState.value.fullName || userState.value.username || userState.value.email || 'Fallback User')


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
  newUsername.value = newState.username || '';
  newAvatar.value = newState.avatarUrl || '';
}, { immediate: true });
// END OF "NOT THE BEST SOLUTION"

// Dropdown (Menu)
import type { DropdownMenuItem } from '@nuxt/ui'
const items = computed<DropdownMenuItem[][]>(() => {
  return [
    [
      {
        label: Username,
        avatar: {
          src: Avatar.value || undefined,
          icon: Avatar.value || 'i-lucide-user-round'
        },
        type: 'label'
      }
    ],
    [
      {
        label: 'Profile',
        icon: 'i-lucide-user',
        to: '/profile'
      },
      {
        label: 'Settings',
        icon: 'i-lucide-settings',
        to: '/settings/general'
      }
    ],

    // Admin
    ...(role === 'admin'
      ? [[
	  	  {
			label: 'Admin',
			icon: 'i-lucide-shield-check',
			type: 'label',
			color: 'primary'
		  },
          {
            label: 'Dashboard',
            icon: 'i-lucide-layout-dashboard',
            to: '/admin'
          },
		  {
			label: 'Manage Users',
			icon: 'i-lucide-users',
			to: '/admin/users'
		  }
        ]]
      : []),
	  
    [
      {
        label: 'GitHub',
        icon: 'i-simple-icons-github',
        to: 'https://github.com/LeeKrane/ResuGen',
        target: '_blank'
      },
      {
        label: 'Support',
        icon: 'i-lucide-mail',
        to: 'mailto:support+resugen@krane.dev'
      }
    ],
    [
      {
        label: 'Logout',
        color: 'error',
        icon: 'i-lucide-log-out',
        onSelect: logout
      }
    ]
  ]
})
</script>

<template>
	<header
		class="print:hidden sticky h-16 top-0 z-50 bg-(--ui-bg)/75 backdrop-blur-xs border-b border-(--ui-border) grid md:grid-cols-[1fr_1fr_1fr] max-md:grid-cols-[1fr_1fr] items-center px-4 py-1">
		<GeneralResuGenButton class="justify-self-start"/>
		
		<UNavigationMenu class="max-md:hidden justify-center" :items="navItems"/>
		<div class="justify-self-end flex items-center gap-2 mr-2">
			<GeneralColorModeButton/>
			
			<UTooltip
				text="Source Code"
				arrow
				:delay-duration="0">
				<UButton
					color="neutral"
					variant="ghost"
					icon="i-lucide-code"
					to="https://github.com/LeeKrane/ResuGen"
					target="_blank"
				/>
			</UTooltip>

			<UDropdownMenu
				v-if="useSupabaseUser().value"
				:items="items"
				:ui="{ content: 'min-w-fit' }">

				<UTooltip
					text="Menu"
					arrow
					:delay-duration="0">
					
					<UAvatar :src="Avatar || undefined" icon="i-lucide-user-round" class="border border-(--ui-border)" />
				</UTooltip>
			</UDropdownMenu>

			<UButton
				v-else
				color="neutral"
				variant="ghost"
				label="Sign In"
				trailing-icon="i-lucide-log-in"
				to="/login"/>

			<aside class="md:hidden">
				<USlideover
					v-model:open="sideNavOpen"
					title="Navigation">
					<UButton
						color="neutral"
						variant="ghost"
						icon="i-lucide-menu"/>

					<template #body>
						<UNavigationMenu
							:items="navItems"
							class="w-full"
							orientation="vertical"
							@click="sideNavOpen = false"/>
					</template>

					<template #footer>
						<div class="flex items-center justify-center w-full">
							<GeneralCopyrightNotice/>
						</div>
					</template>
				</USlideover>
			</aside>
		</div>
	</header>
</template>

<style scoped>

</style>