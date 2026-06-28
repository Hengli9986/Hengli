/**
 * AI Analysis Engine (local rule-based)
 * No external LLM calls — all insights are derived from simple heuristics.
 */

// ========== Helpers ==========

function toNum(v) {
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : 0
}

function avg(arr, key) {
  if (!arr.length) return 0
  const sum = arr.reduce((s, item) => {
    const value = key !== undefined ? item?.[key] : item
    return s + toNum(value)
  }, 0)
  return sum / arr.length
}

function sortBy(arr, key, desc = true) {
  return [...arr].sort((a, b) => {
    const diff = toNum(a?.[key]) - toNum(b?.[key])
    return desc ? -diff : diff
  })
}

function topPercent(arr, key, percent = 0.2) {
  const sorted = sortBy(arr, key, true)
  const count = Math.max(1, Math.ceil(arr.length * percent))
  return sorted.slice(0, count)
}

function bottomPercent(arr, key, percent = 0.2) {
  const sorted = sortBy(arr, key, false)
  const count = Math.max(1, Math.ceil(arr.length * percent))
  return sorted.slice(0, count)
}

function engagementRate(video) {
  const play = toNum(video?.play_count)
  if (!play) return 0
  const interactions =
    toNum(video?.like_count) +
    toNum(video?.comment_count) +
    toNum(video?.share_count) +
    toNum(video?.collect_count)
  return (interactions / play) * 100
}

function getHourLabel(dateLike) {
  const d = new Date(dateLike)
  if (Number.isNaN(d.getTime())) return null
  const h = d.getHours()
  return `${String(h).padStart(2, '0')}:00`
}

function getWeekdayLabel(dateLike) {
  const d = new Date(dateLike)
  if (Number.isNaN(d.getTime())) return null
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return weekdays[d.getDay()]
}

function fmtDate(dateLike) {
  const d = new Date(dateLike)
  if (Number.isNaN(d.getTime())) return dateLike || '-'
  return d.toLocaleDateString('zh-CN')
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n))
}

// ========== Video Analysis ==========

export function analyzeVideos(videos = []) {
  if (!videos.length) {
    return {
      topVideos: [],
      lowVideos: [],
      avgStats: {
        avgPlay: 0,
        avgLike: 0,
        avgComment: 0,
        avgShare: 0,
        avgCollect: 0,
        avgCompletionRate: 0,
        avgEngagementRate: 0
      },
      engagementTrend: { dates: [], values: [] },
      contentAdvice: ['暂无视频数据，导入数据后可生成短视频建议。']
    }
  }

  const topVideos = topPercent(videos, 'play_count', 0.2).map(v => ({
    id: v.id,
    title: v.title || '未命名',
    publishTime: v.publish_time || '-',
    playCount: toNum(v.play_count),
    likeCount: toNum(v.like_count),
    engagementRate: engagementRate(v)
  }))

  const lowVideos = bottomPercent(videos, 'play_count', 0.2).map(v => ({
    id: v.id,
    title: v.title || '未命名',
    publishTime: v.publish_time || '-',
    playCount: toNum(v.play_count),
    likeCount: toNum(v.like_count),
    engagementRate: engagementRate(v)
  }))

  const avgStats = {
    avgPlay: Math.round(avg(videos, 'play_count')),
    avgLike: Math.round(avg(videos, 'like_count')),
    avgComment: Math.round(avg(videos, 'comment_count')),
    avgShare: Math.round(avg(videos, 'share_count')),
    avgCollect: Math.round(avg(videos, 'collect_count')),
    avgCompletionRate: avg(videos, 'completion_rate').toFixed(2),
    avgEngagementRate: avg(videos.map(engagementRate)).toFixed(2)
  }

  const sortedByDate = sortBy(videos, 'publish_time', true)
    .filter(v => v.publish_time)
    .slice(0, 30)
    .reverse()

  const engagementTrend = {
    dates: sortedByDate.map(v => fmtDate(v.publish_time)),
    values: sortedByDate.map(v => Number(engagementRate(v).toFixed(2)))
  }

  const advice = []
  const topAvgPlay = avg(topVideos, 'playCount')
  const lowAvgPlay = avg(lowVideos, 'playCount')

  if (topAvgPlay > 0 && lowAvgPlay > 0) {
    advice.push(`头部视频播放量约为尾部视频的 ${(topAvgPlay / lowAvgPlay).toFixed(1)} 倍，建议重点复盘爆款选题与封面逻辑。`)
  }

  if (Number(avgStats.avgEngagementRate) < 3) {
    advice.push('整体互动率偏低，可在视频前 3 秒设置强钩子，并在结尾引导点赞/评论/收藏。')
  } else {
    advice.push('互动率表现良好，可持续复用高互动话术与投票/提问型文案。')
  }

  if (Number(avgStats.avgCompletionRate) > 0 && Number(avgStats.avgCompletionRate) < 30) {
    advice.push('完播率偏低，建议压缩视频节奏，减少铺垫，优先在 5 秒内进入核心信息。')
  } else if (Number(avgStats.avgCompletionRate) >= 30) {
    advice.push('完播率健康，适合发布信息密度高、节奏紧凑的内容。')
  }

  if (avg(videos, 'share_count') > avg(videos, 'comment_count')) {
    advice.push('分享数高于评论数，内容具备社交货币属性，可多产出“可转发”型干货/情绪共鸣内容。')
  }

  if (topVideos.length > 0) {
    advice.push(`近期爆款视频 "${topVideos[0].title}" 可作为下一步二创或系列化的参考样本。`)
  }

  return {
    topVideos,
    lowVideos,
    avgStats,
    engagementTrend,
    contentAdvice: advice
  }
}

// ========== Live Analysis ==========

export function analyzeLiveSessions(sessions = []) {
  if (!sessions.length) {
    return {
      gmvTrend: { dates: [], values: [] },
      bestSessions: [],
      bestTimeSlot: null,
      bestDurationRange: null,
      recommendations: ['暂无直播数据，导入数据后可生成直播建议。']
    }
  }

  const sortedByDate = [...sessions]
    .filter(s => s.live_date)
    .sort((a, b) => new Date(a.live_date) - new Date(b.live_date))

  const gmvTrend = {
    dates: sortedByDate.map(s => fmtDate(s.live_date)),
    values: sortedByDate.map(s => toNum(s.gmv))
  }

  const bestSessions = topPercent(sessions, 'gmv', 0.2).map(s => ({
    id: s.id,
    date: s.live_date || '-',
    duration: toNum(s.duration_minutes),
    gmv: toNum(s.gmv),
    watch: toNum(s.avg_watch),
    conversion: s.avg_watch ? ((toNum(s.orders) / s.avg_watch) * 100).toFixed(2) : '0.00'
  }))

  // Best time slot (prefer hour, fallback to weekday)
  const hourBuckets = {}
  const weekdayBuckets = {}
  sessions.forEach(s => {
    const hour = getHourLabel(s.live_date)
    const weekday = getWeekdayLabel(s.live_date)
    if (hour) {
      hourBuckets[hour] = hourBuckets[hour] || { count: 0, totalGmv: 0, totalWatch: 0 }
      hourBuckets[hour].count += 1
      hourBuckets[hour].totalGmv += toNum(s.gmv)
      hourBuckets[hour].totalWatch += toNum(s.avg_watch)
    }
    if (weekday) {
      weekdayBuckets[weekday] = weekdayBuckets[weekday] || { count: 0, totalGmv: 0, totalWatch: 0 }
      weekdayBuckets[weekday].count += 1
      weekdayBuckets[weekday].totalGmv += toNum(s.gmv)
      weekdayBuckets[weekday].totalWatch += toNum(s.avg_watch)
    }
  })

  let bestTimeSlot = null
  const hourEntries = Object.entries(hourBuckets)
  if (hourEntries.length >= 2) {
    const best = hourEntries.sort((a, b) => (b[1].totalGmv / b[1].count) - (a[1].totalGmv / a[1].count))[0]
    bestTimeSlot = {
      label: best[0],
      by: 'hour',
      sessions: best[1].count,
      avgGmv: Math.round(best[1].totalGmv / best[1].count),
      avgWatch: Math.round(best[1].totalWatch / best[1].count)
    }
  } else {
    const weekdayEntries = Object.entries(weekdayBuckets)
    if (weekdayEntries.length >= 2) {
      const best = weekdayEntries.sort((a, b) => (b[1].totalGmv / b[1].count) - (a[1].totalGmv / a[1].count))[0]
      bestTimeSlot = {
        label: best[0],
        by: 'weekday',
        sessions: best[1].count,
        avgGmv: Math.round(best[1].totalGmv / best[1].count),
        avgWatch: Math.round(best[1].totalWatch / best[1].count)
      }
    }
  }

  // Best duration range
  const ranges = [
    { label: '< 60 分钟', min: 0, max: 60 },
    { label: '60-120 分钟', min: 60, max: 120 },
    { label: '120-180 分钟', min: 120, max: 180 },
    { label: '> 180 分钟', min: 180, max: Infinity }
  ]

  const rangeBuckets = ranges.map(r => ({ ...r, count: 0, totalGmv: 0, totalGmvPerMinute: 0 }))
  sessions.forEach(s => {
    const d = toNum(s.duration_minutes)
    const bucket = rangeBuckets.find(r => d >= r.min && d < r.max)
    if (bucket) {
      bucket.count += 1
      bucket.totalGmv += toNum(s.gmv)
      bucket.totalGmvPerMinute += d > 0 ? toNum(s.gmv) / d : 0
    }
  })

  const validRanges = rangeBuckets.filter(r => r.count > 0)
  const bestDurationRange = validRanges.length
    ? validRanges.sort((a, b) => (b.totalGmv / b.count) - (a.totalGmv / a.count))[0]
    : null

  const recommendations = []
  const avgGmv = avg(sessions, 'gmv')
  const avgWatch = avg(sessions, 'avg_watch')

  if (bestSessions.length > 0 && bestSessions[0].gmv > avgGmv * 1.5) {
    recommendations.push(`"${bestSessions[0].date}" 的 GMV 明显高于均值，建议复盘该场直播的选品与话术策略。`)
  }

  if (bestTimeSlot) {
    recommendations.push(`建议优先在 ${bestTimeSlot.label} 安排直播，该时段场均 GMV 最高（¥${bestTimeSlot.avgGmv.toLocaleString('zh-CN')}）。`)
  }

  if (bestDurationRange) {
    recommendations.push(`当前数据中，${bestDurationRange.label} 的直播场均 GMV 最高，可作为常规排期参考。`)
  }

  const avgConversion = avgWatch ? (avg(sessions, 'orders') / avgWatch) * 100 : 0
  if (avgConversion < 1) {
    recommendations.push('整体转化率偏低，建议加强限时福利、憋单话术与购物车引导。')
  } else if (avgConversion >= 3) {
    recommendations.push('转化率表现优秀，可复制高转化场的排品与讲解节奏。')
  }

  const gmvFirstHalf = gmvTrend.values.slice(0, Math.ceil(gmvTrend.values.length / 2))
  const gmvSecondHalf = gmvTrend.values.slice(Math.floor(gmvTrend.values.length / 2))
  const firstAvg = gmvFirstHalf.length ? gmvFirstHalf.reduce((a, b) => a + b, 0) / gmvFirstHalf.length : 0
  const secondAvg = gmvSecondHalf.length ? gmvSecondHalf.reduce((a, b) => a + b, 0) / gmvSecondHalf.length : 0
  if (firstAvg > 0 && secondAvg < firstAvg * 0.8) {
    recommendations.push('近期 GMV 呈下滑趋势，建议排查流量来源、选品结构与主播状态。')
  } else if (firstAvg > 0 && secondAvg > firstAvg * 1.2) {
    recommendations.push('近期 GMV 呈上升趋势，建议趁热打铁，加大该模式的场次复制。')
  }

  return {
    gmvTrend,
    bestSessions,
    bestTimeSlot,
    bestDurationRange,
    recommendations
  }
}

// ========== Overall Analysis ==========

export function analyzeOverall(liveSessions = [], videos = []) {
  const hasLive = liveSessions.length > 0
  const hasVideo = videos.length > 0

  const liveTotalGmv = liveSessions.reduce((sum, s) => sum + toNum(s.gmv), 0)
  const liveTotalOrders = liveSessions.reduce((sum, s) => sum + toNum(s.orders), 0)
  const liveAvgGmv = hasLive ? liveTotalGmv / liveSessions.length : 0

  const videoTotalPlay = videos.reduce((sum, v) => sum + toNum(v.play_count), 0)
  const videoAvgEngagement = hasVideo ? avg(videos.map(engagementRate)) : 0

  // Trend comparisons (latest 30% vs previous 30%)
  function trendRatio(items, dateKey, valueKey) {
    const sorted = [...items]
      .filter(i => i[dateKey])
      .sort((a, b) => new Date(a[dateKey]) - new Date(b[dateKey]))
    if (sorted.length < 4) return 0
    const chunk = Math.max(1, Math.floor(sorted.length * 0.3))
    const recent = sorted.slice(-chunk).reduce((s, i) => s + toNum(i[valueKey]), 0) / chunk
    const previous = sorted.slice(-chunk * 2, -chunk).reduce((s, i) => s + toNum(i[valueKey]), 0) / chunk
    if (!previous) return 0
    return Number(((recent - previous) / previous * 100).toFixed(1))
  }

  const gmvTrend = hasLive ? trendRatio(liveSessions, 'live_date', 'gmv') : 0
  const playTrend = hasVideo ? trendRatio(videos, 'publish_time', 'play_count') : 0

  const summaryCards = [
    {
      label: '直播总 GMV',
      value: `¥${Math.round(liveTotalGmv).toLocaleString('zh-CN')}`,
      trend: hasLive ? `${gmvTrend >= 0 ? '+' : ''}${gmvTrend}%` : '-',
      icon: '💰'
    },
    {
      label: '直播总订单',
      value: Math.round(liveTotalOrders).toLocaleString('zh-CN'),
      trend: hasLive ? `${liveSessions.length} 场` : '-',
      icon: '🛒'
    },
    {
      label: '短视频总播放',
      value: Math.round(videoTotalPlay).toLocaleString('zh-CN'),
      trend: hasVideo ? `${playTrend >= 0 ? '+' : ''}${playTrend}%` : '-',
      icon: '▶️'
    },
    {
      label: '视频互动率',
      value: `${videoAvgEngagement.toFixed(2)}%`,
      trend: hasVideo ? `${videos.length} 个` : '-',
      icon: '❤️'
    }
  ]

  const insights = []
  if (!hasLive && !hasVideo) {
    insights.push('暂无数据，请导入直播或短视频数据以生成 AI 洞察。')
  } else {
    if (hasLive && hasVideo) {
      insights.push(`当前账号共运营 ${liveSessions.length} 场直播、${videos.length} 个短视频，直播总 GMV 为 ¥${Math.round(liveTotalGmv).toLocaleString('zh-CN')}。`)
      if (videoTotalPlay > 0) {
        const gmvPerPlay = liveTotalGmv / videoTotalPlay
        insights.push(`每万次短视频播放对应约 ¥${(gmvPerPlay * 10000).toFixed(2)} 直播 GMV，短视频引流效率可作为内容策略参考。`)
      }
    } else if (hasLive) {
      insights.push(`当前账号共运营 ${liveSessions.length} 场直播，总 GMV ¥${Math.round(liveTotalGmv).toLocaleString('zh-CN')}，场均 GMV ¥${Math.round(liveAvgGmv).toLocaleString('zh-CN')}。`)
    } else {
      insights.push(`当前账号共发布 ${videos.length} 个短视频，总播放量 ${Math.round(videoTotalPlay).toLocaleString('zh-CN')}，整体互动率 ${videoAvgEngagement.toFixed(2)}%。`)
    }

    if (gmvTrend > 10) {
      insights.push('直播 GMV 近期呈明显上升趋势，建议保持当前运营节奏。')
    } else if (gmvTrend < -10) {
      insights.push('直播 GMV 近期出现下滑，需重点关注流量获取与转化链路。')
    }

    if (playTrend > 10) {
      insights.push('短视频播放量近期增长较快，可考虑加热优质内容或进行直播预告。')
    } else if (playTrend < -10) {
      insights.push('短视频播放量近期下滑，建议复盘选题、封面与发布时间。')
    }

    if (hasLive && liveAvgGmv > 0 && hasVideo && videoTotalPlay > 0) {
      if (liveTotalGmv / liveSessions.length > videoTotalPlay / videos.length * 0.5) {
        insights.push('直播变现效率高于短视频流量价值，建议以直播为核心转化场景，短视频为引流辅助。')
      } else {
        insights.push('短视频流量规模可观，可加强直播预约与短视频挂车，把流量转化为成交。')
      }
    }
  }

  // Health score: weighted average of multiple dimensions
  let score = 50 // baseline
  if (hasLive) {
    score += Math.min(25, (liveAvgGmv / 1000) * 5)
    score += gmvTrend > 0 ? 5 : gmvTrend < 0 ? -5 : 0
  }
  if (hasVideo) {
    score += Math.min(15, videoAvgEngagement * 3)
    score += playTrend > 0 ? 5 : playTrend < 0 ? -5 : 0
  }
  if (!hasLive && !hasVideo) score = 0

  return {
    summaryCards,
    insights,
    healthScore: clamp(Math.round(score), 0, 100)
  }
}
