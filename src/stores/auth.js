import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '../lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(true)
  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  // Initialize auth state from Supabase session or guest mode
  async function initAuth() {
    // 3秒后强制结束loading，防止Supabase连接卡住
    setTimeout(() => {
      loading.value = false
  }, 3000)
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session?.user) {
      user.value = session.user
    } else if (localStorage.getItem('guest_mode') === 'true') {
      // Guest mode: create a mock user object
      user.value = {
        id: 'guest',
        email: 'guest@local',
        user_metadata: {
          name: localStorage.getItem('guest_name') || '访客'
        }
      }
    } else {
      user.value = null
    }
    
    loading.value = false

    // Listen for auth changes
    supabase.auth.onAuthStateChange((event, session) => {
      user.value = session?.user ?? null
    })
  }

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    user.value = data.user
    return data.user
  }

  async function register(email, password, name) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    })
    if (error) {
      if (error.message?.includes('rate limit') || error.status === 429) {
        throw new Error('注册过于频繁，请稍后再试，或使用已有账号登录')
      }
      throw error
    }
    user.value = data.user
    
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      throw new Error('该邮箱已注册，请直接登录')
    }
    
    return data.user
  }

  async function logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    user.value = null
  }

  // Initialize immediately
  initAuth()

  return { user, loading, isAuthenticated, isAdmin, login, register, logout, initAuth }
})
