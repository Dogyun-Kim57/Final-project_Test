from flask import Flask

from app.config import Config
from app.extensions import db, socketio

# blueprint import
from app.routes.main_routes import main_bp
from app.routes.api_routes import api_bp
from app.routes.traffic_api_routes import traffic_api_bp
from app.routes.route_api_routes import route_api_bp
from app.routes.ai_detection_routes import ai_detection_bp
from app.routes.post_routes import post_bp
from app.routes.assistant_routes import assistant_bp

def create_app():
    app = Flask(
        __name__,
        template_folder="templates",
        static_folder="static"
    )

    # 환경설정 로드
    app.config.from_object(Config)

    # 확장 객체 초기화
    db.init_app(app)
    socketio.init_app(app)

    # 화면 라우트
    app.register_blueprint(main_bp)

    # API 라우트
    app.register_blueprint(api_bp, url_prefix="/api")
    app.register_blueprint(traffic_api_bp, url_prefix="/api")
    app.register_blueprint(route_api_bp, url_prefix="/api")
    app.register_blueprint(ai_detection_bp, url_prefix="/api")

    # 게시판 라우트
    app.register_blueprint(post_bp)

    # API: /api/assistant/chat
    app.register_blueprint(assistant_bp)


    return app