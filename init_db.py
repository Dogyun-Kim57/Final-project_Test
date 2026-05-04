from app import create_app
from app.extensions import db
from app.models.camera import Camera
from app.models.detection_event import DetectionEvent

# ✔ DB 초기화
# ✔ 테스트 데이터 생성
# ✔ 디버깅용 더미 데이터

app = create_app()

with app.app_context():
    db.drop_all()
    db.create_all()

    camera1 = Camera(
        name="Camera 01",
        location_name="주차장 입구",
        thumbnail_url="/static/images/placeholder.jpg",
        is_live=True
    )

    camera2 = Camera(
        name="Camera 02",
        location_name="복도",
        thumbnail_url="/static/images/placeholder.jpg",
        is_live=True
    )

    camera3 = Camera(
        name="Camera 03",
        location_name="후문",
        thumbnail_url="/static/images/placeholder.jpg",
        is_live=True
    )

    db.session.add_all([camera1, camera2, camera3])
    db.session.commit()

    event1 = DetectionEvent(
        camera_id=camera2.id,
        event_type="사람 감지",
        risk_level="주의",
        object_type="person",
        confidence=0.91,
        snapshot_url="/static/images/placeholder.jpg"
    )

    event2 = DetectionEvent(
        camera_id=camera3.id,
        event_type="사람 감지",
        risk_level="주의",
        object_type="person",
        confidence=0.87,
        snapshot_url="/static/images/placeholder.jpg"
    )

    event3 = DetectionEvent(
        camera_id=camera1.id,
        event_type="차량 감지",
        risk_level="주의",
        object_type="car",
        confidence=0.93,
        snapshot_url="/static/images/placeholder.jpg"
    )

    db.session.add_all([event1, event2, event3])
    db.session.commit()

    print("초기 DB 세팅 완료")