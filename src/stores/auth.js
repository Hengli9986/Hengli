import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const isAdmin = computed(() => user.value?.role === 'admin')

  async function login(email, password) {
    // MVP: Simple localStorage auth (replace with Supabase Auth in production)
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const found = users.find(u => u.email === email && u.password === password)
    if (!found) throw new Error('邮箱或密码错误')
    user.value = found
    localStorage.setItem('user', JSON.stringify(found))
    return found
  }

  async function register(email, password, name) {
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    if (users.find(u => u.email === email)) throw new Error('邮箱已注册')
    const newUser = { id: Date.now().toString(), email, password, name, role: 'member' }
    users.push(newUser)
    localStorage.setItem('users', JSON.stringify(users))
    user.value = newUser
    localStorage.setItem('user', JSON.stringify(newUser))
    return newUser
  }

  function logout() {
    user.value = null
    localStorage.removeItem('user')
  }

  return { user, isAdmin, login, register, logout }
})
