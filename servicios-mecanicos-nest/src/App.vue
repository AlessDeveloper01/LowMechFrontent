<script setup lang="ts">
import { ref, provide, watch } from 'vue'
import { RouterView } from 'vue-router'

const collapsed = ref(false)
const darkMode = ref(false)

provide('sidebarCollapsed', collapsed)
provide('darkMode', darkMode)

watch(
  darkMode,
  (val) => {
    document.documentElement.classList.toggle('dark', val)
  },
  { immediate: true },
)
</script>

<template>
  <RouterView />
</template>
