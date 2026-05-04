from app.services.its_api_service import get_cctv_list


def get_map_cctv_markers():
    cctv_list = get_cctv_list()

    return [
        {
            "id": cctv["id"],
            "name": cctv["name"],
            "road_name": cctv["road_name"],
            "lat": cctv["lat"],
            "lng": cctv["lng"],
            "status": cctv["status"],
            "avg_speed": cctv["avg_speed"],
            "vehicle_count": cctv["vehicle_count"],
            "cctv_url": cctv.get("cctv_url", ""),
        }
        for cctv in cctv_list
    ]