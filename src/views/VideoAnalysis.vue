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
      <div class="flex items-center justify-center gap-4 flex-wrap">
        <router-link to="/import" class="btn-primary">
          去导入数据
        </router-link>
        <button @click="showAutoImport = true" class="btn-secondary">
          ⚡ 自动化导入
        </button>
      </div>
      <p class="text-xs text-gray-400 mt-4">💡 自动化导入仅支持电脑版浏览器</p>
    </div>

    <!-- Full Dashboard (shown when has data) -->
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

    <!-- Auto Import Modal (outside conditional to avoid v-if/v-else mismatch) -->
    <div v-if="showAutoImport" class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background: rgba(0,0,0,0.5);" @click.self="showAutoImport = false">
      <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-100">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E85D4E] to-[#FF8A7A] flex items-center justify-center text-white text-lg">⚡</div>
            <div>
              <h3 class="font-bold text-lg">自动化导入</h3>
              <p class="text-xs text-gray-400">一键从抖音后台提取视频数据</p>
            </div>
          </div>
          <button @click="showAutoImport = false" class="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <!-- Modal Body -->
        <div class="p-6">
          <!-- PC Only Warning -->
          <div class="flex items-start gap-3 p-3 bg-amber-50 rounded-lg mb-6">
            <span class="text-lg">💻</span>
            <div>
              <p class="text-sm font-medium text-amber-800">仅支持电脑版浏览器</p>
              <p class="text-xs text-amber-600">请使用 Chrome / Edge 浏览器操作</p>
            </div>
          </div>

          <!-- Bookmarklet Drag Zone -->
          <div class="bg-gradient-to-br from-[#FFF5F3] to-[#FFFBF7] border-2 border-dashed border-[#E85D4E] rounded-xl p-6 text-center mb-6">
            <p class="text-sm font-medium text-gray-700 mb-3">Step 1：将下方按钮拖拽到浏览器书签栏</p>
            <a
              :href="bookmarkletCode"
              class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#E85D4E] to-[#D45040] text-white font-bold rounded-xl shadow-lg cursor-move hover:shadow-xl transition-all"
              onclick="alert('请将此按钮拖拽到书签栏，不要点击！'); return false;"
            >
              <span>🎬</span>
              <span>提取视频数据</span>
            </a>
            <p class="text-xs text-[#E85D4E] mt-3 font-medium">← 按住鼠标左键，拖到浏览器顶部的书签栏</p>
            <p class="text-xs text-gray-400 mt-1">看不到书签栏？按 Ctrl + Shift + B 显示</p>
          </div>

          <!-- Steps -->
          <div class="space-y-4">
            <p class="text-sm font-medium text-gray-700">Step 2：按以下步骤操作</p>

            <div class="flex gap-3">
              <div class="w-7 h-7 rounded-full bg-gradient-to-br from-[#E85D4E] to-[#FF8A7A] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">1</div>
              <p class="text-sm text-gray-600">打开 <a href="https://fxg.jinritemai.com" target="_blank" class="text-[#E85D4E] font-medium underline">抖音创作者服务中心</a> 并登录</p>
            </div>

            <div class="flex gap-3">
              <div class="w-7 h-7 rounded-full bg-gradient-to-br from-[#E85D4E] to-[#FF8A7A] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">2</div>
              <p class="text-sm text-gray-600">进入「内容分析」→「视频数据」页面</p>
            </div>

            <div class="flex gap-3">
              <div class="w-7 h-7 rounded-full bg-gradient-to-br from-[#E85D4E] to-[#FF8A7A] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">3</div>
              <p class="text-sm text-gray-600">点击书签栏上的 <span class="font-bold text-[#E85D4E]">🎬 提取视频数据</span></p>
            </div>

            <div class="flex gap-3">
              <div class="w-7 h-7 rounded-full bg-gradient-to-br from-[#E85D4E] to-[#FF8A7A] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">4</div>
              <p class="text-sm text-gray-600">右上角弹出面板，确认提取到的视频数据</p>
            </div>

            <div class="flex gap-3">
              <div class="w-7 h-7 rounded-full bg-gradient-to-br from-[#E85D4E] to-[#FF8A7A] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">5</div>
              <p class="text-sm text-gray-600">点击 <span class="font-bold">📤 发送</span>，数据自动导入本网站</p>
            </div>

            <div class="flex gap-3">
              <div class="w-7 h-7 rounded-full bg-gradient-to-br from-[#E85D4E] to-[#FF8A7A] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">6</div>
              <p class="text-sm text-gray-600">自动跳转回来，视频数据已填好，直接查看分析</p>
            </div>
          </div>

          <!-- Tip -->
          <div class="mt-6 p-4 bg-gray-50 rounded-lg">
            <p class="text-xs text-gray-500">
              <span class="font-bold">💡 提示：</span>此功能通过浏览器书签工具（Bookmarklet）读取抖音后台页面数据，数据仅保存在当前浏览器中，不会上传到任何服务器。
            </p>
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
import { LineChart, BarChart, PieChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { exportVideoReportPDF } from '../lib/export'

use([CanvasRenderer, LineChart, BarChart, PieChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent])

const dataStore = {
  isLoading: false,
  importHistory: [],
  liveSessions: [],
  videos: [],
  loadData: () => {},
  setImportedData: async () => {},
  removeImportHistoryItem: () => {}
}

const showAutoImport = ref(false)

// Bookmarklet code for video data extraction
const bookmarkletCode = ref(`javascript:(function(){
  var SITE='https://060224.top';
  function showPanel(videos){
    var old=document.getElementById('ds-panel');
    if(old)old.remove();
    var p=document.createElement('div');
    p.id='ds-panel';
    p.style.cssText='position:fixed;top:20px;right:20px;width:360px;background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:16px;padding:20px;z-index:999999;color:#fff;font-family:system-ui,sans-serif;box-shadow:0 20px 60px rgba(0,0,0,0.4);';
    var hasData=videos&&videos.length>0;
    p.innerHTML='<style>@keyframes dsIn{from{transform:translateX(100px);opacity:0}to{transform:translateX(0);opacity:1}}.ds-h{display:flex;align-items:center;gap:10px;margin-bottom:14px}.ds-lg{width:36px;height:36px;background:linear-gradient(135deg,#E85D4E,#FF8A7A);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px}.ds-t{font-size:15px;font-weight:700;margin:0}.ds-s{font-size:11px;color:rgba(255,255,255,0.5);margin:0}.ds-st{display:flex;align-items:center;gap:8px;margin:10px 0;padding:10px;border-radius:10px;font-size:12px;background:'+(hasData?'rgba(0,201,167,0.15);color:#00C9A7':'rgba(255,184,0,0.15);color:#FFB800')+';}.ds-b{width:100%;padding:10px;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;margin-top:6px}.ds-b1{background:linear-gradient(135deg,#E85D4E,#D45040);color:#fff}.ds-b1:hover{transform:translateY(-1px)}.ds-b2{background:rgba(255,255,255,0.1);color:#fff;margin-top:4px}.ds-x{position:absolute;top:10px;right:14px;background:none;border:none;color:rgba(255,255,255,0.5);font-size:18px;cursor:pointer}</style><button class=ds-x onclick="document.getElementById(\'ds-panel\').remove()">✕</button><div class=ds-h><div class=ds-lg>🎬</div><div><div class=ds-t>数据站</div><div class=ds-s>视频数据提取工具</div></div></div><div class=ds-st>'+(hasData?'✓ 提取到 '+videos.length+' 条视频数据':'⏳ 未检测到视频数据')+'</div>'+(hasData?'<button class="ds-b ds-b1" id=ds-send>📤 发送到 060224.top</button>':'<div style="font-size:11px;color:rgba(255,255,255,0.5);margin:8px 0">提示：请打开抖音「内容分析」→「视频数据」页面</div>')+'<button class="ds-b ds-b2" onclick="document.getElementById(\'ds-panel\').remove()\">关闭</button>';
    document.body.appendChild(p);
    if(hasData){
      document.getElementById('ds-send').onclick=function(){
        var json=JSON.stringify({source:'bookmarklet_video',timestamp:Date.now(),videos:videos,url:location.href});
        var enc=btoa(encodeURIComponent(json));
        window.open(SITE+'/import?source=bookmarklet_video&data='+enc,'_blank');
      };
    }
  }
  function extractVideos(){
    var videos=[];
    var rows=document.querySelectorAll('table tr, [class*="video-item"], [class*="content-item"]');
    rows.forEach(function(r,i){
      if(i===0)return;
      var cells=r.querySelectorAll('td, [class*="cell"]');
      if(cells.length>=4){
        var title=cells[0].textContent.trim();
        var time=cells[1]?cells[1].textContent.trim():'';
        var play=parseInt(cells[2]?cells[2].textContent.replace(/[^0-9]/g,''):'0')||0;
        var like=parseInt(cells[3]?cells[3].textContent.replace(/[^0-9]/g,''):'0')||0;
        var comment=parseInt(cells[4]?cells[4].textContent.replace(/[^0-9]/g,''):'0')||0;
        var share=parseInt(cells[5]?cells[5].textContent.replace(/[^0-9]/g,''):'0')||0;
        var collect=parseInt(cells[6]?cells[6].textContent.replace(/[^0-9]/g,''):'0')||0;
        if(title&&play>0){
          videos.push({title:title,publish_time:time,play_count:play,like_count:like,comment_count:comment,share_count:share,collect_count:collect});
        }
      }
    });
    if(videos.length===0){
      var cards=document.querySelectorAll('[class*="video"], [class*="content"]');
      cards.forEach(function(c){
        var text=c.textContent.trim();
        var nums=text.match(/[\d,]+/g);
        if(text.length>5&&text.length<200&&nums&&nums.length>0){
          videos.push({title:text.substring(0,50),publish_time:'',play_count:parseInt(nums[0].replace(/,/g,''))||0,like_count:parseInt(nums[1]?nums[1].replace(/,/g,''):'0'),comment_count:0,share_count:0,collect_count:0});
        }
      });
    }
    return videos;
  }
  showPanel(extractVideos());
})();`)

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
