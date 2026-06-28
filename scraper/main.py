#!/usr/bin/env python3
"""CLI entry point for Douyin data scraper."""
import argparse
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from auth import AuthManager
from exporters.excel_exporter import export_to_excel
from parsers.data_parser import clean_live_data, clean_video_data
from scrapers.live_scraper import LiveScraper
from scrapers.video_scraper import VideoScraper


def main():
    parser = argparse.ArgumentParser(
        description="抖音数据抓取器 - 从创作者服务中心抓取数据并上传到 Supabase"
    )
    subparsers = parser.add_subparsers(dest="command", help="可用命令")

    # Login command
    login_parser = subparsers.add_parser("login", help="登录抖音创作者服务中心")
    login_parser.add_argument("--headless", action="store_true", help="无头模式 (登录时建议不要启用)")

    # Scrape live data
    live_parser = subparsers.add_parser("scrape-live", help="抓取直播数据")
    live_parser.add_argument("--output", default="./output", help="输出目录")
    live_parser.add_argument("--headless", action="store_true", help="无头模式")
    live_parser.add_argument(
        "--upload", action="store_true", help="直接上传到 Supabase"
    )
    live_parser.add_argument("--user-id", help="Supabase 用户 ID (用于上传)")

    # Scrape video data
    video_parser = subparsers.add_parser("scrape-video", help="抓取短视频数据")
    video_parser.add_argument("--output", default="./output", help="输出目录")
    video_parser.add_argument("--headless", action="store_true", help="无头模式")
    video_parser.add_argument(
        "--upload", action="store_true", help="直接上传到 Supabase"
    )
    video_parser.add_argument("--user-id", help="Supabase 用户 ID (用于上传)")

    args = parser.parse_args()

    if args.command == "login":
        # Login always uses headed mode (visible browser)
        auth = AuthManager(headless=False)
        auth.login()

    elif args.command == "scrape-live":
        run_scraper(
            scraper_class=LiveScraper,
            parser_func=clean_live_data,
            data_type="live",
            args=args,
        )

    elif args.command == "scrape-video":
        run_scraper(
            scraper_class=VideoScraper,
            parser_func=clean_video_data,
            data_type="video",
            args=args,
        )

    else:
        parser.print_help()


def run_scraper(scraper_class, parser_func, data_type, args):
    """Run scraper with optional Supabase upload."""
    auth = AuthManager(headless=args.headless)

    if not auth.is_logged_in():
        print("❌ 未登录，请先运行: python main.py login")
        sys.exit(1)

    # Scrape data
    scraper = scraper_class(auth, output_dir=args.output)
    raw_data = scraper.scrape()

    if not raw_data:
        print("❌ 未抓取到数据，请检查页面结构或登录状态")
        sys.exit(1)

    # Clean data
    cleaned_data = parser_func(raw_data)
    print(f"✅ 清洗后数据: {len(cleaned_data)} 条")

    # Upload to Supabase if requested
    if args.upload:
        if not args.user_id:
            print("❌ 上传模式需要 --user-id 参数")
            print("   获取方法: 在 Vue 应用浏览器控制台运行:")
            print("   (await supabase.auth.getUser()).data.user.id")
            sys.exit(1)

        try:
            from uploader.supabase_uploader import SupabaseUploader

            uploader = SupabaseUploader()
            if data_type == "live":
                uploader.upload_live_data(cleaned_data, args.user_id)
            else:
                uploader.upload_video_data(cleaned_data, args.user_id)
        except Exception as e:
            print(f"❌ 上传到 Supabase 失败: {e}")
            print("   将导出 Excel 作为备选...")
            export_to_excel(cleaned_data, data_type, args.output)
            sys.exit(1)
    else:
        # Export to Excel
        export_to_excel(cleaned_data, data_type, args.output)
        print("\n💡 提示: 使用 --upload --user-id YOUR_ID 可直接上传到 Supabase")


if __name__ == "__main__":
    main()
