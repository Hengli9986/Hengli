<template>
  <div class="login-page">
    <!-- Background decoration -->
    <div class="bg-decoration">
      <div class="bg-orb orb-1"></div>
      <div class="bg-orb orb-2"></div>
      <div class="bg-orb orb-3"></div>
      <div class="bg-grid"></div>
    </div>
    
    <div class="login-container">
      <!-- Logo & Brand -->
      <div class="brand-section">
        <div class="brand-logo">
          <span class="brand-icon">🎯</span>
        </div>
        <h1 class="brand-title">
          <span class="gradient-text">抖音数据站</span>
        </h1>
        <p class="brand-subtitle">团队数据助手 · 智能分析</p>
      </div>
      
      <!-- Auth Card -->
      <div class="auth-card">
        <!-- Mode Toggle -->
        <div class="mode-toggle">
          <button
            v-for="mode in authModes"
            :key="mode.key"
            @click="authMode = mode.key"
            :class="[
              'mode-btn',
              authMode === mode.key ? 'mode-btn-active' : 'mode-btn-inactive'
            ]"
          >
            {{ mode.label }}
          </button>
        </div>
        
        <!-- Login Form -->
        <form v-if="authMode === 'login'" @submit.prevent="handleLogin" class="auth-form">
          <div class="form-group">
            <label class="form-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              邮箱
            </label>
            <input
              v-model="form.email"
              type="email"
              required
              class="form-input"
              placeholder="your@email.com"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              密码
            </label>
            <input
              v-model="form.password"
              type="password"
              required
              class="form-input"
              placeholder="••••••"
            />
          </div>
          
          <button type="submit" class="submit-btn" :disabled="isLoading">
            <span v-if="!isLoading" class="btn-content">
              登录
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </span>
            <span v-else class="btn-loading">
              <span class="loading-spinner"></span>
              登录中...
            </span>
          </button>
        </form>
        
        <!-- Register Form -->
        <form v-if="authMode === 'register'" @submit.prevent="handleRegister" class="auth-form">
          <div class="form-group">
            <label class="form-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              邮箱
            </label>
            <input
              v-model="form.email"
              type="email"
              required
              class="form-input"
              placeholder="your@email.com"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              密码
            </label>
            <input
              v-model="form.password"
              type="password"
              required
              minlength="6"
              class="form-input"
              placeholder="至少6位"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              姓名
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              class="form-input"
              placeholder="你的名字"
            />
          </div>
          
          <button type="submit" class="submit-btn" :disabled="isLoading">
            <span v-if="!isLoading" class="btn-content">
              注册
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </span>
            <span v-else class="btn-loading">
              <span class="loading-spinner"></span>
              注册中...
            </span>
          </button>
          
          <p class="form-tip">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            如遇"邮件速率限制"报错，请使用「免登录」模式
          </p>
        </form>
        
        <!-- Guest Mode -->
        <div v-if="authMode === 'guest'" class="auth-form">
          <div class="guest-notice">
            <div class="guest-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            <h3 class="guest-title">免登录模式</h3>
            <p class="guest-desc">
              数据仅保存在当前浏览器，换设备或清除缓存会丢失。<br/>
              适合快速体验功能，后续可在设置中绑定账号。
            </p>
          </div>
          
          <div class="form-group">
            <label class="form-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              显示名称（可选）
            </label>
            <input
              v-model="form.name"
              type="text"
              class="form-input"
              placeholder="访客"
            />
          </div>
          
          <button @click="enterGuestMode" class="submit-btn submit-btn-guest" :disabled="isLoading">
            <span v-if="!isLoading" class="btn-content">
              直接进入
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </span>
            <span v-else class="btn-loading">
              <span class="loading-spinner"></span>
              进入中...
            </span>
          </button>
        </div>
        
        <p v-if="error" class="error-message">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          {{ error }}
        </p>
      </div>
      
      <!-- Footer -->
      <p class="login-footer">抖音数据站 · 团队数据助手</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()
const authMode = ref('login')
const isLoading = ref(false)
const error = ref('')
const form = ref({ email: '', password: '', name: '' })

const authModes = [
  { key: 'login', label: '登录' },
  { key: 'register', label: '注册' },
  { key: 'guest', label: '免登录' },
]

async function handleLogin() {
  isLoading.value = true
  error.value = ''
  try {
    await auth.login(form.value.email, form.value.password)
    router.push('/dashboard')
  } catch (err) {
    error.value = err.message || '登录失败'
  } finally {
    isLoading.value = false
  }
}

async function handleRegister() {
  isLoading.value = true
  error.value = ''
  try {
    await auth.register(form.value.email, form.value.password, form.value.name)
    router.push('/dashboard')
  } catch (err) {
    error.value = err.message || '注册失败'
  } finally {
    isLoading.value = false
  }
}

function enterGuestMode() {
  const guestId = 'guest-' + Date.now()
  const guestUser = {
    id: guestId,
    email: 'guest@local',
    user_metadata: { name: form.value.name || '访客' },
    role: 'guest'
  }
  
  localStorage.setItem('guest_mode', 'true')
  localStorage.setItem('guest_user', JSON.stringify(guestUser))
  auth.user = guestUser
  router.push('/dashboard')
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  position: relative;
  overflow: hidden;
  padding: 20px;
}

/* Background decoration */
.bg-decoration {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
  animation: orbFloat 8s ease-in-out infinite;
}

.orb-1 {
  width: 400px;
  height: 400px;
  background: #E85D4E;
  top: -100px;
  right: -100px;
  animation-delay: 0s;
}

.orb-2 {
  width: 300px;
  height: 300px;
  background: #4A90D9;
  bottom: -80px;
  left: -80px;
  animation-delay: -3s;
  animation-duration: 10s;
}

.orb-3 {
  width: 200px;
  height: 200px;
  background: #8B5CF6;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: -5s;
  animation-duration: 12s;
}

@keyframes orbFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.05); }
  66% { transform: translate(-20px, 20px) scale(0.95); }
}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 50px 50px;
}

/* Container */
.login-container {
  width: 100%;
  max-width: 420px;
  position: relative;
  z-index: 1;
}

/* Brand Section */
.brand-section {
  text-align: center;
  margin-bottom: 32px;
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.brand-logo {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  background: linear-gradient(135deg, #E85D4E 0%, #FF8A7A 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(232,93,78,0.3);
}

.brand-icon {
  font-size: 32px;
}

.brand-title {
  font-size: 28px;
  font-weight: 800;
  margin: 0 0 8px;
  letter-spacing: -0.5px;
}

.gradient-text {
  background: linear-gradient(135deg, #FF8A7A 0%, #FFB89A 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-subtitle {
  font-size: 14px;
  color: rgba(255,255,255,0.5);
  margin: 0;
  font-weight: 400;
}

/* Auth Card */
.auth-card {
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1);
  animation: fadeInUp 0.6s ease-out 0.1s both;
}

/* Mode Toggle */
.mode-toggle {
  display: flex;
  background: #F3F4F6;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 28px;
  gap: 2px;
}

.mode-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  text-align: center;
}

.mode-btn-active {
  background: white;
  color: #1F2937;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.mode-btn-inactive {
  background: transparent;
  color: #9CA3AF;
}

.mode-btn-inactive:hover {
  color: #6B7280;
  background: rgba(255,255,255,0.5);
}

/* Form */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #4B5563;
}

.form-label svg {
  width: 15px;
  height: 15px;
  color: #9CA3AF;
}

.form-input {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid #E5E7EB;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.25s ease;
  outline: none;
  background: #FAFAFA;
  color: #1F2937;
}

.form-input:focus {
  border-color: #E85D4E;
  background: white;
  box-shadow: 0 0 0 4px rgba(232,93,78,0.1);
}

.form-input::placeholder {
  color: #C7C7C7;
}

/* Submit Button */
.submit-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: 4px;
  position: relative;
  overflow: hidden;
}

.submit-btn:not(.submit-btn-guest) {
  background: linear-gradient(135deg, #E85D4E 0%, #D45040 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(232,93,78,0.3);
}

.submit-btn-guest {
  background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(139,92,246,0.3);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(232,93,78,0.4);
}

.submit-btn-guest:hover:not(:disabled) {
  box-shadow: 0 8px 24px rgba(139,92,246,0.4);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-content svg {
  width: 16px;
  height: 16px;
  transition: transform 0.2s;
}

.submit-btn:hover .btn-content svg {
  transform: translateX(3px);
}

/* Loading */
.btn-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Guest Notice */
.guest-notice {
  text-align: center;
  padding: 8px 0 4px;
}

.guest-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 12px;
  background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(139,92,246,0.2);
}

.guest-icon svg {
  width: 24px;
  height: 24px;
  color: white;
}

.guest-title {
  font-size: 16px;
  font-weight: 700;
  color: #1F2937;
  margin: 0 0 8px;
}

.guest-desc {
  font-size: 13px;
  color: #9CA3AF;
  line-height: 1.6;
  margin: 0 0 4px;
}

/* Form Tip */
.form-tip {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 12px;
  color: #9CA3AF;
  margin: 4px 0 0;
  line-height: 1.5;
}

.form-tip svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  margin-top: 1px;
  color: #FFB800;
}

/* Error */
.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #FFF0F1;
  border-radius: 10px;
  font-size: 13px;
  color: #E85D4E;
  font-weight: 600;
  margin: 8px 0 0;
}

.error-message svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* Footer */
.login-footer {
  text-align: center;
  margin-top: 24px;
  font-size: 12px;
  color: rgba(255,255,255,0.3);
  animation: fadeInUp 0.6s ease-out 0.3s both;
}

/* Responsive */
@media (max-width: 480px) {
  .login-page {
    padding: 16px;
  }
  
  .auth-card {
    padding: 24px 20px;
    border-radius: 16px;
  }
  
  .brand-title {
    font-size: 24px;
  }
  
  .mode-toggle {
    margin-bottom: 20px;
  }
  
  .mode-btn {
    padding: 8px;
    font-size: 13px;
  }
}
</style>
