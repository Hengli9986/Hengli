<template>
  <nav class="bg-white border-b border-gray-200 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex items-center justify-between h-14">
        <div class="flex items-center space-x-8">
          <router-link to="/dashboard" class="text-lg font-bold text-primary">
            geek抖音服务站
          </router-link>
          <div class="hidden md:flex space-x-1">
            <router-link to="/dashboard" class="nav-link px-3 py-2 rounded-lg" active-class="bg-blue-50 text-primary font-medium">
              首页
            </router-link>
            <router-link to="/import" class="nav-link px-3 py-2 rounded-lg" active-class="bg-blue-50 text-primary font-medium">
              数据导入
            </router-link>
            <router-link to="/live" class="nav-link px-3 py-2 rounded-lg" active-class="bg-blue-50 text-primary font-medium">
              直播分析
            </router-link>
            <router-link to="/video" class="nav-link px-3 py-2 rounded-lg" active-class="bg-blue-50 text-primary font-medium">
              短视频分析
            </router-link>
            <router-link to="/ai-analysis" class="nav-link px-3 py-2 rounded-lg" active-class="bg-blue-50 text-primary font-medium">
              AI 洞察
            </router-link>
            <router-link to="/tasks" class="nav-link px-3 py-2 rounded-lg" active-class="bg-blue-50 text-primary font-medium">
              任务
            </router-link>
            <router-link to="/ai-assistant" class="nav-link px-3 py-2 rounded-lg" active-class="bg-blue-50 text-primary font-medium">
              AI 内容助手
            </router-link>
          </div>
        </div>
        
        <div class="flex items-center space-x-4">
          <router-link to="/accounts" class="text-sm text-gray-500 hover:text-gray-700">
            [切换账号]
          </router-link>
          <span class="text-sm text-gray-400">{{ auth.user?.name }}</span>
          <button @click="logout" class="text-sm text-gray-400 hover:text-gray-600">
            退出
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.nav-link {
  color: #666;
  transition: all 0.2s;
  font-size: 0.875rem;
}
.nav-link:hover {
  color: #0071e3;
  background-color: #f8fafc;
}
</style>
