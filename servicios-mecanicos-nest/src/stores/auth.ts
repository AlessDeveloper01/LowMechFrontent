import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/services/api'

const STORAGE_KEY = 'lowmech_auth'

interface AuthUser {
  id: number
  username: string
  nombre: string
  apellido: string
  email: string
  rol: string
}

interface LoginResponse {
  access_token: string
  user: AuthUser
}

function cargarUsuario(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as AuthUser
  } catch {
    // ignore
  }
  return null
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(cargarUsuario())
  const isAuthenticated = computed(() => !!user.value)

  async function login(
    username: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const data = await api.post<LoginResponse>('/auth/login', { username, password })
      api.setToken(data.access_token)
      user.value = data.user
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user))
      return { success: true }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }

  function logout() {
    user.value = null
    api.setToken(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return { user, isAuthenticated, login, logout }
})
