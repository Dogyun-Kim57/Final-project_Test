from flask import Blueprint, request
from app.common.response import success, fail
from app.services.kakao_map_service import get_map_cctv_markers
from app.services.llm_comment_service import generate_traffic_comment

traffic_api_bp = Blueprint("traffic_api", __name__)

@traffic_api_bp.route("/traffic/cctv-list")
def traffic_cctv_list():
    return success(get_map_cctv_markers())

@traffic_api_bp.route("/traffic/comment", methods=["POST"])
def traffic_comment():
    data = request.get_json() or {}

    if not data.get("road_name"):
        return fail("road_name is required", 400)

    comment = generate_traffic_comment(
        road_name=data.get("road_name"),
        avg_speed=data.get("avg_speed"),
        vehicle_count=data.get("vehicle_count"),
        status=data.get("status"),
    )

    return success({"comment": comment})