"""Cookie and session management for Douyin login."""
import json
from pathlib import Path

from playwright.sync_api import sync_playwright

COOKIE_FILE = Path(__file__).parent / "cookies.json"


class AuthManager:
    """Manages browser authentication and cookie persistence."""

    def __init__(self, headless: bool = False):
        self.headless = headless

    def login(self) -> None:
        """Open browser for manual login, save cookies afterward."""
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=self.headless)
            context = browser.new_context(
                viewport={"width": 1280, "height": 800},
                user_agent=(
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/120.0.0.0 Safari/537.36"
                ),
            )
            page = context.new_page()

            page.goto("https://creator.douyin.com/")
            print("=" * 50)
            print("请手动登录抖音创作者服务中心")
            print("登录完成后，回到这里按 Enter 键继续")
            print("=" * 50)
            input()

            cookies = context.cookies()
            with open(COOKIE_FILE, "w", encoding="utf-8") as f:
                json.dump(cookies, f, ensure_ascii=False, indent=2)
            print(f"\n✅ Cookies 已保存到 {COOKIE_FILE}")

            browser.close()

    def is_logged_in(self) -> bool:
        """Check if cookies exist and are valid."""
        if not COOKIE_FILE.exists():
            return False

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context()

            with open(COOKIE_FILE, encoding="utf-8") as f:
                cookies = json.load(f)
            context.add_cookies(cookies)

            page = context.new_page()
            page.goto("https://creator.douyin.com/")

            try:
                # Wait for dashboard indicator or content area
                page.wait_for_selector(
                    "[class*='dashboard'], [class*='creator'], [class*='data'], "
                    ".creator-dashboard, .data-overview",
                    timeout=8000,
                )
                browser.close()
                return True
            except Exception:
                browser.close()
                return False

    def get_browser_context(self):
        """Get Playwright browser context with loaded cookies.

        Returns:
            Tuple of (playwright, browser, context)
        """
        p = sync_playwright().start()
        browser = p.chromium.launch(headless=self.headless)
        context = browser.new_context(
            viewport={"width": 1280, "height": 800},
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            ),
        )

        if COOKIE_FILE.exists():
            with open(COOKIE_FILE, encoding="utf-8") as f:
                cookies = json.load(f)
            context.add_cookies(cookies)

        return p, browser, context
