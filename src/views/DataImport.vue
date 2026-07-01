<template>
  <div class="max-w-6xl mx-auto p-6">
    <!-- Loading state -->
    <div v-if="dataStore.isLoading" class="text-center py-12">
      <div class="text-2xl mb-2">⏳</div>
      <div class="text-gray-500">加载中...</div>
    </div>

    <template v-else>
    <!-- Header -->
    <div class="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold mb-2">数据导入</h1>
        <p class="text-gray-500">支持 Excel / 截图 OCR / 手动录入 / 自动化导入等多种方式导入直播或短视频数据</p>
      </div>
      <button @click="exportAllData" class="btn-secondary text-sm">
        📥 导出全部数据
      </button>
    </div>

    <!-- Import Type Selection -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      <button
        @click="setImportType('live')"
        :class="[
          'card p-6 text-left transition-all cursor-pointer border-2',
          importType === 'live' ? 'border-primary bg-blue-50' : 'border-transparent hover:border-gray-200'
        ]"
      >
        <div class="text-3xl mb-3">📺</div>
        <h3 class="font-bold text-lg mb-1">直播数据</h3>
        <p class="text-sm text-gray-500">导入直播场次、观看人数、GMV、成交订单等数据</p>
        <div class="mt-3 text-xs text-gray-400">
          推荐字段：直播日期、直播时长、场均观看、直播GMV、成交订单数
        </div>
      </button>
      
      <button
        @click="setImportType('video')"
        :class="[
          'card p-6 text-left transition-all cursor-pointer border-2',
          importType === 'video' ? 'border-primary bg-blue-50' : 'border-transparent hover:border-gray-200'
        ]"
      >
        <div class="text-3xl mb-3">🎬</div>
        <h3 class="font-bold text-lg mb-1">短视频数据</h3>
        <p class="text-sm text-gray-500">导入视频播放量、点赞、评论、分享、收藏等数据</p>
        <div class="mt-3 text-xs text-gray-400">
          推荐字段：视频标题、发布时间、播放量、点赞数、评论数、分享数
        </div>
      </button>
    </div>

    <!-- Bookmarklet Auto-Import Banner (shown when data arrives from URL) -->
    <div v-if="bookmarkletData" class="card mb-6 p-4 bg-gradient-to-r from-[#E85D4E]/10 to-[#FF8A7A]/5 border border-[#E85D4E]/20">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E85D4E] to-[#FF8A7A] flex items-center justify-center text-white text-lg">🎯</div>
        <div class="flex-1">
          <h3 class="font-bold text-[#E85D4E]">自动化数据已送达</h3>
          <p class="text-sm text-gray-600">从抖音后台提取到 <strong>{{ bookmarkletData.data?.length || 0 }}</strong> 分钟的趋势数据，请确认导入</p>
        </div>
        <button @click="confirmBookmarkletImport" class="btn-primary text-sm">
          ✅ 确认导入
        </button>
      </div>
    </div>

    <!-- Source Tabs -->
    <div v-if="importType" class="card mb-6 p-2">
      <div class="flex space-x-1 overflow-x-auto">
        <button
          v-for="tab in filteredSourceTabs"
          :key="tab.key"
          @click="activeSource = tab.key"
          class="px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors"
          :class="activeSource === tab.key ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- File Upload -->
    <div 
      v-if="importType && activeSource === 'file'"
      class="card p-8 mb-6"
      :class="{ 'border-primary border-2 border-dashed': isDragging }"
      @dragenter.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @dragover.prevent
      @drop.prevent="handleDrop"
    >
      <div class="text-center">
        <div class="text-5xl mb-4">📁</div>
        <h3 class="font-bold text-lg mb-2">拖拽文件到此处上传</h3>
        <p class="text-gray-500 mb-4">或者点击选择文件</p>
        <input
          ref="fileInput"
          type="file"
          accept=".xlsx,.xls,.csv"
          class="hidden"
          @change="handleFileSelect"
        />
        <button 
          @click="$refs.fileInput.click()"
          class="btn-primary"
          :disabled="isProcessing"
        >
          {{ isProcessing ? '处理中...' : '选择文件' }}
        </button>
        
        <!-- Template Download -->
        <div class="mt-4 pt-4 border-t border-gray-100">
          <p class="text-sm text-gray-500 mb-2">没有数据文件？下载模板：</p>
          <button @click="downloadTemplate" class="text-sm text-primary hover:underline">
            📥 下载 {{ importType === 'live' ? '直播' : '短视频' }}数据模板
          </button>
        </div>
      </div>
    </div>

    <!-- Bookmarklet Source -->
    <div v-if="importType && activeSource === 'bookmarklet'" class="card p-8 mb-6">
      <div class="text-center">
        <div class="text-5xl mb-4">⚡</div>
        <h3 class="font-bold text-lg mb-2">自动化导入（Bookmarklet）</h3>
        <p class="text-gray-500 mb-6">通过浏览器书签工具，一键从抖音后台提取数据</p>

        <!-- PC Only Warning -->
        <div class="flex items-start gap-3 p-3 bg-amber-50 rounded-lg mb-6 text-left max-w-md mx-auto">
          <span class="text-lg">💻</span>
          <div>
            <p class="text-sm font-medium text-amber-800">仅支持电脑版浏览器</p>
            <p class="text-xs text-amber-600">请使用 Chrome / Edge 浏览器操作</p>
          </div>
        </div>

        <!-- Bookmarklet Drag Zone -->
        <div class="bg-gradient-to-br from-[#FFF5F3] to-[#FFFBF7] border-2 border-dashed border-[#E85D4E] rounded-xl p-6 mb-6 max-w-md mx-auto">
          <p class="text-sm font-medium text-gray-700 mb-3">Step 1：将下方按钮拖拽到浏览器书签栏</p>
          <a
            :href="bookmarkletCode"
            class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#E85D4E] to-[#D45040] text-white font-bold rounded-xl shadow-lg cursor-move hover:shadow-xl transition-all"
            onclick="alert('请将此按钮拖拽到书签栏，不要点击！'); return false;"
          >
            <span>🎯</span>
            <span>提取到数据站</span>
          </a>
          <p class="text-xs text-[#E85D4E] mt-3 font-medium">← 按住鼠标左键，拖到浏览器顶部的书签栏</p>
          <p class="text-xs text-gray-400 mt-1">看不到书签栏？按 Ctrl + Shift + B 显示</p>
        </div>

        <!-- Steps -->
        <div class="text-left max-w-md mx-auto space-y-3">
          <p class="text-sm font-medium text-gray-700">Step 2：按以下步骤操作</p>

          <div class="flex gap-3">
            <div class="w-7 h-7 rounded-full bg-gradient-to-br from-[#E85D4E] to-[#FF8A7A] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">1</div>
            <p class="text-sm text-gray-600">打开 <a href="https://fxg.jinritemai.com" target="_blank" class="text-[#E85D4E] font-medium underline">抖音创作者服务中心</a> 并登录</p>
          </div>

          <div class="flex gap-3">
            <div class="w-7 h-7 rounded-full bg-gradient-to-br from-[#E85D4E] to-[#FF8A7A] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">2</div>
            <p class="text-sm text-gray-600">进入「直播数据」→「直播复盘」页面</p>
          </div>

          <div class="flex gap-3">
            <div class="w-7 h-7 rounded-full bg-gradient-to-br from-[#E85D4E] to-[#FF8A7A] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">3</div>
            <p class="text-sm text-gray-600">点击书签栏上的 <span class="font-bold text-[#E85D4E]">🎯 提取到数据站</span></p>
          </div>

          <div class="flex gap-3">
            <div class="w-7 h-7 rounded-full bg-gradient-to-br from-[#E85D4E] to-[#FF8A7A] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">4</div>
            <p class="text-sm text-gray-600">右上角弹出面板，确认提取到的数据</p>
          </div>

          <div class="flex gap-3">
            <div class="w-7 h-7 rounded-full bg-gradient-to-br from-[#E85D4E] to-[#FF8A7A] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">5</div>
            <p class="text-sm text-gray-600">点击 <span class="font-bold">📤 发送</span>，数据自动导入本网站</p>
          </div>
        </div>

        <!-- Tip -->
        <div class="mt-6 p-4 bg-gray-50 rounded-lg text-left max-w-md mx-auto">
          <p class="text-xs text-gray-500">
            <span class="font-bold">💡 提示：</span>此功能通过浏览器书签工具读取抖音后台页面数据，数据仅保存在当前浏览器中。
          </p>
        </div>
      </div>
    </div>

    <!-- Screenshot OCR -->
    <div v-if="importType && activeSource === 'ocr'" class="space-y-6 mb-6">
      <div 
        v-if="!ocrImage"
        class="card p-8"
        :class="{ 'border-primary border-2 border-dashed': isDragging }"
        @dragenter.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @dragover.prevent
        @drop.prevent="handleImageDrop"
      >
        <div class="text-center">
          <div class="text-5xl mb-4">📸</div>
          <h3 class="font-bold text-lg mb-2">上传抖音后台截图</h3>
          <p class="text-gray-500 mb-4">支持 PNG / JPG 格式，截图需包含表格数据</p>
          <input
            ref="imageInput"
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            class="hidden"
            @change="handleImageSelect"
          />
          <button 
            @click="$refs.imageInput.click()"
            class="btn-primary"
            :disabled="isProcessing"
          >
            {{ isProcessing ? '处理中...' : '选择截图' }}
          </button>
        </div>
      </div>

      <div v-else class="card">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="sm:w-1/3">
            <img :src="ocrImage" class="rounded-lg border border-gray-200 w-full" alt="OCR preview" />
          </div>
          <div class="sm:w-2/3">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-bold">识别结果</h3>
              <button @click="resetOcr" class="text-sm text-gray-500 hover:text-gray-700">
                重新上传
              </button>
            </div>
            <div v-if="ocrProgress" class="mb-3 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
              {{ ocrProgress }}
            </div>
            <textarea
              v-model="ocrText"
              rows="8"
              class="input-field font-mono text-sm"
              placeholder="OCR 识别文本，可在此手动修正..."
            ></textarea>
            <div class="mt-3 flex space-x-3">
              <button 
                @click="runOcrParse"
                class="btn-primary"
                :disabled="!ocrText.trim() || isProcessing"
              >
                解析数据
              </button>
              <button 
                @click="resetOcr"
                class="btn-secondary"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Manual Input -->
    <div v-if="importType && activeSource === 'manual'" class="space-y-6 mb-6">
      <!-- Single Entry Form -->
      <div class="card">
        <h3 class="font-bold mb-4">单条录入</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div v-for="field in manualFields" :key="field.key">
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ field.label }}</label>
            <input
              v-model="manualForm[field.key]"
              :type="field.type || 'text'"
              class="input-field"
              :placeholder="field.placeholder"
            />
          </div>
        </div>
        <button 
          @click="addManualRow"
          class="btn-primary"
          :disabled="!hasManualData"
        >
          添加到预览
        </button>
      </div>

      <!-- Batch Paste -->
      <div class="card">
        <h3 class="font-bold mb-4">批量粘贴</h3>
        <p class="text-sm text-gray-500 mb-3">从 Excel 复制多行数据，直接粘贴到下方（支持 Tab/逗号分隔）</p>
        <textarea
          v-model="batchText"
          rows="6"
          class="input-field font-mono text-sm mb-4"
          :placeholder="batchPlaceholder"
        ></textarea>
        <button 
          @click="parseBatchText"
          class="btn-primary"
          :disabled="!batchText.trim()"
        >
          解析粘贴内容
        </button>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div class="flex items-center">
        <span class="text-red-500 mr-2">⚠️</span>
        <span class="text-red-700">{{ error }}</span>
      </div>
    </div>

    <!-- Data Preview -->
    <div v-if="previewData.length > 0" class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold">数据预览 (共 {{ previewData.length }} 条)</h2>
        <div class="space-x-2">
          <button @click="clearPreview" class="btn-secondary text-sm">
            重新选择
          </button>
          <button @click="confirmImport" class="btn-primary text-sm" :disabled="isProcessing">
            ✅ 确认导入
          </button>
        </div>
      </div>
      
      <div class="card overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-200">
              <th v-for="header in previewHeaders" :key="header" class="text-left py-2 px-3 font-medium text-gray-600 whitespace-nowrap">
                {{ header }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in previewData" :key="index" class="border-b border-gray-100 hover:bg-gray-50">
              <td v-for="header in previewHeaders" :key="header" class="py-2 px-3 whitespace-nowrap">
                {{ row[header] !== undefined ? row[header] : '-' }}
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="parsedData.length > 10" class="text-center py-3 text-gray-500 text-sm">
          ... 还有 {{ parsedData.length - 10 }} 条数据
        </div>
      </div>
    </div>

    <!-- Import History -->
    <div v-if="dataStore.importHistory.length > 0">
      <h2 class="text-lg font-bold mb-4">导入历史</h2>
      <div class="space-y-3">
        <div 
          v-for="item in dataStore.importHistory" 
          :key="item.id"
          class="card flex items-center justify-between"
        >
          <div class="flex items-center space-x-4">
            <span class="text-2xl">{{ item.type === 'live' ? '📺' : '🎬' }}</span>
            <div>
              <div class="font-medium">
                {{ item.type === 'live' ? '直播数据' : '短视频数据' }}
                <span class="text-gray-500">({{ item.count }} 条)</span>
              </div>
              <div class="text-sm text-gray-400">{{ item.timestamp }}</div>
            </div>
          </div>
          <button 
            @click="dataStore.removeImportHistoryItem(item.id)"
            class="text-gray-400 hover:text-red-500 transition-colors"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>

    <!-- Success Toast -->
    <div 
      v-if="showSuccess"
      class="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity"
    >
      ✅ 导入成功！{{ successCount }} 条数据已保存
      <p class="text-xs mt-1">{{ importType === 'live' ? '正在跳转到直播分析...' : '正在跳转到短视频分析...' }}</p>
    </div>
    </template>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as XLSX from 'xlsx'
import Tesseract from 'tesseract.js'
import { useDataStore } from '../stores/data'
import { exportAllDataExcel } from '../lib/export'
import { parseOcrText } from '../lib/ocrParser'

const route = useRoute()
const router = useRouter()
const dataStore = useDataStore()

const importType = ref('')
const activeSource = ref('file')
const isDragging = ref(false)
const isProcessing = ref(false)
const error = ref('')
const fileInput = ref(null)

const parsedData = ref([])
const previewData = ref([])
const previewHeaders = ref([])

const showSuccess = ref(false)
const successCount = ref(0)

// Bookmarklet
const bookmarkletData = ref(null)
const sourceTabs = [
  { key: 'file', label: '📁 文件导入' },
  { key: 'bookmarklet', label: '⚡ 自动化导入' },
  { key: 'ocr', label: '📸 截图 OCR' },
  { key: 'manual', label: '✏️ 手动录入' }
]

// Show bookmarklet tab only for live data
const filteredSourceTabs = computed(() => {
  if (importType.value === 'video') {
    return sourceTabs.filter(t => t.key !== 'bookmarklet')
  }
  return sourceTabs
})

const manualForm = ref({})
const batchText = ref('')
const ocrImage = ref('')
const ocrText = ref('')
const ocrProgress = ref('')

// Check for bookmarklet data in URL on mount
onMounted(() => {
  dataStore.loadData()
  checkBookmarkletData()
})

function checkBookmarkletData() {
  const source = route.query.source
  const data = route.query.data
  
  if (source === 'bookmarklet' && data) {
    try {
      const decoded = JSON.parse(decodeURIComponent(atob(data)))
      if (decoded.data && decoded.data.length > 0) {
        bookmarkletData.value = decoded
        importType.value = 'live'
        activeSource.value = 'bookmarklet'
        // Parse the minute data into preview
        const rows = decoded.data.map((d, i) => ({
          '分钟': d.minute,
          '时间': formatMinuteTime(d.minute),
          '在线人数': d.online,
          '进入人数': d.enter,
          '离开人数': d.leave,
          '净变化': d.enter - d.leave
        }))
        setParsedData(rows)
      }
    } catch (err) {
      console.error('Failed to parse bookmarklet data:', err)
    }
  }
}

function formatMinuteTime(minute) {
  const h = Math.floor(minute / 60)
  const m = minute % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function confirmBookmarkletImport() {
  if (!bookmarkletData.value) return
  confirmImport()
  // Clean URL
  router.replace({ path: '/import', query: {} })
}

function setImportType(type) {
  importType.value = type
  clearPreview()
  resetManualForm()
  // Reset active source if bookmarklet not available
  if (type === 'video' && activeSource.value === 'bookmarklet') {
    activeSource.value = 'file'
  }
}

const manualFields = computed(() => {
  if (importType.value === 'live') {
    return [
      { key: '直播日期', label: '直播日期', placeholder: '2024-01-15', type: 'date' },
      { key: '直播时长', label: '直播时长(分钟)', placeholder: '120', type: 'number' },
      { key: '场均观看', label: '场均观看', placeholder: '15000', type: 'number' },
      { key: '直播GMV', label: '直播GMV', placeholder: '50000', type: 'number' },
      { key: '成交订单数', label: '成交订单数', placeholder: '320', type: 'number' },
      { key: '新增粉丝', label: '新增粉丝', placeholder: '850', type: 'number' },
      { key: '互动人数', label: '互动人数', placeholder: '4200', type: 'number' }
    ]
  }
  return [
    { key: '视频标题', label: '视频标题', placeholder: '爆款视频教程 #1' },
    { key: '发布时间', label: '发布时间', placeholder: '2024-01-15 10:30' },
    { key: '播放量', label: '播放量', placeholder: '500000', type: 'number' },
    { key: '点赞数', label: '点赞数', placeholder: '25000', type: 'number' },
    { key: '评论数', label: '评论数', placeholder: '1200', type: 'number' },
    { key: '分享数', label: '分享数', placeholder: '800', type: 'number' },
    { key: '收藏数', label: '收藏数', placeholder: '3500', type: 'number' },
    { key: '完播率', label: '完播率(%)', placeholder: '45', type: 'number' }
  ]
})

const batchPlaceholder = computed(() => {
  if (importType.value === 'live') {
    return `2024-01-15\t120\t15000\t50000\t320\t850\t4200
2024-01-16\t90\t12000\t35000\t210\t620\t3100`
  }
  return `爆款视频教程 #1\t2024-01-15 10:30\t500000\t25000\t1200\t800\t3500\t45
日常分享 #2\t2024-01-16 15:00\t120000\t8000\t450\t320\t1200\t38`
})

const hasManualData = computed(() => {
  return manualFields.value.some(f => manualForm.value[f.key] !== undefined && manualForm.value[f.key] !== '')
})

function resetManualForm() {
  manualForm.value = {}
  batchText.value = ''
  resetOcr()
}

function resetOcr() {
  ocrImage.value = ''
  ocrText.value = ''
  ocrProgress.value = ''
}

// ========== Bookmarklet Code ==========
const bookmarkletCode = ref(`javascript:(function(){
  var SITE='https://060224.top';
  function showPanel(data){
    var old=document.getElementById('ds-panel');
    if(old)old.remove();
    var p=document.createElement('div');
    p.id='ds-panel';
    p.style.cssText='position:fixed;top:20px;right:20px;width:360px;background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:16px;padding:20px;z-index:999999;color:#fff;font-family:system-ui,sans-serif;box-shadow:0 20px 60px rgba(0,0,0,0.4);';
    var hasData=data&&data.length>0;
    var netChange=hasData?data.reduce(function(s,d){return s+(d.enter-d.leave)},0):0;
    p.innerHTML='<style>@keyframes dsIn{from{transform:translateX(100px);opacity:0}to{transform:translateX(0);opacity:1}}.ds-h{display:flex;align-items:center;gap:10px;margin-bottom:14px}.ds-lg{width:36px;height:36px;background:linear-gradient(135deg,#E85D4E,#FF8A7A);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px}.ds-t{font-size:15px;font-weight:700;margin:0}.ds-s{font-size:11px;color:rgba(255,255,255,0.5);margin:0}.ds-st{display:flex;align-items:center;gap:8px;margin:10px 0;padding:10px;border-radius:10px;font-size:12px;background:'+(hasData?'rgba(0,201,167,0.15);color:#00C9A7':'rgba(255,184,0,0.15);color:#FFB800')+';}.ds-b{width:100%;padding:10px;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;margin-top:6px}.ds-b1{background:linear-gradient(135deg,#E85D4E,#D45040);color:#fff}.ds-b1:hover{transform:translateY(-1px)}.ds-b2{background:rgba(255,255,255,0.1);color:#fff;margin-top:4px}.ds-x{position:absolute;top:10px;right:14px;background:none;border:none;color:rgba(255,255,255,0.5);font-size:18px;cursor:pointer}</style><button class=ds-x onclick="document.getElementById(\'ds-panel\').remove()">✕</button><div class=ds-h><div class=ds-lg>🎯</div><div><div class=ds-t>数据站</div><div class=ds-s>数据提取工具</div></div></div><div class=ds-st>'+(hasData?'✓ 提取到 '+data.length+' 分钟数据，净变化 '+netChange+' 人':'⏳ 未检测到趋势图表数据')+'</div>'+(hasData?'<button class="ds-b ds-b1" id=ds-send>📤 发送到 060224.top</button>':'<div style="font-size:11px;color:rgba(255,255,255,0.5);margin:8px 0">提示：请打开抖音直播复盘页面，确保趋势明细图表已加载</div>')+'<button class="ds-b ds-b2" onclick="document.getElementById(\'ds-panel\').remove()\">关闭</button>';
    document.body.appendChild(p);
    if(hasData){
      document.getElementById('ds-send').onclick=function(){
        var json=JSON.stringify({source:'bookmarklet',timestamp:Date.now(),data:data,url:location.href});
        var enc=btoa(encodeURIComponent(json));
        window.open(SITE+'/import?source=bookmarklet&data='+enc,'_blank');
      };
    }
  }
  function extractData(){
    var extracted=[];
    if(typeof echarts!=='undefined'){
      var inst=echarts.getInstanceByDom(document.querySelector('[class*=chart]'));
      if(!inst){
        var charts=document.querySelectorAll('div');
        for(var i=0;i<charts.length;i++){
          var c=echarts.getInstanceByDom(charts[i]);
          if(c){inst=c;break;}
        }
      }
      if(inst){
        var opt=inst.getOption();
        var s=opt.series;
        if(s&&s.length>0){
          var online=s[0].data||[];
          var enter=s[1]?s[1].data:[];
          var leave=s[2]?s[2].data:[];
          for(var j=0;j<online.length;j++){
            var v=online[j];
            extracted.push({
              minute:j,
              online:(v&&v.value!==undefined)?v.value:v||0,
              enter:(enter[j]&&(enter[j].value!==undefined))?enter[j].value:enter[j]||0,
              leave:(leave[j]&&(leave[j].value!==undefined))?leave[j].value:leave[j]||0
            });
          }
        }
      }
    }
    if(extracted.length===0){
      var rows=document.querySelectorAll('table tr');
      rows.forEach(function(r,i){
        if(i===0)return;
        var cells=r.querySelectorAll('td');
        if(cells.length>=3){
          var t=cells[0].textContent.trim();
          var n=parseInt(cells[1].textContent.replace(/[^0-9]/g,''))||0;
          extracted.push({minute:i-1,time:t,online:n,enter:0,leave:0});
        }
      });
    }
    return extracted;
  }
  showPanel(extractData());
})();`)

// ========== File Handling ==========
function handleDrop(e) {
  isDragging.value = false
  const files = e.dataTransfer.files
  if (files.length > 0) {
    processFile(files[0])
  }
}

function handleFileSelect(e) {
  const files = e.target.files
  if (files.length > 0) {
    processFile(files[0])
  }
}

function processFile(file) {
  if (!importType.value) {
    error.value = '请先选择数据类型（直播或短视频）'
    return
  }
  
  error.value = ''
  isProcessing.value = true

  const reader = new FileReader()
  
  reader.onload = (e) => {
    try {
      const data = e.target.result
      const workbook = XLSX.read(data, { type: 'binary' })
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })
      
      if (jsonData.length < 2) {
        error.value = '文件中没有有效数据（需要至少包含表头和一行数据）'
        isProcessing.value = false
        return
      }

      parseRows(jsonData[0].map(h => String(h).trim()), jsonData.slice(1))
      isProcessing.value = false
    } catch (err) {
      error.value = '文件解析失败：' + err.message
      isProcessing.value = false
    }
  }

  reader.onerror = () => {
    error.value = '文件读取失败'
    isProcessing.value = false
  }

  reader.readAsBinaryString(file)
}

// ========== OCR Handling ==========
function handleImageDrop(e) {
  isDragging.value = false
  const files = e.dataTransfer.files
  if (files.length > 0) {
    processImage(files[0])
  }
}

function handleImageSelect(e) {
  const files = e.target.files
  if (files.length > 0) {
    processImage(files[0])
  }
}

function processImage(file) {
  if (!file.type.startsWith('image/')) {
    error.value = '请上传图片文件（PNG/JPG）'
    return
  }

  error.value = ''
  const reader = new FileReader()
  reader.onload = (e) => {
    ocrImage.value = e.target.result
    runOcr()
  }
  reader.readAsDataURL(file)
}

async function runOcr() {
  if (!ocrImage.value) return
  
  isProcessing.value = true
  ocrProgress.value = '正在识别图片文字...'
  ocrText.value = ''

  try {
    const result = await Tesseract.recognize(
      ocrImage.value,
      'chi_sim+eng',
      {
        logger: m => {
          if (m.status === 'recognizing text') {
            ocrProgress.value = `识别进度: ${Math.round(m.progress * 100)}%`
          }
        }
      }
    )
    ocrText.value = result.data.text
    ocrProgress.value = '识别完成，请点击"解析数据"'
  } catch (err) {
    error.value = 'OCR 识别失败：' + err.message
    ocrProgress.value = ''
  } finally {
    isProcessing.value = false
  }
}

function runOcrParse() {
  error.value = ''
  try {
    const { records } = parseOcrText(ocrText.value, importType.value)
    if (records.length === 0) {
      error.value = '未能解析出有效数据，请检查 OCR 文本或手动修正'
      return
    }
    setParsedData(records)
  } catch (err) {
    error.value = err.message
  }
}

// ========== Manual Input ==========
function addManualRow() {
  const row = {}
  manualFields.value.forEach(f => {
    row[f.key] = manualForm.value[f.key] || ''
  })
  parsedData.value.push(row)
  updatePreview()
  resetManualForm()
}

function parseBatchText() {
  error.value = ''
  const lines = batchText.value.trim().split('\n').filter(l => l.trim())
  if (lines.length === 0) {
    error.value = '粘贴内容为空'
    return
  }

  const headers = manualFields.value.map(f => f.key)
  const rows = lines.map(line => {
    const cols = line.split(/\t|,/)
    const row = {}
    headers.forEach((h, i) => {
      row[h] = cols[i] ? cols[i].trim() : ''
    })
    return row
  })

  parsedData.value = [...parsedData.value, ...rows]
  updatePreview()
  batchText.value = ''
}

// ========== Common Parsing ==========
function parseRows(headers, rows) {
  const cleanHeaders = headers.map(h => String(h).trim())
  const dataRows = rows.map(row => {
    const obj = {}
    cleanHeaders.forEach((h, i) => {
      obj[h] = row[i] !== undefined ? row[i] : ''
    })
    return obj
  }).filter(row => Object.values(row).some(v => v !== ''))

  setParsedData(dataRows)
}

function setParsedData(data) {
  parsedData.value = data
  updatePreview()
}

function updatePreview() {
  if (parsedData.value.length === 0) {
    previewData.value = []
    previewHeaders.value = []
    return
  }
  previewHeaders.value = Object.keys(parsedData.value[0])
  previewData.value = parsedData.value.slice(0, 10)
}

function clearPreview() {
  parsedData.value = []
  previewData.value = []
  previewHeaders.value = []
  error.value = ''
  resetManualForm()
  bookmarkletData.value = null
}

// ========== Confirm Import ==========
async function confirmImport() {
  if (parsedData.value.length === 0) return
  
  isProcessing.value = true
  error.value = ''
  
  try {
    await dataStore.setImportedData(parsedData.value, importType.value)
    successCount.value = parsedData.value.length
    showSuccess.value = true
    
    clearPreview()
    
    // Auto-redirect to analysis page after successful import
    setTimeout(() => {
      showSuccess.value = false
      if (importType.value === 'live') {
        router.push('/live')
      } else if (importType.value === 'video') {
        router.push('/video')
      }
    }, 2000)
  } catch (err) {
    error.value = err.message || '导入失败'
  } finally {
    isProcessing.value = false
  }
}

// ========== Export All Data ==========
function exportAllData() {
  if (dataStore.liveSessions.length === 0 && dataStore.videos.length === 0) {
    alert('没有数据可导出')
    return
  }
  exportAllDataExcel(dataStore.liveSessions, dataStore.videos)
}

// ========== Template Download ==========
function downloadTemplate() {
  const headers = importType.value === 'live' 
    ? ['直播日期', '直播时长(分钟)', '场均观看', '直播GMV', '成交订单数', '新增粉丝', '互动人数']
    : ['视频标题', '发布时间', '播放量', '点赞数', '评论数', '分享数', '收藏数', '完播率(%)']
  
  const sampleData = importType.value === 'live'
    ? [
        ['2024-01-15', '120', '15000', '50000', '320', '850', '4200'],
        ['2024-01-16', '90', '12000', '35000', '210', '620', '3100'],
        ['2024-01-17', '150', '22000', '80000', '560', '1200', '6800']
      ]
    : [
        ['爆款视频教程 #1', '2024-01-15 10:30', '500000', '25000', '1200', '800', '3500', '45'],
        ['日常分享 #2', '2024-01-16 15:00', '120000', '8000', '450', '320', '1200', '38'],
        ['产品测评 #3', '2024-01-17 20:00', '350000', '18000', '890', '650', '2800', '52']
      ]

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
  
  const fileName = importType.value === 'live' ? '直播数据模板.xlsx' : '短视频数据模板.xlsx'
  XLSX.writeFile(wb, fileName)
}
</script>
