<template>
  <div v-if="auth.loading" class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <div class="text-2xl mb-2">⏳</div>
      <div class="text-gray-500">加载中...</div>
    </div>
  </div>
  <div v-else class="min-h-screen bg-gray-50">
    <NavBar v-if="auth.user" />
    <router-view />
    <TaskFloat v-if="auth.user" />
    
    <!-- Mobile bottom navigation -->
    <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
      <div class="flex justify-around py-2">
        <router-link to="/dashboard" class="flex flex-col items-center text-xs" active-class="text-primary">
          <span class="text-xl">🏠</span>
          <span>首页</span>
        </router-link>
        <router-link to="/import" class="flex flex-col items-center text-xs" active-class="text-primary">
          <span class="text-xl">📁</span>
          <span>导入</span>
        </router-link>
        <router-link to="/live" class="flex flex-col items-center text-xs" active-class="text-primary">
          <span class="text-xl">📺</span>
          <span>直播</span>
        </router-link>
        <router-link to="/video" class="flex flex-col items-center text-xs" active-class="text-primary">
          <span class="text-xl">🎬</span>
          <span>视频</span>
        </router-link>
        <router-link to="/ai-assistant" class="flex flex-col items-center text-xs" active-class="text-primary">
          <span class="text-xl">✨</span>
          <span>AI助手</span>
        </router-link>
      </div>
    </nav>
    
    <!-- Add padding for mobile bottom nav -->
    <div class="pb-16 md:pb-0"></div>
  </div>
</template>

<script setup>
import { useAuthStore } from './stores/auth'
import NavBar from './components/NavBar.vue'
import TaskFloat from './components/TaskFloat.vue'

const auth = useAuthStore()
</script>
