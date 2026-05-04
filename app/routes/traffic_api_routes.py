from flask import Blueprint, request
from app.common.response import success
from app.services.its_api_service import get_cctv_list

traffic_api_bp = Blueprint("traffic_api", __name__)


@traffic_api_bp.route("/traffic/cctv-list")
def traffic_cctv_list():
    region = request.args.get("region", "seoul")
    data = get_cctv_list(region)
    return success(data)