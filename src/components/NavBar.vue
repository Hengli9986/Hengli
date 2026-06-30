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
/* ===== 设计系统 ===== */
:root {
  --nav-primary: #E85D4E;
  --nav-bg: #FFFFFF;
  --nav-border: #F0EEEA;
  --nav-text: #888888;
  --nav-text-active: #E85D4E;
  --nav-hover-bg: #FFF5F3;
  --nav-shadow: 0 1px 2px rgba(0,0,0,0.03), 0 1px 8px rgba(0,0,0,0.02);
  --nav-shadow-mobile: 0 4px 20px rgba(0,0,0,0.08);
}

.nav-bar {
  background: var(--nav-bg);
  border-bottom: 1px solid var(--nav-border);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  box-shadow: var(--nav-shadow);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* ===== Logo ===== */
.nav-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  flex-shrink: 0;
  transition: transform 0.2s;
}

.nav-logo:hover {
  transform: scale(1.02);
}

.nav-logo-icon {
  font-size: 22px;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.08));
}

.nav-logo-text {
  font-size: 17px;
  font-weight: 800;
  color: var(--nav-primary);
  letter-spacing: -0.5px;
  line-height: 1;
}

/* ===== Desktop Nav ===== */
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
  color: var(--nav-text);
  font-size: 13px;
  font-weight: 600;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  letter-spacing: -0.2px;
}

.nav-item:hover {
  background: var(--nav-hover-bg);
  color: var(--nav-primary);
}

.nav-item-active {
  color: var(--nav-text-active);
  background: var(--nav-hover-bg);
  font-weight: 700;
}

.nav-item-icon {
  font-size: 17px;
  line-height: 1;
  transition: transform 0.2s;
}

.nav-item:hover .nav-item-icon {
  transform: scale(1.15);
}

.nav-item-text {
  font-size: 13px;
}

.nav-indicator {
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 3px;
  background: var(--nav-primary);
  border-radius: 2px;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-item-active:hover .nav-indicator {
  width: 24px;
}

/* ===== Mobile ===== */
.nav-mobile-btn {
  display: none;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 6px 8px;
  color: var(--nav-text);
  border-radius: 8px;
  transition: all 0.2s;
  line-height: 1;
}

.nav-mobile-btn:hover {
  background: var(--nav-hover-bg);
  color: var(--nav-primary);
}

.nav-mobile-menu {
  display: none;
  position: absolute;
  top: 56px;
  left: 0;
  right: 0;
  background: var(--nav-bg);
  border-bottom: 1px solid var(--nav-border);
  padding: 8px 16px 16px;
  box-shadow: var(--nav-shadow-mobile);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.nav-mobile-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  text-decoration: none;
  color: var(--nav-text);
  font-size: 15px;
  font-weight: 600;
  border-radius: 10px;
  transition: all 0.2s;
  margin-bottom: 2px;
}

.nav-mobile-item:last-child {
  margin-bottom: 0;
}

.nav-mobile-item:hover {
  background: var(--nav-hover-bg);
  color: var(--nav-primary);
}

.nav-mobile-active {
  color: var(--nav-text-active);
  background: var(--nav-hover-bg);
  font-weight: 700;
}

.nav-mobile-icon {
  font-size: 20px;
  width: 32px;
  text-align: center;
  line-height: 1;
}

.nav-mobile-text {
  font-size: 14px;
}

/* ===== Responsive ===== */
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
    padding: 0 16px;
  }
}

@media (max-width: 400px) {
  .nav-logo-text {
    font-size: 15px;
  }
  
  .nav-logo-icon {
    font-size: 20px;
  }
  
  .nav-container {
    padding: 0 12px;
  }
}
</style>
