"""Video data scraper from Douyin creator center."""
import time
from pathlib import Path


class VideoScraper:
    """Scrapes short video data from Douyin creator center."""

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
        p, browser, context = self.auth.get_browser_context()
        page = context.new_page()

        try:
            # Check login status first
            print("检查登录状态...")
            page.goto("https://creator.douyin.com/", wait_until="domcontentloaded", timeout=30000)
            time.sleep(2)
            
            # Check if we're on login page
            login_indicators = [
                'a[href*="login"]', '[class*="login"]', '[class*="signin"]',
                'input[type="tel"]', 'input[placeholder*="手机号"]',
                '.qr-code', '[class*="qr"]'
            ]
            is_login_page = False
            for selector in login_indicators:
                try:
                    if page.locator(selector).first.is_visible(timeout=2000):
                        is_login_page = True
                        print(f"检测到登录页面 (选择器: {selector})")
                        break
                except:
                    continue
            
            if is_login_page:
                print("❌ 登录已失效，请重新运行: python main.py login")
                return []

            # Navigate to content management page
            print("正在访问视频数据页面...")
            page.goto(
                "https://creator.douyin.com/creator-micro/content/manage",
                wait_until="domcontentloaded",
                timeout=60000,
            )
            time.sleep(5)  # Wait for dynamic content

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

            # Extract data from the page
            data = self._extract_video_data(page)
            print(f"抓取到 {len(data)} 条视频数据")
            return data

        except Exception as e:
            print(f"❌ 抓取过程出错: {e}")
            self._save_debug_html(page, "debug_video_page")
            return []
        finally:
            browser.close()
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
