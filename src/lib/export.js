import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

/**
 * Export live analysis report as PDF
 */
export function exportLiveReportPDF(liveSessions, stats) {
  const doc = new jsPDF()
  
  // Title
  doc.setFontSize(18)
  doc.text('直播数据分析报告', 14, 20)
  
  doc.setFontSize(10)
  doc.text(`生成时间: ${new Date().toLocaleString('zh-CN')}`, 14, 28)
  
  // Stats summary
  doc.setFontSize(12)
  doc.text('数据概览', 14, 40)
  
  doc.setFontSize(10)
  const statsData = [
    ['直播场次', stats.sessionCount.toString()],
    ['场均观看', stats.avgWatch.toLocaleString('zh-CN')],
    ['总GMV', `¥${stats.totalGmv.toLocaleString('zh-CN')}`],
    ['总成交订单', stats.totalOrders.toLocaleString('zh-CN')],
    ['场均GMV', `¥${stats.avgGmvPerSession.toLocaleString('zh-CN')}`],
    ['平均直播时长', `${stats.avgDuration} 分钟`],
    ['平均转化率', `${stats.avgConversion}%`]
  ]
  
  autoTable(doc, {
    startY: 45,
    head: [['指标', '数值']],
    body: statsData,
    theme: 'grid',
    headStyles: { fillColor: [0, 113, 227] },
    styles: { font: 'helvetica', fontSize: 10 }
  })
  
  // Data table
  const finalY = doc.lastAutoTable?.finalY || 80
  doc.setFontSize(12)
  doc.text('直播明细', 14, finalY + 10)
  
  autoTable(doc, {
    startY: finalY + 15,
    head: [['日期', '时长(分)', '观看', 'GMV', '订单', '新增粉丝', '互动']],
    body: liveSessions.map(s => [
      s.live_date || '-',
      s.duration_minutes || '-',
      (s.avg_watch || 0).toLocaleString('zh-CN'),
      `¥${(parseFloat(s.gmv) || 0).toLocaleString('zh-CN')}`,
      (s.orders || 0).toLocaleString('zh-CN'),
      (s.new_fans || 0).toLocaleString('zh-CN'),
      (s.interactions || 0).toLocaleString('zh-CN')
    ]),
    theme: 'grid',
    headStyles: { fillColor: [0, 113, 227] },
    styles: { font: 'helvetica', fontSize: 9 }
  })
  
  doc.save('直播分析报告.pdf')
}

/**
 * Export video analysis report as PDF
 */
export function exportVideoReportPDF(videos, stats) {
  const doc = new jsPDF()
  
  doc.setFontSize(18)
  doc.text('短视频数据分析报告', 14, 20)
  
  doc.setFontSize(10)
  doc.text(`生成时间: ${new Date().toLocaleString('zh-CN')}`, 14, 28)
  
  // Stats summary
  doc.setFontSize(12)
  doc.text('数据概览', 14, 40)
  
  doc.setFontSize(10)
  const statsData = [
    ['视频总数', stats.videoCount.toString()],
    ['总播放量', stats.totalPlay.toLocaleString('zh-CN')],
    ['总点赞', stats.totalLike.toLocaleString('zh-CN')],
    ['总评论', stats.totalComment.toLocaleString('zh-CN')],
    ['总分享', stats.totalShare.toLocaleString('zh-CN')],
    ['平均播放', stats.avgPlay.toLocaleString('zh-CN')],
    ['平均点赞', stats.avgLike.toLocaleString('zh-CN')],
    ['互动率', `${stats.engagementRate}%`]
  ]
  
  autoTable(doc, {
    startY: 45,
    head: [['指标', '数值']],
    body: statsData,
    theme: 'grid',
    headStyles: { fillColor: [0, 113, 227] },
    styles: { font: 'helvetica', fontSize: 10 }
  })
  
  // Top videos
  const finalY = doc.lastAutoTable?.finalY || 80
  doc.setFontSize(12)
  doc.text('爆款视频 TOP', 14, finalY + 10)
  
  autoTable(doc, {
    startY: finalY + 15,
    head: [['排名', '标题', '播放', '点赞']],
    body: stats.topVideos.map((v, i) => [
      (i + 1).toString(),
      v.title || '-',
      (v.playCount || 0).toLocaleString('zh-CN'),
      (v.likeCount || 0).toLocaleString('zh-CN')
    ]),
    theme: 'grid',
    headStyles: { fillColor: [255, 159, 10] },
    styles: { font: 'helvetica', fontSize: 9 }
  })
  
  // All videos
  const finalY2 = doc.lastAutoTable?.finalY || 120
  doc.setFontSize(12)
  doc.text('视频明细', 14, finalY2 + 10)
  
  autoTable(doc, {
    startY: finalY2 + 15,
    head: [['标题', '发布时间', '播放', '点赞', '评论', '分享', '收藏']],
    body: videos.map(v => [
      v.title || '-',
      v.publish_time ? new Date(v.publish_time).toLocaleString('zh-CN') : '-',
      (v.play_count || 0).toLocaleString('zh-CN'),
      (v.like_count || 0).toLocaleString('zh-CN'),
      (v.comment_count || 0).toLocaleString('zh-CN'),
      (v.share_count || 0).toLocaleString('zh-CN'),
      (v.collect_count || 0).toLocaleString('zh-CN')
    ]),
    theme: 'grid',
    headStyles: { fillColor: [0, 113, 227] },
    styles: { font: 'helvetica', fontSize: 8 }
  })
  
  doc.save('短视频分析报告.pdf')
}

/**
 * Export AI analysis report as PDF
 */
export function exportAIAnalysisPDF(liveSessions, videos, overall, videoAnalysis, liveAnalysis) {
  const doc = new jsPDF()

  // Title
  doc.setFontSize(18)
  doc.text('AI 数据洞察报告', 14, 20)

  doc.setFontSize(10)
  doc.text(`生成时间: ${new Date().toLocaleString('zh-CN')}`, 14, 28)

  // Health score
  doc.setFontSize(14)
  doc.text(`账号健康度评分: ${overall.healthScore}/100`, 14, 42)

  // Summary cards
  doc.setFontSize(12)
  doc.text('数据概览', 14, 54)

  autoTable(doc, {
    startY: 59,
    head: [['指标', '数值', '趋势']],
    body: overall.summaryCards.map(c => [c.label, c.value, c.trend]),
    theme: 'grid',
    headStyles: { fillColor: [0, 113, 227] },
    styles: { font: 'helvetica', fontSize: 10 }
  })

  // Core insights
  let finalY = doc.lastAutoTable?.finalY || 90
  doc.setFontSize(12)
  doc.text('核心洞察', 14, finalY + 10)

  autoTable(doc, {
    startY: finalY + 15,
    head: [['序号', '洞察']],
    body: overall.insights.map((insight, i) => [(i + 1).toString(), insight]),
    theme: 'grid',
    headStyles: { fillColor: [0, 113, 227] },
    styles: { font: 'helvetica', fontSize: 9 }
  })

  // Video advice
  if (videos.length > 0) {
    finalY = doc.lastAutoTable?.finalY || 130
    doc.setFontSize(12)
    doc.text('短视频优化建议', 14, finalY + 10)

    autoTable(doc, {
      startY: finalY + 15,
      head: [['序号', '建议']],
      body: videoAnalysis.contentAdvice.map((advice, i) => [(i + 1).toString(), advice]),
      theme: 'grid',
      headStyles: { fillColor: [255, 159, 10] },
      styles: { font: 'helvetica', fontSize: 9 }
    })
  }

  // Live recommendations
  if (liveSessions.length > 0) {
    finalY = doc.lastAutoTable?.finalY || 170
    doc.setFontSize(12)
    doc.text('直播运营建议', 14, finalY + 10)

    autoTable(doc, {
      startY: finalY + 15,
      head: [['序号', '建议']],
      body: liveAnalysis.recommendations.map((rec, i) => [(i + 1).toString(), rec]),
      theme: 'grid',
      headStyles: { fillColor: [52, 199, 89] },
      styles: { font: 'helvetica', fontSize: 9 }
    })
  }

  doc.save('AI数据洞察报告.pdf')
}

/**
 * Export all data as Excel backup
 */
export function exportAllDataExcel(liveSessions, videos) {
  const wb = XLSX.utils.book_new()
  
  // Live sessions sheet
  const liveWs = XLSX.utils.json_to_sheet(liveSessions.map(s => ({
    '直播日期': s.live_date || '',
    '时长(分钟)': s.duration_minutes || '',
    '场均观看': s.avg_watch || '',
    'GMV': s.gmv || '',
    '订单数': s.orders || '',
    '新增粉丝': s.new_fans || '',
    '互动人数': s.interactions || ''
  })))
  XLSX.utils.book_append_sheet(wb, liveWs, '直播数据')
  
  // Videos sheet
  const videoWs = XLSX.utils.json_to_sheet(videos.map(v => ({
    '视频标题': v.title || '',
    '发布时间': v.publish_time || '',
    '播放量': v.play_count || '',
    '点赞数': v.like_count || '',
    '评论数': v.comment_count || '',
    '分享数': v.share_count || '',
    '收藏数': v.collect_count || '',
    '完播率(%)': v.completion_rate || ''
  })))
  XLSX.utils.book_append_sheet(wb, videoWs, '短视频数据')
  
  XLSX.writeFile(wb, `抖音数据备份_${new Date().toISOString().slice(0, 10)}.xlsx`)
}
