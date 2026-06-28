"""Data parsers for scraped Douyin data."""
import re


def parse_duration(duration_str):
    """Parse duration like '1小时30分' or '90' to minutes.

    Args:
        duration_str: Raw duration string from page

    Returns:
        int: Duration in minutes
    """
    if not duration_str:
        return 0

    hours = re.search(r"(\d+)小时", duration_str)
    minutes = re.search(r"(\d+)分", duration_str)

    total = 0
    if hours:
        total += int(hours.group(1)) * 60
    if minutes:
        total += int(minutes.group(1))

    # If no pattern matched, try direct number
    if total == 0:
        try:
            match = re.search(r"\d+", duration_str)
            if match:
                total = int(match.group())
        except (AttributeError, ValueError):
            total = 0

    return total


def parse_number(num_str):
    """Parse numbers like '1.2w', '5,000', '1.5万' to integers.

    Args:
        num_str: Raw number string from page

    Returns:
        int: Parsed number
    """
    if not num_str:
        return 0

    num_str = str(num_str).strip().replace(",", "").replace(" ", "")

    # Handle Chinese units
    if "万" in num_str or "w" in num_str.lower():
        match = re.search(r"[\d.]+", num_str)
        if match:
            return int(float(match.group()) * 10000)
        return 0

    if "千" in num_str or "k" in num_str.lower():
        match = re.search(r"[\d.]+", num_str)
        if match:
            return int(float(match.group()) * 1000)
        return 0

    if "亿" in num_str:
        match = re.search(r"[\d.]+", num_str)
        if match:
            return int(float(match.group()) * 100000000)
        return 0

    try:
        return int(float(num_str))
    except (ValueError, TypeError):
        return 0


def parse_gmv(gmv_str):
    """Parse GMV like '¥1,234.56' or '1234.56' to float.

    Args:
        gmv_str: Raw GMV string from page

    Returns:
        float: Parsed GMV value
    """
    if not gmv_str:
        return 0.0

    gmv_str = str(gmv_str).strip().replace("¥", "").replace(",", "").replace(" ", "")

    try:
        return float(gmv_str)
    except (ValueError, TypeError):
        return 0.0


def parse_completion_rate(rate_str):
    """Parse '45%' or '45.5%' to float.

    Args:
        rate_str: Raw completion rate string

    Returns:
        float or None: Parsed rate
    """
    if not rate_str:
        return None

    rate_str = str(rate_str).strip().replace("%", "").replace(" ", "")

    try:
        return float(rate_str)
    except (ValueError, TypeError):
        return None


def clean_live_data(raw_data):
    """Clean and normalize raw scraped live data.

    Args:
        raw_data: List of dicts from scraper

    Returns:
        List of cleaned dicts matching DataImport.vue format
    """
    cleaned = []
    for row in raw_data:
        cleaned.append(
            {
                "直播日期": row.get("直播日期", ""),
                "直播时长(分钟)": parse_duration(row.get("直播时长", "")),
                "场均观看": parse_number(row.get("场均观看", "")),
                "直播GMV": parse_gmv(row.get("直播GMV", "")),
                "成交订单数": parse_number(row.get("成交订单数", "")),
                "新增粉丝": parse_number(row.get("新增粉丝", "")),
                "互动人数": parse_number(row.get("互动人数", "")),
            }
        )
    return cleaned


def clean_video_data(raw_data):
    """Clean and normalize raw scraped video data.

    Args:
        raw_data: List of dicts from scraper

    Returns:
        List of cleaned dicts matching DataImport.vue format
    """
    cleaned = []
    for row in raw_data:
        cleaned.append(
            {
                "视频标题": row.get("视频标题", ""),
                "发布时间": row.get("发布时间", ""),
                "播放量": parse_number(row.get("播放量", "")),
                "点赞数": parse_number(row.get("点赞数", "")),
                "评论数": parse_number(row.get("评论数", "")),
                "分享数": parse_number(row.get("分享数", "")),
                "收藏数": parse_number(row.get("收藏数", "")),
                "完播率(%)": parse_completion_rate(row.get("完播率", "")),
            }
        )
    return cleaned
