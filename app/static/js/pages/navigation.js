import { fetchRoute } from "../services/routeService.js";
import {
  createKakaoMap,
  createMarker,
  createPolyline,
  fitBounds
} from "../components/mapComponent.js";
import { setText } from "../core/dom.js";

let map;
let startPlace = null;
let endPlace = null;
let routeLine = null;
let markers = [];
let cctvMarkers = [];

document.addEventListener("DOMContentLoaded", () => {
  map = createKakaoMap("map");

  document.getElementById("searchRouteBtn").addEventListener("click", (event) => {
    event.preventDefault();
    searchRoute();
  });

  ["startInput", "endInput"].forEach((id) => {
    const input = document.getElementById(id);
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") event.preventDefault();
    });
  });
});

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
  setText("#routeComment", "경로와 주변 CCTV를 분석 중입니다...");

  const result = await fetchRoute(
    {
      name: startPlace.name,
      lat: startPlace.lat,
      lng: startPlace.lng
    },
    {
      name: endPlace.name,
      lat: endPlace.lat,
      lng: endPlace.lng
    }
  );

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

  markers.push(createMarker(map, startPlace.lat, startPlace.lng, "출발"));
  markers.push(createMarker(map, endPlace.lat, endPlace.lng, "도착"));

  routeLine = createPolyline(map, routePath);
  fitBounds(map, routePath);
}

function drawNearbyCctvs(cctvs) {
  if (!cctvs) return;

  cctvs.forEach(cctv => {
    const marker = createMarker(map, cctv.lat, cctv.lng, cctv.name);

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

function clearMap() {
  markers.forEach(marker => marker.setMap(null));
  cctvMarkers.forEach(marker => marker.setMap(null));

  markers = [];
  cctvMarkers = [];

  if (routeLine) {
    routeLine.setMap(null);
    routeLine = null;
  }
}

function updateRoutePanel(route) {
  const analysis = route.analysis;

  setText("#startName", startPlace.name);
  setText("#endName", endPlace.name);
  setText("#distance", route.distance_text);
  setText("#duration", route.duration_text);
  setText("#nearbyCctvCount", `${analysis.nearby_cctv_count}개`);
  setText("#riskLevel", `${analysis.risk_level} (${analysis.average_score}점)`);
  setText("#routeComment", analysis.comment);
}