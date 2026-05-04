from flask import Flask

from app.config import Config
from app.extensions import db, migrate



# blueprint 모음

from app.routes.main_routes import main_bp
from app.routes.api_routes import api_bp
from app.routes.map_routes import map_bp
from app.routes.traffic_api_routes import traffic_api_bp


# 구동 파일을 만든다.

def create_app():
    app = Flask(__name__)

    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)


# blueprint
    app.register_blueprint(main_bp)
    app.register_blueprint(api_bp, url_prefix="/api")
    app.register_blueprint(map_bp)
    app.register_blueprint(traffic_api_bp, url_prefix="/api")


    return app