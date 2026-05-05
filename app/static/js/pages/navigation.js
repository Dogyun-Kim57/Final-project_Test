import { fetchRoute } from "../services/routeService.js";
import {
  createKakaoMap,
  createMarker,
  createPolyline,
  fitBounds
} from "../components/mapComponent.js";
import { setText } from "../core/dom.js";

let map;
let places;
let startPlace = null;
let endPlace = null;
let routeLine = null;
let markers = [];
let cctvMarkers = [];

let startSearchTimer = null;
let endSearchTimer = null;

document.addEventListener("DOMContentLoaded", () => {
  map = createKakaoMap("map");

  places = new kakao.maps.services.Places();

  const startInput = document.getElementById("startInput");
  const endInput = document.getElementById("endInput");

  startInput.addEventListener("input", () => {
    clearTimeout(startSearchTimer);

    startSearchTimer = setTimeout(() => {
      searchPlaceKeyword(
        startInput.value,
        "start"
      );
    }, 300);
  });

  endInput.addEventListener("input", () => {
    clearTimeout(endSearchTimer);

    endSearchTimer = setTimeout(() => {
      searchPlaceKeyword(
        endInput.value,
        "end"
      );
    }, 300);
  });

  startInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      searchPlaceKeyword(startInput.value, "start");
    }
  });

  endInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      searchPlaceKeyword(endInput.value, "end");
    }
  });

  document.getElementById("searchRouteBtn").addEventListener("click", (event) => {
    event.preventDefault();
    searchRoute();
  });
});


function searchPlaceKeyword(keyword, type) {
  const trimmedKeyword = keyword.trim();

  if (!trimmedKeyword) {
    clearPlaceResults(type);
    return;
  }

  places.keywordSearch(trimmedKeyword, (data, status) => {
    if (status !== kakao.maps.services.Status.OK) {
      renderEmptyPlaceResult(type, "검색 결과가 없습니다.");
      return;
    }

    renderPlaceResults(data.slice(0, 5), type);
  });
}


function renderPlaceResults(results, type) {
  const listEl = getResultListEl(type);
  listEl.innerHTML = "";

  results.forEach((place) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "place-result-item";

    item.innerHTML = `
      <strong>${place.place_name}</strong>
      <span>${place.road_address_name || place.address_name || ""}</span>
    `;

    item.addEventListener("click", () => {
      selectPlace(place, type);
    });

    listEl.appendChild(item);
  });
}


function renderEmptyPlaceResult(type, message) {
  const listEl = getResultListEl(type);

  listEl.innerHTML = `
    <div class="place-result-empty">
      ${message}
    </div>
  `;
}


function clearPlaceResults(type) {
  const listEl = getResultListEl(type);
  listEl.innerHTML = "";
}


function getResultListEl(type) {
  if (type === "start") {
    return document.getElementById("startResultList");
  }

  return document.getElementById("endResultList");
}


function selectPlace(place, type) {
  const selected = {
    name: place.place_name,
    lat: Number(place.y),
    lng: Number(place.x),
    address: place.road_address_name || place.address_name || ""
  };

  if (type === "start") {
    startPlace = selected;
    document.getElementById("startInput").value = selected.name;
    clearPlaceResults("start");
  } else {
    endPlace = selected;
    document.getElementById("endInput").value = selected.name;
    clearPlaceResults("end");
  }

  moveMapToPlace(selected);
}


function moveMapToPlace(place) {
  const position = new kakao.maps.LatLng(place.lat, place.lng);
  map.setCenter(position);
  map.setLevel(5);
}


async function searchRoute() {
  if (!startPlace || !endPlace) {
    alert("출발지와 도착지를 검색 결과 목록에서 선택해주세요.");
    return;
  }

  clearMap();

  setText("#routeComment", "카카오 경로와 주변 CCTV를 분석 중입니다...");

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
    setText("#routeComment", "경로 계산에 실패했습니다.");
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
  if (!cctvs) {
    return;
  }

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