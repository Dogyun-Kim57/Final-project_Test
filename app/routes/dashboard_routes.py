from flask import Blueprint, render_template
from app.services.dashboard_service import get_dashboard_data

dashboard_bp = Blueprint(
    "dashboard",
    __name__,
    url_prefix="/"   # 🔥 여기 핵심
)


@dashboard_bp.route("/")
def dashboard():
    data = get_dashboard_data()
    return render_template("dashboard.html", data=data)