from flask import Blueprint, render_template, current_app

map_bp = Blueprint("map", __name__)

@map_bp.route("/traffic-map")
def traffic_map():
    return render_template(
        "main/monitoring.html",
        kakao_map_js_key=current_app.config.get("KAKAO_MAP_JS_KEY")
    )