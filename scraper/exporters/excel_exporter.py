"""Excel exporter for scraped data."""
import pandas as pd
from pathlib import Path
from datetime import datetime


def export_to_excel(data, data_type, output_dir="./output"):
    """Export scraped data to Excel matching DataImport.vue format.

    Args:
        data: List of cleaned dicts
        data_type: 'live' or 'video'
        output_dir: Directory to save file

    Returns:
        Path to saved Excel file
    """
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    if data_type == "live":
        filename = f"直播数据_{timestamp}.xlsx"
        df = pd.DataFrame(data)
        columns = [
            "直播日期",
            "直播时长(分钟)",
            "场均观看",
            "直播GMV",
            "成交订单数",
            "新增粉丝",
            "互动人数",
        ]
        # Ensure all columns exist
        for col in columns:
            if col not in df.columns:
                df[col] = ""
        df = df[columns]
    else:
        filename = f"短视频数据_{timestamp}.xlsx"
        df = pd.DataFrame(data)
        columns = [
            "视频标题",
            "发布时间",
            "播放量",
            "点赞数",
            "评论数",
            "分享数",
            "收藏数",
            "完播率(%)",
        ]
        for col in columns:
            if col not in df.columns:
                df[col] = ""
        df = df[columns]

    filepath = output_path / filename
    df.to_excel(filepath, index=False, engine="openpyxl")

    print(f"✅ 数据已导出到: {filepath}")
    print(f"   共 {len(data)} 条记录")
    return filepath
