from flask import current_app
import requests


REGION_BOUNDS = {
    "seoul": {
        "minX": "126.76",
        "maxX": "127.18",
        "minY": "37.41",
        "maxY": "37.70",
    },
    "gyeonggi": {
        "minX": "126.50",
        "maxX": "127.80",
        "minY": "36.90",
        "maxY": "38.30",
    },
    "incheon": {
        "minX": "126.30",
        "maxX": "126.85",
        "minY": "37.20",
        "maxY": "37.65",
    },
    "capital": {
        "minX": "126.30",
        "maxX": "127.80",
        "minY": "36.90",
        "maxY": "38.30",
    },
}


def get_cctv_list(region="seoul"):
    api_key = current_app.config.get("ITS_API_KEY")
    base_url = current_app.config.get("ITS_CCTV_BASE_URL")

    bounds = REGION_BOUNDS.get(region, REGION_BOUNDS["seoul"])

    params = {
        "apiKey": api_key,
        "type": "all",
        "cctvType": "1",
        "minX": bounds["minX"],
        "maxX": bounds["maxX"],
        "minY": bounds["minY"],
        "maxY": bounds["maxY"],
        "getType": "json",
    }

    try:
        res = requests.get(base_url, params=params, timeout=10)
        data = res.json()

        cctv_data = data.get("response", {}).get("data", [])

        result = []
        for item in cctv_data:
            result.append({
                "id": item.get("cctvid"),
                "name": item.get("cctvname"),
                "road_name": item.get("roadsectionid"),
                "lat": float(item.get("coordy")),
                "lng": float(item.get("coordx")),
                "cctv_url": item.get("cctvurl"),
                "status": "정상",
                "avg_speed": 0,
                "vehicle_count": 0,
            })

        return result

    except Exception as e:
        print("[ITS ERROR]", e)
        return []