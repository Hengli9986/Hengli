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
        <h1 class="text-2xl font-bold">短视频分析</h1>
        <p class="text-gray-500 mt-1">视频表现数据与爆款分析</p>
      </div>
      <div class="flex items-center space-x-3">
        <button class="btn-secondary text-sm" @click="exportPDF">
          📄 导出 PDF
        </button>
        <router-link to="/import" class="btn-secondary text-sm">
          📁 导入数据
        </router-link>
        <span v-if="dataStore.videos.length > 0" class="text-sm text-gray-500">
          共 {{ dataStore.videos.length }} 个视频
        </span>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!hasData" class="card p-12 text-center">
      <div class="text-6xl mb-4">🎬</div>
      <h3 class="text-xl font-bold mb-2">暂无视频数据</h3>
      <p class="text-gray-500 mb-6">导入短视频数据后，即可查看分析看板</p>
      <router-link to="/import" class="btn-primary">
        去导入数据
      </router-link>
    </div>

    <div v-else>
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="card">
          <div class="text-sm text-gray-500 mb-1">视频总数</div>
          <div class="text-2xl font-bold">{{ stats.videoCount }}</div>
        </div>
        <div class="card">
          <div class="text-sm text-gray-500 mb-1">总播放量</div>
          <div class="text-2xl font-bold">{{ formatNumber(stats.totalPlay) }}</div>
        </div>
        <div class="card">
          <div class="text-sm text-gray-500 mb-1">总点赞</div>
          <div class="text-2xl font-bold text-red-500">{{ formatNumber(stats.totalLike) }}</div>
        </div>
        <div class="card">
          <div class="text-sm text-gray-500 mb-1">互动率</div>
          <div class="text-2xl font-bold text-primary">{{ stats.engagementRate }}%</div>
        </div>
      </div>

      <!-- Secondary Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div class="card">
          <div class="text-sm text-gray-500 mb-1">平均播放</div>
          <div class="text-xl font-bold">{{ formatNumber(stats.avgPlay) }}</div>
        </div>
        <div class="card">
          <div class="text-sm text-gray-500 mb-1">平均点赞</div>
          <div class="text-xl font-bold">{{ formatNumber(stats.avgLike) }}</div>
        </div>
        <div class="card">
          <div class="text-sm text-gray-500 mb-1">爆款视频</div>
          <div class="text-xl font-bold text-orange-500">{{ stats.topVideos.length }} 个</div>
        </div>
      </div>

      <!-- Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Play Count Trend -->
        <div class="card">
          <h3 class="font-bold mb-4">播放量趋势</h3>
          <v-chart class="h-64" :option="playChartOption" autoresize />
        </div>
        
        <!-- Engagement Distribution -->
        <div class="card">
          <h3 class="font-bold mb-4">互动数据分布</h3>
          <v-chart class="h-64" :option="engagementChartOption" autoresize />
        </div>
      </div>

      <!-- Top Videos -->
      <div class="card mb-6">
        <h3 class="font-bold mb-4">🔥 爆款视频 Top {{ stats.topVideos.length }}</h3>
        <div class="space-y-4">
          <div 
            v-for="(video, index) in stats.topVideos" 
            :key="index"
            class="flex items-center p-4 bg-gray-50 rounded-lg"
          >
            <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-4"
              :class="index < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-600'"
            >
              {{ index + 1 }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-medium truncate">{{ video.title }}</div>
              <div class="text-sm text-gray-500">{{ video.publish_time }}</div>
            </div>
            <div class="text-right ml-4">
              <div class="font-bold">{{ formatNumber(video.play_count) }}</div>
              <div class="text-xs text-gray-500">播放</div>
            </div>
            <div class="text-right ml-4">
              <div class="font-bold text-red-500">{{ formatNumber(video.like_count) }}</div>
              <div class="text-xs text-gray-500">点赞</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Data Table -->
      <div class="card">
        <h3 class="font-bold mb-4">视频明细</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="text-left py-2 px-3 font-medium text-gray-600">标题</th>
                <th class="text-left py-2 px-3 font-medium text-gray-600">发布时间</th>
                <th class="text-right py-2 px-3 font-medium text-gray-600">播放</th>
                <th class="text-right py-2 px-3 font-medium text-gray-600">点赞</th>
                <th class="text-right py-2 px-3 font-medium text-gray-600">评论</th>
                <th class="text-right py-2 px-3 font-medium text-gray-600">分享</th>
                <th class="text-right py-2 px-3 font-medium text-gray-600">收藏</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="video in sortedVideos" 
                :key="video.id"
                class="border-b border-gray-100 hover:bg-gray-50"
              >
                <td class="py-2 px-3 max-w-xs truncate">{{ video.title || '未命名' }}</td>
                <td class="py-2 px-3">{{ video.publish_time || '-' }}</td>
                <td class="py-2 px-3 text-right">{{ formatNumber(video.play_count) }}</td>
                <td class="py-2 px-3 text-right text-red-500">{{ formatNumber(video.like_count) }}</td>
                <td class="py-2 px-3 text-right">{{ formatNumber(video.comment_count) }}</td>
                <td class="py-2 px-3 text-right">{{ formatNumber(video.share_count) }}</td>
                <td class="py-2 px-3 text-right">{{ formatNumber(video.collect_count) }}</td>
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
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart, PieChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { exportVideoReportPDF } from '../lib/export'

use([CanvasRenderer, LineChart, BarChart, PieChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent])

const dataStore = useDataStore()

onMounted(() => {
  dataStore.loadData()
})

const hasData = computed(() => dataStore.videos.length > 0)
const stats = computed(() => dataStore.videoStats || {
  videoCount: 0, totalPlay: 0, totalLike: 0, engagementRate: '0.00',
  avgPlay: 0, avgLike: 0, topVideos: []
})

const sortedVideos = computed(() => {
  return [...dataStore.videos].sort((a, b) => {
    const playA = parseFloat(a.play_count) || 0
    const playB = parseFloat(b.play_count) || 0
    return playB - playA
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

function exportPDF() {
  if (!dataStore.videoStats || dataStore.videos.length === 0) {
    alert('没有数据可导出')
    return
  }
  exportVideoReportPDF(dataStore.videos, dataStore.videoStats)
}

// ========== Chart Options ==========
const chartData = computed(() => {
  const videos = [...dataStore.videos].sort((a, b) => {
    const dateA = new Date(a.publish_time || 0)
    const dateB = new Date(b.publish_time || 0)
    return dateA - dateB
  })
  
  return {
    dates: videos.map(v => v.publish_time || '').slice(-20), // Last 20
    play: videos.map(v => parseFloat(v.play_count) || 0).slice(-20),
    like: videos.map(v => parseFloat(v.like_count) || 0).slice(-20),
    comment: videos.map(v => parseFloat(v.comment_count) || 0).slice(-20),
    share: videos.map(v => parseFloat(v.share_count) || 0).slice(-20),
    collect: videos.map(v => parseFloat(v.collect_count) || 0).slice(-20)
  }
})

const playChartOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: chartData.value.dates, axisLabel: { rotate: 45 } },
  yAxis: { type: 'value', axisLabel: { formatter: v => v >= 10000 ? (v/10000).toFixed(1) + 'w' : v } },
  series: [{
    data: chartData.value.play,
    type: 'bar',
    itemStyle: { color: '#0071e3', borderRadius: [4, 4, 0, 0] }
  }]
}))

const engagementChartOption = computed(() => {
  const totals = {
    点赞: dataStore.videos.reduce((sum, v) => sum + (parseFloat(v.like_count) || 0), 0),
    评论: dataStore.videos.reduce((sum, v) => sum + (parseFloat(v.comment_count) || 0), 0),
    分享: dataStore.videos.reduce((sum, v) => sum + (parseFloat(v.share_count) || 0), 0),
    收藏: dataStore.videos.reduce((sum, v) => sum + (parseFloat(v.collect_count) || 0), 0)
  }
  
  return {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: [
        { value: totals.点赞, name: '点赞', itemStyle: { color: '#ff3b30' } },
        { value: totals.评论, name: '评论', itemStyle: { color: '#0071e3' } },
        { value: totals.分享, name: '分享', itemStyle: { color: '#34c759' } },
        { value: totals.收藏, name: '收藏', itemStyle: { color: '#ff9f0a' } }
      ]
    }]
  }
})
</script>
