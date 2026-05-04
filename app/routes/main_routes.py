from flask import Blueprint, render_template, current_app

from app.services.dashboard_service import get_dashboard_data
from app.services.route_report_service import get_recent_route_reports


main_bp = Blueprint("main", __name__)


# =========================
# 🟢 대시보드
# =========================
@main_bp.route("/")
def dashboard():
    data = get_dashboard_data()

    return render_template(
        "pages/dashboard.html",   # 🔥 여기 수정됨
        data=data
    )


# =========================
# 🟢 모니터링
# =========================
@main_bp.route("/monitoring")
def monitoring():
    return render_template(
        "pages/monitoring.html",   # 🔥 수정
        kakao_map_js_key=current_app.config.get("KAKAO_MAP_JS_KEY")
    )


# =========================
# 🟢 레포트
# =========================
@main_bp.route("/reports")
def reports():
    reports = get_recent_route_reports(limit=30)

    return render_template(
        "pages/reports.html",   # 🔥 수정
        reports=reports
    )


# =========================
# 🟢 경로 탐색
# =========================
@main_bp.route("/navigation")
def navigation():
    return render_template(
        "pages/navigation.html",   # 🔥 수정
        kakao_map_js_key=current_app.config.get("KAKAO_MAP_JS_KEY"),
        google_maps_api_key=current_app.config.get("GOOGLE_MAPS_API_KEY")
    )


# =========================
# 🟢 게시판
# =========================
@main_bp.route("/board")
def board():
    return render_template(
        "pages/board.html"   # 🔥 수정
    )


# =========================
# 🟢 설정
# =========================
@main_bp.route("/settings")
def settings():
    return render_template(
        "pages/settings.html",   # 🔥 수정
        config=current_app.config
    )