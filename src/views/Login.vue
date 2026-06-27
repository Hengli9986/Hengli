<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg">
      <h1 class="text-2xl font-bold text-center mb-2">geek抖音服务站</h1>
      <p class="text-gray-500 text-center mb-8">团队数据助手</p>
      
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
          <input
            v-model="form.email"
            type="email"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="your@email.com"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">密码</label>
          <input
            v-model="form.password"
            type="password"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="******"
          />
        </div>
        
        <div v-if="isRegister">
          <label class="block text-sm font-medium text-gray-700 mb-1">姓名</label>
          <input
            v-model="form.name"
            type="text"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="你的名字"
          />
        </div>
        
        <button type="submit" class="w-full btn-primary py-3 font-medium">
          {{ isRegister ? '注册' : '登录' }}
        </button>
      </form>
      
      <p class="text-center mt-4 text-sm text-gray-500">
        {{ isRegister ? '已有账号?' : '没有账号?' }}
        <button @click="isRegister = !isRegister" class="text-primary hover:underline">
          {{ isRegister ? '去登录' : '去注册' }}
        </button>
      </p>
      
      <p v-if="error" class="mt-4 text-sm text-error text-center">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()
const isRegister = ref(false)
const error = ref('')
const form = ref({ email: '', password: '', name: '' })

async function handleSubmit() {
  error.value = ''
  try {
    if (isRegister.value) {
      await auth.register(form.value.email, form.value.password, form.value.name)
    } else {
      await auth.login(form.value.email, form.value.password)
    }
    router.push('/dashboard')
  } catch (err) {
    error.value = err.message
  }
}
</script>
