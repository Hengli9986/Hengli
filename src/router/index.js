import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import DataImport from '../views/DataImport.vue'
import LiveAnalysis from '../views/LiveAnalysis.vue'
import LiveDetail from '../views/LiveDetail.vue'
import VideoAnalysis from '../views/VideoAnalysis.vue'
import AccountManage from '../views/AccountManage.vue'
import AIAssistant from '../views/AIAssistant.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/login', name: 'Login', component: Login },
    { path: '/dashboard', name: 'Dashboard', component: Dashboard, meta: { requiresAuth: true } },
    { path: '/import', name: 'DataImport', component: DataImport, meta: { requiresAuth: true } },
    { path: '/live', name: 'LiveAnalysis', component: LiveAnalysis, meta: { requiresAuth: true } },
    { path: '/live/:id', name: 'LiveDetail', component: LiveDetail, meta: { requiresAuth: true } },
    { path: '/video', name: 'VideoAnalysis', component: VideoAnalysis, meta: { requiresAuth: true } },
    { path: '/accounts', name: 'AccountManage', component: AccountManage, meta: { requiresAuth: true } },
    { path: '/ai-assistant', name: 'AIAssistant', component: AIAssistant, meta: { requiresAuth: true } },
  ],
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('user') !== null
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
