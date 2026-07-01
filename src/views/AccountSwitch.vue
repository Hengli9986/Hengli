<template>
  <div class="account-switch">
    <div class="bg-decoration">
      <div class="bg-orb orb-1"></div>
      <div class="bg-orb orb-2"></div>
      <div class="bg-grid"></div>
    </div>

    <div class="switch-container">
      <div class="brand-section">
        <div class="brand-logo">
          <span class="brand-icon">🎯</span>
        </div>
        <h1 class="brand-title">
          <span class="gradient-text">抖音数据站</span>
        </h1>
        <p class="brand-subtitle">选择你的登录方式</p>
      </div>

      <div class="current-card" v-if="currentUser">
        <div class="current-label">当前账号</div>
        <div class="current-user">
          <div class="current-avatar">{{ currentUser.charAt(0) }}</div>
          <div class="current-info">
            <div class="current-name">{{ currentUser }}</div>
            <div class="current-role">
              <span class="role-badge" :class="isGuest ? 'role-guest' : 'role-user'">
                {{ isGuest ? '免登录模式' : '已登录' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="options-grid">
        <router-link to="/login" class="option-card option-login">
          <div class="option-icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
          </div>
          <div class="option-content">
            <h3 class="option-title">登录其他账号</h3>
            <p class="option-desc">使用已有邮箱账号登录，数据保存在云端</p>
          </div>
          <svg class="option-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </router-link>

        <router-link to="/login" class="option-card option-register">
          <div class="option-icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <line x1="19" y1="8" x2="19" y2="14"/>
              <line x1="16" y1="11" x2="22" y2="11"/>
            </svg>
          </div>
          <div class="option-content">
            <h3 class="option-title">注册新账号</h3>
            <p class="option-desc">创建新账号，获得云端数据同步和团队协作功能</p>
          </div>
          <svg class="option-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </router-link>

        <button class="option-card option-guest" @click="reenterGuest">
          <div class="option-icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <div class="option-content">
            <h3 class="option-title">继续免登录</h3>
            <p class="option-desc">不登录直接进入，数据仅保存在当前浏览器</p>
          </div>
          <svg class="option-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>

      <router-link to="/dashboard" class="back-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
        返回数据仪表盘
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentUser = ref('')
const isGuest = ref(false)

onMounted(() => {
  const guestUser = localStorage.getItem('guest_user')
  if (guestUser) {
    const user = JSON.parse(guestUser)
    currentUser.value = user.user_metadata?.name || user.name || '访客'
    isGuest.value = true
    return
  }
  const guestName = localStorage.getItem('guest_name')
  if (guestName) {
    currentUser.value = guestName
    isGuest.value = true
    return
  }
  currentUser.value = '访客'
  isGuest.value = true
})

function reenterGuest() {
  router.push('/dashboard')
}
</script>

<style scoped>
.account-switch {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  position: relative;
  overflow: hidden;
  padding: 20px;
}

.bg-decoration { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
.bg-orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.12; animation: orbFloat 8s ease-in-out infinite; }
.orb-1 { width: 400px; height: 400px; background: #E85D4E; top: -100px; right: -100px; animation-delay: 0s; }
.orb-2 { width: 300px; height: 300px; background: #4A90D9; bottom: -80px; left: -80px; animation-delay: -3s; animation-duration: 10s; }

@keyframes orbFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.05); }
  66% { transform: translate(-20px, 20px) scale(0.95); }
}

.bg-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px); background-size: 50px 50px; }

.switch-container { width: 100%; max-width: 440px; position: relative; z-index: 1; }

.brand-section { text-align: center; margin-bottom: 28px; }
.brand-logo { width: 56px; height: 56px; margin: 0 auto 12px; background: linear-gradient(135deg, #E85D4E 0%, #FF8A7A 100%); border-radius: 16px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 32px rgba(232,93,78,0.3); }
.brand-icon { font-size: 28px; }
.brand-title { font-size: 24px; font-weight: 800; margin: 0 0 6px; letter-spacing: -0.5px; }
.gradient-text { background: linear-gradient(135deg, #FF8A7A 0%, #FFB89A 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.brand-subtitle { font-size: 14px; color: rgba(255,255,255,0.45); margin: 0; }

.current-card { background: rgba(255,255,255,0.08); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 16px 20px; margin-bottom: 20px; }
.current-label { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
.current-user { display: flex; align-items: center; gap: 12px; }
.current-avatar { width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, #E85D4E 0%, #FF8A7A 100%); display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; color: white; box-shadow: 0 4px 12px rgba(232,93,78,0.25); flex-shrink: 0; }
.current-name { font-size: 15px; font-weight: 600; color: rgba(255,255,255,0.9); margin-bottom: 3px; }
.role-badge { padding: 2px 8px; border-radius: 6px; font-weight: 600; font-size: 11px; }
.role-guest { background: rgba(255,184,0,0.15); color: #FFB800; }
.role-user { background: rgba(0,201,167,0.15); color: #00C9A7; }

.options-grid { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
.option-card { background: rgba(255,255,255,0.95); backdrop-filter: blur(20px); border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 16px; text-decoration: none; border: none; cursor: pointer; transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden; text-align: left; width: 100%; }
.option-card::before { content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%; opacity: 0; transition: opacity 0.3s; }
.option-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.2); }
.option-card:hover::before { opacity: 1; }
.option-login::before { background: linear-gradient(180deg, #E85D4E, #FF8A7A); }
.option-register::before { background: linear-gradient(180deg, #8B5CF6, #A78BFA); }
.option-guest::before { background: linear-gradient(180deg, #06B6D4, #22D3EE); }
.option-icon-wrapper { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.option-login .option-icon-wrapper { background: linear-gradient(135deg, #E85D4E 0%, #FF8A7A 100%); }
.option-register .option-icon-wrapper { background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%); }
.option-guest .option-icon-wrapper { background: linear-gradient(135deg, #06B6D4 0%, #22D3EE 100%); }
.option-icon-wrapper svg { width: 22px; height: 22px; }
.option-content { flex: 1; min-width: 0; }
.option-title { font-size: 15px; font-weight: 700; color: #1F2937; margin: 0 0 4px; }
.option-desc { font-size: 12px; color: #9CA3AF; margin: 0; line-height: 1.5; }
.option-arrow { width: 18px; height: 18px; color: #D1D5DB; flex-shrink: 0; transition: all 0.3s ease; }
.option-card:hover .option-arrow { color: #E85D4E; transform: translateX(4px); }

.back-btn { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 14px; background: rgba(255,255,255,0.08); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: rgba(255,255,255,0.6); font-size: 14px; font-weight: 500; text-decoration: none; transition: all 0.25s ease; }
.back-btn:hover { background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.9); }
.back-btn svg { width: 16px; height: 16px; }

@media (max-width: 480px) {
  .brand-title { font-size: 20px; }
  .option-card { padding: 16px; gap: 12px; }
  .option-icon-wrapper { width: 42px; height: 42px; }
  .option-title { font-size: 14px; }
  .option-desc { font-size: 11px; }
}
</style>