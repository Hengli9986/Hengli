"""Supabase uploader for direct database insertion."""
import os

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv()


class SupabaseUploader:
    """Uploads scraped data directly to Supabase database."""

    def __init__(self):
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_KEY")
        if not url or not key:
            raise ValueError(
                "SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env\n"
                "You can find these in your Supabase Dashboard → Project Settings → API"
            )
        self.client: Client = create_client(url, key)

    def upload_live_data(self, data, user_id):
        """Upload live session data directly to Supabase.

        Args:
            data: List of cleaned dicts
            user_id: Supabase auth user UUID

        Returns:
            Supabase response
        """
        if not data:
            print("没有直播数据需要上传")
            return None

        records = []
        for row in data:
            records.append(
                {
                    "user_id": user_id,
                    "live_date": row.get("直播日期") or None,
                    "duration_minutes": row.get("直播时长(分钟)") or None,
                    "avg_watch": row.get("场均观看") or None,
                    "gmv": row.get("直播GMV") or None,
                    "orders": row.get("成交订单数") or None,
                    "new_fans": row.get("新增粉丝") or None,
                    "interactions": row.get("互动人数") or None,
                    "raw_data": row,
                }
            )

        print(f"正在上传 {len(records)} 条直播数据到 Supabase...")
        response = self.client.table("live_sessions").insert(records).execute()
        print("✅ 直播数据上传完成")
        return response

    def upload_video_data(self, data, user_id):
        """Upload video data directly to Supabase.

        Args:
            data: List of cleaned dicts
            user_id: Supabase auth user UUID

        Returns:
            Supabase response
        """
        if not data:
            print("没有视频数据需要上传")
            return None

        records = []
        for row in data:
            records.append(
                {
                    "user_id": user_id,
                    "title": row.get("视频标题") or None,
                    "publish_time": row.get("发布时间") or None,
                    "play_count": row.get("播放量") or None,
                    "like_count": row.get("点赞数") or None,
                    "comment_count": row.get("评论数") or None,
                    "share_count": row.get("分享数") or None,
                    "collect_count": row.get("收藏数") or None,
                    "completion_rate": row.get("完播率(%)") or None,
                    "raw_data": row,
                }
            )

        print(f"正在上传 {len(records)} 条视频数据到 Supabase...")
        response = self.client.table("videos").insert(records).execute()
        print("✅ 视频数据上传完成")
        return response
