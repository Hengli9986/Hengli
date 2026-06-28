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
        <p class="text-gray-500">支持 Excel / 截图 OCR / 手动录入等多种方式导入直播或短视频数据</p>
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

    <!-- Source Tabs -->
    <div v-if="importType" class="card mb-6 p-2">
      <div class="flex space-x-1 overflow-x-auto">
        <button
          v-for="tab in sourceTabs"
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
    </div>
    </template>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import * as XLSX from 'xlsx'
import Tesseract from 'tesseract.js'
import { exportAllDataExcel } from '../lib/export'
import { parseOcrText } from '../lib/ocrParser'

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

const sourceTabs = [
  { key: 'file', label: '📁 文件导入' },
  { key: 'ocr', label: '📸 截图 OCR' },
  { key: 'manual', label: '✏️ 手动录入' }
]

const manualForm = ref({})
const batchText = ref('')
const ocrImage = ref('')
const ocrText = ref('')
const ocrProgress = ref('')

onMounted(() => {
  dataStore.loadData()
})

function setImportType(type) {
  importType.value = type
  clearPreview()
  resetManualForm()
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
    
    setTimeout(() => {
      showSuccess.value = false
    }, 3000)
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
