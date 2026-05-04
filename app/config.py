import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")

    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "sqlite:///traffic_demo.db"
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    YOLO_MODEL_PATH = os.getenv("YOLO_MODEL_PATH", "yolov8n.pt")