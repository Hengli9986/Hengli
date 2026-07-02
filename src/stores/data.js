import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './auth'

export const useDataStore = defineStore('data', () => {
  // ========== Raw data from Supabase ==========
  const liveSessions = ref([])
  const videos = ref([])
  const importHistory = ref([])
  const currentImportType = ref('')
  const isLoading = ref(false)
  const error = ref(null)

  // ========== Computed stats (Live) ==========
  const liveStats = computed(() => {
    const sessions = liveSessions.value
    if (!sessions.length) return null

    const totalWatch = sessions.reduce((sum, s) => sum + (s.avg_watch || 0), 0)
    const totalDuration = sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0)
    const totalGmv = sessions.reduce((sum, s) => sum + (parseFloat(s.gmv) || 0), 0)
    const totalOrders = sessions.reduce((sum, s) => sum + (s.orders || 0), 0)

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

  // ========== Computed stats (Video) ==========
  const videoStats = computed(() => {
    const vids = videos.value
    if (!vids.length) return null

    const totalPlay = vids.reduce((sum, v) => sum + (v.play_count || 0), 0)
    const totalLike = vids.reduce((sum, v) => sum + (v.like_count || 0), 0)
    const totalComment = vids.reduce((sum, v) => sum + (v.comment_count || 0), 0)
    const totalShare = vids.reduce((sum, v) => sum + (v.share_count || 0), 0)
    const totalCollect = vids.reduce((sum, v) => sum + (v.collect_count || 0), 0)

    const engagement = totalPlay > 0
      ? (((totalLike + totalComment + totalShare + totalCollect) / totalPlay) * 100).toFixed(2)
      : '0.00'

    // Top videos (top 10%)
    const sortedByPlay = [...vids].sort((a, b) => (b.play_count || 0) - (a.play_count || 0))
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
        title: v.title || '未命名',
        play_count: v.play_count || 0,
        like_count: v.like_count || 0,
        publish_time: v.publish_time || ''
      }))
    }
  })

  // ========== Actions ==========
  async function loadData() {
    isLoading.value = true
    error.value = null

    // ALWAYS load from localStorage first (works for both guest and logged-in users)
    loadGuestData()

    // If logged in, also load from Supabase and merge
    const authStore = useAuthStore()
    const isLoggedIn = !!(authStore.user && authStore.user.id)

    if (isLoggedIn) {
      try {
        // Load live sessions from Supabase
        const { data: liveData, error: liveError } = await supabase
          .from('live_sessions')
          .select('*')
          .eq('user_id', authStore.user.id)
          .order('created_at', { ascending: false })

        if (liveError) throw liveError

        // Load videos from Supabase
        const { data: videoData, error: videoError } = await supabase
          .from('videos')
          .select('*')
          .eq('user_id', authStore.user.id)
          .order('created_at', { ascending: false })

        if (videoError) throw videoError

        // Load import logs from Supabase
        const { data: logData, error: logError } = await supabase
          .from('import_logs')
          .select('*')
          .eq('user_id', authStore.user.id)
          .order('created_at', { ascending: false })
          .limit(20)

        if (logError) throw logError

        // Merge Supabase data with localStorage data (deduplicate by id)
        const liveIds = new Set(liveSessions.value.map(s => s.id))
        const videoIds = new Set(videos.value.map(v => v.id))
        const historyIds = new Set(importHistory.value.map(h => h.id))

        const newLive = (liveData || []).filter(s => !liveIds.has(s.id))
        const newVideo = (videoData || []).filter(v => !videoIds.has(v.id))
        const newHistory = (logData || []).map(log => ({
          id: log.id,
          type: log.import_type,
          count: log.record_count,
          timestamp: new Date(log.created_at).toLocaleString('zh-CN'),
          fileName: log.file_name
        })).filter(h => !historyIds.has(h.id))

        liveSessions.value = [...liveSessions.value, ...newLive]
        videos.value = [...videos.value, ...newVideo]
        importHistory.value = [...importHistory.value, ...newHistory]
      } catch (err) {
        console.error('Supabase load failed, using localStorage only:', err)
        // localStorage data is already loaded, so this is fine
      }
    }

    isLoading.value = false
  }

  async function setImportedData(data, type) {
    isLoading.value = true
    error.value = null
    currentImportType.value = type

    const authStore = useAuthStore()
    const isLoggedIn = !!(authStore.user && authStore.user.id)

    // Step 1: ALWAYS save to localStorage (primary storage, works for everyone)
    if (!isLoggedIn) {
      localStorage.setItem('guest_mode', 'true')
    }
    saveGuestData(data, type)

    // Step 2: If logged in, also save to Supabase (cloud backup)
    if (isLoggedIn) {
      try {
        const records = data.map(row => {
          const base = {
            user_id: authStore.user.id,
            raw_data: row
          }

          if (type === 'live') {
            return {
              ...base,
              live_date: row.直播日期 || row.date || null,
              duration_minutes: parseInt(row.直播时长 || row.duration) || null,
              avg_watch: parseInt(row.场均观看 || row.watchCount) || null,
              gmv: parseFloat(row.直播GMV || row.gmv) || null,
              orders: parseInt(row.成交订单数 || row.orders) || null,
              new_fans: parseInt(row.新增粉丝 || row.newFans) || null,
              interactions: parseInt(row.互动人数 || row.interactions) || null
            }
          } else {
            return {
              ...base,
              title: row.视频标题 || row.title || null,
              publish_time: row.发布时间 || row.publishTime || null,
              play_count: parseInt(row.播放量 || row.playCount) || null,
              like_count: parseInt(row.点赞数 || row.likeCount) || null,
              comment_count: parseInt(row.评论数 || row.commentCount) || null,
              share_count: parseInt(row.分享数 || row.shareCount) || null,
              collect_count: parseInt(row.收藏数 || row.collectCount) || null,
              completion_rate: parseFloat(row.完播率 || row.completionRate) || null
            }
          }
        })

        const table = type === 'live' ? 'live_sessions' : 'videos'
        const { error: insertError } = await supabase.from(table).insert(records)
        if (insertError) throw insertError

        // Log import
        const { error: logError } = await supabase.from('import_logs').insert({
          user_id: authStore.user.id,
          import_type: type,
          record_count: data.length
        })
        if (logError) console.warn('Failed to log import:', logError)
      } catch (err) {
        console.error('Supabase save failed, data is still in localStorage:', err)
        // Don't throw - localStorage has the data as backup
      }
    }

    isLoading.value = false
  }

  async function clearData() {
    // Always clear localStorage
    localStorage.removeItem('guest_live_sessions')
    localStorage.removeItem('guest_videos')
    localStorage.removeItem('guest_import_history')
    liveSessions.value = []
    videos.value = []
    importHistory.value = []

    // If logged in, also clear Supabase
    const authStore = useAuthStore()
    if (authStore.user && authStore.user.id) {
      isLoading.value = true
      try {
        await supabase.from('live_sessions').delete().eq('user_id', authStore.user.id)
        await supabase.from('videos').delete().eq('user_id', authStore.user.id)
        await supabase.from('import_logs').delete().eq('user_id', authStore.user.id)
      } catch (err) {
        console.error('Failed to clear Supabase data:', err)
      } finally {
        isLoading.value = false
      }
    }
  }

  async function removeImportHistoryItem(id) {
    // Always remove from localStorage
    const history = JSON.parse(localStorage.getItem('guest_import_history') || '[]')
    const filtered = history.filter(h => h.id !== id)
    localStorage.setItem('guest_import_history', JSON.stringify(filtered))
    importHistory.value = filtered

    // If logged in, also remove from Supabase
    const { error: deleteError } = await supabase.from('import_logs').delete().eq('id', id)
    if (deleteError) {
      console.error('Failed to delete import log:', deleteError)
    }
  }

  function isGuestMode() {
    return localStorage.getItem('guest_mode') === 'true'
  }

  function loadGuestData() {
    try {
      const liveData = JSON.parse(localStorage.getItem('guest_live_sessions') || '[]')
      const videoData = JSON.parse(localStorage.getItem('guest_videos') || '[]')
      const historyData = JSON.parse(localStorage.getItem('guest_import_history') || '[]')
      liveSessions.value = liveData
      videos.value = videoData
      importHistory.value = historyData
    } catch (e) {
      console.error('Failed to load guest data:', e)
    }
  }

  function saveGuestData(data, type) {
    try {
      const records = data.map((row, index) => {
        if (type === 'live') {
          return {
            id: 'guest-live-' + Date.now() + '-' + index,
            user_id: 'guest',
            live_date: row.直播日期 || row.date || null,
            duration_minutes: parseInt(row.直播时长 || row.duration) || null,
            avg_watch: parseInt(row.场均观看 || row.watchCount) || null,
            gmv: parseFloat(row.直播GMV || row.gmv) || null,
            orders: parseInt(row.成交订单数 || row.orders) || null,
            new_fans: parseInt(row.新增粉丝 || row.newFans) || null,
            interactions: parseInt(row.互动人数 || row.interactions) || null,
            raw_data: row,
            created_at: new Date().toISOString()
          }
        } else {
          return {
            id: 'guest-video-' + Date.now() + '-' + index,
            user_id: 'guest',
            title: row.视频标题 || row.title || null,
            publish_time: row.发布时间 || row.publishTime || null,
            play_count: parseInt(row.播放量 || row.playCount) || null,
            like_count: parseInt(row.点赞数 || row.likeCount) || null,
            comment_count: parseInt(row.评论数 || row.commentCount) || null,
            share_count: parseInt(row.分享数 || row.shareCount) || null,
            collect_count: parseInt(row.收藏数 || row.collectCount) || null,
            completion_rate: parseFloat(row.完播率 || row.completionRate) || null,
            raw_data: row,
            created_at: new Date().toISOString()
          }
        }
      })

      if (type === 'live') {
        const existing = JSON.parse(localStorage.getItem('guest_live_sessions') || '[]')
        localStorage.setItem('guest_live_sessions', JSON.stringify([...existing, ...records]))
      } else {
        const existing = JSON.parse(localStorage.getItem('guest_videos') || '[]')
        localStorage.setItem('guest_videos', JSON.stringify([...existing, ...records]))
      }

      // Add import log
      const history = JSON.parse(localStorage.getItem('guest_import_history') || '[]')
      history.unshift({
        id: 'guest-log-' + Date.now(),
        type: type,
        count: data.length,
        timestamp: new Date().toLocaleString('zh-CN')
      })
      localStorage.setItem('guest_import_history', JSON.stringify(history.slice(0, 20)))

      // Reload into reactive state
      loadGuestData()
    } catch (e) {
      console.error('Failed to save guest data:', e)
      throw new Error('保存数据失败')
    }
  }

  return {
    liveSessions,
    videos,
    importHistory,
    currentImportType,
    isLoading,
    error,
    liveStats,
    videoStats,
    loadData,
    setImportedData,
    clearData,
    removeImportHistoryItem
  }
})
