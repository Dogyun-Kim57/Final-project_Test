from datetime import datetime, date
from app.extensions import db
from app.models.detection_event import DetectionEvent


def find_recent(limit=5):
    return (
        DetectionEvent.query
        .order_by(DetectionEvent.detected_at.desc())
        .limit(limit)
        .all()
    )


def count_all():
    return DetectionEvent.query.count()


def count_today():
    today = date.today()

    return (
        DetectionEvent.query
        .filter(db.func.date(DetectionEvent.detected_at) == today)
        .count()
    )


def save(event):
    db.session.add(event)
    db.session.commit()
    return event