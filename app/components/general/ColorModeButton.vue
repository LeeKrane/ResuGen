<script setup>
const colorMode = useColorMode()

const isDark = computed({
  get() {
    return colorMode.value === 'dark'
  },
  set() {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  }
})
</script>

<template>
  <ClientOnly v-if="!colorMode?.forced">
    <UTooltip
				:text="isDark ? 'Dark Mode' : 'Light Mode'"
				arrow
				:delay-duration="0">
				<UButton
          color="neutral"
					variant="ghost"
					target="_blank"
          :icon="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
          @click="isDark = !isDark"
        />
    </UTooltip>

    <template #fallback>
      <div class="size-8" />
    </template>
  </ClientOnly>
</template>