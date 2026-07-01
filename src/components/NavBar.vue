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
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0,0,0,0.06);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  transition: all 0.3s ease;
}

.nav-bar::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232,93,78,0.15), transparent);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Logo */
.nav-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.nav-logo:hover {
  transform: scale(1.02);
}

.nav-logo-icon {
  font-size: 22px;
  filter: drop-shadow(0 2px 4px rgba(232,93,78,0.2));
}

.nav-logo-text {
  font-size: 17px;
  font-weight: 800;
  background: linear-gradient(135deg, #E85D4E 0%, #FF8A7A 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
}

/* Desktop Nav */
.nav-desktop {
  display: flex;
  align-items: center;
  gap: 2px;
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 10px;
  text-decoration: none;
  color: #8E8E93;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
}

.nav-item:hover {
  background: rgba(232,93,78,0.08);
  color: #E85D4E;
}

.nav-item-active {
  background: linear-gradient(135deg, rgba(232,93,78,0.1) 0%, rgba(232,93,78,0.05) 100%);
  color: #E85D4E;
  font-weight: 600;
}

.nav-item-icon {
  font-size: 16px;
  transition: transform 0.2s ease;
}

.nav-item:hover .nav-item-icon {
  transform: scale(1.15);
}

.nav-item-text {
  font-size: 13px;
}

.nav-indicator {
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 3px;
  background: linear-gradient(90deg, #E85D4E, #FF8A7A);
  border-radius: 2px;
  animation: fadeInUp 0.3s ease;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateX(-50%) translateY(4px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

/* Mobile */
.nav-mobile-btn {
  display: none;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 6px;
  color: #666;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.nav-mobile-btn:hover {
  background: rgba(232,93,78,0.08);
  color: #E85D4E;
}

.nav-mobile-menu {
  display: none;
  position: absolute;
  top: 56px;
  left: 0;
  right: 0;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0,0,0,0.06);
  padding: 8px 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.08);
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

.nav-mobile-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  text-decoration: none;
  color: #666;
  font-size: 15px;
  border-bottom: 1px solid rgba(0,0,0,0.04);
  transition: all 0.2s ease;
}

.nav-mobile-item:last-child {
  border-bottom: none;
}

.nav-mobile-item:hover {
  color: #E85D4E;
  padding-left: 8px;
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
  
  .nav-container {
    justify-content: center;
  }
  
  .nav-logo {
    margin: 0 auto;
  }
  
  .nav-mobile-btn {
    position: absolute;
    right: 16px;
  }
}

@media (max-width: 400px) {
  .nav-logo-text {
    font-size: 15px;
  }
  
  .nav-container {
    padding: 0 12px;
  }
}
</style>
