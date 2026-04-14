import { ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/services/api'

export interface User {
  id: number
  username: string
  name: string
  apellido: string
  email: string
  rol: string
  activo: boolean
  created_at: string
  updated_at: string
}

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([])
  const selectedUser = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchUsers() {
    loading.value = true
    error.value = null
    try {
      users.value = await api.get<User[]>('/users')
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  async function fetchUser(id: number): Promise<User | null> {
    loading.value = true
    error.value = null
    try {
      const u = await api.get<User>(`/users/${id}`)
      selectedUser.value = u
      return u
    } catch (e) {
      error.value = (e as Error).message
      selectedUser.value = null
      return null
    } finally {
      loading.value = false
    }
  }

  async function createUser(payload: Record<string, unknown>): Promise<User | null> {
    error.value = null
    try {
      const u = await api.post<User>('/users', payload)
      users.value.push(u)
      return u
    } catch (e) {
      error.value = (e as Error).message
      return null
    }
  }

  async function updateUser(id: number, payload: Record<string, unknown>): Promise<User | null> {
    error.value = null
    try {
      const u = await api.put<User>(`/users/${id}`, payload)
      const idx = users.value.findIndex((x) => x.id === id)
      if (idx !== -1) users.value[idx] = u
      return u
    } catch (e) {
      error.value = (e as Error).message
      return null
    }
  }

  async function deleteUser(id: number): Promise<boolean> {
    error.value = null
    try {
      await api.delete(`/users/${id}`)
      users.value = users.value.filter((u) => u.id !== id)
      return true
    } catch (e) {
      error.value = (e as Error).message
      return false
    }
  }

  return {
    users,
    selectedUser,
    loading,
    error,
    fetchUsers,
    fetchUser,
    createUser,
    updateUser,
    deleteUser,
  }
})
