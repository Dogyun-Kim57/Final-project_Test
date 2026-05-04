export function createKakaoMap(containerId, lat = 37.5665, lng = 126.9780, level = 7) {
  const container = document.getElementById(containerId);

  return new kakao.maps.Map(container, {
    center: new kakao.maps.LatLng(lat, lng),
    level
  });
}

export function createMarker(map, lat, lng, title = "") {
  return new kakao.maps.Marker({
    map,
    position: new kakao.maps.LatLng(lat, lng),
    title
  });
}

export function createPolyline(map, path) {
  const kakaoPath = path.map(point => new kakao.maps.LatLng(point.lat, point.lng));

  const line = new kakao.maps.Polyline({
    path: kakaoPath,
    strokeWeight: 6,
    strokeOpacity: 0.85,
    strokeStyle: "solid"
  });

  line.setMap(map);
  return line;
}

export function fitBounds(map, path) {
  const bounds = new kakao.maps.LatLngBounds();

  path.forEach(point => {
    bounds.extend(new kakao.maps.LatLng(point.lat, point.lng));
  });

  map.setBounds(bounds);
}