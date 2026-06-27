<template>
  <nav class="bg-white border-b border-gray-200 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex items-center justify-between h-14">
        <div class="flex items-center space-x-8">
          <router-link to="/dashboard" class="text-lg font-bold" style="color: #0071e3;">
            geek抖音服务站
          </router-link>
          <div class="hidden md:flex space-x-4">
            <router-link to="/dashboard" class="nav-link" active-class="font-medium" style="color: #0071e3;">
              首页
            </router-link>
            <router-link to="/import" class="nav-link">
              数据导入
            </router-link>
            <router-link to="/live" class="nav-link">
              直播分析
            </router-link>
            <router-link to="/video" class="nav-link">
              短视频分析
            </router-link>
            <router-link to="/ai-assistant" class="nav-link">
              AI内容助手
            </router-link>
          </div>
        </div>
        
        <div class="flex items-center space-x-4">
          <router-link to="/accounts" class="text-sm" style="color: #666;">
            [切换账号]
          </router-link>
          <span class="text-sm" style="color: #999;">{{ auth.user?.name }}</span>
          <button @click="logout" class="text-sm" style="color: #999;">
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
}
</style>
