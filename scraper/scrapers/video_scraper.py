"""Video data scraper from Douyin creator center."""
import time
from pathlib import Path


class VideoScraper:
    """Scrapes short video data from Douyin creator center.
    
    Uses persistent browser context from AuthManager - no separate login check needed
    since the persistent context already maintains login state.
    """

    def __init__(self, auth_manager, output_dir: str = "./output"):
        self.auth = auth_manager
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)

    def scrape(self, date_range=None):
        """Scrape video data from Douyin creator center.

        Args:
            date_range: tuple (start_date, end_date) in 'YYYY-MM-DD' format

        Returns:
            list of dicts with raw video data
        """
        p, context = self.auth.get_browser_context()
        page = context.new_page()

        try:
            # Navigate directly to content management page
            # Persistent context already has login state, no need to check separately
            print("正在访问视频数据页面...")
            page.goto(
                "https://creator.douyin.com/creator-micro/content/manage",
                wait_until="domcontentloaded",
                timeout=60000,
            )
            time.sleep(5)  # Wait for dynamic content

            # Check if we got redirected to login page (rare with persistent context)
            print("检查页面状态...")
            login_indicators = [
                'a[href*="login"]', '[class*="login"]', '[class*="signin"]',
                'input[type="tel"]', 'input[placeholder*="手机号"]',
                '.qr-code', '[class*="qr"]', '[class*="扫码"]',
                '[class*="未登录"]', '[class*="请登录"]'
            ]
            is_login_page = False
            for selector in login_indicators:
                try:
                    if page.locator(selector).first.is_visible(timeout=2000):
                        is_login_page = True
                        print(f"  检测到登录页面 (选择器: {selector})")
                        break
                except:
                    continue
            
            if is_login_page:
                print("❌ 登录已失效，请重新运行: python main.py login")
                return []

            # Wait for data with multiple attempts
            print("等待页面数据加载...")
            loaded = False
            for attempt in range(3):
                try:
                    page.wait_for_selector(
                        "table, [class*='table'], [class*='video-list'], "
                        "[class*='content-list'], [class*='manage-list'], "
                        "[class*='video-item'], [class*='content-item']",
                        timeout=15000,
                    )
                    loaded = True
                    print(f"数据加载成功 (尝试 {attempt + 1})")
                    break
                except Exception as e:
                    print(f"等待数据超时 (尝试 {attempt + 1}/3): {e}")
                    time.sleep(3)
            
            if not loaded:
                print("⚠️ 数据加载失败，保存页面供调试...")
                self._save_debug_html(page, "debug_video_page")

            # Extract data from the page
            data = self._extract_video_data(page)
            print(f"抓取到 {len(data)} 条视频数据")
            return data

        except Exception as e:
            print(f"❌ 抓取过程出错: {e}")
            self._save_debug_html(page, "debug_video_page")
            return []
        finally:
            context.close()
            p.stop()

    def _save_debug_html(self, page, filename):
        """Save page HTML for debugging."""
        try:
            html = page.content()
            debug_file = self.output_dir / f"{filename}.html"
            debug_file.write_text(html, encoding="utf-8")
            print(f"📄 调试页面已保存: {debug_file}")
        except Exception as e:
            print(f"保存调试页面失败: {e}")

    def _extract_video_data(self, page):
        """Extract video data from the page using multiple strategies."""
        data = []
        
        # Strategy 1: Try table rows
        try:
            rows = page.locator("table tbody tr, [class*='table'] tbody tr").all()
            for row in rows:
                cells = row.locator("td, [class*='cell']").all()
                if len(cells) >= 4:
                    data.append({
                        "视频标题": cells[0].inner_text().strip(),
                        "发布时间": cells[1].inner_text().strip(),
                        "播放量": cells[2].inner_text().strip(),
                        "点赞数": cells[3].inner_text().strip(),
                    })
            if data:
                print(f"  使用 table 策略提取到 {len(data)} 条")
                return data
        except Exception as e:
            print(f"  table 策略失败: {e}")
        
        # Strategy 2: Try video list items
        try:
            items = page.locator("[class*='video-item'], [class*='content-item']").all()
            for item in items:
                title = item.locator("[class*='title'], h3, h4").first.inner_text().strip()
                data.append({
                    "视频标题": title,
                    "发布时间": "",
                    "播放量": "",
                    "点赞数": "",
                })
            if data:
                print(f"  使用 video-item 策略提取到 {len(data)} 条")
                return data
        except Exception as e:
            print(f"  video-item 策略失败: {e}")
        
        # Strategy 3: Generic - any div with text content
        try:
            # Look for elements that might contain video data
            elements = page.locator("div").all()
            for el in elements:
                text = el.inner_text().strip()
                if len(text) > 5 and len(text) < 200:
                    # Heuristic: might be a video title
                    data.append({
                        "视频标题": text,
                        "发布时间": "",
                        "播放量": "",
                        "点赞数": "",
                    })
            if data:
                print(f"  使用 generic 策略提取到 {len(data)} 条")
                return data[:50]  # Limit to avoid noise
        except Exception as e:
            print(f"  generic 策略失败: {e}")
        
        return data
