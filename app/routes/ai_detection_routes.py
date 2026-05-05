from flask import Blueprint, request, Response, current_app, stream_with_context

from app.common.response import success, fail
from app.services.ai_detection_service import analyze_uploaded_file
from app.services.yolo_stream_service import generate_yolo_stream


ai_detection_bp = Blueprint("ai_detection", __name__)


@ai_detection_bp.route("/ai/detect", methods=["POST"])
def detect():
    """
    이미지 업로드 기반 YOLO 분석 API
    """
    file = request.files.get("file")

    if not file:
        return fail("분석할 파일이 없습니다.", 400)

    try:
        result = analyze_uploaded_file(file)
        return success(result, "AI 분석이 완료되었습니다.")

    except Exception as e:
        print("[AI DETECTION ERROR]", e)
        return fail("AI 분석 중 오류가 발생했습니다.", 500)


@ai_detection_bp.route("/ai/stream")
def ai_stream():
    """
    YOLO 실시간 스트리밍 API

    핵심:
    - 스트리밍 중에는 Flask context가 끊길 수 있음
    - 그래서 여기서 app 객체를 미리 꺼내서 service로 넘김
    """
    source = request.args.get("source", "0")

    # 현재 Flask app 객체를 미리 확보
    app = current_app._get_current_object()

    return Response(
        stream_with_context(generate_yolo_stream(source=source, app=app)),
        mimetype="multipart/x-mixed-replace; boundary=frame"
    )