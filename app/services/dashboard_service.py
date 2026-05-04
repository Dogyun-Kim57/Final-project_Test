from app.repositories import camera_repository, detection_repository
from app.services.camera_service import get_camera_list
from app.services.detection_service import get_recent_events


def get_dashboard_data():
    return {
        "summary": {
            "total_cameras": camera_repository.count_all(),
            "live_cameras": camera_repository.count_live(),
            "today_events": detection_repository.count_today(),
            "total_events": detection_repository.count_all(),
        },
        "cameras": get_camera_list(),
        "recent_events": get_recent_events(limit=5),
    }