<script setup lang="ts"> 
const sideNavOpen = ref(false)

useRouter().beforeEach(() => {
	sideNavOpen.value = false
})

const user = useSupabaseUser()
const userState = useUserState().userState

// Username
const username = computed(() =>
  userState.value.fullName ||
  userState.value.username ||
  userState.value.email ||
  'Fallback User'
)

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

watch(
  avatarSource,
  (newUrl) => {
    loadAvatar(newUrl)
  },
  { immediate: true }
)

onMounted(() => {
  if (user.value) loadAvatar(avatarSource.value)
})

onBeforeUnmount(() => {
  if (lastObjectUrl) {
    URL.revokeObjectURL(lastObjectUrl)
  }
})

// Dropdown (Menu)
import type { DropdownMenuItem } from '@nuxt/ui'
const logout = useLogout()
const items = computed<DropdownMenuItem[][]>(() => {
  const base: DropdownMenuItem[][] = [
    [
      {
        label: username.value,
        avatar: {
          src: avatarBlob.value || undefined,
          icon: avatarBlob.value || 'i-lucide-user-round',
        },
        type: 'label',
      },
    ],
    [
      { label: 'Profile', icon: 'i-lucide-user', to: '/profile' },
      { label: 'Settings', icon: 'i-lucide-settings', to: '/settings/general' },
    ],
    [
      {
        label: 'GitHub',
        icon: 'i-simple-icons-github',
        to: 'https://github.com/LeeKrane/ResuGen',
        target: '_blank',
      },
      { label: 'Support', icon: 'i-lucide-mail', to: 'mailto:support+resugen@krane.dev' },
    ],
    [
      {
        label: 'Logout',
        color: 'error',
        icon: 'i-lucide-log-out',
        onSelect: logout,
      },
    ],
  ]

  if (userState.value.role === 'admin' || true) {
    base.splice(2, 0, [
      { label: 'Admin', icon: 'i-lucide-shield-check', type: 'label', color: 'primary', },
      { label: 'Dashboard', icon: 'i-lucide-layout-dashboard', to: '/admin' },
      { label: 'Manage Users', icon: 'i-lucide-users', to: '/admin/users' }
    ])
  }

  return base
})

const navItems = useNavItems()
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
					
					<UAvatar :src="avatarBlob" icon="i-lucide-user-round" class="border border-(--ui-border)" />
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