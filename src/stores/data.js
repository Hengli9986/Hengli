import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useDataStore = defineStore('data', () => {
  // ========== 导入的原始数据 ==========
  const importedData = ref([])
  const importHistory = ref([])
  const currentImportType = ref('') // 'live' | 'video'
  const isLoading = ref(false)
  const error = ref(null)

  // ========== 直播数据 ==========
  const liveSessions = computed(() => {
    return importedData.value.filter(row => 
      row.type === 'live' || row.直播时长 || row.场均观看 || row.直播场次
    )
  })

  const liveStats = computed(() => {
    const sessions = liveSessions.value
    if (!sessions.length) return null
    
    const totalWatch = sessions.reduce((sum, s) => sum + (parseFloat(s.场均观看) || 0), 0)
    const totalDuration = sessions.reduce((sum, s) => sum + (parseFloat(s.直播时长) || 0), 0)
    const totalGmv = sessions.reduce((sum, s) => sum + (parseFloat(s.直播GMV) || 0), 0)
    const totalOrders = sessions.reduce((sum, s) => sum + (parseFloat(s.成交订单数) || 0), 0)
    
    return {
      sessionCount: sessions.length,
      avgWatch: Math.round(totalWatch / sessions.length),
      avgDuration: Math.round(totalDuration / sessions.length),
      totalGmv: Math.round(totalGmv),
      totalOrders: Math.round(totalOrders),
      avgGmvPerSession: Math.round(totalGmv / sessions.length),
      avgConversion: sessions.length > 0 
        ? ((totalOrders / totalWatch) * 100).toFixed(2) 
        : '0.00'
    }
  })

  // ========== 视频数据 ==========
  const videos = computed(() => {
    return importedData.value.filter(row => 
      row.type === 'video' || row.播放量 || row.点赞数 || row.视频标题
    )
  })

  const videoStats = computed(() => {
    const vids = videos.value
    if (!vids.length) return null

    const totalPlay = vids.reduce((sum, v) => sum + (parseFloat(v.播放量) || 0), 0)
    const totalLike = vids.reduce((sum, v) => sum + (parseFloat(v.点赞数) || 0), 0)
    const totalComment = vids.reduce((sum, v) => sum + (parseFloat(v.评论数) || 0), 0)
    const totalShare = vids.reduce((sum, v) => sum + (parseFloat(v.分享数) || 0), 0)
    const totalCollect = vids.reduce((sum, v) => sum + (parseFloat(v.收藏数) || 0), 0)

    // 互动率 = (点赞+评论+分享+收藏) / 播放量
    const engagement = totalPlay > 0 
      ? (((totalLike + totalComment + totalShare + totalCollect) / totalPlay) * 100).toFixed(2)
      : '0.00'

    // 找出爆款视频（播放量前10%）
    const sortedByPlay = [...vids].sort((a, b) => (b.播放量 || 0) - (a.播放量 || 0))
    const topThreshold = Math.ceil(vids.length * 0.1)
    const topVideos = sortedByPlay.slice(0, topThreshold)

    return {
      videoCount: vids.length,
      totalPlay: Math.round(totalPlay),
      totalLike: Math.round(totalLike),
      totalComment: Math.round(totalComment),
      totalShare: Math.round(totalShare),
      avgPlay: Math.round(totalPlay / vids.length),
      avgLike: Math.round(totalLike / vids.length),
      engagementRate: engagement,
      topVideos: topVideos.map(v => ({
        title: v.视频标题 || v.title || '未命名',
        playCount: v.播放量 || 0,
        likeCount: v.点赞数 || 0,
        publishTime: v.发布时间 || v.publishTime || ''
      }))
    }
  })

  // ========== Actions ==========
  function setImportedData(data, type) {
    importedData.value = data.map((row, index) => ({
      ...row,
      _id: `${type}_${index}_${Date.now()}`,
      type: type
    }))
    currentImportType.value = type
    
    // 添加到导入历史
    importHistory.value.unshift({
      id: Date.now(),
      type,
      count: data.length,
      timestamp: new Date().toLocaleString('zh-CN'),
      preview: data.slice(0, 3)
    })
    
    // 持久化到 localStorage
    saveToStorage()
  }

  function clearData() {
    importedData.value = []
    currentImportType.value = ''
    saveToStorage()
  }

  function saveToStorage() {
    localStorage.setItem('geek_douyin_data', JSON.stringify({
      importedData: importedData.value,
      importHistory: importHistory.value.slice(0, 20), // 只保留最近20条
      currentImportType: currentImportType.value
    }))
  }

  function loadFromStorage() {
    try {
      const stored = localStorage.getItem('geek_douyin_data')
      if (stored) {
        const parsed = JSON.parse(stored)
        importedData.value = parsed.importedData || []
        importHistory.value = parsed.importHistory || []
        currentImportType.value = parsed.currentImportType || ''
      }
    } catch (e) {
      console.error('Failed to load data from storage:', e)
    }
  }

  function removeImportHistoryItem(id) {
    importHistory.value = importHistory.value.filter(h => h.id !== id)
    saveToStorage()
  }

  // 初始化时加载
  loadFromStorage()

  return {
    importedData,
    importHistory,
    currentImportType,
    isLoading,
    error,
    liveSessions,
    liveStats,
    videos,
    videoStats,
    setImportedData,
    clearData,
    loadFromStorage,
    saveToStorage,
    removeImportHistoryItem
  }
})
