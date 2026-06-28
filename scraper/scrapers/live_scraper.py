"""Live session data scraper from Douyin creator center."""
import time
from pathlib import Path


class LiveScraper:
    """Scrapes live streaming data from Douyin creator center."""

    def __init__(self, auth_manager, output_dir: str = "./output"):
        self.auth = auth_manager
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)

    def scrape(self, date_range=None):
        """Scrape live session data from Douyin creator center.

        Args:
            date_range: tuple (start_date, end_date) in 'YYYY-MM-DD' format

        Returns:
            list of dicts with raw live session data
        """
        p, browser, context = self.auth.get_browser_context()
        page = context.new_page()

        try:
            # Navigate to live data overview page
            print("正在访问直播数据页面...")
            page.goto(
                "https://creator.douyin.com/creator-micro/data/live/overview",
                wait_until="networkidle",
            )
            time.sleep(3)  # Rate limiting

            # Wait for data to load - try multiple possible selectors
            print("等待页面数据加载...")
            try:
                page.wait_for_selector(
                    "table, [class*='table'], [class*='data'], .data-list, "
                    "[class*='live-list'], [class*='session']",
                    timeout=15000,
                )
            except Exception as e:
                print(f"警告: 未找到预期的数据表格，尝试备用选择器... ({e})")

            # Extract data from the page
            data = self._extract_live_data(page)
            print(f"抓取到 {len(data)} 条直播数据")
            return data

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
