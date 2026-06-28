/**
 * OCR result parser for Douyin creator center screenshots.
 * Tries to detect table headers and rows from raw OCR text.
 */

const LIVE_KEYWORDS = ['直播日期', '直播时长', '场均观看', '直播GMV', '成交订单', '新增粉丝', '互动人数', 'GMV', '订单', '观看', '时长']
const VIDEO_KEYWORDS = ['视频标题', '发布时间', '播放量', '点赞数', '评论数', '分享数', '收藏数', '完播率', '点赞', '评论', '分享', '收藏']

function normalizeNumber(str) {
  if (!str) return ''
  // Remove common OCR noise while keeping digits, dots, and minus
  return str.replace(/[,，\s]/g, '').replace(/[oO]/g, '0')
}

function parseNumber(str) {
  const cleaned = normalizeNumber(str)
  const n = parseFloat(cleaned)
  return Number.isFinite(n) ? n : ''
}

/**
 * Split OCR text into lines and clean them.
 */
export function splitOcrLines(text) {
  return text
    .split(/\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0)
}

/**
 * Detect whether the content looks like live or video data.
 */
export function detectDataType(lines) {
  const sample = lines.slice(0, 20).join(' ')
  let liveScore = 0
  let videoScore = 0

  LIVE_KEYWORDS.forEach(k => {
    if (sample.includes(k)) liveScore++
  })
  VIDEO_KEYWORDS.forEach(k => {
    if (sample.includes(k)) videoScore++
  })

  return liveScore >= videoScore ? 'live' : 'video'
}

/**
 * Heuristic table parser: try to split each line by whitespace or Chinese spaces.
 * Returns array of arrays (rows).
 */
export function parseOcrTable(lines) {
  // Find the header line by looking for known keywords
  let headerIndex = -1
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const line = lines[i]
    const hasLiveHeader = LIVE_KEYWORDS.some(k => line.includes(k))
    const hasVideoHeader = VIDEO_KEYWORDS.some(k => line.includes(k))
    if (hasLiveHeader || hasVideoHeader) {
      headerIndex = i
      break
    }
  }

  // If no header found, just treat first line as header
  if (headerIndex === -1) headerIndex = 0

  const headerLine = lines[headerIndex]
  const dataLines = lines.slice(headerIndex + 1)

  // Try to split header into columns
  // Common separators: multiple spaces, tabs, Chinese whitespace characters
  const headerCols = splitColumns(headerLine)

  const rows = dataLines.map(line => {
    const cols = splitColumns(line)
    // Pad or trim to match header length
    if (cols.length < headerCols.length) {
      while (cols.length < headerCols.length) cols.push('')
    } else if (cols.length > headerCols.length) {
      // If too many columns, maybe merge the first ones as title
      const extra = cols.length - headerCols.length
      const first = cols.slice(0, extra + 1).join(' ')
      cols.splice(0, extra + 1, first)
    }
    return cols
  })

  return { headers: headerCols, rows }
}

function splitColumns(line) {
  // First try tab
  if (line.includes('\t')) return line.split('\t').map(s => s.trim()).filter(Boolean)
  // Then try 2+ spaces
  const bySpaces = line.split(/\s{2,}/).map(s => s.trim()).filter(Boolean)
  if (bySpaces.length >= 2) return bySpaces
  // Fallback: split by common Chinese separators
  return line.split(/[ |｜，,]/).map(s => s.trim()).filter(Boolean)
}

/**
 * Map parsed OCR rows to live session records.
 */
export function mapToLiveRecords(headers, rows) {
  return rows.map(row => {
    const record = {}
    headers.forEach((h, i) => {
      const value = row[i] || ''
      const header = h.trim()

      if (header.includes('日期')) record['直播日期'] = value
      else if (header.includes('时长')) record['直播时长'] = parseNumber(value)
      else if (header.includes('观看') || header.includes('场均')) record['场均观看'] = parseNumber(value)
      else if (header.includes('GMV')) record['直播GMV'] = parseNumber(value)
      else if (header.includes('订单')) record['成交订单数'] = parseNumber(value)
      else if (header.includes('粉丝')) record['新增粉丝'] = parseNumber(value)
      else if (header.includes('互动')) record['互动人数'] = parseNumber(value)
    })

    // If header didn't match, fallback to positional mapping
    if (Object.keys(record).length === 0 && row.length >= 4) {
      record['直播日期'] = row[0]
      record['直播时长'] = parseNumber(row[1])
      record['场均观看'] = parseNumber(row[2])
      record['直播GMV'] = parseNumber(row[3])
      record['成交订单数'] = parseNumber(row[4])
      record['新增粉丝'] = parseNumber(row[5])
      record['互动人数'] = parseNumber(row[6])
    }

    record.raw_data = Object.fromEntries(headers.map((h, i) => [h, row[i] || '']))
    return record
  }).filter(r => r['直播日期'] || r['直播时长'] || r['场均观看'] || r['直播GMV'])
}

/**
 * Map parsed OCR rows to video records.
 */
export function mapToVideoRecords(headers, rows) {
  return rows.map(row => {
    const record = {}
    headers.forEach((h, i) => {
      const value = row[i] || ''
      const header = h.trim()

      if (header.includes('标题')) record['视频标题'] = value
      else if (header.includes('时间')) record['发布时间'] = value
      else if (header.includes('播放')) record['播放量'] = parseNumber(value)
      else if (header.includes('点赞')) record['点赞数'] = parseNumber(value)
      else if (header.includes('评论')) record['评论数'] = parseNumber(value)
      else if (header.includes('分享')) record['分享数'] = parseNumber(value)
      else if (header.includes('收藏')) record['收藏数'] = parseNumber(value)
      else if (header.includes('完播')) record['完播率'] = parseNumber(value)
    })

    // Positional fallback
    if (Object.keys(record).length === 0 && row.length >= 4) {
      record['视频标题'] = row[0]
      record['发布时间'] = row[1]
      record['播放量'] = parseNumber(row[2])
      record['点赞数'] = parseNumber(row[3])
      record['评论数'] = parseNumber(row[4])
      record['分享数'] = parseNumber(row[5])
      record['收藏数'] = parseNumber(row[6])
      record['完播率'] = parseNumber(row[7])
    }

    record.raw_data = Object.fromEntries(headers.map((h, i) => [h, row[i] || '']))
    return record
  }).filter(r => r['视频标题'] || r['播放量'] || r['点赞数'])
}

/**
 * High-level function: OCR text -> cleaned records.
 */
export function parseOcrText(text, forcedType = null) {
  const lines = splitOcrLines(text)
  if (lines.length < 2) {
    throw new Error('OCR 识别内容过少，请上传更清晰的截图')
  }

  const type = forcedType || detectDataType(lines)
  const { headers, rows } = parseOcrTable(lines)

  if (rows.length === 0) {
    throw new Error('未能从 OCR 结果中解析出数据行')
  }

  const records = type === 'live'
    ? mapToLiveRecords(headers, rows)
    : mapToVideoRecords(headers, rows)

  return { type, headers, rows, records }
}
