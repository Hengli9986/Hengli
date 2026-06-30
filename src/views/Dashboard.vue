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
        <router-link to="/accounts" class="account-btn">
          切换账号 →
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'

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
/* ===== 设计系统 ===== */
:root {
  --bg-warm: #F8F7F4;
  --bg-card: #FFFFFF;
  --primary: #E85D4E;
  --primary-light: #FFF5F3;
  --text-main: #2D2D2D;
  --text-secondary: #888888;
  --text-tertiary: #AAAAAA;
  --border: #F0EEEA;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.03), 0 1px 8px rgba(0,0,0,0.02);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.05), 0 1px 4px rgba(0,0,0,0.03);
  --shadow-hover: 0 8px 24px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04);
  --radius-sm: 12px;
  --radius-md: 16px;
  --radius-lg: 20px;
}

/* ===== 页面容器 ===== */
.dashboard {
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 24px 100px;
  background: var(--bg-warm);
  min-height: calc(100vh - 56px);
}

/* ===== 页面标题 ===== */
.dashboard-header {
  margin-bottom: 28px;
  padding: 0 4px;
}

.dashboard-title {
  font-size: 28px;
  font-weight: 800;
  color: var(--text-main);
  margin: 0 0 6px;
  letter-spacing: -0.8px;
  line-height: 1.2;
}

.dashboard-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
  font-weight: 400;
}

/* ===== 核心指标卡片 ===== */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 40px;
}

.metric-card {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  padding: 24px 20px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: transparent;
  transition: background 0.3s;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
}

.metric-card:hover::before {
  background: var(--primary);
}

.metric-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
  transition: transform 0.3s;
}

.metric-card:hover .metric-icon {
  transform: scale(1.1);
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
  font-size: 26px;
  font-weight: 800;
  color: var(--text-main);
  line-height: 1.15;
  margin-bottom: 4px;
  letter-spacing: -0.5px;
  font-variant-numeric: tabular-nums;
}

.metric-label {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  font-weight: 500;
}

.metric-trend {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  background: transparent;
  transition: background 0.2s;
}

.trend-up {
  color: #00B894;
  background: #E8F8F5;
}

.trend-down {
  color: #E85D4E;
  background: #FFF5F3;
}

/* ===== 区块标题 ===== */
.section {
  margin-bottom: 36px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-main);
  margin: 0 0 16px;
  padding: 0 4px;
  letter-spacing: -0.3px;
}

/* ===== 快捷操作 ===== */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.action-card {
  background: var(--bg-card);
  border-radius: var(--radius-sm);
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 600;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.action-card::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  width: 40%;
  height: 3px;
  background: var(--primary);
  border-radius: 3px 3px 0 0;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  color: var(--primary);
  border-color: #F5D0CB;
}

.action-card:hover::after {
  transform: translateX(-50%) scaleX(1);
}

.action-icon {
  font-size: 32px;
  transition: transform 0.3s;
}

.action-card:hover .action-icon {
  transform: scale(1.15);
}

.action-text {
  font-size: 13px;
  font-weight: 600;
}

/* ===== 历史记录 ===== */
.history-list {
  background: var(--bg-card);
  border-radius: var(--radius-sm);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border);
}

.history-item {
  display: flex;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid #F8F7F4;
  font-size: 14px;
  transition: background 0.15s;
}

.history-item:hover {
  background: #FDFCFB;
}

.history-item:last-child {
  border-bottom: none;
}

.history-type {
  flex: 1;
  color: var(--text-main);
  font-weight: 600;
}

.history-date {
  color: var(--text-tertiary);
  font-size: 13px;
  margin-right: 16px;
  font-weight: 500;
}

.history-count {
  color: var(--primary);
  font-weight: 700;
  font-size: 13px;
  padding: 2px 10px;
  background: var(--primary-light);
  border-radius: 6px;
}

/* ===== 账号管理（底部） ===== */
.account-section {
  margin-top: 60px;
  padding-top: 32px;
}

.account-divider {
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--border), transparent);
  margin-bottom: 24px;
  border-radius: 1px;
}

.account-info {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px;
  background: var(--bg-card);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border);
  transition: all 0.3s;
}

.account-info:hover {
  box-shadow: var(--shadow-md);
  border-color: #E8E4DF;
}

.account-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
  transition: transform 0.3s;
}

.account-info:hover .account-avatar {
  transform: scale(1.05);
}

.account-details {
  flex: 1;
}

.account-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 2px;
}

.account-role {
  font-size: 13px;
  color: var(--text-tertiary);
  font-weight: 500;
}

.account-btn {
  padding: 10px 18px;
  background: var(--bg-warm);
  border-radius: 10px;
  font-size: 13px;
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--border);
  white-space: nowrap;
}

.account-btn:hover {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(232, 93, 78, 0.25);
}

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .dashboard {
    padding: 24px 16px 80px;
  }
  
  .dashboard-title {
    font-size: 24px;
  }
  
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .metric-card {
    padding: 18px 14px;
  }
  
  .metric-value {
    font-size: 22px;
  }
  
  .metric-icon {
    width: 38px;
    height: 38px;
    font-size: 18px;
  }
  
  .actions-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  
  .action-card {
    padding: 16px 10px;
  }
  
  .action-icon {
    font-size: 26px;
  }
  
  .action-text {
    font-size: 12px;
  }
  
  .account-section {
    margin-top: 48px;
  }
}

@media (max-width: 400px) {
  .dashboard {
    padding: 20px 12px 80px;
  }
  
  .dashboard-title {
    font-size: 22px;
  }
  
  .metrics-grid {
    gap: 10px;
  }
  
  .metric-card {
    padding: 14px 12px;
    gap: 10px;
  }
  
  .metric-icon {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }
  
  .metric-value {
    font-size: 18px;
  }
  
  .metric-label {
    font-size: 11px;
  }
  
  .metric-trend {
    font-size: 11px;
    padding: 2px 6px;
  }
  
  .actions-grid {
    gap: 8px;
  }
  
  .action-card {
    padding: 12px 8px;
    gap: 6px;
  }
  
  .action-icon {
    font-size: 22px;
  }
  
  .action-text {
    font-size: 11px;
  }
  
  .section-title {
    font-size: 16px;
  }
  
  .account-info {
    padding: 14px;
    gap: 10px;
  }
  
  .account-avatar {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }
  
  .account-btn {
    padding: 8px 12px;
    font-size: 12px;
  }
}
</style>
