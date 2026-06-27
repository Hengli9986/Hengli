<template>
  <div class="max-w-6xl mx-auto p-6">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold">仪表盘</h1>
      <p class="text-gray-500 mt-1">数据总览与快速入口</p>
    </div>

    <!-- Quick Stats Row -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div class="card">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-gray-500">直播场次</span>
          <span class="text-xl">📺</span>
        </div>
        <div class="text-2xl font-bold">{{ liveStats?.sessionCount || 0 }}</div>
        <router-link to="/live" class="text-xs text-primary hover:underline mt-1 block">
          查看详情 →
        </router-link>
      </div>
      
      <div class="card">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-gray-500">视频数量</span>
          <span class="text-xl">🎬</span>
        </div>
        <div class="text-2xl font-bold">{{ videoStats?.videoCount || 0 }}</div>
        <router-link to="/video" class="text-xs text-primary hover:underline mt-1 block">
          查看详情 →
        </router-link>
      </div>
      
      <div class="card">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-gray-500">总GMV</span>
          <span class="text-xl">💰</span>
        </div>
        <div class="text-2xl font-bold text-green-600">¥{{ formatNumber(liveStats?.totalGmv) }}</div>
        <router-link to="/live" class="text-xs text-primary hover:underline mt-1 block">
          查看详情 →
        </router-link>
      </div>
      
      <div class="card">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-gray-500">总播放</span>
          <span class="text-xl">▶️</span>
        </div>
        <div class="text-2xl font-bold">{{ formatNumber(videoStats?.totalPlay) }}</div>
        <router-link to="/video" class="text-xs text-primary hover:underline mt-1 block">
          查看详情 →
        </router-link>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <router-link to="/import" class="card p-6 hover:shadow-md transition-shadow cursor-pointer">
        <div class="text-3xl mb-3">📁</div>
        <h3 class="font-bold text-lg mb-1">导入数据</h3>
        <p class="text-sm text-gray-500">上传 Excel/CSV 文件导入直播或短视频数据</p>
      </router-link>
      
      <router-link to="/live" class="card p-6 hover:shadow-md transition-shadow cursor-pointer">
        <div class="text-3xl mb-3">📺</div>
        <h3 class="font-bold text-lg mb-1">直播分析</h3>
        <p class="text-sm text-gray-500">查看直播数据趋势、GMV分析和场次对比</p>
      </router-link>
      
      <router-link to="/video" class="card p-6 hover:shadow-md transition-shadow cursor-pointer">
        <div class="text-3xl mb-3">🎬</div>
        <h3 class="font-bold text-lg mb-1">短视频分析</h3>
        <p class="text-sm text-gray-500">分析视频播放量、互动率和爆款检测</p>
      </router-link>
    </div>

    <!-- Recent Import History -->
    <div v-if="dataStore.importHistory.length > 0" class="card mb-8">
      <h3 class="font-bold mb-4">最近导入</h3>
      <div class="space-y-3">
        <div 
          v-for="item in dataStore.importHistory.slice(0, 5)" 
          :key="item.id"
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div class="flex items-center space-x-3">
            <span class="text-xl">{{ item.type === 'live' ? '📺' : '🎬' }}</span>
            <div>
              <div class="font-medium">
                {{ item.type === 'live' ? '直播数据' : '短视频数据' }}
              </div>
              <div class="text-sm text-gray-500">{{ item.count }} 条记录 · {{ item.timestamp }}</div>
            </div>
          </div>
          <router-link 
            :to="item.type === 'live' ? '/live' : '/video'"
            class="text-sm text-primary hover:underline"
          >
            查看 →
          </router-link>
        </div>
      </div>
    </div>

    <!-- Account Info -->
    <div class="card">
      <h3 class="font-bold mb-4">当前账号</h3>
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
            {{ activeAccount?.name?.[0] || '?' }}
          </div>
          <div>
            <div class="font-medium">{{ activeAccount?.name || '未选择账号' }}</div>
            <div class="text-sm text-gray-500">{{ activeAccount?.douyin_id || '' }}</div>
          </div>
        </div>
        <router-link to="/accounts" class="btn-secondary text-sm">
          切换账号
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDataStore } from '../stores/data'
import { useAccountStore } from '../stores/account'

const dataStore = useDataStore()
const accountStore = useAccountStore()

const liveStats = computed(() => dataStore.liveStats)
const videoStats = computed(() => dataStore.videoStats)
const activeAccount = computed(() => accountStore.activeAccount)

function formatNumber(num) {
  if (!num) return '0'
  const n = parseFloat(num)
  if (n >= 10000) {
    return (n / 10000).toFixed(1) + 'w'
  }
  return n.toLocaleString('zh-CN')
}
</script>
