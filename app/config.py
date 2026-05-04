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

    KAKAO_MAP_JS_KEY = os.getenv("KAKAO_MAP_JS_KEY")

    ITS_API_KEY = os.getenv("ITS_API_KEY")
    ITS_CCTV_BASE_URL = os.getenv(
        "ITS_CCTV_BASE_URL",
        "https://openapi.its.go.kr:9443/cctvInfo"
    )

    LLM_API_KEY = os.getenv("LLM_API_KEY")
    LLM_MODEL = os.getenv("LLM_MODEL", "gpt-4o-mini")