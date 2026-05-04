document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("reloadBtn").addEventListener("click", loadCctv);
  loadCctv();
});

async function loadCctv() {
  const region = document.getElementById("regionSelect").value;

  const res = await fetch(`/api/traffic/cctv-list?region=${region}`);
  const result = await res.json();

  const list = document.getElementById("cctvList");
  list.innerHTML = "";

  result.data.forEach(cctv => {
    const el = document.createElement("div");
    el.className = "cctv-item";
    el.innerText = cctv.name;

    el.onclick = () => selectCctv(cctv);

    list.appendChild(el);
  });
}

function selectCctv(cctv) {
  const video = document.getElementById("videoArea");

  if (cctv.cctv_url) {
    video.innerHTML = `
      <video src="${cctv.cctv_url}" controls autoplay width="100%"></video>
    `;
  } else {
    video.innerText = "영상 없음";
  }

  document.getElementById("name").innerText = cctv.name;
  document.getElementById("road").innerText = cctv.road_name;
}