<template>
  <div class="account-switch-page">
    <div class="bg-decoration">
      <div class="bg-orb orb-1"></div>
      <div class="bg-orb orb-2"></div>
      <div class="bg-orb orb-3"></div>
      <div class="bg-grid"></div>
    </div>
    <div class="account-switch-container">
      <div class="brand-section">
        <div class="brand-logo">
          <span class="brand-icon">🎯</span>
        </div>
        <h1 class="brand-title">
          <span class="gradient-text">数据站</span>
        </h1>
        <p class="brand-subtitle">选择一个方式继续使用</p>
      </div>
      <div class="options-card">
        <router-link to="/login" class="option-card option-login">
          <div class="option-icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
          </div>
          <div class="option-content">
            <h3 class="option-title">登录其他账号</h3>
            <p class="option-desc">使用已有账号密码登录</p>
          </div>
          <svg class="option-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </router-link>
        <router-link to="/login" class="option-card option-register">
          <div class="option-icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
          </div>
          <div class="option-content">
            <h3 class="option-title">注册新账号</h3>
            <p class="option-desc">创建一个新账号开始使用</p>
          </div>
          <svg class="option-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </router-link>
        <div class="option-divider"><span>或者</span></div>
        <button class="option-card option-guest" @click="reenterGuest">
          <div class="option-icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <div class="option-content">
            <h3 class="option-title">继续免登录</h3>
            <p class="option-desc">以访客模式返回仪表盘</p>
          </div>
          <svg class="option-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
      <p class="page-footer">数据站 · 团队数据助手</p>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
const router = useRouter()
const auth = useAuthStore()
function reenterGuest() {
  const guestUser = { id: 'guest', email: 'guest@local', user_metadata: { name: '访客' }, role: 'guest' }
  localStorage.setItem('guest_mode', 'true')
  localStorage.setItem('guest_user', JSON.stringify(guestUser))
  auth.user = guestUser
  router.push('/dashboard')
}
</script>

<style scoped>
.account-switch-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); position: relative; overflow: hidden; padding: 20px; }
.bg-decoration { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
.bg-orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.15; animation: orbFloat 8s ease-in-out infinite; }
.orb-1 { width: 400px; height: 400px; background: #E85D4E; top: -100px; right: -100px; animation-delay: 0s; }
.orb-2 { width: 300px; height: 300px; background: #4A90D9; bottom: -80px; left: -80px; animation-delay: -3s; animation-duration: 10s; }
.orb-3 { width: 200px; height: 200px; background: #8B5CF6; top: 50%; left: 50%; transform: translate(-50%,-50%); animation-delay: -5s; animation-duration: 12s; }
@keyframes orbFloat { 0%,100% { transform: translate(0,0) scale(1); } 33% { transform: translate(30px,-30px) scale(1.05); } 66% { transform: translate(-20px,20px) scale(0.95); } }
.bg-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px); background-size: 50px 50px; }
.account-switch-container { width: 100%; max-width: 420px; position: relative; z-index: 1; }
.brand-section { text-align: center; margin-bottom: 32px; animation: fadeInUp 0.6s ease-out; }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.brand-logo { width: 64px; height: 64px; margin: 0 auto 16px; background: linear-gradient(135deg, #E85D4E 0%, #FF8A7A 100%); border-radius: 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 32px rgba(232,93,78,0.3); }
.brand-icon { font-size: 32px; }
.brand-title { font-size: 28px; font-weight: 800; margin: 0 0 8px; letter-spacing: -0.5px; }
.gradient-text { background: linear-gradient(135deg, #FF8A7A 0%, #FFB89A 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.brand-subtitle { font-size: 14px; color: rgba(255,255,255,0.5); margin: 0; font-weight: 400; }
.options-card { background: rgba(255,255,255,0.95); backdrop-filter: blur(20px); border-radius: 20px; padding: 32px; box-shadow: 0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1); animation: fadeInUp 0.6s ease-out 0.1s both; }
.option-card { display: flex; align-items: center; gap: 16px; padding: 20px; border-radius: 16px; text-decoration: none; transition: all 0.3s cubic-bezier(0.4,0,0.2,1); border: 2px solid transparent; cursor: pointer; width: 100%; background: none; text-align: left; }
.option-login { background: linear-gradient(135deg, #E85D4E 0%, #FF8A7A 100%); color: white; box-shadow: 0 4px 16px rgba(232,93,78,0.3); }
.option-login:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(232,93,78,0.4); }
.option-register { background: linear-gradient(135deg, #4A90D9 0%, #7AB8E8 100%); color: white; box-shadow: 0 4px 16px rgba(74,144,217,0.3); margin-top: 12px; }
.option-register:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(74,144,217,0.4); }
.option-guest { background: #F3F4F6; color: #4B5563; margin-top: 4px; }
.option-guest:hover { background: #E5E7EB; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
.option-icon-wrapper { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: rgba(255,255,255,0.2); }
.option-icon-wrapper svg { width: 24px; height: 24px; }
.option-guest .option-icon-wrapper { background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%); color: white; }
.option-content { flex: 1; }
.option-title { font-size: 15px; font-weight: 700; margin: 0 0 4px; }
.option-desc { font-size: 12px; margin: 0; opacity: 0.8; }
.option-arrow { width: 20px; height: 20px; flex-shrink: 0; opacity: 0.6; transition: transform 0.2s ease; }
.option-card:hover .option-arrow { transform: translateX(4px); opacity: 1; }
.option-divider { display: flex; align-items: center; gap: 16px; margin: 20px 0; color: #9CA3AF; font-size: 13px; }
.option-divider::before, .option-divider::after { content: ''; flex: 1; height: 1px; background: #E5E7EB; }
.page-footer { text-align: center; margin-top: 24px; font-size: 12px; color: rgba(255,255,255,0.3); animation: fadeInUp 0.6s ease-out 0.3s both; }
@media (max-width: 480px) {
  .account-switch-page { padding: 16px; }
  .options-card { padding: 24px 20px; border-radius: 16px; }
  .brand-title { font-size: 24px; }
  .option-card { padding: 16px; gap: 12px; }
  .option-icon-wrapper { width: 42px; height: 42px; border-radius: 12px; }
  .option-icon-wrapper svg { width: 20px; height: 20px; }
  .option-title { font-size: 14px; }
  .option-desc { font-size: 11px; }
}
</style>
