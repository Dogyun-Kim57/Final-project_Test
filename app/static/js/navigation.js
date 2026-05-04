let map;

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("map");

  map = new kakao.maps.Map(container, {
    center: new kakao.maps.LatLng(37.5665, 126.9780),
    level: 7
  });
});

function searchRoute() {
  alert("경로 검색 기능 연결 예정");
}