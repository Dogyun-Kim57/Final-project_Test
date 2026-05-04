from flask import Blueprint, render_template
from app.services.dashboard_service import get_dashboard_data

main_bp = Blueprint("main", __name__)


@main_bp.route("/")
def dashboard():
    dashboard_data = get_dashboard_data()
    return render_template("main/dashboard.html", dashboard=dashboard_data)