from flask import Blueprint, request

from app.common.response import success, fail
from app.services.ai_detection_service import analyze_uploaded_file


ai_detection_bp = Blueprint("ai_detection", __name__)


@ai_detection_bp.route("/ai/detect", methods=["POST"])
def detect():
    file = request.files.get("file")

    if not file:
        return fail("분석할 파일이 없습니다.", 400)

    try:
        result = analyze_uploaded_file(file)
        return success(result, "AI 분석이 완료되었습니다.")

    except Exception as e:
        print("[AI DETECTION ERROR]", e)
        return fail("AI 분석 중 오류가 발생했습니다.", 500)