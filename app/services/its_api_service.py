import requests
from flask import current_app


def get_cctv_list():
    """
    ITS CCTV API 호출.
    실패하거나 데이터 구조가 다르면 데모용 fallback 데이터를 반환한다.
    """
    api_key = current_app.config.get("ITS_API_KEY")
    base_url = current_app.config.get("ITS_CCTV_BASE_URL")

    params = {
        "apiKey": api_key,
        "type": "all",
        "cctvType": "1",
        "minX": "126.7",
        "maxX": "127.3",
        "minY": "37.3",
        "maxY": "37.8",
        "getType": "json",
    }

    try:
        response = requests.get(base_url, params=params, timeout=5)
        response.raise_for_status()
        data = response.json()

        raw_items = (
            data.get("response", {})
                .get("data", [])
        )

        cctv_list = []

        for idx, item in enumerate(raw_items[:20], start=1):
            name = item.get("cctvname") or item.get("name") or f"CCTV {idx}"
            lat = item.get("coordy") or item.get("lat")
            lng = item.get("coordx") or item.get("lng")
            cctv_url = item.get("cctvurl") or item.get("url")

            if not lat or not lng:
                continue

            cctv_list.append({
                "id": idx,
                "name": name,
                "road_name": item.get("roadsectionid", "도로 정보 없음"),
                "lat": float(lat),
                "lng": float(lng),
                "cctv_url": cctv_url,
                "status": "정상",
                "avg_speed": 25 + (idx % 4) * 7,
                "vehicle_count": 8 + (idx % 6),
            })

        if cctv_list:
            return cctv_list

    except Exception as e:
        print("[ITS API ERROR]", e)

    return get_fallback_cctv_list()


def get_fallback_cctv_list():
    return [
        {
            "id": 1,
            "name": "Demo CCTV 01",
            "road_name": "경부고속도로 양재IC 인근",
            "lat": 37.4683,
            "lng": 127.0396,
            "cctv_url": "",
            "status": "정체 의심",
            "avg_speed": 18,
            "vehicle_count": 14,
        },
        {
            "id": 2,
            "name": "Demo CCTV 02",
            "road_name": "올림픽대로 반포대교 인근",
            "lat": 37.5122,
            "lng": 127.0124,
            "cctv_url": "",
            "status": "주의",
            "avg_speed": 32,
            "vehicle_count": 10,
        },
        {
            "id": 3,
            "name": "Demo CCTV 03",
            "road_name": "강변북로 한남대교 인근",
            "lat": 37.5295,
            "lng": 127.0083,
            "cctv_url": "",
            "status": "원활",
            "avg_speed": 48,
            "vehicle_count": 6,
        },
    ]