from app.repositories import detection_repository


def get_recent_events(limit=5):
    events = detection_repository.find_recent(limit)

    return [
        {
            "id": event.id,
            "camera_name": event.camera.name if event.camera else "",
            "location_name": event.camera.location_name if event.camera else "",
            "event_type": event.event_type,
            "risk_level": event.risk_level,
            "object_type": event.object_type,
            "confidence": event.confidence,
            "snapshot_url": event.snapshot_url,
            "detected_at": event.detected_at.strftime("%Y-%m-%d %H:%M:%S"),
        }
        for event in events
    ]