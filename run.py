from app import create_app
from app.extensions import db, socketio

# SQLAlchemy 모델 등록용
import app.models

app = create_app()

if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    socketio.run(
        app,
        debug=True,
        host="127.0.0.1",
        port=5001,
        allow_unsafe_werkzeug=True,
        use_reloader=False  # 웹캠/스트리밍 중복 실행 방지
    )