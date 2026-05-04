import requests
from flask import current_app


def compute_route(origin, destination):
    api_key = current_app.config.get("KAKAO_REST_API_KEY")

    if not api_key:
        raise ValueError("KAKAO_REST_API_KEY is missing")

    url = "https://apis-navi.kakaomobility.com/v1/directions"

    headers = {
        "Authorization": f"KakaoAK {api_key}",
        "Content-Type": "application/json",
    }

    params = {
        "origin": f"{origin['lng']},{origin['lat']}",
        "destination": f"{destination['lng']},{destination['lat']}",
        "priority": "RECOMMEND",
        "car_fuel": "GASOLINE",
        "car_hipass": "false",
        "alternatives": "false",
        "road_details": "false",
        "summary": "false",
    }

    response = requests.get(url, headers=headers, params=params, timeout=10)

    if response.status_code != 200:
        print("[KAKAO ROUTE ERROR STATUS]", response.status_code)
        print("[KAKAO ROUTE ERROR BODY]", response.text[:1000])

    response.raise_for_status()

    data = response.json()
    routes = data.get("routes", [])

    if not routes:
        raise ValueError("No route found")

    route = routes[0]

    if route.get("result_code") != 0:
        raise ValueError(route.get("result_msg", "Kakao route failed"))

    summary = route.get("summary", {})
    distance = summary.get("distance", 0)
    duration = summary.get("duration", 0)

    path = extract_path(route)

    return {
        "distance_meters": distance,
        "distance_text": format_distance(distance),
        "duration_seconds": duration,
        "duration_text": format_duration(duration),
        "path": path,
    }


def extract_path(route):
    path = []

    sections = route.get("sections", [])

    for section in sections:
        roads = section.get("roads", [])

        for road in roads:
            vertexes = road.get("vertexes", [])

            for i in range(0, len(vertexes), 2):
                lng = vertexes[i]
                lat = vertexes[i + 1]

                path.append({
                    "lat": lat,
                    "lng": lng,
                })

    return path


def format_distance(meters):
    if meters >= 1000:
        return f"{meters / 1000:.1f} km"

    return f"{meters} m"


def format_duration(seconds):
    minutes = seconds // 60
    hours = minutes // 60
    remain_minutes = minutes % 60

    if hours > 0:
        return f"{hours}시간 {remain_minutes}분"

    return f"{minutes}분"