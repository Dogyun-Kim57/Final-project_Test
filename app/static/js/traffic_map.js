let map = null;
let selectedCctv = null;
let markers = [];

document.addEventListener("DOMContentLoaded", () => {
  console.log("traffic_map.js loaded");

  const reloadBtn = document.getElementById("reloadBtn");
  const commentBtn = document.getElementById("commentBtn");

  if (reloadBtn) {
    reloadBtn.addEventListener("click", () => {
      console.log("reload clicked");
      loadCctvMarkers();
    });
  }

  if (commentBtn) {
    commentBtn.addEventListener("click", () => {
      console.log("comment clicked");
      generateComment();
    });
  }

  if (!window.kakao || !window.kakao.maps) {
    console.error("Kakao Map SDK is not loaded.");
    const mapEl = document.getElementById("map");
    if (mapEl) {
      mapEl.innerHTML = `
        <div style="padding:24px; font-weight:700;">
          카카오맵 SDK를 불러오지 못했습니다.<br>
          Kakao JavaScript Key와 등록 도메인을 확인하세요.
        </div>
      `;
    }
    return;
  }

  initMap();
  loadCctvMarkers();
});

function initMap() {
  const container = document.getElementById("map");

  if (!container) {
    console.error("#map element not found");
    return;
  }

  const options = {
    center: new kakao.maps.LatLng(37.5665, 126.9780),
    level: 8
  };

  map = new kakao.maps.Map(container, options);
  console.log("map initialized");
}

async function loadCctvMarkers() {
  console.log("loadCctvMarkers start");

  if (!map) {
    console.error("map is not initialized");
    return;
  }

  clearMarkers();

  try {
    const response = await fetch("/api/traffic/cctv-list");
    console.log("cctv api status:", response.status);

    const result = await response.json();
    console.log("cctv api result:", result);

    if (!result.success) {
      alert("CCTV 목록을 불러오지 못했습니다.");
      return;
    }

    const cctvList = result.data || [];

    if (cctvList.length === 0) {
      alert("표시할 CCTV 데이터가 없습니다.");
      return;
    }

    const bounds = new kakao.maps.LatLngBounds();

    cctvList.forEach((cctv) => {
      const position = new kakao.maps.LatLng(cctv.lat, cctv.lng);

      const marker = new kakao.maps.Marker({
        position,
        title: cctv.name
      });

      marker.setMap(map);
      markers.push(marker);
      bounds.extend(position);

      kakao.maps.event.addListener(marker, "click", () => {
        console.log("marker clicked:", cctv);
        selectCctv(cctv);
      });
    });

    map.setBounds(bounds);
    selectCctv(cctvList[0]);

  } catch (error) {
    console.error("CCTV load error:", error);
    alert("CCTV 데이터를 불러오는 중 오류가 발생했습니다.");
  }
}

function clearMarkers() {
  markers.forEach((marker) => marker.setMap(null));
  markers = [];
}

function selectCctv(cctv) {
  selectedCctv = cctv;

  document.getElementById("cctvName").innerText = cctv.name || "-";
  document.getElementById("roadName").innerText = cctv.road_name || "-";
  document.getElementById("status").innerText = cctv.status || "-";
  document.getElementById("avgSpeed").innerText = `${cctv.avg_speed ?? "-"} km/h`;
  document.getElementById("vehicleCount").innerText = `${cctv.vehicle_count ?? "-"} 대`;
  document.getElementById("aiComment").innerText = "AI 코멘트 생성 버튼을 눌러주세요.";

  document.getElementById("commentBtn").disabled = false;
}

async function generateComment() {
  if (!selectedCctv) {
    alert("먼저 CCTV 마커를 선택하세요.");
    return;
  }

  const commentBox = document.getElementById("aiComment");
  commentBox.innerText = "AI 코멘트 생성 중...";

  try {
    const response = await fetch("/api/traffic/comment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        road_name: selectedCctv.road_name,
        avg_speed: selectedCctv.avg_speed,
        vehicle_count: selectedCctv.vehicle_count,
        status: selectedCctv.status
      })
    });

    const result = await response.json();
    console.log("comment result:", result);

    if (!result.success) {
      commentBox.innerText = "코멘트 생성에 실패했습니다.";
      return;
    }

    commentBox.innerText = result.data.comment;

  } catch (error) {
    console.error("comment error:", error);
    commentBox.innerText = "코멘트 생성 중 오류가 발생했습니다.";
  }
}