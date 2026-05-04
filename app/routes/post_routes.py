from flask import Blueprint, render_template, request, redirect

from app.services.post_service import create_post, get_posts

post_bp = Blueprint("post", __name__, url_prefix="/board")


@post_bp.route("/", methods=["GET"])
def board():
    posts = get_posts()
    return render_template("main/board.html", posts=posts)


@post_bp.route("/create", methods=["POST"])
def create():
    title = request.form.get("title")
    content = request.form.get("content")
    files = request.files.getlist("files")

    create_post(title, content, files)

    return redirect("/board")