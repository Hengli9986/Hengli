<template>
  <div class="max-w-6xl mx-auto p-6">
    <div class="flex items-center mb-6">
      <button @click="$router.back()" class="mr-4 text-gray-500 hover:text-gray-700">
        ← 返回
      </button>
      <h1 class="text-2xl font-bold">直播详情</h1>
    </div>

    <div v-if="dataStore.isLoading" class="card p-12 text-center">
      <div class="text-6xl mb-4">⏳</div>
      <h3 class="text-xl font-bold mb-2">加载中...</h3>
      <p class="text-gray-500">正在加载直播数据</p>
    </div>

    <div v-else-if="!session" class="card p-12 text-center">
      <div class="text-6xl mb-4">📺</div>
      <h3 class="text-xl font-bold mb-2">直播数据未找到</h3>
      <p class="text-gray-500 mb-6">该直播场次可能已被删除或数据未导入</p>
      <router-link to="/live" class="btn-primary">
        返回直播列表
      </router-link>
    </div>

    <template v-else>
      <!-- Session Info -->
      <div class="card mb-6">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-500">直播日期</div>
            <div class="text-xl font-bold">{{ session.live_date || '-' }}</div>
          </div>
          <div class="text-right">
            <div class="text-sm text-gray-500">直播时长</div>
            <div class="text-xl font-bold">{{ session.duration_minutes || '-' }} 分钟</div>
          </div>
        </div>
      </div>

      <!-- Key Metrics -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="card">
          <div class="text-sm text-gray-500 mb-1">场均观看</div>
          <div class="text-2xl font-bold">{{ formatNumber(session.avg_watch) }}</div>
        </div>
        <div class="card">
          <div class="text-sm text-gray-500 mb-1">直播GMV</div>
          <div class="text-2xl font-bold text-green-600">¥{{ formatNumber(session.gmv) }}</div>
        </div>
        <div class="card">
          <div class="text-sm text-gray-500 mb-1">成交订单</div>
          <div class="text-2xl font-bold">{{ formatNumber(session.orders) }}</div>
        </div>
        <div class="card">
          <div class="text-sm text-gray-500 mb-1">新增粉丝</div>
          <div class="text-2xl font-bold text-primary">{{ formatNumber(session.new_fans) }}</div>
        </div>
      </div>

      <!-- Conversion Metrics -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div class="card">
          <div class="text-sm text-gray-500 mb-1">观看转化率</div>
          <div class="text-xl font-bold">{{ conversionRate }}%</div>
          <div class="text-xs text-gray-400">订单数 / 观看人数</div>
        </div>
        <div class="card">
          <div class="text-sm text-gray-500 mb-1">客单价</div>
          <div class="text-xl font-bold">¥{{ avgOrderValue }}</div>
          <div class="text-xs text-gray-400">GMV / 订单数</div>
        </div>
        <div class="card">
          <div class="text-sm text-gray-500 mb-1">每分钟GMV</div>
          <div class="text-xl font-bold">¥{{ gmvPerMinute }}</div>
          <div class="text-xs text-gray-400">GMV / 直播时长</div>
        </div>
      </div>

      <!-- Comparison with Average -->
      <div class="card mb-6">
        <h3 class="font-bold mb-4">与平均数据对比</h3>
        <div class="space-y-4">
          <div v-for="metric in comparisonMetrics" :key="metric.name" class="flex items-center">
            <div class="w-24 text-sm text-gray-600">{{ metric.name }}</div>
            <div class="flex-1 mx-4">
              <div class="h-4 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  class="h-full rounded-full transition-all"
                  :class="metric.ratio >= 100 ? 'bg-green-500' : 'bg-yellow-500'"
                  :style="{ width: Math.min(metric.ratio, 150) + '%' }"
                ></div>
              </div>
            </div>
            <div class="w-32 text-right">
              <span class="font-bold">{{ formatNumber(metric.value) }}</span>
              <span class="text-xs ml-1" :class="metric.ratio >= 100 ? 'text-green-600' : 'text-yellow-600'">
                {{ metric.ratio >= 100 ? '↑' : '↓' }} {{ metric.ratio }}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Raw Data -->
      <div class="card">
        <h3 class="font-bold mb-4">原始数据</h3>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div v-for="(value, key) in sessionData" :key="key" class="p-3 bg-gray-50 rounded-lg">
            <div class="text-xs text-gray-500 mb-1">{{ key }}</div>
            <div class="font-medium">{{ value !== undefined && value !== '' ? value : '-' }}</div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useDataStore } from '../stores/data'

const route = useRoute()
const dataStore = useDataStore()

onMounted(() => {
  dataStore.loadData()
})

const session = computed(() => {
  return dataStore.liveSessions.find(s => s.id === route.params.id)
})

const sessionData = computed(() => {
  if (!session.value) return {}
  const { id, user_id, account_id, type, created_at, raw_data, ...rest } = session.value
  return rest
})

const stats = computed(() => dataStore.liveStats)

function formatNumber(num) {
  if (!num) return '0'
  const n = parseFloat(num)
  if (n >= 10000) {
    return (n / 10000).toFixed(1) + 'w'
  }
  return n.toLocaleString('zh-CN')
}

// Computed metrics
const watchCount = computed(() => parseFloat(session.value?.avg_watch) || 0)
const gmv = computed(() => parseFloat(session.value?.gmv) || 0)
const orders = computed(() => parseFloat(session.value?.orders) || 0)
const duration = computed(() => parseFloat(session.value?.duration_minutes) || 0)
const newFans = computed(() => parseFloat(session.value?.new_fans) || 0)

const conversionRate = computed(() => {
  if (watchCount.value === 0) return '0.00'
  return ((orders.value / watchCount.value) * 100).toFixed(2)
})

const avgOrderValue = computed(() => {
  if (orders.value === 0) return '0'
  return Math.round(gmv.value / orders.value).toLocaleString('zh-CN')
})

const gmvPerMinute = computed(() => {
  if (duration.value === 0) return '0'
  return Math.round(gmv.value / duration.value).toLocaleString('zh-CN')
})

const comparisonMetrics = computed(() => {
  if (!stats.value) return []
  
  return [
    {
      name: '场均观看',
      value: watchCount.value,
      ratio: stats.value.avgWatch ? Math.round((watchCount.value / stats.value.avgWatch) * 100) : 0
    },
    {
      name: 'GMV',
      value: gmv.value,
      ratio: stats.value.avgGmvPerSession ? Math.round((gmv.value / stats.value.avgGmvPerSession) * 100) : 0
    },
    {
      name: '成交订单',
      value: orders.value,
      ratio: stats.value.totalOrders ? Math.round((orders.value / (stats.value.totalOrders / stats.value.sessionCount)) * 100) : 0
    },
    {
      name: '新增粉丝',
      value: newFans.value,
      ratio: 0 // Would need avg new fans calculation
    }
  ]
})
</script>
