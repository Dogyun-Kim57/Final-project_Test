from app.repositories import camera_repository


def get_camera_list():
    cameras = camera_repository.find_all()

    return [
        {
            "id": camera.id,
            "name": camera.name,
            "location_name": camera.location_name,
            "stream_url": camera.stream_url,
            "thumbnail_url": camera.thumbnail_url,
            "is_live": camera.is_live,
        }
        for camera in cameras
    ]