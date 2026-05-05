import requests
from flask import current_app


REGION_BOUNDS = {
    "seoul": {
        "minX": "126.7",
        "maxX": "127.3",
        "minY": "37.3",
        "maxY": "37.8",
        "label": "서울",
    },
    "gyeonggi": {
        "minX": "126.4",
        "maxX": "127.8",
        "minY": "36.9",
        "maxY": "38.2",
        "label": "경기",
    },
    "daejeon": {
        "minX": "127.2",
        "maxX": "127.6",
        "minY": "36.1",
        "maxY": "36.6",
        "label": "대전",
    },
    "gangwon": {
        "minX": "127.5",
        "maxX": "129.5",
        "minY": "37.0",
        "maxY": "38.6",
        "label": "강원",
    },
    "daegu": {
        "minX": "128.4",
        "maxX": "128.8",
        "minY": "35.7",
        "maxY": "36.0",
        "label": "대구",
    },
    "gwangju": {
        "minX": "126.7",
        "maxX": "127.1",
        "minY": "35.0",
        "maxY": "35.3",
        "label": "광주",
    },
    "busan": {
        "minX": "128.9",
        "maxX": "129.3",
        "minY": "35.0",
        "maxY": "35.4",
        "label": "부산",
    },
}


def get_cctv_list(region="seoul", road_type="highway"):
    """
    ITS CCTV API 호출.
    실패하거나 데이터 구조가 다르면 데모용 fallback 데이터를 반환한다.

    region:
      seoul, gyeonggi, daejeon, gangwon, daegu, gwangju, busan

    road_type:
      highway, tunnel
    """
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
        response = requests.get(base_url, params=params, timeout=5)
        response.raise_for_status()
        data = response.json()

        raw_items = data.get("response", {}).get("data", [])
        cctv_list = []

        for idx, item in enumerate(raw_items[:20], start=1):
            name = item.get("cctvname") or item.get("name") or f"CCTV {idx}"
            lat = item.get("coordy") or item.get("lat")
            lng = item.get("coordx") or item.get("lng")
            cctv_url = item.get("cctvurl") or item.get("url")

            if not lat or not lng:
                continue

            if road_type == "tunnel" and "터널" not in name:
                continue

            cctv_list.append({
                "id": idx,
                "name": name,
                "road_name": item.get("roadsectionid", "도로 정보 없음"),
                "lat": float(lat),
                "lng": float(lng),
                "cctv_url": cctv_url,
                "status": make_demo_status(idx),
                "avg_speed": make_demo_speed(idx),
                "vehicle_count": make_demo_vehicle_count(idx),
            })

        if cctv_list:
            return cctv_list

    except Exception as e:
        print("[ITS API ERROR]", e)

    return get_fallback_cctv_list(region, road_type)


def make_demo_status(idx):
    if idx % 5 == 0:
        return "정체 의심"
    if idx % 3 == 0:
        return "주의"
    return "원활"


def make_demo_speed(idx):
    return 18 + (idx % 5) * 8


def make_demo_vehicle_count(idx):
    return 7 + (idx % 7) * 3


def get_fallback_cctv_list(region="seoul", road_type="highway"):
    bounds = REGION_BOUNDS.get(region, REGION_BOUNDS["seoul"])
    region_label = bounds["label"]
    road_label = "터널" if road_type == "tunnel" else "고속도로"

    base_lat = float(bounds["minY"]) + 0.15
    base_lng = float(bounds["minX"]) + 0.15

    return [
        {
            "id": 1,
            "name": f"{region_label} {road_label} CCTV 01",
            "road_name": f"{region_label} {road_label} 주요 구간 1",
            "lat": base_lat,
            "lng": base_lng,
            "cctv_url": "",
            "status": "정체 의심",
            "avg_speed": 18,
            "vehicle_count": 18,
        },
        {
            "id": 2,
            "name": f"{region_label} {road_label} CCTV 02",
            "road_name": f"{region_label} {road_label} 주요 구간 2",
            "lat": base_lat + 0.04,
            "lng": base_lng + 0.04,
            "cctv_url": "",
            "status": "주의",
            "avg_speed": 32,
            "vehicle_count": 13,
        },
        {
            "id": 3,
            "name": f"{region_label} {road_label} CCTV 03",
            "road_name": f"{region_label} {road_label} 주요 구간 3",
            "lat": base_lat + 0.08,
            "lng": base_lng + 0.08,
            "cctv_url": "",
            "status": "원활",
            "avg_speed": 48,
            "vehicle_count": 8,
        },
    ]