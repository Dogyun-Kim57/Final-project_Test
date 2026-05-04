from flask import Blueprint, render_template
from app.services.dashboard_service import get_dashboard_data

main_bp = Blueprint("main", __name__)

@main_bp.route("/")
def dashboard():
    data = get_dashboard_data()
    return render_template("main/dashboard.html", dashboard=data)