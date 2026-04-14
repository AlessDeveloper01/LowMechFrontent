<script setup lang="ts">
import LogoBrand from '@/components/login/LogoBrand.vue'
import LoginForm from '@/components/login/LoginForm.vue'
</script>

<template>
  <main class="min-h-screen flex">
    <!-- Lado izquierdo: branding -->
    <aside
      class="hidden lg:flex flex-col items-center justify-center w-[45%] bg-navy relative overflow-hidden"
    >
      <!-- Decoración de fondo - spans puros para layout decorativo sin significado semántico -->
      <aside class="absolute inset-0 opacity-10" aria-hidden="true">
        <span
          class="absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] rounded-full bg-primary block"
        ></span>
        <span
          class="absolute bottom-[-15%] left-[-5%] w-[30rem] h-[30rem] rounded-full bg-primary block"
        ></span>
      </aside>

      <section class="relative z-10 flex flex-col items-center gap-10 px-12">
        <header>
          <LogoBrand size="lg" />
        </header>

        <hgroup class="flex flex-col items-center gap-4 text-center">
          <h1 class="text-[2.2rem] font-bold text-white leading-tight">
            Sistema de Gestión<br />para Talleres Mecánicos
          </h1>
          <p class="text-[1.5rem] text-white/70 max-w-[36rem] leading-relaxed">
            Administra órdenes de trabajo, vehículos, inventario y clientes desde un solo lugar.
          </p>
        </hgroup>

        <!-- Features -->
        <section
          class="flex flex-col gap-4 w-full max-w-[36rem] mt-4"
          aria-label="Características principales"
        >
          <article class="flex items-center gap-4 text-white/80">
            <span
              class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[1.4rem] shrink-0"
              aria-hidden="true"
              >✓</span
            >
            <span class="text-[1.4rem]">Control de órdenes en tiempo real</span>
          </article>
          <article class="flex items-center gap-4 text-white/80">
            <span
              class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[1.4rem] shrink-0"
              aria-hidden="true"
              >✓</span
            >
            <span class="text-[1.4rem]">Gestión de inventario de refacciones</span>
          </article>
          <article class="flex items-center gap-4 text-white/80">
            <span
              class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[1.4rem] shrink-0"
              aria-hidden="true"
              >✓</span
            >
            <span class="text-[1.4rem]">Recordatorios automáticos a clientes</span>
          </article>
        </section>
      </section>
    </aside>

    <!-- Lado derecho: formulario -->
    <section class="flex-1 flex items-center justify-center p-12 bg-bg">
      <article class="w-full max-w-[42rem]">
        <!-- Logo visible solo en móvil -->
        <header class="lg:hidden mb-12">
          <LogoBrand size="md" />
        </header>

        <LoginForm />

        <footer class="mt-12 pt-8 border-t border-border text-center">
          <p class="text-[1.3rem] text-muted">
            ¿No tienes una cuenta?
            <a
              href="#"
              class="font-semibold text-primary no-underline hover:opacity-70 transition-opacity"
            >
              Contacta al administrador
            </a>
          </p>
        </footer>
      </article>
    </section>
  </main>
</template>
