"""Cookie and session management for Douyin login using persistent browser context."""
import json
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

# Persistent context user data directory
USER_DATA_DIR = Path(__file__).parent / "browser_data"
# Storage state file (cookies + localStorage + sessionStorage)
STORAGE_FILE = Path(__file__).parent / "storage_state.json"


class AuthManager:
    """Manages browser authentication using persistent context and storage state.
    
    Uses Playwright's persistent context (user data directory) so the browser
    remembers login state across sessions, including cookies, localStorage,
    sessionStorage, and IndexedDB.
    """

    def __init__(self, headless: bool = False):
        self.headless = headless
        # Ensure user data directory exists
        USER_DATA_DIR.mkdir(parents=True, exist_ok=True)

    def login(self) -> None:
        """Open browser for manual login, save storage state afterward.
        
        Uses persistent browser context so login state is remembered.
        Also saves explicit storage_state.json for backup/transfer.
        """
        with sync_playwright() as p:
            # Launch persistent browser context - this remembers everything
            browser = p.chromium.launch_persistent_context(
                user_data_dir=str(USER_DATA_DIR),
                headless=False,  # Always show browser for login
                viewport={"width": 1280, "height": 800},
                user_agent=(
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/120.0.0.0 Safari/537.36"
                ),
                # Additional args to make persistent context more stable
                args=["--disable-blink-features=AutomationControlled"],
            )
            page = browser.new_page()

            page.goto("https://creator.douyin.com/")
            print("=" * 50)
            print("请手动登录抖音创作者服务中心")
            print("登录完成后，回到这里按 Enter 键继续")
            print("浏览器会自动保存登录状态")
            print("=" * 50)
            input()

            # Save storage state (cookies + localStorage + sessionStorage)
            storage_state = browser.storage_state()
            with open(STORAGE_FILE, "w", encoding="utf-8") as f:
                json.dump(storage_state, f, ensure_ascii=False, indent=2)
            print(f"\n✅ 登录状态已保存到:")
            print(f"   - 浏览器数据目录: {USER_DATA_DIR}")
            print(f"   - 存储状态文件: {STORAGE_FILE}")

            # Also try to save localStorage/sessionStorage explicitly
            try:
                local_storage = page.evaluate("() => JSON.stringify(localStorage)")
                session_storage = page.evaluate("() => JSON.stringify(sessionStorage)")
                storage_backup = {
                    "localStorage": json.loads(local_storage),
                    "sessionStorage": json.loads(session_storage),
                }
                backup_file = Path(__file__).parent / "web_storage.json"
                with open(backup_file, "w", encoding="utf-8") as f:
                    json.dump(storage_backup, f, ensure_ascii=False, indent=2)
                print(f"   - Web Storage 备份: {backup_file}")
            except Exception as e:
                print(f"   (Web Storage 备份可选: {e})")

            browser.close()

    def is_logged_in(self) -> bool:
        """Check if persistent context has valid login state.
        
        Uses the same persistent context directory to check if login is still valid.
        """
        if not USER_DATA_DIR.exists() or not any(USER_DATA_DIR.iterdir()):
            print("浏览器数据目录为空，需要重新登录")
            return False

        with sync_playwright() as p:
            try:
                browser = p.chromium.launch_persistent_context(
                    user_data_dir=str(USER_DATA_DIR),
                    headless=True,
                    viewport={"width": 1280, "height": 800},
                    user_agent=(
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                        "AppleWebKit/537.36 (KHTML, like Gecko) "
                        "Chrome/120.0.0.0 Safari/537.36"
                    ),
                    args=["--disable-blink-features=AutomationControlled"],
                )
            except Exception as e:
                print(f"启动浏览器失败: {e}")
                return False

            page = browser.new_page()
            
            print("正在验证登录状态...")
            page.goto("https://creator.douyin.com/", wait_until="domcontentloaded", timeout=30000)
            
            # Wait for page to settle (redirect, etc.)
            time.sleep(5)
            
            # Check login status with multiple attempts
            for attempt in range(3):
                if attempt > 0:
                    print(f"刷新页面重试 (尝试 {attempt + 1}/3)...")
                    page.reload(wait_until="domcontentloaded", timeout=30000)
                    time.sleep(3)
                
                # Check if we're on login page
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
                            print(f"  检测到登录页面元素: {selector}")
                            break
                    except:
                        continue
                
                if not is_login_page:
                    # Check if we're on dashboard/data page
                    try:
                        page.wait_for_selector(
                            "[class*='dashboard'], [class*='creator'], [class*='data'], "
                            "[class*='overview'], [class*='content'], [class*='manage'], "
                            ".creator-dashboard, .data-overview, .sidebar, .menu",
                            timeout=5000
                        )
                        print("✅ 登录状态有效")
                        browser.close()
                        return True
                    except:
                        print(f"  页面加载中，等待...")
                        time.sleep(2)
                        continue
            
            print("❌ 登录已失效")
            browser.close()
            return False

    def get_browser_context(self):
        """Get Playwright persistent browser context with saved login state.

        Returns:
            Tuple of (playwright, browser_context)
            Note: persistent context returns the context directly, not (browser, context)
        """
        p = sync_playwright().start()
        
        # Use persistent context - this automatically loads all stored data
        context = p.chromium.launch_persistent_context(
            user_data_dir=str(USER_DATA_DIR),
            headless=self.headless,
            viewport={"width": 1280, "height": 800},
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            ),
            args=["--disable-blink-features=AutomationControlled"],
        )

        # Also try to restore storage state from file if persistent context is empty
        if STORAGE_FILE.exists() and not self._has_cookies_in_dir():
            print("从 storage_state.json 恢复登录状态...")
            with open(STORAGE_FILE, encoding="utf-8") as f:
                storage_state = json.load(f)
            # Add cookies to context
            if "cookies" in storage_state:
                context.add_cookies(storage_state["cookies"])
            # Note: localStorage/sessionStorage can't be directly injected,
            # but cookies should be enough for most sites

        return p, context

    def _has_cookies_in_dir(self) -> bool:
        """Check if persistent context directory has any cookie data."""
        # Check for typical Chromium profile files
        cookie_db = USER_DATA_DIR / "Default" / "Cookies"
        network_cookies = USER_DATA_DIR / "Default" / "Network" / "Cookies"
        return cookie_db.exists() or network_cookies.exists()
