import { fetchCctvList } from "../services/trafficService.js";
import { renderCctvList } from "../components/cctvComponent.js";
import { setText } from "../core/dom.js";

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("reloadBtn").addEventListener("click", loadCctv);
  loadCctv();
});

async function loadCctv() {
  const region = document.getElementById("regionSelect").value;
  const result = await fetchCctvList(region);

  const list = document.getElementById("cctvList");
  renderCctvList(list, result.data, selectCctv);
}

function selectCctv(cctv) {
  const video = document.getElementById("videoArea");

  if (cctv.cctv_url) {
    video.innerHTML = `<video src="${cctv.cctv_url}" controls autoplay width="100%"></video>`;
  } else {
    video.innerText = "영상 없음";
  }

  setText("#name", cctv.name);
  setText("#road", cctv.road_name);
}