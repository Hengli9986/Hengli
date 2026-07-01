<template>
  <div class="dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <h1 class="dashboard-title">数据仪表盘</h1>
      <p class="dashboard-subtitle">实时追踪你的抖音运营数据</p>
    </div>

    <!-- 4 Core Metrics -->
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-icon metric-icon-live">📺</div>
        <div class="metric-content">
          <div class="metric-value">{{ stats.liveCount }}</div>
          <div class="metric-label">直播场次</div>
          <div class="metric-trend" :class="stats.liveTrend >= 0 ? 'trend-up' : 'trend-down'">
            {{ stats.liveTrend >= 0 ? '↑' : '↓' }} {{ Math.abs(stats.liveTrend) }}%
          </div>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon metric-icon-video">🎬</div>
        <div class="metric-content">
          <div class="metric-value">{{ stats.videoCount }}</div>
          <div class="metric-label">视频数量</div>
          <div class="metric-trend" :class="stats.videoTrend >= 0 ? 'trend-up' : 'trend-down'">
            {{ stats.videoTrend >= 0 ? '↑' : '↓' }} {{ Math.abs(stats.videoTrend) }}%
          </div>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon metric-icon-gmv">💰</div>
        <div class="metric-content">
          <div class="metric-value">¥{{ formatNumber(stats.gmv) }}</div>
          <div class="metric-label">总 GMV</div>
          <div class="metric-trend" :class="stats.gmvTrend >= 0 ? 'trend-up' : 'trend-down'">
            {{ stats.gmvTrend >= 0 ? '↑' : '↓' }} {{ Math.abs(stats.gmvTrend) }}%
          </div>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon metric-icon-play">▶️</div>
        <div class="metric-content">
          <div class="metric-value">{{ formatNumber(stats.plays) }}</div>
          <div class="metric-label">总播放</div>
          <div class="metric-trend" :class="stats.playTrend >= 0 ? 'trend-up' : 'trend-down'">
            {{ stats.playTrend >= 0 ? '↑' : '↓' }} {{ Math.abs(stats.playTrend) }}%
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="section">
      <h2 class="section-title">快捷操作</h2>
      <div class="actions-grid">
        <router-link to="/import" class="action-card">
          <span class="action-icon">📥</span>
          <span class="action-text">导入数据</span>
        </router-link>
        <router-link to="/live" class="action-card">
          <span class="action-icon">📺</span>
          <span class="action-text">直播分析</span>
        </router-link>
        <router-link to="/video" class="action-card">
          <span class="action-icon">🎬</span>
          <span class="action-text">短视频分析</span>
        </router-link>
        <!-- 新增3个 -->
        <router-link to="/ai-assistant" class="action-card">
          <span class="action-icon">✏️</span>
          <span class="action-text">文案话题优化</span>
        </router-link>
        <router-link to="/tasks" class="action-card">
          <span class="action-icon">✅</span>
          <span class="action-text">任务</span>
        </router-link>
        <router-link to="/ai-analysis" class="action-card">
          <span class="action-icon">💡</span>
          <span class="action-text">AI洞察</span>
        </router-link>
      </div>
    </div>

    <!-- Recent Import History -->
    <div class="section" v-if="importHistory.length > 0">
      <h2 class="section-title">最近导入</h2>
      <div class="history-list">
        <div v-for="(item, i) in importHistory.slice(0, 5)" :key="i" class="history-item">
          <span class="history-type">{{ item.type }}</span>
          <span class="history-date">{{ item.date }}</span>
          <span class="history-count">{{ item.count }} 条</span>
        </div>
      </div>
    </div>

    <!-- Account Management - Bottom -->
    <div class="account-section">
      <div class="account-divider"></div>
      <div class="account-info">
        <span class="account-avatar">👤</span>
        <div class="account-details">
          <div class="account-name">{{ auth.user?.user_metadata?.name || auth.user?.name || '访客' }}</div>
          <div class="account-role">{{ auth.user?.id === 'guest' ? '免登录模式' : '已登录' }}</div>
        </div>
        <button class="account-btn" @click="handleLogout">
          切换账号 →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
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

function formatNumber(n) {
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return n.toString()
}

function handleLogout() {
  localStorage.removeItem('guest_mode')
  localStorage.removeItem('guest_user')
  localStorage.removeItem('guest_name')
  auth.logout()
  router.push('/login')
}

onMounted(() => {
  // Load from localStorage or demo data
  const saved = localStorage.getItem('import_history')
  if (saved) {
    importHistory.value = JSON.parse(saved)
  }
  
  // Demo stats (replace with real data)
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
  background: #F8F7F4;
  min-height: calc(100vh - 56px);
}

/* Header */
.dashboard-header {
  margin-bottom: 24px;
}

.dashboard-title {
  font-size: 24px;
  font-weight: 700;
  color: #2D2D2D;
  margin: 0 0 4px;
  letter-spacing: -0.5px;
}

.dashboard-subtitle {
  font-size: 14px;
  color: #999;
  margin: 0;
}

/* Metrics Grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 32px;
}

.metric-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  transition: transform 0.2s, box-shadow 0.2s;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.metric-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.metric-icon-live { background: #FFF5F3; }
.metric-icon-video { background: #F0F9FF; }
.metric-icon-gmv { background: #FFF9E6; }
.metric-icon-play { background: #F0FFF4; }

.metric-content {
  flex: 1;
  min-width: 0;
}

.metric-value {
  font-size: 22px;
  font-weight: 700;
  color: #2D2D2D;
  line-height: 1.2;
  margin-bottom: 2px;
}

.metric-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.metric-trend {
  font-size: 12px;
  font-weight: 600;
}

.trend-up { color: #00C9A7; }
.trend-down { color: #E85D4E; }

/* Section */
.section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #2D2D2D;
  margin: 0 0 12px;
}

/* Actions */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);  /* 3列，6个按钮就是2行 */
  gap: 12px;
}

.action-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: #666;
  font-size: 13px;
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  transition: all 0.2s;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  color: #E85D4E;
}

.action-icon {
  font-size: 28px;
}

.action-text {
  font-size: 13px;
}

/* History */
.history-list {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.history-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f5f5f5;
  font-size: 13px;
}

.history-item:last-child {
  border-bottom: none;
}

.history-type {
  flex: 1;
  color: #2D2D2D;
  font-weight: 500;
}

.history-date {
  color: #999;
  font-size: 12px;
  margin-right: 12px;
}

.history-count {
  color: #E85D4E;
  font-weight: 600;
  font-size: 12px;
}

/* Account Section - Bottom */
.account-section {
  margin-top: 60px;  /* 原来是40px，改成60px，往下挪 */
  padding-top: 24px;
}

.account-divider {
  height: 1px;
  background: #eee;
  margin-bottom: 20px;
}

.account-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.account-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #FFF5F3;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.account-details {
  flex: 1;
}

.account-name {
  font-size: 14px;
  font-weight: 600;
  color: #2D2D2D;
}

.account-role {
  font-size: 12px;
  color: #999;
}

.account-btn {
  padding: 8px 16px;
  background: #f5f5f5;
  border-radius: 8px;
  font-size: 13px;
  color: #666;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
}

.account-btn:hover {
  background: #E85D4E;
  color: #fff;
}

/* Responsive */
@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  
  .metric-card {
    padding: 16px 12px;
  }
  
  .metric-value {
    font-size: 18px;
  }
  
  .actions-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
  
  .action-card {
    padding: 12px 8px;
  }
  
  .action-icon {
    font-size: 24px;
  }
  
  .action-text {
    font-size: 12px;
  }
}

@media (max-width: 400px) {
  .dashboard {
    padding: 16px 12px 80px;
  }
  
  .dashboard-title {
    font-size: 20px;
  }
  
  .metric-icon {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }
  
  .metric-value {
    font-size: 16px;
  }
  
  .metric-label {
    font-size: 11px;
  }
}
</style>
