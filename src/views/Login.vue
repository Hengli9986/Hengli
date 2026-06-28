<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg">
      <h1 class="text-2xl font-bold text-center mb-2">geek抖音服务站</h1>
      <p class="text-gray-500 text-center mb-8">团队数据助手</p>
      
      <!-- Mode Toggle -->
      <div class="flex bg-gray-100 rounded-lg p-1 mb-6">
        <button
          @click="authMode = 'login'"
          :class="[
            'flex-1 py-2 text-sm font-medium rounded-md transition-all',
            authMode === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          ]"
        >
          登录
        </button>
        <button
          @click="authMode = 'register'"
          :class="[
            'flex-1 py-2 text-sm font-medium rounded-md transition-all',
            authMode === 'register' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          ]"
        >
          注册
        </button>
        <button
          @click="authMode = 'guest'"
          :class="[
            'flex-1 py-2 text-sm font-medium rounded-md transition-all',
            authMode === 'guest' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          ]"
        >
          免登录
        </button>
      </div>
      
      <!-- Login Form -->
      <form v-if="authMode === 'login'" @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
          <input
            v-model="form.email"
            type="email"
            required
            class="input-field"
            placeholder="your@email.com"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">密码</label>
          <input
            v-model="form.password"
            type="password"
            required
            class="input-field"
            placeholder="******"
          />
        </div>
        
        <button type="submit" class="w-full btn-primary py-3 font-medium" :disabled="isLoading">
          {{ isLoading ? '登录中...' : '登录' }}
        </button>
      </form>
      
      <!-- Register Form -->
      <form v-if="authMode === 'register'" @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
          <input
            v-model="form.email"
            type="email"
            required
            class="input-field"
            placeholder="your@email.com"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">密码</label>
          <input
            v-model="form.password"
            type="password"
            required
            minlength="6"
            class="input-field"
            placeholder="至少6位"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">姓名</label>
          <input
            v-model="form.name"
            type="text"
            required
            class="input-field"
            placeholder="你的名字"
          />
        </div>
        
        <button type="submit" class="w-full btn-primary py-3 font-medium" :disabled="isLoading">
          {{ isLoading ? '注册中...' : '注册' }}
        </button>
        
        <p class="text-xs text-gray-400 text-center">
          如遇"邮件速率限制"报错，请使用「免登录」模式
        </p>
      </form>
      
      <!-- Guest Mode -->
      <div v-if="authMode === 'guest'" class="space-y-4">
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p class="text-sm text-yellow-800">
            <span class="font-bold">免登录模式</span>：数据仅保存在当前浏览器，换设备或清除缓存会丢失。
          </p>
          <p class="text-sm text-yellow-700 mt-2">
            适合快速体验功能，后续可在设置中绑定账号。
          </p>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">显示名称（可选）</label>
          <input
            v-model="form.name"
            type="text"
            class="input-field"
            placeholder="访客"
          />
        </div>
        
        <button @click="enterGuestMode" class="w-full btn-primary py-3 font-medium" :disabled="isLoading">
          {{ isLoading ? '进入中...' : '直接进入' }}
        </button>
      </div>
      
      <p v-if="error" class="mt-4 text-sm text-red-500 text-center">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()
const authMode = ref('login')
const isLoading = ref(false)
const error = ref('')
const form = ref({ email: '', password: '', name: '' })

async function handleLogin() {
  isLoading.value = true
  error.value = ''
  try {
    await auth.login(form.value.email, form.value.password)
    router.push('/dashboard')
  } catch (err) {
    error.value = err.message || '登录失败'
  } finally {
    isLoading.value = false
  }
}

async function handleRegister() {
  isLoading.value = true
  error.value = ''
  try {
    await auth.register(form.value.email, form.value.password, form.value.name)
    router.push('/dashboard')
  } catch (err) {
    error.value = err.message || '注册失败'
  } finally {
    isLoading.value = false
  }
}

function enterGuestMode() {
  // Create a mock user object for guest mode
  const guestId = 'guest-' + Date.now()
  const guestUser = {
    id: guestId,
    email: 'guest@local',
    user_metadata: { name: form.value.name || '访客' },
    role: 'guest'
  }
  
  // Store guest flag in localStorage
  localStorage.setItem('guest_mode', 'true')
  localStorage.setItem('guest_user', JSON.stringify(guestUser))
  
  // Set user in auth store
  auth.user = guestUser
  
  router.push('/dashboard')
}
</script>
