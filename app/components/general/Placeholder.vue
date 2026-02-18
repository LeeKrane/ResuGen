<template>
  <div class="relative overflow-hidden rounded-lg border border-dashed border-accented px-4 flex items-center justify-center bg-(--ui-bg)/50 backdrop-blur-md">
    <svg class="absolute inset-0 h-full w-full stroke-inverted/10" fill="none">
      <defs>
        <pattern
          id="placeholder-pattern"
          x="0"
          y="0"
          width="10"
          height="10"
          patternUnits="userSpaceOnUse"
        >
          <path d="M-3 13 15-5M-5 5l18-18M-1 21 17 3" />
        </pattern>
      </defs>
      <rect stroke="none" fill="url(#placeholder-pattern)" width="100%" height="100%" />
    </svg>
  </div>
</template>