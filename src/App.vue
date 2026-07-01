<template>
  <div v-if="false" class="loading-screen">
    <div class="loading-content">
      <div class="loading-emoji">⏳</div>
      <div class="loading-text">加载中...</div>
    </div>
  </div>
  <div v-else class="app-wrapper">
    <NavBar />
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
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
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  background: linear-gradient(180deg, #F8F7F4 0%, #F5F0EB 100%);
  color: #2D2D2D;
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
}

/* Loading */
.loading-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #F8F7F4 0%, #F5F0EB 100%);
}

.loading-content {
  text-align: center;
}

.loading-emoji {
  font-size: 32px;
  margin-bottom: 8px;
  animation: float 2s ease-in-out infinite;
}

.loading-text {
  color: #999;
  font-size: 14px;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

/* App wrapper */
.app-wrapper {
  min-height: 100vh;
  background: linear-gradient(180deg, #F8F7F4 0%, #F5F0EB 50%, #F8F7F4 100%);
}

/* Main content */
.main-content {
  min-height: calc(100vh - 56px);
  padding-top: 56px;
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 20px;
}

/* ===== Page Transition ===== */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ===== Utility Classes ===== */
.text-gradient {
  background: linear-gradient(135deg, #E85D4E 0%, #FF8A7A 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.bg-gradient-warm {
  background: linear-gradient(135deg, #F8F7F4 0%, #FFFBF7 50%, #F5F0EB 100%);
}

.shadow-soft {
  box-shadow: 0 2px 8px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.02);
}

.shadow-card {
  box-shadow: 0 4px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.02);
}

.hover-lift {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-lift:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.1);
}
</style>
