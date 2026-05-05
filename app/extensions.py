from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO

# DB 객체
db = SQLAlchemy()

# WebSocket 객체
# threading 모드는 eventlet 없이도 동작해서 데모 단계에서 가장 안정적
socketio = SocketIO(
    cors_allowed_origins="*",
    async_mode="threading"
)