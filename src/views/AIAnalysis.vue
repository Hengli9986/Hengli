<template>
  <div class="max-w-6xl mx-auto p-6">
    <!-- Loading state -->
    <div v-if="dataStore.isLoading" class="text-center py-12">
      <div class="text-2xl mb-2">⏳</div>
      <div class="text-gray-500">加载中...</div>
    </div>

    <div v-else>
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-bold">AI 数据洞察</h1>
          <p class="text-gray-500 mt-1">基于本地规则的多维度数据分析与建议</p>
        </div>
        <div class="flex items-center space-x-3">
          <button @click="exportPDF" class="btn-primary text-sm">
            📄 导出 AI 报告
          </button>
          <router-link to="/import" class="btn-secondary text-sm">
            📁 导入数据
          </router-link>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!hasAnyData" class="card p-12 text-center">
        <div class="text-6xl mb-4">🤖</div>
        <h3 class="text-xl font-bold mb-2">暂无分析数据</h3>
        <p class="text-gray-500 mb-6">导入直播或短视频数据后，即可查看 AI 洞察</p>
        <router-link to="/import" class="btn-primary">
          去导入数据
        </router-link>
      </div>

      <div v-else>
        <!-- Health Score -->
        <div class="card mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div class="text-sm text-gray-500 mb-1">账号健康度评分</div>
            <div class="text-3xl font-bold text-primary">{{ overall.healthScore }}<span class="text-lg text-gray-400">/100</span></div>
          </div>
          <div class="flex-1 w-full sm:max-w-md">
            <div class="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="healthBarColor"
                :style="{ width: `${overall.healthScore}%` }"
              />
            </div>
            <div class="text-xs text-gray-400 mt-2 text-right">综合直播 GMV、视频互动、趋势变化计算</div>
          </div>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div v-for="(card, idx) in overall.summaryCards" :key="idx" class="card">
            <div class="flex items-center justify-between mb-2">
              <div class="text-sm text-gray-500">{{ card.label }}</div>
              <div class="text-xl">{{ card.icon }}</div>
            </div>
            <div class="text-2xl font-bold">{{ card.value }}</div>
            <div class="text-xs mt-1" :class="trendColor(card.trend)">
              {{ card.trend }}
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="card mb-6 p-2">
          <div class="flex space-x-1 overflow-x-auto">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              @click="activeTab = tab.key"
              class="px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors"
              :class="activeTab === tab.key ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>

        <!-- 综合分析 -->
        <div v-if="activeTab === 'overall'" class="space-y-6">
          <div class="card">
            <h3 class="font-bold mb-4">🧠 核心洞察</h3>
            <ul class="space-y-3">
              <li
                v-for="(insight, idx) in overall.insights"
                :key="idx"
                class="flex items-start text-sm text-gray-700"
              >
                <span class="mr-2 mt-0.5 text-primary">•</span>
                <span>{{ insight }}</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- 短视频分析 -->
        <div v-if="activeTab === 'video'" class="space-y-6">
          <!-- Key metrics -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="card">
              <div class="text-sm text-gray-500 mb-1">平均播放</div>
              <div class="text-xl font-bold">{{ formatNumber(videoAnalysis.avgStats.avgPlay) }}</div>
            </div>
            <div class="card">
              <div class="text-sm text-gray-500 mb-1">平均点赞</div>
              <div class="text-xl font-bold text-red-500">{{ formatNumber(videoAnalysis.avgStats.avgLike) }}</div>
            </div>
            <div class="card">
              <div class="text-sm text-gray-500 mb-1">平均完播率</div>
              <div class="text-xl font-bold text-primary">{{ videoAnalysis.avgStats.avgCompletionRate }}%</div>
            </div>
            <div class="card">
              <div class="text-sm text-gray-500 mb-1">平均互动率</div>
              <div class="text-xl font-bold text-orange-500">{{ videoAnalysis.avgStats.avgEngagementRate }}%</div>
            </div>
          </div>

          <!-- Charts -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="card">
              <h3 class="font-bold mb-4">互动率趋势</h3>
              <v-chart class="h-64" :option="videoEngagementChartOption" autoresize />
            </div>
            <div class="card">
              <h3 class="font-bold mb-4">头部 vs 尾部视频播放量</h3>
              <v-chart class="h-64" :option="videoCompareChartOption" autoresize />
            </div>
          </div>

          <!-- Top Videos -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="card">
              <h3 class="font-bold mb-4">🔥 头部视频 Top {{ videoAnalysis.topVideos.length }}</h3>
              <div class="space-y-3 max-h-80 overflow-y-auto">
                <div
                  v-for="(video, index) in videoAnalysis.topVideos"
                  :key="video.id || index"
                  class="flex items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div
                    class="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs mr-3"
                    :class="index < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-600'"
                  >
                    {{ index + 1 }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="font-medium truncate text-sm">{{ video.title }}</div>
                    <div class="text-xs text-gray-500">{{ video.publishTime }}</div>
                  </div>
                  <div class="text-right ml-3">
                    <div class="font-bold text-sm">{{ formatNumber(video.playCount) }}</div>
                    <div class="text-xs text-gray-500">播放</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="card">
              <h3 class="font-bold mb-4">💡 短视频优化建议</h3>
              <ul class="space-y-3">
                <li
                  v-for="(advice, idx) in videoAnalysis.contentAdvice"
                  :key="idx"
                  class="flex items-start text-sm text-gray-700"
                >
                  <span class="mr-2 mt-0.5 text-primary">•</span>
                  <span>{{ advice }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 直播分析 -->
        <div v-if="activeTab === 'live'" class="space-y-6">
          <!-- Key metrics -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="card">
              <div class="text-sm text-gray-500 mb-1">最佳时段</div>
              <div class="text-xl font-bold text-primary">{{ liveAnalysis.bestTimeSlot?.label || '-' }}</div>
              <div v-if="liveAnalysis.bestTimeSlot" class="text-xs text-gray-500 mt-1">
                场均 ¥{{ formatNumber(liveAnalysis.bestTimeSlot.avgGmv) }}
              </div>
            </div>
            <div class="card">
              <div class="text-sm text-gray-500 mb-1">最佳时长</div>
              <div class="text-xl font-bold text-primary">{{ liveAnalysis.bestDurationRange?.label || '-' }}</div>
              <div v-if="liveAnalysis.bestDurationRange" class="text-xs text-gray-500 mt-1">
                场均 ¥{{ formatNumber(Math.round(liveAnalysis.bestDurationRange.totalGmv / liveAnalysis.bestDurationRange.count)) }}
              </div>
            </div>
            <div class="card">
              <div class="text-sm text-gray-500 mb-1">头部场均 GMV</div>
              <div class="text-xl font-bold text-green-600">
                ¥{{ formatNumber(Math.round(avgLiveBestGmv)) }}
              </div>
            </div>
            <div class="card">
              <div class="text-sm text-gray-500 mb-1">头部转化率</div>
              <div class="text-xl font-bold text-orange-500">{{ avgLiveBestConversion }}%</div>
            </div>
          </div>

          <!-- Charts -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="card">
              <h3 class="font-bold mb-4">GMV 趋势</h3>
              <v-chart class="h-64" :option="liveGmvChartOption" autoresize />
            </div>
            <div class="card">
              <h3 class="font-bold mb-4">最佳直播 Top {{ liveAnalysis.bestSessions.length }}</h3>
              <div class="space-y-3 max-h-80 overflow-y-auto">
                <div
                  v-for="(session, index) in liveAnalysis.bestSessions"
                  :key="session.id || index"
                  class="flex items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div
                    class="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs mr-3"
                    :class="index < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-600'"
                  >
                    {{ index + 1 }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="font-medium truncate text-sm">{{ session.date }}</div>
                    <div class="text-xs text-gray-500">{{ session.duration }} 分钟 · {{ formatNumber(session.watch) }} 观看</div>
                  </div>
                  <div class="text-right ml-3">
                    <div class="font-bold text-sm text-green-600">¥{{ formatNumber(session.gmv) }}</div>
                    <div class="text-xs text-gray-500">GMV</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recommendations -->
          <div class="card">
            <h3 class="font-bold mb-4">🎯 直播运营建议</h3>
            <ul class="space-y-3">
              <li
                v-for="(rec, idx) in liveAnalysis.recommendations"
                :key="idx"
                class="flex items-start text-sm text-gray-700"
              >
                <span class="mr-2 mt-0.5 text-primary">•</span>
                <span>{{ rec }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart, PieChart, ScatterChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { analyzeVideos, analyzeLiveSessions, analyzeOverall } from '../lib/aiAnalyzer'
import { exportAIAnalysisPDF } from '../lib/export'

use([CanvasRenderer, LineChart, BarChart, PieChart, ScatterChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent])

const dataStore = {
  isLoading: false,
  importHistory: [],
  liveSessions: [],
  videos: [],
  loadData: () => {},
  setImportedData: async () => {},
  removeImportHistoryItem: () => {}
}

const tabs = [
  { key: 'overall', label: '综合分析' },
  { key: 'video', label: '短视频分析' },
  { key: 'live', label: '直播分析' }
]
const activeTab = ref('overall')

onMounted(() => {
  dataStore.loadData()
})

const hasAnyData = computed(() => dataStore.liveSessions.length > 0 || dataStore.videos.length > 0)

const videoAnalysis = computed(() => analyzeVideos(dataStore.videos))
const liveAnalysis = computed(() => analyzeLiveSessions(dataStore.liveSessions))
const overall = computed(() => analyzeOverall(dataStore.liveSessions, dataStore.videos))

const avgLiveBestGmv = computed(() => {
  if (!liveAnalysis.value.bestSessions.length) return 0
  return liveAnalysis.value.bestSessions.reduce((s, v) => s + v.gmv, 0) / liveAnalysis.value.bestSessions.length
})

const avgLiveBestConversion = computed(() => {
  if (!liveAnalysis.value.bestSessions.length) return '0.00'
  const avg = liveAnalysis.value.bestSessions.reduce((s, v) => s + parseFloat(v.conversion), 0) / liveAnalysis.value.bestSessions.length
  return avg.toFixed(2)
})

const healthBarColor = computed(() => {
  const score = overall.value.healthScore
  if (score >= 80) return 'bg-green-500'
  if (score >= 60) return 'bg-primary'
  if (score >= 40) return 'bg-yellow-500'
  return 'bg-red-500'
})

function trendColor(trend) {
  if (typeof trend !== 'string') return 'text-gray-400'
  if (trend.startsWith('+')) return 'text-green-600'
  if (trend.startsWith('-')) return 'text-red-500'
  return 'text-gray-400'
}

function formatNumber(num) {
  if (!num && num !== 0) return '0'
  const n = parseFloat(num)
  if (n >= 10000) {
    return (n / 10000).toFixed(1) + 'w'
  }
  return n.toLocaleString('zh-CN')
}

function exportPDF() {
  if (!hasAnyData.value) {
    alert('没有数据可导出')
    return
  }
  exportAIAnalysisPDF(
    dataStore.liveSessions,
    dataStore.videos,
    overall.value,
    videoAnalysis.value,
    liveAnalysis.value
  )
}

// ========== Chart Options ==========

const videoEngagementChartOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: videoAnalysis.value.engagementTrend.dates, axisLabel: { rotate: 45 } },
  yAxis: { type: 'value', name: '互动率%', axisLabel: { formatter: '{value}%' } },
  series: [{
    data: videoAnalysis.value.engagementTrend.values,
    type: 'line',
    smooth: true,
    itemStyle: { color: '#0071e3' },
    areaStyle: { color: 'rgba(0, 113, 227, 0.1)' }
  }]
}))

const videoCompareChartOption = computed(() => {
  const topAvg = videoAnalysis.value.topVideos.length
    ? videoAnalysis.value.topVideos.reduce((s, v) => s + v.playCount, 0) / videoAnalysis.value.topVideos.length
    : 0
  const lowAvg = videoAnalysis.value.lowVideos.length
    ? videoAnalysis.value.lowVideos.reduce((s, v) => s + v.playCount, 0) / videoAnalysis.value.lowVideos.length
    : 0

  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: { type: 'category', data: ['头部视频', '尾部视频'] },
    yAxis: { type: 'value', axisLabel: { formatter: v => v >= 10000 ? (v / 10000).toFixed(1) + 'w' : v } },
    series: [{
      data: [topAvg, lowAvg],
      type: 'bar',
      itemStyle: { color: '#0071e3', borderRadius: [4, 4, 0, 0] },
      label: { show: true, position: 'top', formatter: params => formatNumber(params.value) }
    }]
  }
})

const liveGmvChartOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: liveAnalysis.value.gmvTrend.dates, axisLabel: { rotate: 45 } },
  yAxis: { type: 'value', axisLabel: { formatter: v => v >= 10000 ? (v / 10000).toFixed(1) + 'w' : v } },
  series: [{
    data: liveAnalysis.value.gmvTrend.values,
    type: 'bar',
    itemStyle: { color: '#0071e3', borderRadius: [4, 4, 0, 0] }
  }]
}))
</script>
