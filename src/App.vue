<template>
  <div v-if="auth.loading" class="loading-screen">
    <div class="loading-content">
      <div class="loading-emoji">⏳</div>
      <div class="loading-text">加载中...</div>
    </div>
  </div>
  <div v-else class="app-wrapper">
    <NavBar v-if="auth.user" />
    <main class="main-content">
      <router-view />
    </main>
    <TaskFloat v-if="auth.user" />
  </div>
</template>

<script setup>
import { useAuthStore } from './stores/auth'
import NavBar from './components/NavBar.vue'
import TaskFloat from './components/TaskFloat.vue'

const auth = useAuthStore()
</script>

<style>
/* Global styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  background: #F8F7F4;
  color: #2D2D2D;
  -webkit-font-smoothing: antialiased;
}

.loading-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F8F7F4;
}

.loading-content {
  text-align: center;
}

.loading-emoji {
  font-size: 32px;
  margin-bottom: 8px;
}

.loading-text {
  color: #999;
  font-size: 14px;
}

.app-wrapper {
  min-height: 100vh;
  background: #F8F7F4;
}

.main-content {
  min-height: calc(100vh - 56px);
  padding-top: 56px;
}
</style>
