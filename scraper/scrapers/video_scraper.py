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
            # Navigate to content management page (has video list with data)
            print("正在访问视频数据页面...")
            page.goto(
                "https://creator.douyin.com/creator-micro/content/manage",
                wait_until="networkidle",
            )
            time.sleep(3)  # Rate limiting

            # Wait for data to load
            print("等待页面数据加载...")
            try:
                page.wait_for_selector(
                    "table, [class*='table'], [class*='video-list'], "
                    "[class*='content-list'], [class*='manage-list']",
                    timeout=15000,
                )
            except Exception as e:
                print(f"警告: 未找到预期的数据表格，尝试备用选择器... ({e})")

            # Extract data from the page
            data = self._extract_video_data(page)
            print(f"抓取到 {len(data)} 条视频数据")
            return data

        finally:
            browser.close()
            p.stop()

    def _extract_video_data(self, page):
        """Extract video data from the page.

        Note: CSS selectors are placeholders and may need adjustment
        based on actual Douyin creator center DOM structure.
        """
        data = []

        # Try multiple selector strategies
        selectors = [
            "table tbody tr",
            "[class*='table'] [class*='row']",
            "[class*='video-list'] > div",
            "[class*='content-item']",
            "[class*='video-item']",
            ".data-row",
        ]

        rows = []
        for selector in selectors:
            rows = page.query_selector_all(selector)
            if len(rows) > 0:
                print(f"使用选择器: {selector} (找到 {len(rows)} 行)")
                break

        if not rows:
            print("警告: 未找到任何数据行，请检查页面结构")
            html = page.content()
            debug_file = self.output_dir / "debug_video_page.html"
            debug_file.write_text(html, encoding="utf-8")
            print(f"页面 HTML 已保存到 {debug_file} 供调试")
            return data

        for i, row in enumerate(rows[1:] if len(rows) > 1 else rows):
            try:
                cells = row.query_selector_all(
                    "td, [class*='cell'], [class*='col'], > div"
                )
                if len(cells) < 6:
                    continue

                data.append({
                    "视频标题": cells[0].inner_text().strip(),
                    "发布时间": cells[1].inner_text().strip(),
                    "播放量": cells[2].inner_text().strip(),
                    "点赞数": cells[3].inner_text().strip(),
                    "评论数": cells[4].inner_text().strip(),
                    "分享数": cells[5].inner_text().strip(),
                    "收藏数": cells[6].inner_text().strip()
                    if len(cells) > 6
                    else "0",
                    "完播率": cells[7].inner_text().strip()
                    if len(cells) > 7
                    else "",
                })
            except Exception as e:
                print(f"解析第 {i} 行时出错: {e}")
                continue

        return data
