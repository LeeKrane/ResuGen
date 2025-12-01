<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
const items = ref<NavigationMenuItem[][]>([])
const logout = useLogout()

async function settingsItems() {
	const base: NavigationMenuItem[][] = [
		[
			{
				label: 'General',
				icon: 'i-lucide-user',
				to: '/settings/general',
				exact: true
			}, {
				label: 'Security',
				icon: 'i-lucide-shield',
				to: '/settings/security'
			}, {
				label: 'Notifications',
				icon: 'i-lucide-bell',
				to: '/settings/notifications'
			},
		],
		[
			{
				label: 'Support',
				icon: 'i-lucide-mail',
				to: 'mailto:support+resugen@krane.dev',
			}, {
				label: 'Logout',
				icon: 'i-lucide-log-out',
				onClick: () => logout(),
			}
		],
	]

	if (await useIsWebAdmin()) {
		base.splice(1, 0, [
			{
				label: 'Debug',
				icon: 'i-lucide-bug-off',
				to: '/settings/debug',
				badge: 'Admin'
			}
		])
	}

	items.value = base
}

onMounted(() => {
	settingsItems()
})
</script>

<template>
  <div class="flex flex-col h-full items-center justify-center gap-4 p-4">
    <UPageCard
      class="flex w-full max-w-5xl bg-(--ui-bg-accented)"
      :spotlight="true"
      spotlight-color="primary">

        <UDashboardPanel id="settings">
          <template #header>
            <div class="h-(--ui-header-height) shrink-0 flex items-center justify-between border-b px-4 sm:px-6 gap-1.5 border-(--ui-text-muted)/25">
              <span class="flex items-center gap-1.5 font-semibold text-highlighted truncate">
                Settings
              </span>
            </div>

            <UDashboardToolbar class="border-(--ui-text-muted)/25">
              <UNavigationMenu :items="items" highlight class="-mx-1 flex-1" />
            </UDashboardToolbar>
          </template>

          <template #body>
            <div class="flex flex-col gap-4 sm:gap-6 lg:gap-12 w-full lg:max-w-4xl mx-auto">
              <slot />
            </div>
          </template>
        </UDashboardPanel>
    </UPageCard>
  </div>
</template>
