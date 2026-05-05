import os
from datetime import datetime
from werkzeug.utils import secure_filename

from ultralytics import YOLO

from app.extensions import db, socketio
from app.models.camera import Camera
from app.models.detection_event import DetectionEvent


UPLOAD_DIR = "app/static/uploads/detections"
RESULT_DIR = "app/static/uploads/detection_results"

# YOLO 모델은 매 요청마다 로딩하면 너무 느림
# 전역 변수에 한 번만 올려두고 재사용
model = None


def get_model():
    global model

    if model is None:
        # 현재는 공식 YOLOv8 nano 모델 사용
        # 추후 커스텀 학습 모델 best.pt로 교체 가능
        model = YOLO("yolov8n.pt")

    return model


def analyze_uploaded_file(file):
    # 업로드 원본 저장 폴더 생성
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    # Bounding Box 결과 이미지 저장 폴더 생성
    os.makedirs(RESULT_DIR, exist_ok=True)

    filename = secure_filename(file.filename)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    saved_filename = f"{timestamp}_{filename}"
    save_path = os.path.join(UPLOAD_DIR, saved_filename)

    # 사용자가 업로드한 이미지 저장
    file.save(save_path)

    # YOLO 모델 로딩
    yolo = get_model()

    # 이미지 분석 실행
    results = yolo(save_path)
    result = results[0]

    detected_objects = []

    # YOLO 탐지 결과 파싱
    for box in result.boxes:
        class_id = int(box.cls[0])
        confidence = float(box.conf[0])
        class_name = result.names[class_id]

        detected_objects.append({
            "class_name": class_name,
            "confidence": round(confidence, 3)
        })

    # 차량/사람 개수 계산
    vehicle_count = count_vehicles(detected_objects)
    person_count = count_persons(detected_objects)

    # 이벤트 유형과 위험도 판단
    event_type = decide_event_type(vehicle_count, person_count)
    risk_level = decide_risk_level(vehicle_count, person_count)

    # Bounding Box 이미지 저장
    annotated_filename = f"result_{saved_filename}"
    annotated_path = os.path.join(RESULT_DIR, annotated_filename)

    annotated_image = result.plot()
    save_annotated_image(annotated_path, annotated_image)

    snapshot_url = f"/static/uploads/detection_results/{annotated_filename}"

    # 데모용 기본 카메라 확보
    camera = get_default_camera()

    # DB에 탐지 이벤트 저장
    event = DetectionEvent(
        camera_id=camera.id,
        event_type=event_type,
        risk_level=risk_level,
        object_type=make_object_summary(vehicle_count, person_count),
        confidence=get_max_confidence(detected_objects),
        snapshot_url=snapshot_url
    )

    db.session.add(event)
    db.session.commit()

    # 프론트에 넘길 응답 데이터
    result_payload = {
        "event_id": event.id,
        "event_type": event.event_type,
        "risk_level": event.risk_level,
        "object_type": event.object_type,
        "confidence": event.confidence,
        "vehicle_count": vehicle_count,
        "person_count": person_count,
        "detected_objects": detected_objects,
        "snapshot_url": snapshot_url,
        "detected_at": event.detected_at.strftime("%Y-%m-%d %H:%M:%S"),
        "message": make_message(event_type, risk_level, vehicle_count, person_count)
    }

    # 위험/긴급 이벤트만 WebSocket으로 즉시 알림 전송
    if event.risk_level in ["위험", "긴급"]:
        socketio.emit("ai_alert", result_payload)

    return result_payload


def save_annotated_image(path, image):
    # OpenCV는 함수 내부 import로 둬도 됨
    # 서비스 로딩 시점 부담을 줄이기 위함
    import cv2
    cv2.imwrite(path, image)


def count_vehicles(objects):
    # COCO 데이터셋 기준 차량 계열 클래스
    vehicle_classes = {"car", "truck", "bus", "motorcycle"}

    return sum(
        1 for obj in objects
        if obj["class_name"] in vehicle_classes
    )


def count_persons(objects):
    return sum(
        1 for obj in objects
        if obj["class_name"] == "person"
    )


def decide_event_type(vehicle_count, person_count):
    # 차량이 많으면 정체 의심
    if vehicle_count >= 8:
        return "정체 의심"

    # 차량이 1대 이상이면 차량 감지
    if vehicle_count >= 1:
        return "차량 감지"

    # 사람이 있으면 보행자 감지
    if person_count >= 1:
        return "보행자 감지"

    return "이상징후 없음"


def decide_risk_level(vehicle_count, person_count):
    # 데모용 위험도 기준
    # 추후 실제 운영 기준에 맞게 조정 가능
    if vehicle_count >= 12:
        return "긴급"

    if vehicle_count >= 8:
        return "위험"

    if vehicle_count >= 3:
        return "주의"

    if person_count >= 1:
        return "주의"

    return "낮음"


def make_object_summary(vehicle_count, person_count):
    parts = []

    if vehicle_count > 0:
        parts.append(f"vehicle:{vehicle_count}")

    if person_count > 0:
        parts.append(f"person:{person_count}")

    if not parts:
        return "none"

    return ", ".join(parts)


def get_max_confidence(objects):
    if not objects:
        return 0.0

    return max(obj["confidence"] for obj in objects)


def make_message(event_type, risk_level, vehicle_count, person_count):
    if event_type == "정체 의심":
        return f"차량 {vehicle_count}대가 감지되어 정체 가능성이 있습니다. 위험도는 {risk_level}입니다."

    if event_type == "차량 감지":
        return f"차량 {vehicle_count}대가 감지되었습니다. 현재 위험도는 {risk_level}입니다."

    if event_type == "보행자 감지":
        return f"보행자 {person_count}명이 감지되었습니다. 관제 확인이 필요합니다."

    return "특별한 이상징후가 감지되지 않았습니다."


def get_default_camera():
    # 기존 카메라가 있으면 첫 번째 카메라 사용
    camera = Camera.query.first()

    if camera:
        return camera

    # 카메라 데이터가 하나도 없을 경우 데모용 카메라 자동 생성
    camera = Camera(
        name="Demo Camera 01",
        location_name="AI 테스트 구간",
        thumbnail_url="/static/images/placeholder.jpg",
        is_live=True
    )

    db.session.add(camera)
    db.session.commit()

    return camera