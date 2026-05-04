from flask import Blueprint, render_template, current_app
from app.services.dashboard_service import get_dashboard_data

main_bp = Blueprint("main", __name__)


@main_bp.route("/")
def dashboard():
    data = get_dashboard_data()
    return render_template("main/dashboard.html", dashboard=data)


@main_bp.route("/monitoring")
def monitoring():
    return render_template(
        "main/monitoring.html",
        kakao_map_js_key=current_app.config.get("KAKAO_MAP_JS_KEY")
    )


@main_bp.route("/reports")
def reports():
    return render_template("main/reports.html")


@main_bp.route("/navigation")
def navigation():
    return render_template("main/navigation.html")


@main_bp.route("/board")
def board():
    return render_template("main/board.html")


@main_bp.route("/settings")
def settings():
    return render_template("main/settings.html")