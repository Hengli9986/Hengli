"""Test scraper with mock HTML data (no real Douyin login needed)."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from playwright.sync_api import sync_playwright

from exporters.excel_exporter import export_to_excel
from parsers.data_parser import clean_live_data, clean_video_data


MOCK_LIVE_HTML = Path(__file__).parent / "mock_live_page.html"
MOCK_VIDEO_HTML = Path(__file__).parent / "mock_video_page.html"
OUTPUT_DIR = Path(__file__).parent / "output"


def test_live_scraper():
    """Test live data scraping from mock HTML."""
    print("=" * 60)
    print("测试 1: 直播数据抓取 (Mock HTML)")
    print("=" * 60)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Load mock HTML file
        page.goto(f"file://{MOCK_LIVE_HTML.resolve()}")
        page.wait_for_selector("table", timeout=5000)

        # Extract data using same logic as live_scraper.py
        rows = page.query_selector_all("table tbody tr")
        print(f"找到 {len(rows)} 行数据")

        raw_data = []
        for i, row in enumerate(rows):
            cells = row.query_selector_all("td")
            if len(cells) >= 6:
                raw_data.append(
                    {
                        "直播日期": cells[0].inner_text().strip(),
                        "直播时长": cells[1].inner_text().strip(),
                        "场均观看": cells[2].inner_text().strip(),
                        "直播GMV": cells[3].inner_text().strip(),
                        "成交订单数": cells[4].inner_text().strip(),
                        "新增粉丝": cells[5].inner_text().strip(),
                        "互动人数": cells[6].inner_text().strip()
                        if len(cells) > 6
                        else "0",
                    }
                )
                print(f"  行 {i+1}: {raw_data[-1]}")

        browser.close()

    # Test parser
    print("\n--- 数据清洗 ---")
    cleaned = clean_live_data(raw_data)
    for row in cleaned:
        print(f"  清洗后: {row}")

    # Test Excel export
    print("\n--- Excel 导出 ---")
    filepath = export_to_excel(cleaned, "live", str(OUTPUT_DIR))
    assert filepath.exists(), "Excel 文件未生成"
    print(f"✅ Excel 导出成功: {filepath}")

    return cleaned


def test_video_scraper():
    """Test video data scraping from mock HTML."""
    print("\n" + "=" * 60)
    print("测试 2: 短视频数据抓取 (Mock HTML)")
    print("=" * 60)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Load mock HTML file
        page.goto(f"file://{MOCK_VIDEO_HTML.resolve()}")
        page.wait_for_selector(".video-item", timeout=5000)

        # Extract data using same logic as video_scraper.py
        rows = page.query_selector_all(".video-item")
        print(f"找到 {len(rows)} 个视频")

        raw_data = []
        for i, row in enumerate(rows):
            try:
                title = row.query_selector(".video-title").inner_text().strip()
                time = row.query_selector(".video-time").inner_text().strip()
                metrics = row.query_selector_all(".metric-value")

                if len(metrics) >= 6:
                    raw_data.append(
                        {
                            "视频标题": title,
                            "发布时间": time,
                            "播放量": metrics[0].inner_text().strip(),
                            "点赞数": metrics[1].inner_text().strip(),
                            "评论数": metrics[2].inner_text().strip(),
                            "分享数": metrics[3].inner_text().strip(),
                            "收藏数": metrics[4].inner_text().strip(),
                            "完播率": metrics[5].inner_text().strip(),
                        }
                    )
                    print(f"  视频 {i+1}: {title[:30]}...")
            except Exception as e:
                print(f"  视频 {i+1} 解析失败: {e}")

        browser.close()

    # Test parser
    print("\n--- 数据清洗 ---")
    cleaned = clean_video_data(raw_data)
    for row in cleaned:
        print(f"  清洗后: {row['视频标题'][:20]}... 播放:{row['播放量']} 点赞:{row['点赞数']}")

    # Test Excel export
    print("\n--- Excel 导出 ---")
    filepath = export_to_excel(cleaned, "video", str(OUTPUT_DIR))
    assert filepath.exists(), "Excel 文件未生成"
    print(f"✅ Excel 导出成功: {filepath}")

    return cleaned


def test_supabase_upload(live_data, video_data):
    """Test Supabase upload with mock data."""
    print("\n" + "=" * 60)
    print("测试 3: Supabase 上传")
    print("=" * 60)

    try:
        from uploader.supabase_uploader import SupabaseUploader

        uploader = SupabaseUploader()

        # Note: This requires a real user_id and will actually insert data
        # For testing, we'll just show what would be uploaded
        print("Supabase 配置正确，可以上传数据")
        print(f"  直播数据: {len(live_data)} 条")
        print(f"  视频数据: {len(video_data)} 条")
        print("\n要实际上传，请运行:")
        print(
            f"  python main.py scrape-live --upload --user-id YOUR_USER_ID"
        )
        print("  (YOUR_USER_ID 从 Vue 应用控制台获取)")

    except Exception as e:
        print(f"⚠️ Supabase 配置检查失败: {e}")
        print("  请检查 .env 文件中的 SUPABASE_URL 和 SUPABASE_SERVICE_KEY")


def main():
    """Run all tests."""
    print("\n" + "🧪 抖音数据抓取器 - Mock 数据测试".center(60))
    print("=" * 60)

    # Create output directory
    OUTPUT_DIR.mkdir(exist_ok=True)

    # Test 1: Live data
    live_data = test_live_scraper()

    # Test 2: Video data
    video_data = test_video_scraper()

    # Test 3: Supabase upload (config check)
    test_supabase_upload(live_data, video_data)

    print("\n" + "=" * 60)
    print("✅ 所有测试完成！")
    print("=" * 60)
    print(f"\n输出文件:")
    print(f"  直播数据 Excel: {OUTPUT_DIR}/直播数据_*.xlsx")
    print(f"  视频数据 Excel: {OUTPUT_DIR}/短视频数据_*.xlsx")
    print(f"\n下一步:")
    print(f"  1. 检查 Excel 文件格式是否正确")
    print(f"  2. 在 DataImport.vue 中上传测试 Excel，验证导入")
    print(f"  3. 确认无误后，修改 scraper 选择器适配真实抖音页面")


if __name__ == "__main__":
    main()
