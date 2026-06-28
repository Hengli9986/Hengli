<template>
  <div class="max-w-6xl mx-auto p-6">
    <!-- Loading state -->
    <div v-if="dataStore.isLoading" class="text-center py-12">
      <div class="text-2xl mb-2">⏳</div>
      <div class="text-gray-500">加载中...</div>
    </div>

    <div v-else>
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold">直播分析</h1>
        <p class="text-gray-500 mt-1">直播数据总览与趋势分析</p>
      </div>
      <div class="flex items-center space-x-3">
        <button @click="exportPDF" class="btn-secondary text-sm">
          📄 导出 PDF
        </button>
        <router-link to="/import" class="btn-secondary text-sm">
          📁 导入数据
        </router-link>
        <span v-if="dataStore.liveSessions.length > 0" class="text-sm text-gray-500">
          共 {{ dataStore.liveSessions.length }} 场直播
        </span>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!hasData" class="card p-12 text-center">
      <div class="text-6xl mb-4">📺</div>
      <h3 class="text-xl font-bold mb-2">暂无直播数据</h3>
      <p class="text-gray-500 mb-6">导入直播数据后，即可查看分析看板</p>
      <router-link to="/import" class="btn-primary">
        去导入数据
      </router-link>
    </div>

    <div v-else>
      <!-- Stats Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="card">
          <div class="text-sm text-gray-500 mb-1">直播场次</div>
          <div class="text-2xl font-bold">{{ stats.sessionCount }}</div>
        </div>
        <div class="card">
          <div class="text-sm text-gray-500 mb-1">场均观看</div>
          <div class="text-2xl font-bold">{{ formatNumber(stats.avgWatch) }}</div>
        </div>
        <div class="card">
          <div class="text-sm text-gray-500 mb-1">总GMV</div>
          <div class="text-2xl font-bold text-green-600">¥{{ formatNumber(stats.totalGmv) }}</div>
        </div>
        <div class="card">
          <div class="text-sm text-gray-500 mb-1">总成交订单</div>
          <div class="text-2xl font-bold">{{ formatNumber(stats.totalOrders) }}</div>
        </div>
      </div>

      <!-- Secondary Stats -->
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div class="card">
          <div class="text-sm text-gray-500 mb-1">场均GMV</div>
          <div class="text-xl font-bold">¥{{ formatNumber(stats.avgGmvPerSession) }}</div>
        </div>
        <div class="card">
          <div class="text-sm text-gray-500 mb-1">平均直播时长</div>
          <div class="text-xl font-bold">{{ stats.avgDuration }} 分钟</div>
        </div>
        <div class="card">
          <div class="text-sm text-gray-500 mb-1">平均转化率</div>
          <div class="text-xl font-bold">{{ stats.avgConversion }}%</div>
        </div>
      </div>

      <!-- Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- GMV Trend -->
        <div class="card">
          <h3 class="font-bold mb-4">GMV 趋势</h3>
          <v-chart class="h-64" :option="gmvChartOption" autoresize />
        </div>
        
        <!-- Watch Count Trend -->
        <div class="card">
          <h3 class="font-bold mb-4">观看人数趋势</h3>
          <v-chart class="h-64" :option="watchChartOption" autoresize />
        </div>
      </div>

      <!-- Duration vs GMV Scatter -->
      <div class="card mb-6">
        <h3 class="font-bold mb-4">直播时长 vs GMV 分布</h3>
        <v-chart class="h-64" :option="scatterChartOption" autoresize />
      </div>

      <!-- Data Table -->
      <div class="card">
        <h3 class="font-bold mb-4">直播明细</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="text-left py-2 px-3 font-medium text-gray-600">日期</th>
                <th class="text-left py-2 px-3 font-medium text-gray-600">时长(分)</th>
                <th class="text-left py-2 px-3 font-medium text-gray-600">观看</th>
                <th class="text-left py-2 px-3 font-medium text-gray-600">GMV</th>
                <th class="text-left py-2 px-3 font-medium text-gray-600">订单</th>
                <th class="text-left py-2 px-3 font-medium text-gray-600">新增粉丝</th>
                <th class="text-left py-2 px-3 font-medium text-gray-600">互动</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="session in sortedSessions" 
                :key="session._id"
                class="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                @click="goToDetail(session)"
              >
                <td class="py-2 px-3">{{ session.直播日期 || session.date || '-' }}</td>
                <td class="py-2 px-3">{{ session.直播时长 || session.duration || '-' }}</td>
                <td class="py-2 px-3">{{ formatNumber(session.场均观看 || session.watchCount) }}</td>
                <td class="py-2 px-3 text-green-600">¥{{ formatNumber(session.直播GMV || session.gmv) }}</td>
                <td class="py-2 px-3">{{ formatNumber(session.成交订单数 || session.orders) }}</td>
                <td class="py-2 px-3">{{ formatNumber(session.新增粉丝 || session.newFans) }}</td>
                <td class="py-2 px-3">{{ formatNumber(session.互动人数 || session.interactions) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
  </div>
  </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart, ScatterChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { useDataStore } from '../stores/data'
import { exportLiveReportPDF } from '../lib/export'

use([CanvasRenderer, LineChart, BarChart, ScatterChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent])

const router = useRouter()
const dataStore = useDataStore()

onMounted(() => {
  dataStore.loadData()
})

const hasData = computed(() => dataStore.liveSessions.length > 0)
const stats = computed(() => dataStore.liveStats || {
  sessionCount: 0, avgWatch: 0, totalGmv: 0, totalOrders: 0,
  avgGmvPerSession: 0, avgDuration: 0, avgConversion: '0.00'
})

const sortedSessions = computed(() => {
  return [...dataStore.liveSessions].sort((a, b) => {
    const dateA = new Date(a.live_date || 0)
    const dateB = new Date(b.live_date || 0)
    return dateB - dateA
  })
})

function formatNumber(num) {
  if (!num) return '0'
  const n = parseFloat(num)
  if (n >= 10000) {
    return (n / 10000).toFixed(1) + 'w'
  }
  return n.toLocaleString('zh-CN')
}

function goToDetail(session) {
  router.push(`/live/${session.id}`)
}

function exportPDF() {
  if (!dataStore.liveStats || dataStore.liveSessions.length === 0) {
    alert('没有数据可导出')
    return
  }
  exportLiveReportPDF(dataStore.liveSessions, dataStore.liveStats)
}

// ========== Chart Options ==========
const chartData = computed(() => {
  const sessions = [...dataStore.liveSessions].sort((a, b) => {
    const dateA = new Date(a.live_date || 0)
    const dateB = new Date(b.live_date || 0)
    return dateA - dateB
  })
  
  return {
    dates: sessions.map(s => s.live_date || ''),
    gmv: sessions.map(s => parseFloat(s.gmv) || 0),
    watch: sessions.map(s => parseFloat(s.avg_watch) || 0),
    duration: sessions.map(s => parseFloat(s.duration_minutes) || 0),
    orders: sessions.map(s => parseFloat(s.orders) || 0)
  }
})

const gmvChartOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: chartData.value.dates, axisLabel: { rotate: 45 } },
  yAxis: { type: 'value', axisLabel: { formatter: v => v >= 10000 ? (v/10000).toFixed(1) + 'w' : v } },
  series: [{
    data: chartData.value.gmv,
    type: 'bar',
    itemStyle: { color: '#0071e3', borderRadius: [4, 4, 0, 0] }
  }]
}))

const watchChartOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: chartData.value.dates, axisLabel: { rotate: 45 } },
  yAxis: { type: 'value', axisLabel: { formatter: v => v >= 10000 ? (v/10000).toFixed(1) + 'w' : v } },
  series: [{
    data: chartData.value.watch,
    type: 'line',
    smooth: true,
    itemStyle: { color: '#34c759' },
    areaStyle: { color: 'rgba(52, 199, 89, 0.1)' }
  }]
}))

const scatterChartOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: params => `时长: ${params.value[0]}分<br/>GMV: ¥${params.value[1].toLocaleString()}`
  },
  xAxis: { type: 'value', name: '时长(分钟)', nameLocation: 'middle', nameGap: 25 },
  yAxis: { type: 'value', name: 'GMV', axisLabel: { formatter: v => v >= 10000 ? (v/10000).toFixed(1) + 'w' : v } },
  series: [{
    data: chartData.value.duration.map((d, i) => [d, chartData.value.gmv[i]]),
    type: 'scatter',
    symbolSize: 12,
    itemStyle: { color: '#0071e3' }
  }]
}))
</script>
