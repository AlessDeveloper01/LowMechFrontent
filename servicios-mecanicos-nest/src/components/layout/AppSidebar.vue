<script setup lang="ts">
import { inject, type Ref } from 'vue'
import { useRoute } from 'vue-router'
import logoImg from '@/assets/images/logo.png'

const route = useRoute()
const collapsed = inject<Ref<boolean>>('sidebarCollapsed')!

const navItems = [
  { label: 'Dashboard', route: 'dashboard' },
  { label: 'Ordenes', route: 'ordenes-lista' },
  { label: 'Vehiculos', route: 'vehiculos-lista' },
  { label: 'Clientes', route: 'clientes-lista' },
  { label: 'Inventario', route: 'inventario-lista' },
  { label: 'Usuarios', route: 'usuarios-lista' },
  { label: 'Reportes', route: 'reportes' },
]

function isActive(ruta: string): boolean {
  if (ruta === 'dashboard') return route.name === 'dashboard'
  if (ruta === 'ordenes-lista') return String(route.name).startsWith('ordenes')
  if (ruta === 'vehiculos-lista') return String(route.name).startsWith('vehiculos')
  if (ruta === 'clientes-lista') return String(route.name).startsWith('clientes')
  if (ruta === 'inventario-lista') return String(route.name).startsWith('inventario')
  if (ruta === 'usuarios-lista') return String(route.name).startsWith('usuarios')
  if (ruta === 'reportes') return route.name === 'reportes'
  return false
}
</script>

<template>
  <aside
    class="fixed left-0 top-0 h-screen bg-navy flex flex-col z-[1000] transition-all duration-300 ease-out overflow-hidden max-[768px]:-translate-x-full"
    :class="collapsed ? 'w-[6.4rem]' : 'w-[22rem]'"
  >
    <!-- Logo -->
    <header class="h-[6.5rem] flex items-center px-6 shrink-0">
      <img :src="logoImg" alt="LowMech" class="h-8 object-contain brightness-0 invert" />
      <span
        class="ml-4 text-[1.4rem] font-bold text-white tracking-wide transition-all duration-200 whitespace-nowrap overflow-hidden"
        :class="collapsed ? 'max-w-0 opacity-0' : 'max-w-[12rem] opacity-100'"
      >
        LowMech
      </span>
    </header>

    <!-- Nav -->
    <nav class="flex-1 py-8 flex flex-col px-3">
      <router-link
        v-for="item in navItems"
        :key="item.label"
        :to="{ name: item.route }"
        class="relative flex items-center h-[4.2rem] px-3 text-[1.3rem] font-medium no-underline transition-all duration-200 whitespace-nowrap"
        :class="
          isActive(item.route)
            ? 'text-white bg-white/10'
            : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
        "
      >
        <span
          class="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-primary transition-opacity"
          :class="isActive(item.route) ? 'opacity-100' : 'opacity-0'"
        ></span>
        <span
          class="w-8 h-8 flex items-center justify-center text-[1.1rem] font-bold shrink-0"
          :class="isActive(item.route) ? 'text-primary' : 'text-white/30'"
        >
          {{ item.label.charAt(0) }}
        </span>
        <span
          class="ml-4 transition-all duration-200 overflow-hidden"
          :class="collapsed ? 'max-w-0 opacity-0' : 'max-w-[14rem] opacity-100'"
        >
          {{ item.label }}
        </span>
      </router-link>
    </nav>

    <!-- Bottom -->
    <footer class="p-3 mb-4 flex flex-col gap-1">
      <router-link
        :to="{ name: 'configuracion' }"
        class="flex items-center h-[4.2rem] px-3 text-white/30 hover:text-white/60 hover:bg-white/[0.04] text-[1.3rem] font-medium no-underline transition-all whitespace-nowrap"
      >
        <span class="w-8 h-8 flex items-center justify-center text-[1.1rem] font-bold shrink-0"
          >S</span
        >
        <span
          class="ml-4 transition-all duration-200 overflow-hidden"
          :class="collapsed ? 'max-w-0 opacity-0' : 'max-w-[14rem] opacity-100'"
          >Ajustes</span
        >
      </router-link>
      <button
        class="flex items-center h-[4.2rem] px-3 text-white/30 hover:text-white/60 hover:bg-white/[0.04] text-[1.3rem] font-medium transition-all whitespace-nowrap cursor-pointer border-none bg-transparent"
        @click="collapsed = !collapsed"
      >
        <span class="w-8 h-8 flex items-center justify-center shrink-0">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            class="transition-transform duration-300"
            :class="collapsed ? 'rotate-180' : ''"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </span>
        <span
          class="ml-4 transition-all duration-200 overflow-hidden"
          :class="collapsed ? 'max-w-0 opacity-0' : 'max-w-[14rem] opacity-100'"
          >Colapsar</span
        >
      </button>
    </footer>
  </aside>
</template>
