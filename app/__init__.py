from flask import Flask

from app.config import Config
from app.extensions import db

# blueprint import
from app.routes.main_routes import main_bp
from app.routes.api_routes import api_bp
from app.routes.traffic_api_routes import traffic_api_bp
from app.routes.route_api_routes import route_api_bp
from app.routes.post_routes import post_bp

def create_app():
    app = Flask(__name__,
                template_folder='templates',
                static_folder='static')

    app.config.from_object(Config)

    db.init_app(app)

    # blueprint 등록
    app.register_blueprint(main_bp)
    app.register_blueprint(api_bp, url_prefix="/api")
    app.register_blueprint(traffic_api_bp, url_prefix="/api")
    app.register_blueprint(route_api_bp, url_prefix="/api")
    app.register_blueprint(post_bp)


    return app