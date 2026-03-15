<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import type { NavigationMenuItem } from '@nuxt/ui'

const items = ref<NavigationMenuItem[][]>([])
const logout = useLogout()
const route = useRoute()

// Dynamically compute the title based on the current route
const pageTitle = computed(() => {
  const flatItems = items.value.flat() as NavigationMenuItem[] // Flatten the items array
  const activeItem = flatItems.find(item => item.to === route.path) // Match the current route
  return activeItem?.label || 'Settings' // Default to "Settings" if no match
})

const pageIcon = computed(() => {
  const flatItems = items.value.flat() as NavigationMenuItem[]
  const activeItem = flatItems.find(item => item.to === route.path)
  return activeItem?.icon || ''
})

async function settingsItems() {
	const base: NavigationMenuItem[][] = [
		[
			{
				label: 'General',
				icon: 'i-lucide-user',
				to: '/settings/general'
			},
			{
				label: 'Security',
				icon: 'i-lucide-shield',
				to: '/settings/security'
			},
			{
				label: 'Notifications',
				icon: 'i-lucide-bell',
				to: '/settings/notifications',
			},
		],
		[
			{
				label: 'Support',
				icon: 'i-lucide-mail',
				to: 'mailto:support+resugen@krane.dev',
			},
			{
				label: 'Logout',
				icon: 'i-lucide-log-out',
				color: 'error',
				onClick: () => logout(),
			}
		],
	]

	if (await useIsWebAdmin()) {
		base.splice(1, 0, [
			{
				label: 'Admin',
				icon: 'i-lucide-shield-check',
				type: 'label',
				color: 'primary',
			},	
			{
				label: 'Debug',
				icon: 'i-lucide-bug-off',
				to: '/settings/debug',
				badge: 'Admin',
			},
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

        <UDashboardPanel id="settings" :ui="{ root: 'min-h-auto', body: 'flex-none' }">
          <template #header>
            <div class="h-(--ui-header-height) shrink-0 flex items-center justify-between border-b px-4 sm:px-6 gap-1.5 border-(--ui-text-muted)/25">
              <span class="flex items-center gap-1.5 font-semibold text-highlighted truncate">
                Settings
              </span>
            </div>

            <UDashboardToolbar class="border-(--ui-text-muted)/25">
              <UNavigationMenu :items="items" highlight class="-mx-1 flex-1 hidden md:flex" />
			  <UDropdownMenu
			  	:items="items"
				class="flex md:hidden w-full"
				:ui="{ content: 'w-(--reka-dropdown-menu-trigger-width)' }">
				  <UButton
					variant="outline"
					size="lg"
					:icon="pageIcon"
					trailing-icon="i-lucide-arrow-down"
					:label="pageTitle"
					class="justify-center"
				  />
			  </UDropdownMenu>
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