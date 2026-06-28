<template>
  <div class="max-w-6xl mx-auto p-6">
    <!-- Loading state -->
    <div v-if="dataStore.isLoading" class="text-center py-12">
      <div class="text-2xl mb-2">⏳</div>
      <div class="text-gray-500">加载中...</div>
    </div>

    <template v-else>
    <!-- Header -->
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold mb-2">数据导入</h1>
        <p class="text-gray-500">支持 Excel (.xlsx) 和 CSV (.csv) 格式，导入直播或短视频数据</p>
      </div>
      <button @click="exportAllData" class="btn-secondary text-sm">
        📥 导出全部数据
      </button>
    </div>

    <!-- Import Type Selection -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <button
        @click="importType = 'live'"
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
        @click="importType = 'video'"
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

    <!-- File Upload Area -->
    <div 
      v-if="importType"
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
          <button @click="previewData = []; parsedData = []" class="btn-secondary text-sm">
            重新选择
          </button>
          <button @click="confirmImport" class="btn-primary text-sm">
            ✅ 确认导入
          </button>
        </div>
      </div>
      
      <div class="card overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-200">
              <th v-for="header in previewHeaders" :key="header" class="text-left py-2 px-3 font-medium text-gray-600">
                {{ header }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in previewData" :key="index" class="border-b border-gray-100 hover:bg-gray-50">
              <td v-for="header in previewHeaders" :key="header" class="py-2 px-3">
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
    </div>
    </template>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import * as XLSX from 'xlsx'
import { exportAllDataExcel } from '../lib/export'

const router = useRouter()
const dataStore = useDataStore()

const importType = ref('')
const isDragging = ref(false)
const isProcessing = ref(false)
const error = ref('')
const fileInput = ref(null)

const parsedData = ref([])
const previewData = ref([])
const previewHeaders = ref([])

const showSuccess = ref(false)
const successCount = ref(0)

onMounted(() => {
  dataStore.loadData()
})

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

      // Parse headers and data
      const headers = jsonData[0].map(h => String(h).trim())
      const rows = jsonData.slice(1).map(row => {
        const obj = {}
        headers.forEach((h, i) => {
          obj[h] = row[i] !== undefined ? row[i] : ''
        })
        return obj
      }).filter(row => Object.values(row).some(v => v !== ''))

      if (rows.length === 0) {
        error.value = '未能解析出有效数据行'
        isProcessing.value = false
        return
      }

      parsedData.value = rows
      previewData.value = rows.slice(0, 10) // Show first 10
      previewHeaders.value = headers
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

// ========== Confirm Import ==========
function confirmImport() {
  if (parsedData.value.length === 0) return
  
  dataStore.setImportedData(parsedData.value, importType.value)
  successCount.value = parsedData.value.length
  showSuccess.value = true
  
  // Clear preview
  parsedData.value = []
  previewData.value = []
  previewHeaders.value = []
  
  setTimeout(() => {
    showSuccess.value = false
  }, 3000)
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
