"""Live data scraper from Douyin creator center."""
import time
from pathlib import Path


class LiveScraper:
    """Scrapes live stream data from Douyin creator center.
    
    Uses persistent browser context from AuthManager - no separate login check needed.
    """

    def __init__(self, auth_manager, output_dir: str = "./output"):
        self.auth = auth_manager
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)

    def scrape(self, date_range=None):
        """Scrape live data from Douyin creator center.

        Args:
            date_range: tuple (start_date, end_date) in 'YYYY-MM-DD' format

        Returns:
            list of dicts with raw live data
        """
        p, context = self.auth.get_browser_context()
        page = context.new_page()

        try:
            print("正在访问直播数据页面...")
            page.goto(
                "https://creator.douyin.com/creator-micro/data/live/overview",
                wait_until="domcontentloaded",
                timeout=60000,
            )
            time.sleep(5)

            # Check if redirected to login
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

            # Wait for data
            print("等待页面数据加载...")
            loaded = False
            for attempt in range(3):
                try:
                    page.wait_for_selector(
                        "table, [class*='table'], [class*='live-list'], "
                        "[class*='data-list'], [class*='live-item']",
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
                self._save_debug_html(page, "debug_live_page")

            data = self._extract_live_data(page)
            print(f"抓取到 {len(data)} 条直播数据")
            return data

        except Exception as e:
            print(f"❌ 抓取过程出错: {e}")
            self._save_debug_html(page, "debug_live_page")
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

    def _extract_live_data(self, page):
        """Extract live data from the page."""
        data = []
        
        # Strategy 1: Table rows
        try:
            rows = page.locator("table tbody tr, [class*='table'] tbody tr").all()
            for row in rows:
                cells = row.locator("td, [class*='cell']").all()
                if len(cells) >= 4:
                    data.append({
                        "直播日期": cells[0].inner_text().strip(),
                        "直播时长": cells[1].inner_text().strip(),
                        "观看人数": cells[2].inner_text().strip(),
                        "销售额": cells[3].inner_text().strip(),
                    })
            if data:
                print(f"  使用 table 策略提取到 {len(data)} 条")
                return data
        except Exception as e:
            print(f"  table 策略失败: {e}")
        
        return data
