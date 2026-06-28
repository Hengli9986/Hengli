const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// Mock HTML file paths
const MOCK_LIVE_HTML = path.resolve(__dirname, 'mock_live_page.html');
const MOCK_VIDEO_HTML = path.resolve(__dirname, 'mock_video_page.html');
const OUTPUT_DIR = path.resolve(__dirname, 'output');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Helper: Parse duration like '2小时15分' to minutes
function parseDuration(durationStr) {
  if (!durationStr) return 0;
  const hours = durationStr.match(/(\d+)小时/);
  const minutes = durationStr.match(/(\d+)分/);
  let total = 0;
  if (hours) total += parseInt(hours[1]) * 60;
  if (minutes) total += parseInt(minutes[1]);
  if (total === 0) {
    const match = durationStr.match(/\d+/);
    if (match) total = parseInt(match[0]);
  }
  return total;
}

// Helper: Parse numbers like '1.2w', '5,000', '1.5万'
function parseNumber(numStr) {
  if (!numStr) return 0;
  numStr = numStr.toString().trim().replace(/,/g, '').replace(/\s/g, '');
  if (/万/.test(numStr) || /w/i.test(numStr)) {
    const match = numStr.match(/[\d.]+/);
    return match ? Math.round(parseFloat(match[0]) * 10000) : 0;
  }
  if (/千/.test(numStr) || /k/i.test(numStr)) {
    const match = numStr.match(/[\d.]+/);
    return match ? Math.round(parseFloat(match[0]) * 1000) : 0;
  }
  if (/亿/.test(numStr)) {
    const match = numStr.match(/[\d.]+/);
    return match ? Math.round(parseFloat(match[0]) * 100000000) : 0;
  }
  const val = parseFloat(numStr);
  return isNaN(val) ? 0 : Math.round(val);
}

// Helper: Parse GMV like '¥8,560'
function parseGMV(gmvStr) {
  if (!gmvStr) return 0;
  const cleaned = gmvStr.toString().replace(/[¥,\s]/g, '');
  const val = parseFloat(cleaned);
  return isNaN(val) ? 0 : val;
}

// Helper: Parse completion rate like '48.5%'
function parseCompletionRate(rateStr) {
  if (!rateStr) return null;
  const cleaned = rateStr.toString().replace('%', '').trim();
  const val = parseFloat(cleaned);
  return isNaN(val) ? null : val;
}

// Helper: Export to Excel
function exportToExcel(data, dataType, outputDir) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = dataType === 'live' 
    ? `直播数据_${timestamp}.xlsx`
    : `短视频数据_${timestamp}.xlsx`;
  
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, dataType === 'live' ? '直播数据' : '短视频数据');
  
  const filepath = path.join(outputDir, filename);
  XLSX.writeFile(wb, filepath);
  
  return filepath;
}

test.describe('抖音数据抓取器 Mock 测试', () => {
  
  test('测试 1: 直播数据抓取与解析', async ({ page }) => {
    console.log('\n🧪 测试 1: 直播数据抓取 (Mock HTML)');
    console.log('='.repeat(60));
    
    // Load mock HTML
    await page.goto(`file://${MOCK_LIVE_HTML}`);
    await page.waitForSelector('table', { timeout: 5000 });
    
    // Extract data using same selectors as scraper
    const rows = await page.locator('table tbody tr').all();
    console.log(`找到 ${rows.length} 行数据`);
    
    const rawData = [];
    for (let i = 0; i < rows.length; i++) {
      const cells = await rows[i].locator('td').all();
      if (cells.length >= 6) {
        const row = {
          '直播日期': await cells[0].innerText(),
          '直播时长': await cells[1].innerText(),
          '场均观看': await cells[2].innerText(),
          '直播GMV': await cells[3].innerText(),
          '成交订单数': await cells[4].innerText(),
          '新增粉丝': await cells[5].innerText(),
          '互动人数': cells.length > 6 ? await cells[6].innerText() : '0',
        };
        rawData.push(row);
        console.log(`  行 ${i+1}: ${JSON.stringify(row)}`);
      }
    }
    
    expect(rawData.length).toBe(5);
    expect(rawData[0]['直播日期']).toBe('2024-01-20');
    
    // Parse data
    console.log('\n--- 数据清洗 ---');
    const cleaned = rawData.map(row => ({
      '直播日期': row['直播日期'],
      '直播时长(分钟)': parseDuration(row['直播时长']),
      '场均观看': parseNumber(row['场均观看']),
      '直播GMV': parseGMV(row['直播GMV']),
      '成交订单数': parseNumber(row['成交订单数']),
      '新增粉丝': parseNumber(row['新增粉丝']),
      '互动人数': parseNumber(row['互动人数']),
    }));
    
    cleaned.forEach(row => {
      console.log(`  清洗后: ${JSON.stringify(row)}`);
    });
    
    // Verify parsing
    expect(cleaned[0]['直播时长(分钟)']).toBe(135); // 2小时15分 = 135分钟
    expect(cleaned[0]['场均观看']).toBe(12000); // 1.2w = 12000
    expect(cleaned[0]['直播GMV']).toBe(8560); // ¥8,560
    expect(cleaned[2]['直播时长(分钟)']).toBe(180); // 3小时 = 180分钟
    expect(cleaned[2]['场均观看']).toBe(21000); // 2.1w = 21000
    expect(cleaned[3]['直播时长(分钟)']).toBe(45); // 45分 = 45分钟
    
    // Export to Excel
    console.log('\n--- Excel 导出 ---');
    const filepath = exportToExcel(cleaned, 'live', OUTPUT_DIR);
    console.log(`✅ Excel 导出成功: ${filepath}`);
    
    expect(fs.existsSync(filepath)).toBe(true);
    
    // Verify Excel content
    const wb = XLSX.readFile(filepath);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const excelData = XLSX.utils.sheet_to_json(ws);
    expect(excelData.length).toBe(5);
    expect(excelData[0]['直播日期']).toBe('2024-01-20');
    expect(excelData[0]['直播时长(分钟)']).toBe(135);
    expect(excelData[0]['场均观看']).toBe(12000);
    
    console.log('\n✅ 直播数据测试通过！');
  });
  
  test('测试 2: 短视频数据抓取与解析', async ({ page }) => {
    console.log('\n🧪 测试 2: 短视频数据抓取 (Mock HTML)');
    console.log('='.repeat(60));
    
    // Load mock HTML
    await page.goto(`file://${MOCK_VIDEO_HTML}`);
    await page.waitForSelector('.video-item', { timeout: 5000 });
    
    // Extract data
    const rows = await page.locator('.video-item').all();
    console.log(`找到 ${rows.length} 个视频`);
    
    const rawData = [];
    for (let i = 0; i < rows.length; i++) {
      try {
        const title = await rows[i].locator('.video-title').innerText();
        const time = await rows[i].locator('.video-time').innerText();
        const metrics = await rows[i].locator('.metric-value').all();
        
        if (metrics.length >= 6) {
          const row = {
            '视频标题': title,
            '发布时间': time,
            '播放量': await metrics[0].innerText(),
            '点赞数': await metrics[1].innerText(),
            '评论数': await metrics[2].innerText(),
            '分享数': await metrics[3].innerText(),
            '收藏数': await metrics[4].innerText(),
            '完播率': await metrics[5].innerText(),
          };
          rawData.push(row);
          console.log(`  视频 ${i+1}: ${title.substring(0, 30)}...`);
        }
      } catch (e) {
        console.log(`  视频 ${i+1} 解析失败: ${e.message}`);
      }
    }
    
    expect(rawData.length).toBe(5);
    expect(rawData[0]['视频标题']).toContain('爆款视频教程');
    
    // Parse data
    console.log('\n--- 数据清洗 ---');
    const cleaned = rawData.map(row => ({
      '视频标题': row['视频标题'],
      '发布时间': row['发布时间'],
      '播放量': parseNumber(row['播放量']),
      '点赞数': parseNumber(row['点赞数']),
      '评论数': parseNumber(row['评论数']),
      '分享数': parseNumber(row['分享数']),
      '收藏数': parseNumber(row['收藏数']),
      '完播率(%)': parseCompletionRate(row['完播率']),
    }));
    
    cleaned.forEach(row => {
      console.log(`  清洗后: ${row['视频标题'].substring(0, 20)}... 播放:${row['播放量']} 点赞:${row['点赞数']}`);
    });
    
    // Verify parsing
    expect(cleaned[0]['播放量']).toBe(502000); // 50.2w = 502000
    expect(cleaned[0]['点赞数']).toBe(25000); // 2.5w = 25000
    expect(cleaned[0]['完播率(%)']).toBe(48.5); // 48.5%
    expect(cleaned[1]['播放量']).toBe(128000); // 12.8w = 128000
    expect(cleaned[1]['点赞数']).toBe(8500); // 8,500
    
    // Export to Excel
    console.log('\n--- Excel 导出 ---');
    const filepath = exportToExcel(cleaned, 'video', OUTPUT_DIR);
    console.log(`✅ Excel 导出成功: ${filepath}`);
    
    expect(fs.existsSync(filepath)).toBe(true);
    
    // Verify Excel content
    const wb = XLSX.readFile(filepath);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const excelData = XLSX.utils.sheet_to_json(ws);
    expect(excelData.length).toBe(5);
    expect(excelData[0]['视频标题']).toContain('爆款视频教程');
    expect(excelData[0]['播放量']).toBe(502000);
    expect(excelData[0]['完播率(%)']).toBe(48.5);
    
    console.log('\n✅ 短视频数据测试通过！');
  });
  
  test('测试 3: Supabase 配置检查', async () => {
    console.log('\n🧪 测试 3: Supabase 配置检查');
    console.log('='.repeat(60));
    
    const supabase = require('@supabase/supabase-js');
    const dotenv = require('dotenv');
    
    // Load .env from scraper directory
    dotenv.config({ path: path.resolve(__dirname, '../.env') });
    
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    
    console.log(`SUPABASE_URL: ${url ? '✅ 已配置' : '❌ 未配置'}`);
    console.log(`SUPABASE_SERVICE_KEY: ${key ? '✅ 已配置' : '❌ 未配置'}`);
    
    if (!url || !key) {
      console.log('⚠️ Supabase 未配置，跳过连接测试');
      console.log('  如需测试上传，请配置 scraper/.env');
      return;
    }
    
    try {
      const client = supabase.createClient(url, key);
      
      // Test connection by querying a simple table
      const { data, error } = await client.from('live_sessions').select('count', { count: 'exact', head: true });
      
      if (error) {
        console.log(`⚠️ Supabase 连接测试失败: ${error.message}`);
      } else {
        console.log('✅ Supabase 连接成功！');
        console.log(`  live_sessions 表存在，可以上传数据`);
      }
    } catch (e) {
      console.log(`⚠️ Supabase 连接异常: ${e.message}`);
    }
    
    console.log('\n✅ Supabase 配置检查完成！');
  });
  
});

// Print summary after all tests
test.afterAll(async () => {
  console.log('\n' + '='.repeat(60));
  console.log('✅ 所有 Mock 测试完成！');
  console.log('='.repeat(60));
  console.log(`\n输出文件目录: ${OUTPUT_DIR}`);
  
  const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.xlsx'));
  console.log(`生成的 Excel 文件 (${files.length}):`);
  files.forEach(f => console.log(`  - ${f}`));
  
  console.log('\n下一步:');
  console.log('  1. 检查 Excel 文件格式是否正确');
  console.log('  2. 在 DataImport.vue 中上传测试 Excel，验证导入');
  console.log('  3. 确认无误后，修改 scraper 选择器适配真实抖音页面');
});
