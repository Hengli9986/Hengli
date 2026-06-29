<template>
  <nav class="nav-bar">
    <div class="nav-container">
      <!-- Logo -->
      <router-link to="/dashboard" class="nav-logo">
        <span class="nav-logo-icon">🎯</span>
        <span class="nav-logo-text">抖音数据站</span>
      </router-link>

      <!-- Desktop Navigation -->
      <div class="nav-desktop">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ 'nav-item-active': $route.path === item.path }"
        >
          <span class="nav-item-icon">{{ item.icon }}</span>
          <span class="nav-item-text">{{ item.label }}</span>
          <span v-if="$route.path === item.path" class="nav-indicator"></span>
        </router-link>
      </div>

      <!-- Mobile Menu Button -->
      <button class="nav-mobile-btn" @click="mobileOpen = !mobileOpen">
        <span class="nav-mobile-icon">{{ mobileOpen ? '✕' : '☰' }}</span>
      </button>
    </div>

    <!-- Mobile Menu -->
    <div v-if="mobileOpen" class="nav-mobile-menu">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="nav-mobile-item"
        :class="{ 'nav-mobile-active': $route.path === item.path }"
        @click="mobileOpen = false"
      >
        <span class="nav-mobile-icon">{{ item.icon }}</span>
        <span class="nav-mobile-text">{{ item.label }}</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const mobileOpen = ref(false)

const navItems = [
  { path: '/dashboard', label: '数据仪表盘', icon: '🏠' },
  { path: '/import', label: '数据导入', icon: '📥' },
  { path: '/live', label: '直播分析', icon: '📺' },
  { path: '/video', label: '短视频分析', icon: '🎬' },
  { path: '/ai-assistant', label: '文案话题优化', icon: '✍️' },
  { path: '/tasks', label: '任务', icon: '📋' },
  { path: '/ai-analysis', label: 'AI洞察', icon: '🤖' },
]
</script>

<style scoped>
.nav-bar {
  background: #ffffff;
  border-bottom: 1px solid #eee;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Logo */
.nav-logo {
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  flex-shrink: 0;
}

.nav-logo-icon {
  font-size: 20px;
}

.nav-logo-text {
  font-size: 16px;
  font-weight: 700;
  color: #E85D4E;
  letter-spacing: -0.5px;
}

/* Desktop Nav */
.nav-desktop {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 14px;
  border-radius: 8px;
  text-decoration: none;
  color: #666;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.nav-item:hover {
  background: #FFF5F3;
  color: #E85D4E;
}

.nav-item-active {
  color: #E85D4E;
  font-weight: 600;
}

.nav-item-icon {
  font-size: 16px;
}

.nav-item-text {
  font-size: 13px;
}

.nav-indicator {
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background: #E85D4E;
  border-radius: 2px;
}

/* Mobile */
.nav-mobile-btn {
  display: none;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  color: #666;
}

.nav-mobile-menu {
  display: none;
  position: absolute;
  top: 56px;
  left: 0;
  right: 0;
  background: #fff;
  border-bottom: 1px solid #eee;
  padding: 8px 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.nav-mobile-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
  text-decoration: none;
  color: #666;
  font-size: 15px;
  border-bottom: 1px solid #f5f5f5;
}

.nav-mobile-item:last-child {
  border-bottom: none;
}

.nav-mobile-active {
  color: #E85D4E;
  font-weight: 600;
}

.nav-mobile-icon {
  font-size: 18px;
  width: 28px;
  text-align: center;
}

/* Responsive */
@media (max-width: 900px) {
  .nav-desktop {
    display: none;
  }
  
  .nav-mobile-btn {
    display: block;
  }
  
  .nav-mobile-menu {
    display: block;
  }
}

@media (max-width: 400px) {
  .nav-logo-text {
    font-size: 14px;
  }
}
</style>
