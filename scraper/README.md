# 抖音数据抓取器 (Douyin Data Scraper)

使用 Playwright 自动化浏览器从抖音创作者服务中心抓取数据，支持直接上传到 Supabase 数据库或导出 Excel。

## 安装

```bash
cd scraper

# 创建虚拟环境（推荐）
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 安装 Playwright 浏览器
playwright install chromium
```

## 配置

复制 `.env.example` 为 `.env`，并填写你的 Supabase 信息：

```bash
cp .env.example .env
```

编辑 `.env`：

```
# Supabase 配置（用于直接上传）
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# 输出目录（Excel 导出时使用）
OUTPUT_DIR=./output

# 是否使用无头模式（不显示浏览器窗口）
HEADLESS=false
```

**注意：** `SUPABASE_SERVICE_KEY` 是 Service Role Key，不是 Anon Key。可以在 Supabase Dashboard → Project Settings → API → service_role key 找到。**切勿将此密钥泄露到前端代码中。**

## 使用

### 1. 登录抖音创作者服务中心

```bash
python main.py login
```

这会打开浏览器窗口，请手动登录抖音创作者服务中心。登录完成后按 Enter 键保存 cookies。

### 2. 抓取直播数据

**导出 Excel（Phase 4.1）：**
```bash
python main.py scrape-live
```

**直接上传到 Supabase（Phase 4.2）：**
```bash
python main.py scrape-live --upload --user-id YOUR_USER_ID
```

### 3. 抓取短视频数据

**导出 Excel：**
```bash
python main.py scrape-video
```

**直接上传到 Supabase：**
```bash
python main.py scrape-video --upload --user-id YOUR_USER_ID
```

### 4. 获取 User ID

如果需要直接上传到 Supabase，需要知道你的用户 ID。可以在 Vue 应用的浏览器控制台运行：

```javascript
// 在 geek抖音服务站 页面打开浏览器控制台 (F12)
(await supabase.auth.getUser()).data.user.id
```

## 数据格式

抓取的数据会自动转换为与 DataImport.vue 兼容的格式：

**直播数据字段：**
- 直播日期
- 直播时长(分钟)
- 场均观看
- 直播GMV
- 成交订单数
- 新增粉丝
- 互动人数

**短视频数据字段：**
- 视频标题
- 发布时间
- 播放量
- 点赞数
- 评论数
- 分享数
- 收藏数
- 完播率(%)

## 注意事项

1. **DOM 选择器是占位符** — 抖音页面结构经常变化，需要根据实际情况调整 `live_scraper.py` 和 `video_scraper.py` 中的 CSS 选择器
2. **反爬策略** — 默认使用有头模式（显示浏览器），降低被检测风险
3. **频率限制** — 每次页面导航后有 3 秒延迟
4. **Cookie 有效期** — 如果登录失效，需要重新运行 `python main.py login`

## 故障排除

**问题：未抓取到数据**
- 检查是否已登录：`python main.py login`
- 检查页面结构是否变化（需要更新 CSS 选择器）
- 尝试非无头模式查看浏览器行为

**问题：Supabase 上传失败**
- 检查 `.env` 中的 `SUPABASE_URL` 和 `SUPABASE_SERVICE_KEY`
- 检查 `user_id` 是否正确
- 检查网络连接

## 技术栈

- **Playwright** — 浏览器自动化
- **Pandas + openpyxl** — Excel 导出
- **supabase-py** — Supabase 数据库上传
- **python-dotenv** — 环境变量管理
