import os
from werkzeug.utils import secure_filename

from app.models.post import Post, PostFile
from app.repositories import post_repository


UPLOAD_DIR = "app/static/uploads"


def create_post(title, content, files):
    post = Post(title=title, content=content)

    os.makedirs(UPLOAD_DIR, exist_ok=True)

    for file in files:
        if file and file.filename:
            filename = secure_filename(file.filename)
            path = os.path.join(UPLOAD_DIR, filename)

            file.save(path)

            post.files.append(
                PostFile(
                    filename=filename,
                    file_path=f"/static/uploads/{filename}"
                )
            )

    return post_repository.save(post)


def get_posts():
    return post_repository.find_all()