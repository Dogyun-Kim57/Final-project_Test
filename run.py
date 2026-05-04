from app import create_app
from app.extensions import db

app = create_app()

if __name__ == "__main__":
    with app.app_context():
        from app import models   # 모델 등록
        db.create_all()

    app.run(debug=True, host="127.0.0.1", port=5001)