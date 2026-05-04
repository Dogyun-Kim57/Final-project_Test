from flask import Flask

from app.config import Config
from app.extensions import db, migrate
from app.routes.main_routes import main_bp
from app.routes.api_routes import api_bp


def create_app():
    app = Flask(__name__)

    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)

    app.register_blueprint(main_bp)
    app.register_blueprint(api_bp, url_prefix="/api")

    return app