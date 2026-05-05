from datetime import datetime

from app.repositories import detection_repository


PAGE_SIZE = 7


def convert_event_to_dict(event, confidence_percent=False):
    """
    DetectionEvent 모델을 화면에서 쓰기 좋은 dict로 변환.
    """
    confidence = event.confidence or 0

    if confidence_percent:
        confidence = round(confidence * 100, 1)

    source_type = classify_event_source(event.snapshot_url)

    return {
        "id": event.id,
        "camera_name": event.camera.name if event.camera else "미지정 카메라",
        "location_name": event.camera.location_name if event.camera else "위치 정보 없음",
        "event_type": event.event_type,
        "risk_level": event.risk_level,
        "object_type": event.object_type or "-",
        "confidence": confidence,
        "snapshot_url": event.snapshot_url,
        "detected_at": event.detected_at.strftime("%Y-%m-%d %H:%M:%S"),
        "detected_date": event.detected_at.date(),
        "source_type": source_type,
    }


def classify_event_source(snapshot_url):
    """
    snapshot_url 파일명 기준으로 출처 구분.
    - realtime_anomaly_... : 실시간 CCTV 탐지 기록
    - result_...           : AI 영상 분석 업로드 기록
    """
    if snapshot_url and "realtime_anomaly_" in snapshot_url:
        return "realtime"

    return "upload"


def paginate_list(items, page, page_size=PAGE_SIZE):
    """
    리스트 페이지네이션 처리.
    """
    total_count = len(items)
    total_pages = max((total_count + page_size - 1) // page_size, 1)

    page = max(page, 1)
    page = min(page, total_pages)

    start = (page - 1) * page_size
    end = start + page_size

    return {
        "items": items[start:end],
        "page": page,
        "total_pages": total_pages,
        "total_count": total_count,
        "has_prev": page > 1,
        "has_next": page < total_pages,
        "prev_page": page - 1,
        "next_page": page + 1,
    }


def get_recent_events(limit=5):
    """
    대시보드/모니터링 로그용 최근 이벤트.
    """
    events = detection_repository.find_recent(limit)

    return [
        convert_event_to_dict(event, confidence_percent=False)
        for event in events
    ]


def get_ai_detection_reports(limit=50):
    """
    전체 AI 탐지 이벤트 조회.
    """
    events = detection_repository.find_recent(limit)

    return [
        convert_event_to_dict(event, confidence_percent=True)
        for event in events
    ]


def get_grouped_detection_reports(
    realtime_page=1,
    upload_page=1,
    previous_page=1,
    limit=300
):
    """
    탐지 레포트 화면 전용 데이터 구성.

    화면 기준:
    - 실시간 이상징후 오늘자 기록: 7개씩 페이지네이션
    - AI 영상 분석 업로드 오늘자 기록: 7개씩 페이지네이션
    - 이전 기록: 실시간/업로드 합쳐서 7개씩 페이지네이션

    위험 기준:
    - 위험 / 긴급만 레포트에 노출
    """
    today = datetime.now().date()

    events = detection_repository.find_recent_by_risk_levels(
        risk_levels=["위험", "긴급"],
        limit=limit
    )

    realtime_today = []
    upload_today = []
    previous_records = []

    for event in events:
        item = convert_event_to_dict(event, confidence_percent=True)

        is_today = item["detected_date"] == today

        if is_today and item["source_type"] == "realtime":
            realtime_today.append(item)
        elif is_today and item["source_type"] == "upload":
            upload_today.append(item)
        else:
            previous_records.append(item)

    return {
        "realtime_today": paginate_list(realtime_today, realtime_page),
        "upload_today": paginate_list(upload_today, upload_page),
        "previous_records": paginate_list(previous_records, previous_page),
        "summary": {
            "realtime_today_count": len(realtime_today),
            "upload_today_count": len(upload_today),
            "previous_count": len(previous_records),
            "total_count": len(realtime_today) + len(upload_today) + len(previous_records),
        }
    }