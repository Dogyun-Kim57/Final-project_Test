from flask import Blueprint
from app.common.response import success
from app.services.dashboard_service import get_dashboard_data

api_bp = Blueprint("api", __name__)


@api_bp.route("/dashboard")
def dashboard_api():
    return success(get_dashboard_data())