let map;
let startPlace = null;
let endPlace = null;
let routeLine = null;
let markers = [];
let cctvMarkers = [];

document.addEventListener("DOMContentLoaded", () => {
    initKakaoMap();

    document.getElementById("searchRouteBtn").addEventListener("click", (event) => {
        event.preventDefault();
        searchRoute();
    });

    ["startInput", "endInput"].forEach((id) => {
        const input = document.getElementById(id);

        input.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
            }
        });
    });
});

function initKakaoMap() {
    const container = document.getElementById("map");

    map = new kakao.maps.Map(container, {
        center: new kakao.maps.LatLng(37.5665, 126.9780),
        level: 7
    });
}

window.initGoogleAutocomplete = function () {
    const startInput = document.getElementById("startInput");
    const endInput = document.getElementById("endInput");

    const startAutocomplete = new google.maps.places.Autocomplete(startInput);
    const endAutocomplete = new google.maps.places.Autocomplete(endInput);

    startAutocomplete.addListener("place_changed", () => {
        const place = startAutocomplete.getPlace();
        if (!place.geometry) return;

        startPlace = {
            name: place.name,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
        };
    });

    endAutocomplete.addListener("place_changed", () => {
        const place = endAutocomplete.getPlace();
        if (!place.geometry) return;

        endPlace = {
            name: place.name,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
        };
    });
};

async function searchRoute() {
    if (!startPlace || !endPlace) {
        alert("자동완성 목록에서 출발지와 도착지를 선택해주세요.");
        return;
    }

    clearMap();

    document.getElementById("routeComment").innerText = "경로와 주변 CCTV를 분석 중입니다...";

    const response = await fetch("/api/route/compute", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            origin: {
                name: startPlace.name,
                lat: startPlace.lat,
                lng: startPlace.lng
            },
            destination: {
                name: endPlace.name,
                lat: endPlace.lat,
                lng: endPlace.lng
            }
        })
    });

    const result = await response.json();

    if (!result.success) {
        alert(result.message || "경로 계산에 실패했습니다.");
        return;
    }

    const route = result.data;

    drawRoute(route.path);
    drawNearbyCctvs(route.analysis.nearby_cctvs);
    updateRoutePanel(route);
}

function drawRoute(routePath) {
    if (!routePath || routePath.length === 0) {
        alert("경로 좌표가 없습니다.");
        return;
    }

    const path = routePath.map(point => {
        return new kakao.maps.LatLng(point.lat, point.lng);
    });

    const startLatLng = new kakao.maps.LatLng(startPlace.lat, startPlace.lng);
    const endLatLng = new kakao.maps.LatLng(endPlace.lat, endPlace.lng);

    addMarker(startLatLng, "출발");
    addMarker(endLatLng, "도착");

    routeLine = new kakao.maps.Polyline({
        path: path,
        strokeWeight: 6,
        strokeOpacity: 0.85,
        strokeStyle: "solid"
    });

    routeLine.setMap(map);

    const bounds = new kakao.maps.LatLngBounds();

    path.forEach(point => {
        bounds.extend(point);
    });

    map.setBounds(bounds);
}

function drawNearbyCctvs(cctvs) {
    if (!cctvs) return;

    cctvs.forEach(cctv => {
        const position = new kakao.maps.LatLng(cctv.lat, cctv.lng);

        const marker = new kakao.maps.Marker({
            map: map,
            position: position,
            title: cctv.name
        });

        const infoWindow = new kakao.maps.InfoWindow({
            content: `
        <div style="padding:8px;font-size:13px;">
          <strong>${cctv.name}</strong><br>
          ${cctv.road_name}<br>
          위험도: ${cctv.risk_level}<br>
          점수: ${cctv.congestion_score}
        </div>
      `
        });

        kakao.maps.event.addListener(marker, "click", () => {
            infoWindow.open(map, marker);
        });

        cctvMarkers.push(marker);
    });
}

function addMarker(position, title) {
    const marker = new kakao.maps.Marker({
        map: map,
        position: position,
        title: title
    });

    markers.push(marker);
}

function clearMap() {
    markers.forEach(marker => marker.setMap(null));
    markers = [];

    cctvMarkers.forEach(marker => marker.setMap(null));
    cctvMarkers = [];

    if (routeLine) {
        routeLine.setMap(null);
        routeLine = null;
    }
}

function updateRoutePanel(route) {
    const analysis = route.analysis;

    document.getElementById("startName").innerText = startPlace.name;
    document.getElementById("endName").innerText = endPlace.name;

    document.getElementById("distance").innerText = route.distance_text;
    document.getElementById("duration").innerText = route.duration_text;

    document.getElementById("nearbyCctvCount").innerText =
        `${analysis.nearby_cctv_count}개`;

    document.getElementById("riskLevel").innerText =
        `${analysis.risk_level} (${analysis.average_score}점)`;

    document.getElementById("routeComment").innerText = analysis.comment;
}