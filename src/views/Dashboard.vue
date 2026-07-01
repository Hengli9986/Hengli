<template>
  <div class="dashboard">
    <!-- Header with gradient text -->
    <div class="dashboard-header animate-fade-in-up">
      <div class="header-greeting">
        <h1 class="dashboard-title">
          <span class="gradient-text">数据仪表盘</span>
        </h1>
        <span class="live-badge" v-if="stats.liveCount > 0">
          <span class="live-dot"></span>
          实时追踪中
        </span>
      </div>
      <p class="dashboard-subtitle">实时监控你的抖音运营数据</p>
    </div>

    <!-- 4 Core Metrics -->
    <div class="metrics-grid">
      <div 
        v-for="(metric, i) in metrics" 
        :key="metric.key"
        class="metric-card"
        :class="[`animate-fade-in-up stagger-${i+1}`]"
      >
        <div class="metric-icon-wrapper" :class="`icon-bg-${metric.key}`">
          <svg class="metric-svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <template v-if="metric.key === 'live'">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </template>
            <template v-else-if="metric.key === 'video'">
              <polygon points="23 7 16 12 23 17 23 7"/>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </template>
            <template v-else-if="metric.key === 'gmv'">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </template>
            <template v-else-if="metric.key === 'play'">
              <circle cx="12" cy="12" r="10"/>
              <polygon points="10 8 16 12 10 16 10 8"/>
            </template>
          </svg>
        </div>
        <div class="metric-content">
          <div class="metric-value">{{ metric.value }}</div>
          <div class="metric-label">{{ metric.label }}</div>
          <div class="metric-trend" :class="metric.trend >= 0 ? 'trend-up' : 'trend-down'">
            <svg class="trend-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline v-if="metric.trend >= 0" points="18 15 12 9 6 15"/>
              <polyline v-else points="6 9 12 15 18 9"/>
            </svg>
            {{ Math.abs(metric.trend) }}%
          </div>
        </div>
        <div class="metric-glow" :class="`glow-${metric.key}`"></div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="section animate-fade-in-up stagger-3">
      <div class="section-header">
        <h2 class="section-title">快捷操作</h2>
        <span class="section-count">{{ actions.length }} 个功能</span>
      </div>
      <div class="actions-grid">
        <router-link 
          v-for="(action, i) in actions" 
          :key="action.path"
          :to="action.path" 
          class="action-card"
          :class="`animate-fade-in-up stagger-${i+4}`"
        >
          <div class="action-icon-wrapper" :class="`icon-bg-${action.key}`">
            <svg class="action-svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" v-html="action.icon"></svg>
          </div>
          <span class="action-text">{{ action.label }}</span>
          <svg class="action-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </router-link>
      </div>
    </div>

    <!-- Recent Import History -->
    <div class="section animate-fade-in-up stagger-5" v-if="importHistory.length > 0">
      <div class="section-header">
        <h2 class="section-title">最近导入</h2>
        <router-link to="/import" class="section-link">
          查看全部
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </router-link>
      </div>
      <div class="history-list">
        <div 
          v-for="(item, i) in importHistory.slice(0, 5)" 
          :key="i" 
          class="history-item"
          :class="{ 'history-item-highlight': i === 0 }"
        >
          <div class="history-badge" :class="`badge-${item.type?.toLowerCase?.() || 'default'}`">
            {{ item.type?.charAt(0) || '?' }}
          </div>
          <span class="history-type">{{ item.type }}</span>
          <span class="history-date">{{ item.date }}</span>
          <span class="history-count">
            <span class="count-number">{{ item.count }}</span>
            <span class="count-unit">条</span>
          </span>
        </div>
      </div>
    </div>

    <!-- Account Management -->
    <div class="account-section animate-fade-in-up stagger-6">
      <div class="account-divider"></div>
      <div class="account-info">
        <div class="account-avatar-wrapper">
          <span class="account-avatar">{{ (auth.user?.user_metadata?.name || auth.user?.name || '访')?.charAt(0) }}</span>
          <div class="account-status" v-if="auth.user?.id !== 'guest'"></div>
        </div>
        <div class="account-details">
          <div class="account-name">{{ auth.user?.user_metadata?.name || auth.user?.name || '访客' }}</div>
          <div class="account-role">
            <span class="role-badge" :class="auth.user?.id === 'guest' ? 'role-guest' : 'role-user'">
              {{ auth.user?.id === 'guest' ? '免登录模式' : '已登录' }}
            </span>
          </div>
        </div>
        <button class="account-btn" @click="handleSwitchAccount">
          切换账号
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const stats = ref({
  liveCount: 0,
  videoCount: 0,
  gmv: 0,
  plays: 0,
  liveTrend: 0,
  videoTrend: 0,
  gmvTrend: 0,
  playTrend: 0
})

const importHistory = ref([])

const metrics = computed(() => [
  { key: 'live', label: '直播场次', value: stats.value.liveCount, trend: stats.value.liveTrend },
  { key: 'video', label: '视频数量', value: stats.value.videoCount, trend: stats.value.videoTrend },
  { key: 'gmv', label: '总 GMV', value: '¥' + formatNumber(stats.value.gmv), trend: stats.value.gmvTrend },
  { key: 'play', label: '总播放', value: formatNumber(stats.value.plays), trend: stats.value.playTrend },
])

const actions = [
  { key: 'import', path: '/import', label: '导入数据', icon: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>' },
  { key: 'live', path: '/live', label: '直播分析', icon: '<rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>' },
  { key: 'video', path: '/video', label: '短视频分析', icon: '<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>' },
  { key: 'ai', path: '/ai-assistant', label: '文案话题优化', icon: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>' },
  { key: 'task', path: '/tasks', label: '任务', icon: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>' },
  { key: 'ai', path: '/ai-analysis', label: 'AI洞察', icon: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>' },
])

function formatNumber(n) {
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return n.toString()
}

async function handleSwitchAccount() {
  // 清除访客模式数据
  localStorage.removeItem('guest_mode')
  localStorage.removeItem('guest_user')
  localStorage.removeItem('guest_name')
  
  // 调用 Supabase 登出
  try {
    await auth.logout()
  } catch (err) {
    // 忽略登出错误，继续跳转
    console.log('Logout error:', err)
  }
  
  // 清空 auth store 中的用户
  auth.user = null
  
  // 跳转到登录页
  router.push('/login')
}

onMounted(() => {
  const saved = localStorage.getItem('import_history')
  if (saved) {
    importHistory.value = JSON.parse(saved)
  }
  
  const demoData = JSON.parse(localStorage.getItem('dashboard_stats') || '{}')
  stats.value = {
    liveCount: demoData.liveCount || 0,
    videoCount: demoData.videoCount || 0,
    gmv: demoData.gmv || 0,
    plays: demoData.plays || 0,
    liveTrend: demoData.liveTrend || 0,
    videoTrend: demoData.videoTrend || 0,
    gmvTrend: demoData.gmvTrend || 0,
    playTrend: demoData.playTrend || 0
  }
})
</script>

<style scoped>
.dashboard {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px 16px 80px;
  min-height: calc(100vh - 56px);
}

/* Animations */
.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out forwards;
  opacity: 0;
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
.stagger-1 { animation-delay: 0.05s; }
.stagger-2 { animation-delay: 0.1s; }
.stagger-3 { animation-delay: 0.15s; }
.stagger-4 { animation-delay: 0.2s; }
.stagger-5 { animation-delay: 0.25s; }
.stagger-6 { animation-delay: 0.3s; }

/* Header */
.dashboard-header {
  margin-bottom: 28px;
}

.header-greeting {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.dashboard-title {
  font-size: 26px;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.5px;
}

.gradient-text {
  background: linear-gradient(135deg, #E85D4E 0%, #FF8A7A 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.live-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: linear-gradient(135deg, #E6FAF5 0%, #D1F5E9 100%);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: #00C9A7;
}

.live-dot {
  width: 7px;
  height: 7px;
  background: #00C9A7;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.85); }
}

.dashboard-subtitle {
  font-size: 14px;
  color: #9CA3AF;
  margin: 0;
  font-weight: 400;
}

/* Metrics Grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 36px;
}

.metric-card {
  background: linear-gradient(135deg, #ffffff 0%, #FFFBF7 100%);
  border-radius: 16px;
  padding: 20px 16px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.02);
  border: 1px solid rgba(255,255,255,0.8);
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.metric-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.1), 0 0 0 1px rgba(232,93,78,0.08);
}

.metric-icon-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.metric-svg {
  width: 22px;
  height: 22px;
}

.metric-content {
  flex: 1;
  min-width: 0;
}

.metric-value {
  font-size: 22px;
  font-weight: 800;
  color: #1F2937;
  line-height: 1.2;
  margin-bottom: 3px;
  letter-spacing: -0.5px;
}

.metric-label {
  font-size: 12px;
  color: #9CA3AF;
  margin-bottom: 6px;
  font-weight: 500;
}

.metric-trend {
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 8px;
  border-radius: 6px;
}

.trend-up {
  color: #00C9A7;
  background: #E6FAF5;
}

.trend-down {
  color: #E85D4E;
  background: #FFF5F3;
}

.trend-icon {
  width: 14px;
  height: 14px;
}

/* Glow effect on hover */
.metric-glow {
  position: absolute;
  top: -20px;
  right: -20px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s;
  filter: blur(20px);
}

.metric-card:hover .metric-glow {
  opacity: 0.15;
}

.glow-live { background: #E85D4E; }
.glow-video { background: #4A90D9; }
.glow-gmv { background: #FFB800; }
.glow-play { background: #00C9A7; }

/* Section */
.section {
  margin-bottom: 36px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-title {
  font-size: 17px;
  font-weight: 700;
  color: #1F2937;
  margin: 0;
}

.section-count {
  font-size: 12px;
  color: #9CA3AF;
  font-weight: 500;
  background: #F3F4F6;
  padding: 3px 10px;
  border-radius: 10px;
}

.section-link {
  font-size: 13px;
  color: #E85D4E;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: gap 0.2s;
}

.section-link:hover {
  gap: 8px;
}

.section-link svg {
  width: 14px;
  height: 14px;
}

/* Actions */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.action-card {
  background: linear-gradient(135deg, #ffffff 0%, #FFFBF7 100%);
  border-radius: 14px;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: #4B5563;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.02);
  border: 1px solid rgba(255,255,255,0.8);
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.1);
  color: #E85D4E;
}

.action-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #E85D4E, #FF8A7A);
  opacity: 0;
  transition: opacity 0.3s;
}

.action-card:hover::before {
  opacity: 1;
}

.action-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transition: transform 0.3s ease;
}

.action-card:hover .action-icon-wrapper {
  transform: scale(1.08);
}

.action-svg {
  width: 24px;
  height: 24px;
}

.action-text {
  font-size: 13px;
  font-weight: 600;
}

.action-arrow {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 16px;
  height: 16px;
  opacity: 0;
  transform: translateX(-4px);
  transition: all 0.3s ease;
  color: #E85D4E;
}

.action-card:hover .action-arrow {
  opacity: 1;
  transform: translateX(0);
}

/* History */
.history-list {
  background: linear-gradient(135deg, #ffffff 0%, #FFFBF7 100%);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.02);
  border: 1px solid rgba(255,255,255,0.8);
}

.history-item {
  display: flex;
  align-items: center;
  padding: 13px 16px;
  border-bottom: 1px solid rgba(0,0,0,0.04);
  transition: background 0.2s ease;
}

.history-item:hover {
  background: rgba(232,93,78,0.02);
}

.history-item:last-child {
  border-bottom: none;
}

.history-item-highlight {
  background: linear-gradient(90deg, rgba(232,93,78,0.03) 0%, transparent 100%);
}

.history-badge {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: white;
  margin-right: 12px;
  flex-shrink: 0;
}

.badge-live { background: linear-gradient(135deg, #E85D4E, #FF8A7A); }
.badge-video { background: linear-gradient(135deg, #4A90D9, #7AB8E8); }
.badge-import { background: linear-gradient(135deg, #06B6D4, #22D3EE); }
.badge-default { background: linear-gradient(135deg, #8B5CF6, #A78BFA); }

.history-type {
  flex: 1;
  color: #1F2937;
  font-weight: 600;
  font-size: 13px;
}

.history-date {
  color: #9CA3AF;
  font-size: 12px;
  margin-right: 14px;
  font-weight: 500;
}

.history-count {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.count-number {
  color: #E85D4E;
  font-weight: 800;
  font-size: 15px;
}

.count-unit {
  color: #9CA3AF;
  font-size: 11px;
  font-weight: 500;
}

/* Account Section */
.account-section {
  margin-top: 48px;
  padding-top: 24px;
}

.account-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, #E5E7EB, transparent);
  margin-bottom: 24px;
}

.account-info {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  background: linear-gradient(135deg, #ffffff 0%, #FFFBF7 100%);
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.02);
  border: 1px solid rgba(255,255,255,0.8);
  transition: all 0.3s ease;
}

.account-info:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
}

.account-avatar-wrapper {
  position: relative;
}

.account-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #E85D4E 0%, #FF8A7A 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  color: white;
  box-shadow: 0 4px 12px rgba(232,93,78,0.25);
}

.account-status {
  position: absolute;
  bottom: 1px;
  right: 1px;
  width: 12px;
  height: 12px;
  background: #00C9A7;
  border-radius: 50%;
  border: 2px solid white;
}

.account-details {
  flex: 1;
}

.account-name {
  font-size: 14px;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 3px;
}

.account-role {
  font-size: 12px;
}

.role-badge {
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 11px;
}

.role-user {
  background: #E6FAF5;
  color: #00C9A7;
}

.role-guest {
  background: #FFF8E6;
  color: #FFB800;
}

.account-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%);
  border-radius: 10px;
  font-size: 13px;
  color: #4B5563;
  font-weight: 600;
  transition: all 0.25s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  cursor: pointer;
}

.account-btn:hover {
  background: linear-gradient(135deg, #E85D4E 0%, #D45040 100%);
  color: #fff;
  box-shadow: 0 4px 12px rgba(232,93,78,0.25);
}

.account-btn svg {
  width: 14px;
  height: 14px;
}

/* Responsive */
@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .metric-card {
    padding: 16px 12px;
  }
  
  .metric-value {
    font-size: 18px;
  }
  
  .metric-icon-wrapper {
    width: 38px;
    height: 38px;
  }
  
  .metric-svg {
    width: 18px;
    height: 18px;
  }
  
  .actions-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  
  .action-card {
    padding: 16px 10px;
  }
  
  .action-icon-wrapper {
    width: 42px;
    height: 42px;
  }
  
  .action-svg {
    width: 20px;
    height: 20px;
  }
  
  .action-text {
    font-size: 12px;
  }
  
  .dashboard-title {
    font-size: 22px;
  }
}

@media (max-width: 400px) {
  .dashboard {
    padding: 16px 12px 80px;
  }
  
  .metrics-grid {
    gap: 8px;
  }
  
  .metric-card {
    padding: 14px 10px;
    gap: 10px;
  }
  
  .metric-icon-wrapper {
    width: 34px;
    height: 34px;
    border-radius: 10px;
  }
  
  .metric-value {
    font-size: 16px;
  }
  
  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
}
</style>
