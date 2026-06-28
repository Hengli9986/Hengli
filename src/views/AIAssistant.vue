<template>
  <div class="max-w-6xl mx-auto p-6">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold">文案助手</h1>
      <p class="text-gray-500 mt-1">智能工具箱：违禁词检测、去 AI 味、文案诊断</p>
    </div>

    <!-- Tool Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <!-- 违禁词检测 -->
      <div 
        class="card p-6 cursor-pointer hover:shadow-lg transition-all border-2 border-transparent hover:border-red-200"
        :class="{ 'border-red-300 bg-red-50': activeTool === 'risk' }"
        @click="activeTool = 'risk'"
      >
        <div class="flex items-start space-x-4">
          <div class="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-2xl">🛡️</div>
          <div class="flex-1">
            <h3 class="font-bold text-lg mb-1">违禁词检测</h3>
            <p class="text-sm text-gray-500">检测短视频逐字稿是否违反抖音、小红书、视频号的社区规范，识别违规风险点</p>
            <div class="mt-2 flex flex-wrap gap-2">
              <span class="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">抖音</span>
              <span class="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">小红书</span>
              <span class="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">视频号</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 去 AI 味 -->
      <div 
        class="card p-6 cursor-pointer hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-200"
        :class="{ 'border-blue-300 bg-blue-50': activeTool === 'humanize' }"
        @click="activeTool = 'humanize'"
      >
        <div class="flex items-start space-x-4">
          <div class="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">✨</div>
          <div class="flex-1">
            <h3 class="font-bold text-lg mb-1">去 AI 味</h3>
            <p class="text-sm text-gray-500">识别并去除 AI 生成文本的痕迹，让文案更自然、更像人类书写</p>
            <div class="mt-2 flex flex-wrap gap-2">
              <span class="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">22 种特征检测</span>
              <span class="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">智能改写</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 视频文案/标题诊断 -->
      <div 
        class="card p-6 cursor-pointer hover:shadow-lg transition-all border-2 border-transparent hover:border-purple-200"
        :class="{ 'border-purple-300 bg-purple-50': activeTool === 'diagnose' }"
        @click="activeTool = 'diagnose'"
      >
        <div class="flex items-start space-x-4">
          <div class="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-2xl">🔍</div>
          <div class="flex-1">
            <h3 class="font-bold text-lg mb-1">视频文案/标题诊断</h3>
            <p class="text-sm text-gray-500">扫描文案中的 AI 生成痕迹，输出诊断报告。默认只诊断不改，帮你找到自己的写法</p>
            <div class="mt-2 flex flex-wrap gap-2">
              <span class="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded">22 条 AI 指纹</span>
              <span class="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded">深度追问</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Active Tool Panel -->
    <div v-if="activeTool" class="card">
      <!-- 违禁词检测面板 -->
      <template v-if="activeTool === 'risk'">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold flex items-center">
            <span class="mr-2">🛡️</span> 违禁词检测
          </h2>
          <button @click="activeTool = ''" class="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">目标平台</label>
          <div class="flex space-x-3">
            <button 
              v-for="platform in ['通用', '抖音', '小红书', '视频号']" 
              :key="platform"
              @click="riskForm.platform = platform"
              :class="[
                'px-4 py-2 rounded-lg text-sm transition-all',
                riskForm.platform === platform 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]"
            >
              {{ platform }}
            </button>
          </div>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">内容类型</label>
          <div class="flex space-x-3">
            <button 
              v-for="type in ['普通内容', '带货推广', '医疗健康', '金融投资']" 
              :key="type"
              @click="riskForm.contentType = type"
              :class="[
                'px-4 py-2 rounded-lg text-sm transition-all',
                riskForm.contentType === type 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]"
            >
              {{ type }}
            </button>
          </div>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">逐字稿内容</label>
          <textarea 
            v-model="riskForm.text"
            rows="8"
            class="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-200 focus:border-red-300 outline-none resize-none"
            placeholder="粘贴你的短视频逐字稿内容..."
          ></textarea>
        </div>

        <button 
          @click="checkRisk"
          :disabled="!riskForm.text || isAnalyzing"
          class="btn-primary w-full py-3"
          :class="{ 'opacity-50 cursor-not-allowed': !riskForm.text || isAnalyzing }"
        >
          {{ isAnalyzing ? '检测中...' : '🔍 开始检测' }}
        </button>

        <!-- Results -->
        <div v-if="riskResult" class="mt-6">
          <div 
            class="p-4 rounded-lg mb-4"
            :class="{
              'bg-red-50 border border-red-200': riskResult.level === 'high',
              'bg-yellow-50 border border-yellow-200': riskResult.level === 'medium',
              'bg-green-50 border border-green-200': riskResult.level === 'low'
            }"
          >
            <div class="flex items-center">
              <span class="text-2xl mr-2">
                {{ riskResult.level === 'high' ? '🔴' : riskResult.level === 'medium' ? '🟡' : '🟢' }}
              </span>
              <div>
                <div class="font-bold">
                  {{ riskResult.level === 'high' ? '高风险' : riskResult.level === 'medium' ? '中风险' : '低风险/无风险' }}
                </div>
                <div class="text-sm text-gray-600">{{ riskResult.summary }}</div>
              </div>
            </div>
          </div>

          <div v-if="riskResult.violations.length > 0" class="space-y-3">
            <div 
              v-for="(v, i) in riskResult.violations" 
              :key="i"
              class="p-4 bg-gray-50 rounded-lg"
            >
              <div class="flex items-start space-x-3">
                <span 
                  class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  :class="{
                    'bg-red-500': v.severity === 'high',
                    'bg-orange-500': v.severity === 'medium',
                    'bg-yellow-500': v.severity === 'low'
                  }"
                >
                  {{ i + 1 }}
                </span>
                <div class="flex-1">
                  <div class="font-medium text-red-600 mb-1">{{ v.type }}</div>
                  <div class="text-sm bg-red-50 p-2 rounded mb-2">"{{ v.text }}"</div>
                  <div class="text-sm text-gray-600 mb-2">{{ v.reason }}</div>
                  <div class="text-sm text-green-600">
                    <span class="font-medium">建议：</span>{{ v.suggestion }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- 去 AI 味面板 -->
      <template v-if="activeTool === 'humanize'">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold flex items-center">
            <span class="mr-2">✨</span> 去 AI 味
          </h2>
          <button @click="activeTool = ''" class="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">语气风格</label>
          <div class="flex space-x-3">
            <button 
              v-for="tone in ['随意自然', '专业正式', '幽默风趣', '情感真挚']" 
              :key="tone"
              @click="humanizeForm.tone = tone"
              :class="[
                'px-4 py-2 rounded-lg text-sm transition-all',
                humanizeForm.tone === tone 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]"
            >
              {{ tone }}
            </button>
          </div>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">输入文本</label>
          <textarea 
            v-model="humanizeForm.text"
            rows="8"
            class="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-300 outline-none resize-none"
            placeholder="粘贴需要去除 AI 味的文本..."
          ></textarea>
        </div>

        <button 
          @click="humanizeText"
          :disabled="!humanizeForm.text || isAnalyzing"
          class="btn-primary w-full py-3"
          :class="{ 'opacity-50 cursor-not-allowed': !humanizeForm.text || isAnalyzing }"
        >
          {{ isAnalyzing ? '处理中...' : '✨ 去除 AI 味' }}
        </button>

        <!-- Results -->
        <div v-if="humanizeResult" class="mt-6">
          <div class="mb-4">
            <div class="flex items-center justify-between mb-2">
              <span class="font-medium">AI 痕迹评分</span>
              <span 
                class="font-bold"
                :class="{
                  'text-red-500': humanizeResult.score > 70,
                  'text-yellow-500': humanizeResult.score > 40,
                  'text-green-500': humanizeResult.score <= 40
                }"
              >
                {{ humanizeResult.score }}/100
              </span>
            </div>
            <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                class="h-full rounded-full transition-all"
                :class="{
                  'bg-red-500': humanizeResult.score > 70,
                  'bg-yellow-500': humanizeResult.score > 40,
                  'bg-green-500': humanizeResult.score <= 40
                }"
                :style="{ width: humanizeResult.score + '%' }"
              ></div>
            </div>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">改写结果</label>
            <div class="p-4 bg-blue-50 rounded-lg text-sm leading-relaxed">
              {{ humanizeResult.text }}
            </div>
          </div>

          <div v-if="humanizeResult.changes.length > 0" class="space-y-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">修改明细</label>
            <div 
              v-for="(change, i) in humanizeResult.changes" 
              :key="i"
              class="flex items-start space-x-2 text-sm p-2 bg-gray-50 rounded"
            >
              <span class="text-blue-500">→</span>
              <div>
                <span class="text-red-500 line-through">{{ change.before }}</span>
                <span class="mx-2 text-gray-400">→</span>
                <span class="text-green-600">{{ change.after }}</span>
                <div class="text-xs text-gray-500 mt-1">{{ change.reason }}</div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- 视频文案/标题诊断面板 -->
      <template v-if="activeTool === 'diagnose'">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold flex items-center">
            <span class="mr-2">🔍</span> 视频文案/标题诊断
          </h2>
          <button @click="activeTool = ''" class="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">文案体裁</label>
          <div class="flex space-x-3">
            <button 
              v-for="type in ['短视频文稿', '公众号长文', '推文/社交媒体', '学术/正式文体']" 
              :key="type"
              @click="diagnoseForm.genre = type"
              :class="[
                'px-4 py-2 rounded-lg text-sm transition-all',
                diagnoseForm.genre === type 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]"
            >
              {{ type }}
            </button>
          </div>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">输入文案</label>
          <textarea 
            v-model="diagnoseForm.text"
            rows="8"
            class="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-300 outline-none resize-none"
            placeholder="粘贴你的视频文案或标题..."
          ></textarea>
        </div>

        <button 
          @click="diagnoseText"
          :disabled="!diagnoseForm.text || isAnalyzing"
          class="btn-primary w-full py-3"
          :class="{ 'opacity-50 cursor-not-allowed': !diagnoseForm.text || isAnalyzing }"
        >
          {{ isAnalyzing ? '诊断中...' : '🔍 开始诊断' }}
        </button>

        <!-- Results -->
        <div v-if="diagnoseResult" class="mt-6">
          <div class="mb-4">
            <div class="flex items-center justify-between mb-2">
              <span class="font-medium">AI 指纹命中数</span>
              <span class="font-bold text-purple-600">{{ diagnoseResult.fingerprints }} 处</span>
            </div>
          </div>

          <div v-if="diagnoseResult.findings.length > 0" class="space-y-4">
            <div 
              v-for="(finding, i) in diagnoseResult.findings" 
              :key="i"
              class="p-4 bg-gray-50 rounded-lg"
            >
              <div class="flex items-start space-x-3">
                <span 
                  class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  :class="{
                    'bg-red-500': finding.severity === 'high',
                    'bg-orange-500': finding.severity === 'medium',
                    'bg-yellow-500': finding.severity === 'low'
                  }"
                >
                  {{ i + 1 }}
                </span>
                <div class="flex-1">
                  <div class="text-sm bg-purple-50 p-2 rounded mb-2">"{{ finding.text }}"</div>
                  <div class="text-sm text-gray-700 mb-2">{{ finding.description }}</div>
                  <div class="text-xs text-gray-500">
                    特征 #{{ finding.feature }} {{ finding.featureName }} 
                    <span 
                      class="px-2 py-0.5 rounded text-xs"
                      :class="{
                        'bg-red-100 text-red-600': finding.severity === 'high',
                        'bg-orange-100 text-orange-600': finding.severity === 'medium',
                        'bg-yellow-100 text-yellow-600': finding.severity === 'low'
                      }"
                    >
                      {{ finding.severity === 'high' ? '强信号' : finding.severity === 'medium' ? '中信号' : '弱信号' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="diagnoseResult.summary" class="mt-4 p-4 bg-purple-50 rounded-lg">
            <div class="font-medium text-purple-800 mb-1">诊断总结</div>
            <div class="text-sm text-purple-700">{{ diagnoseResult.summary }}</div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const activeTool = ref('')
const isAnalyzing = ref(false)

// ========== 违禁词检测 ==========
const riskForm = reactive({
  platform: '通用',
  contentType: '普通内容',
  text: ''
})
const riskResult = ref(null)

// 违禁词库（简化版，实际可扩展）
const riskKeywords = {
  high: [
    // 法律红线
    { word: '毒品', type: '毒品相关', reason: '涉及毒品内容，法律零容忍' },
    { word: '赌博', type: '赌博推广', reason: '推广赌博活动，违反法律' },
    { word: '色情', type: '色情内容', reason: '色情内容禁止' },
    { word: '暴力', type: '暴力内容', reason: '暴力内容禁止' },
    { word: '诈骗', type: '诈骗信息', reason: '诈骗相关内容' },
    { word: '传销', type: '传销推广', reason: '传销活动禁止' },
    { word: '假币', type: '假币制造', reason: '假币相关内容' },
    { word: '黑客', type: '黑客攻击', reason: '黑客攻击相关内容' },
    // 医疗
    { word: '治好', type: '医疗承诺', reason: '承诺治愈疾病，涉嫌虚假宣传' },
    { word: '根治', type: '医疗承诺', reason: '承诺根治疾病，无资质医疗建议' },
    { word: '疗效', type: '医疗宣传', reason: '医疗疗效宣传需资质' },
    { word: '秘方', type: '虚假医疗', reason: '宣传秘方，涉嫌虚假医疗' },
  ],
  medium: [
    // 虚假宣传
    { word: '最', type: '极限用语', reason: '使用极限词，涉嫌虚假宣传' },
    { word: '第一', type: '极限用语', reason: '使用极限词，涉嫌虚假宣传' },
    { word: '绝对', type: '绝对化用语', reason: '绝对化用语需谨慎' },
    { word: '保证', type: '承诺用语', reason: '保证效果，涉嫌虚假宣传' },
    { word: '100%', type: '绝对承诺', reason: '100%承诺，涉嫌虚假宣传' },
    { word: '永久', type: '绝对承诺', reason: '永久承诺，涉嫌虚假宣传' },
    // 导流
    { word: '加微信', type: '站外导流', reason: '引导加微信，站外导流' },
    { word: '私信', type: '私信引流', reason: '引导私信，可能涉及引流' },
    { word: '二维码', type: '二维码引流', reason: '展示二维码，站外导流' },
  ],
  low: [
    // 敏感词
    { word: '赚钱', type: '收益承诺', reason: '承诺收益，需标注风险' },
    { word: '暴富', type: '暴富宣传', reason: '宣传暴富，价值观导向问题' },
    { word: '躺赚', type: '不劳而获', reason: '宣传不劳而获' },
    { word: '秒杀', type: '促销用语', reason: '促销用语，需真实有效' },
    { word: '限时', type: '促销用语', reason: '限时促销，需真实有效' },
  ]
}

async function checkRisk() {
  isAnalyzing.value = true
  
  // 模拟分析过程
  await new Promise(r => setTimeout(r, 1500))
  
  const text = riskForm.text
  const violations = []
  
  // 检查高风险词
  riskKeywords.high.forEach(item => {
    if (text.includes(item.word)) {
      const index = text.indexOf(item.word)
      const start = Math.max(0, index - 10)
      const end = Math.min(text.length, index + item.word.length + 10)
      violations.push({
        type: item.type,
        severity: 'high',
        text: text.slice(start, end),
        reason: item.reason,
        suggestion: `建议删除或替换"${item.word}"，使用更中性的表述`
      })
    }
  })
  
  // 检查中风险词
  riskKeywords.medium.forEach(item => {
    if (text.includes(item.word)) {
      const index = text.indexOf(item.word)
      const start = Math.max(0, index - 10)
      const end = Math.min(text.length, index + item.word.length + 10)
      violations.push({
        type: item.type,
        severity: 'medium',
        text: text.slice(start, end),
        reason: item.reason,
        suggestion: `建议避免使用"${item.word}"，改用客观描述`
      })
    }
  })
  
  // 检查低风险词
  riskKeywords.low.forEach(item => {
    if (text.includes(item.word)) {
      const index = text.indexOf(item.word)
      const start = Math.max(0, index - 10)
      const end = Math.min(text.length, index + item.word.length + 10)
      violations.push({
        type: item.type,
        severity: 'low',
        text: text.slice(start, end),
        reason: item.reason,
        suggestion: `建议谨慎使用"${item.word}"，注意合规表达`
      })
    }
  })
  
  // 根据内容类型额外检查
  if (riskForm.contentType === '医疗健庘') {
    if (text.includes('药') && !text.includes('建议咨询')) {
      violations.push({
        type: '医疗资质',
        severity: 'high',
        text: text.slice(0, 30) + '...',
        reason: '医疗健康内容需要专业资质',
        suggestion: '添加"本内容仅供参考，具体请咨询专业医生"等免责声明'
      })
    }
  }
  
  const highCount = violations.filter(v => v.severity === 'high').length
  const mediumCount = violations.filter(v => v.severity === 'medium').length
  
  let level = 'low'
  let summary = '未发现明显风险'
  
  if (highCount > 0) {
    level = 'high'
    summary = `发现 ${highCount} 个高风险项，${mediumCount} 个中风险项，建议修改后再发布`
  } else if (mediumCount > 0) {
    level = 'medium'
    summary = `发现 ${mediumCount} 个中风险项，建议优化`
  } else if (violations.length > 0) {
    summary = `发现 ${violations.length} 个低风险项，注意即可`
  }
  
  riskResult.value = {
    level,
    summary,
    violations: violations.sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 }
      return order[a.severity] - order[b.severity]
    })
  }
  
  isAnalyzing.value = false
}

// ========== 去 AI 味 ==========
const humanizeForm = reactive({
  tone: '随意自然',
  text: ''
})
const humanizeResult = ref(null)

// AI 模式检测规则（基于 humanizer-zh SKILL.md）
const aiPatterns = [
  { pattern: /此外[，、]/, name: '连接词过度', weight: 5 },
  { pattern: /至关重要|极其重要|关键性的/, name: 'AI 词汇', weight: 8 },
  { pattern: /深入探讨|强调|凸显|彰显/, name: '强调动词', weight: 6 },
  { pattern: /标志着|见证了|是……的体现/, name: '象征意义夸大', weight: 7 },
  { pattern: /不仅……而且|不是……而是/, name: '否定式排比', weight: 6 },
  { pattern: /[，、][^，。]{1,20}[，、][^，。]{1,20}[，、][^，。]{1,20}[，。]/, name: '三段式法则', weight: 5 },
  { pattern: /作为[^，]{1,30}的/, name: '系动词回避', weight: 4 },
  { pattern: /——/, name: '破折号过度', weight: 3 },
  { pattern: /行业报告显示|观察者指出|专家认为/, name: '模糊归因', weight: 7 },
  { pattern: /拥有|设有|提供[^，]{1,20}的/, name: '宣传性语言', weight: 5 },
  { pattern: /充满活力的|丰富的|深刻的|迷人的/, name: '形容词堆砌', weight: 4 },
  { pattern: /希望这对您有帮助|请告诉我|您说得完全正确/, name: '协作交流痕迹', weight: 8 },
  { pattern: /截至.*训练更新|根据可用信息|虽然具体细节有限/, name: '知识截止免责声明', weight: 6 },
  { pattern: /本质上|归根结底/, name: '过度升维', weight: 5 },
]

async function humanizeText() {
  isAnalyzing.value = true
  
  await new Promise(r => setTimeout(r, 1200))
  
  const text = humanizeForm.text
  let score = 0
  const changes = []
  let humanized = text
  
  // 检测 AI 模式
  aiPatterns.forEach(rule => {
    const matches = text.match(new RegExp(rule.pattern.source, 'g')) || []
    if (matches.length > 0) {
      score += rule.weight * matches.length
      changes.push({
        before: matches[0],
        after: getHumanizedReplacement(matches[0], rule.name),
        reason: `检测到「${rule.name}」模式`
      })
      
      // 简单替换第一个匹配
      humanized = humanized.replace(matches[0], getHumanizedReplacement(matches[0], rule.name))
    }
  })
  
  // 根据语气调整
  if (humanizeForm.tone === '随意自然') {
    humanized = humanized.replace(/[，。]/g, (match) => {
      if (Math.random() > 0.7) return match === '，' ? ' ' : ''
      return match
    })
  }
  
  score = Math.min(100, score)
  
  humanizeResult.value = {
    score,
    text: humanized,
    changes: changes.slice(0, 8)
  }
  
  isAnalyzing.value = false
}

function getHumanizedReplacement(text, patternName) {
  const replacements = {
    '连接词过度': text.replace('此外', '还有'),
    'AI 词汇': text.replace(/至关重要|极其重要|关键性的/, '重要'),
    '强调动词': text.replace(/深入探讨|强调|凸显|彰显/, '说'),
    '象征意义夸大': text.replace(/标志着|见证了|是……的体现/, '是'),
    '否定式排比': text.replace(/不仅……而且|不是……而是/, ''),
    '三段式法则': text.split('，').slice(0, 2).join('，') + '。',
    '系动词回避': text.replace(/作为[^，]{1,30}的/, '是'),
    '破折号过度': text.replace('——', '，'),
    '模糊归因': text.replace(/行业报告显示|观察者指出|专家认为/, ''),
    '宣传性语言': text.replace(/拥有|设有|提供/, '有'),
    '形容词堆砌': text.replace(/充满活力的|丰富的|深刻的|迷人的/, '不错的'),
    '协作交流痕迹': text.replace(/希望这对您有帮助|请告诉我|您说得完全正确/, ''),
    '知识截止免责声明': text.replace(/截至.*训练更新|根据可用信息|虽然具体细节有限/, ''),
    '过度升维': text.replace(/本质上|归根结底/, '简单说'),
  }
  return replacements[patternName] || text
}

// ========== 视频文案/标题诊断 ==========
const diagnoseForm = reactive({
  genre: '短视频文稿',
  text: ''
})
const diagnoseResult = ref(null)

// AI 指纹特征（基于 dbs-ai-check SKILL.md 的 22 条特征）
const aiFingerprints = [
  { id: 1, name: '堵住所有反驳', pattern: /当然|诚然|不可否认|必须承认/, severity: 'medium' },
  { id: 2, name: '知识全部输出', pattern: /[0-9]+[.%]?.*[0-9]+[.%]?.*[0-9]+[.%]?/, severity: 'low' },
  { id: 3, name: '匀速排比', pattern: /(.{5,20})[，、]\1[，、]\1/, severity: 'medium' },
  { id: 4, name: '同一个让步模板', pattern: /虽然.*但是.*虽然.*但是/, severity: 'medium' },
  { id: 5, name: '给概念起名字的仪式', pattern: /「[^」]{2,8}」|“[^”]{2,8}”/, severity: 'low' },
  { id: 6, name: '情绪曲线太光滑', pattern: /先是.*然后.*最后.*终于/, severity: 'medium' },
  { id: 7, name: '替读者说一句蠢话然后纠正', pattern: /你可能会觉得|你可能会问|有人可能会说/, severity: 'high' },
  { id: 8, name: '「不是 X 是 Y」高密度', pattern: /不是.*是.*不是.*是/, severity: 'high' },
  { id: 9, name: '没有任何犹豫', pattern: /毫无疑问|显然|必然|绝对/, severity: 'medium' },
  { id: 10, name: '精确到不真实的情绪细节', pattern: /[0-9]+\.[0-9]+秒|第[0-9]+次/, severity: 'low' },
  { id: 11, name: '脆弱感服务于论点', pattern: /我曾经.*但是.*这让我明白/, severity: 'medium' },
  { id: 12, name: '把结论包装成「协议」', pattern: /所以我的建议是|你可以这样做|记住这三点/, severity: 'low' },
  { id: 13, name: '每个段落都有收束金句', pattern: /这才是.*|真正.*|说到底.*$/, severity: 'low' },
  { id: 14, name: '句子节奏过于均匀', pattern: /(.{15,25}[。！？]){3,}/, severity: 'low' },
  { id: 15, name: '用身体感受替代论证', pattern: /身体知道|直觉告诉我|心里有个声音/, severity: 'medium' },
  { id: 16, name: '开头「钩子 + 痛点 + 承诺」三件套', pattern: /你是不是.*是不是.*我来告诉你|你有没有.*有没有.*其实/, severity: 'high' },
  { id: 17, name: '连接词过度使用且位置固定', pattern: /然而.*事实上.*值得注意的是/, severity: 'medium' },
  { id: 18, name: '同义词刻意替换', pattern: /(.{2,4}).*\1.*\1/, severity: 'low' },
  { id: 19, name: '中文翻译腔', pattern: /作为.*关于.*基于.*进行/, severity: 'medium' },
  { id: 20, name: '虚假的「讲个故事」', pattern: /我有个朋友|我认识一个人|之前有个客户/, severity: 'medium' },
  { id: 21, name: '结尾「你值得」式祝福', pattern: /你值得|希望你.*记住|愿你.*相信/, severity: 'low' },
  { id: 22, name: '对「深刻」的过拟合', pattern: /本质上.*归根结底.*其实/, severity: 'medium' },
]

async function diagnoseText() {
  isAnalyzing.value = true
  
  await new Promise(r => setTimeout(r, 1800))
  
  const text = diagnoseForm.text
  const findings = []
  
  aiFingerprints.forEach(feature => {
    const matches = text.match(new RegExp(feature.pattern.source, 'g')) || []
    if (matches.length > 0) {
      matches.forEach(match => {
        if (findings.length < 15) { // 最多显示 15 处
          findings.push({
            text: match.slice(0, 50),
            description: getDiagnosisDescription(feature.id, feature.name),
            feature: feature.id,
            featureName: feature.name,
            severity: feature.severity
          })
        }
      })
    }
  })
  
  // 去重
  const uniqueFindings = findings.filter((f, i, arr) => 
    arr.findIndex(t => t.feature === f.feature && t.text === f.text) === i
  )
  
  const highCount = uniqueFindings.filter(f => f.severity === 'high').length
  const mediumCount = uniqueFindings.filter(f => f.severity === 'medium').length
  
  let summary = ''
  if (uniqueFindings.length === 0) {
    summary = '文案整体自然，未发现明显 AI 指纹。继续保持你的写法！'
  } else if (highCount > 3) {
    summary = `发现 ${highCount} 处强信号 AI 指纹，文案 AI 痕迹较重。建议重点关注「替读者说蠢话」「否定式排比」「开头三件套」等模式。`
  } else if (mediumCount > 5) {
    summary = `发现 ${uniqueFindings.length} 处 AI 指纹，以中信号为主。建议检查连接词、情绪曲线、论证结构等。`
  } else {
    summary = `发现 ${uniqueFindings.length} 处 AI 指纹，整体可控。大部分为弱信号，注意即可。`
  }
  
  diagnoseResult.value = {
    fingerprints: uniqueFindings.length,
    findings: uniqueFindings,
    summary
  }
  
  isAnalyzing.value = false
}

function getDiagnosisDescription(id, name) {
  const descriptions = {
    1: '过度防御性论证，试图堵住所有可能的反驳',
    2: '堆砌数据和术语来展示专业度',
    3: '排比句节奏过于均匀，像机器生成',
    4: '反复使用同一个让步结构',
    5: '给概念起名字制造记忆点',
    6: '情绪转折过于平滑，缺乏真实波动',
    7: '虚构读者声音来推进论证',
    8: '高密度使用「不是 X 是 Y」结构',
    9: '过度确定性，没有犹豫和不确定',
    10: '精确到不真实的数字细节',
    11: '个人经历过于服务于论点',
    12: '结尾强行给出可操作结论',
    13: '每段都有收束金句',
    14: '句子长度过于均匀',
    15: '用身体感受替代逻辑论证',
    16: '开头使用「钩子+痛点+承诺」套路',
    17: '连接词过度且位置固定',
    18: '同一段内刻意替换同义词',
    19: '中文翻译腔，使用「作为」「关于」「基于」',
    20: '虚构朋友/客户故事',
    21: '结尾使用「你值得」式祝福',
    22: '过度升维到哲学层面',
  }
  return descriptions[id] || `${name} 模式`
}

// ========== UI 设计建议（已移除，保留代码供参考）==========
const designForm = reactive({
  brief: '',
  directions: [],
  pageType: '数据仪表盘'
})
const designResult = ref(null)

function toggleDesignDirection(dir) {
  const idx = designForm.directions.indexOf(dir)
  if (idx > -1) {
    designForm.directions.splice(idx, 1)
  } else {
    designForm.directions.push(dir)
  }
}

async function getDesignAdvice() {
  isAnalyzing.value = true
  
  await new Promise(r => setTimeout(r, 1500))
  
  const direction = designForm.directions[0] || '极简现代'
  const pageType = designForm.pageType
  
  // 基于 frontend-design SKILL.md 生成建议
  const palettes = {
    '极简现代': {
      primary: '#1a1a1a',
      secondary: '#f5f5f7',
      accent: '#0071e3',
      text: '#333333',
      muted: '#86868b'
    },
    '温暖有机': {
      primary: '#2d2a26',
      secondary: '#faf6f1',
      accent: '#c75b39',
      text: '#3d3833',
      muted: '#a89f94'
    },
    '大胆前卫': {
      primary: '#0a0a0a',
      secondary: '#111111',
      accent: '#ccff00',
      text: '#ffffff',
      muted: '#666666'
    },
    '专业商务': {
      primary: '#1e3a5f',
      secondary: '#f8fafc',
      accent: '#2563eb',
      text: '#1e293b',
      muted: '#64748b'
    },
    '活泼创意': {
      primary: '#1a1a2e',
      secondary: '#f7f1e3',
      accent: '#e94560',
      text: '#16213e',
      muted: '#a8a8a8'
    }
  }
  
  const typography = {
    '极简现代': { display: 'SF Pro Display / Inter', body: 'SF Pro Text / Inter', utility: 'SF Mono / JetBrains Mono' },
    '温暖有机': { display: 'Playfair Display / 思源宋体', body: 'Source Sans Pro / 思源黑体', utility: 'IBM Plex Mono' },
    '大胆前卫': { display: 'Helvetica Now / Bebas Neue', body: 'Inter / Roboto', utility: 'Space Mono' },
    '专业商务': { display: 'Georgia / 思源宋体', body: 'Inter / 微软雅黑', utility: 'Fira Code' },
    '活泼创意': { display: 'Poppins / 站酷快乐体', body: 'Nunito / 思源黑体', utility: 'Courier Prime' }
  }
  
  const layouts = {
    '数据仪表盘': '采用卡片式布局，关键指标使用大数字展示。左侧固定导航，右侧主内容区。图表区域使用 2:1 或 1:1 网格排列。数据表格使用斑马纹提升可读性。',
    '内容展示': '采用杂志式排版，大图配精炼文字。使用非对称网格创造视觉节奏。留白充足，让内容呼吸。',
    '表单/输入': '采用单列布局，标签左对齐或顶对齐。使用渐进式披露，分步骤展示。输入框使用下划线或细边框风格。',
    '电商/商品': '采用网格布局，商品卡片统一尺寸。使用悬浮效果展示次要信息。购物车常驻右下角。',
    '社交/社区': '采用信息流布局，卡片之间有明确分隔。用户头像和昵称突出显示。互动按钮（点赞、评论）使用图标+数字。'
  }
  
  const signatures = {
    '数据仪表盘': '使用动态数字计数动画作为标志性元素，数据更新时有微妙的脉冲效果。',
    '内容展示': '使用独特的首字下沉或自定义引号样式作为标志性排版元素。',
    '表单/输入': '使用微交互动画作为标志，如输入框聚焦时的边框颜色流动效果。',
    '电商/商品': '使用悬浮时的 3D 倾斜效果作为标志性交互。',
    '社交/社区': '使用独特的点赞动画（如粒子爆炸效果）作为标志性微交互。'
  }
  
  const palette = palettes[direction] || palettes['极简现代']
  const type = typography[direction] || typography['极简现代']
  
  designResult.value = {
    colors: palette,
    typography: type,
    layout: layouts[pageType] || layouts['数据仪表盘'],
    signature: signatures[pageType] || signatures['数据仪表盘'],
    fullAdvice: `## 设计建议

### 设计方向：${direction}

**核心原则**：
1. 避免模板化设计，每个选择都应有明确理由
2. 从主题本身的世界寻找灵感（短视频、数据、创作者）
3. 在克制中制造一个记忆点

**配色说明**：
- 主色 ${palette.primary} 用于核心文字和关键元素
- 辅色 ${palette.secondary} 作为背景基调
- 强调色 ${palette.accent} 用于按钮、链接和行动号召
- 文字色 ${palette.text} 确保可读性
- 弱化色 ${palette.muted} 用于辅助信息

**排版策略**：
- 显示字体「${type.display}」用于标题和关键数字
- 正文字体「${type.body}」用于段落和描述
- 等宽字体「${type.utility}」用于数据和代码

**布局建议**：
${layouts[pageType] || layouts['数据仪表盘']}

**标志性元素**：
${signatures[pageType] || signatures['数据仪表盘']}

**注意事项**：
- 避免使用默认的圆角和阴影，自定义以匹配主题
- 动画要有目的性，不要分散注意力
- 内容优先，设计服务于信息传达
- 响应式设计，移动端体验同样重要`
  }
  
  isAnalyzing.value = false
}
</script>
