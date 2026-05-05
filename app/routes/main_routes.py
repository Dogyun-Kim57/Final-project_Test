from flask import Blueprint, render_template, current_app, request

from app.services.dashboard_service import get_dashboard_data
from app.services.route_report_service import get_recent_route_reports
from app.services.detection_service import get_grouped_detection_reports


main_bp = Blueprint("main", __name__)


@main_bp.route("/")
def dashboard():
    data = get_dashboard_data()
    return render_template("pages/dashboard.html", data=data)


@main_bp.route("/monitoring")
def monitoring():
    return render_template(
        "pages/monitoring.html",
        kakao_map_js_key=current_app.config.get("KAKAO_MAP_JS_KEY")
    )


@main_bp.route("/ai-detect")
def ai_detect_page():
    return render_template("pages/ai_detect.html")


@main_bp.route("/reports")
def reports():
    """
    탐지 레포트 화면.

    query string 예시:
    /reports?rt_page=1&up_page=1&prev_page=1
    """
    realtime_page = request.args.get("rt_page", 1, type=int)
    upload_page = request.args.get("up_page", 1, type=int)
    previous_page = request.args.get("prev_page", 1, type=int)

    detection_groups = get_grouped_detection_reports(
        realtime_page=realtime_page,
        upload_page=upload_page,
        previous_page=previous_page,
        limit=300
    )

    route_reports = get_recent_route_reports(limit=30)

    return render_template(
        "pages/reports.html",
        detection_groups=detection_groups,
        route_reports=route_reports
    )


@main_bp.route("/navigation")
def navigation():
    return render_template(
        "pages/navigation.html",
        kakao_map_js_key=current_app.config.get("KAKAO_MAP_JS_KEY"),
        google_maps_api_key=current_app.config.get("GOOGLE_MAPS_API_KEY")
    )


@main_bp.route("/settings")
def settings():
    return render_template(
        "pages/settings.html",
        config=current_app.config
    )