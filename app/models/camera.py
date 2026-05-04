from datetime import datetime
from app.extensions import db


class Camera(db.Model):
    __tablename__ = "cameras"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    location_name = db.Column(db.String(100), nullable=False)

    stream_url = db.Column(db.String(255), nullable=True)
    thumbnail_url = db.Column(db.String(255), nullable=True)

    is_active = db.Column(db.Boolean, default=True)
    is_live = db.Column(db.Boolean, default=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)