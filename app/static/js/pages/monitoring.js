import { fetchCctvList, fetchAiEvents } from "../services/trafficService.js";
import { renderCctvList } from "../components/cctvComponent.js";
import { setText } from "../core/dom.js";

let selectedCctvs = [null, null];
let activeStates = [false, false];
let lastAlertEventId = null;

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("reloadBtn").addEventListener("click", loadCctv);
  document.getElementById("reloadAiEventBtn").addEventListener("click", loadAiEvents);

  document.getElementById("cam1Toggle").addEventListener("click", () => toggleCamera(0));
  document.getElementById("cam2Toggle").addEventListener("click", () => toggleCamera(1));

  document.getElementById("cam1ReplayBtn").addEventListener("click", () => showReplay(0));
  document.getElementById("cam2ReplayBtn").addEventListener("click", () => showReplay(1));

  loadCctv();
  loadAiEvents();

  setInterval(loadAiEvents, 5000);
});

async function loadCctv() {
  const region = document.getElementById("regionSelect").value;
  const roadType = document.getElementById("roadTypeSelect").value;

  resetMonitoring();

  const result = await fetchCctvList(region, roadType);

  const list = document.getElementById("cctvList");
  renderCctvList(list, result.data, selectCctv);
}

async function loadAiEvents() {
  const result = await fetchAiEvents();
  const list = document.getElementById("aiEventList");

  if (!result.success || !result.data || result.data.length === 0) {
    list.innerHTML = `<p class="empty-text">최근 AI 탐지 로그가 없습니다.</p>`;
    hideAlertBanner();
    return;
  }

  renderAiEvents(result.data);
  checkLatestAlert(result.data[0]);
}

function renderAiEvents(events) {
  const list = document.getElementById("aiEventList");
  list.innerHTML = "";

  events.forEach(event => {
    const item = document.createElement("div");
    item.className = "ai-log-item";

    item.innerHTML = `
      <div class="ai-log-thumb">
        ${
          event.snapshot_url
            ? `<img src="${event.snapshot_url}" alt="AI 탐지 결과">`
            : `<span>이미지 없음</span>`
        }
      </div>

      <div class="ai-log-info">
        <div class="ai-log-title">
          <strong>${event.event_type}</strong>
          <span class="risk-badge ${getRiskClass(event.risk_level)}">${event.risk_level}</span>
        </div>

        <p>${event.detected_at}</p>
        <p>${event.camera_name} / ${event.location_name}</p>
        <p>객체: ${event.object_type} · 신뢰도: ${event.confidence}%</p>
      </div>
    `;

    list.appendChild(item);
  });
}

function checkLatestAlert(event) {
  if (!event) return;

  const shouldAlert = event.risk_level === "긴급" || event.risk_level === "위험";

  if (!shouldAlert) {
    return;
  }

  if (lastAlertEventId === event.id) {
    return;
  }

  lastAlertEventId = event.id;
  showAlertBanner(event);
}

function showAlertBanner(event) {
  let banner = document.getElementById("aiAlertBanner");

  if (!banner) {
    banner = document.createElement("div");
    banner.id = "aiAlertBanner";
    banner.className = "ai-alert-banner";

    const mainContent = document.querySelector(".main-content");
    mainContent.prepend(banner);
  }

  banner.innerHTML = `
    <div>
      <strong>AI 이상징후 경보 발생</strong>
      <p>${event.event_type} · ${event.risk_level} · ${event.detected_at}</p>
      <p>${event.camera_name} / ${event.location_name}</p>
    </div>
    <button id="closeAiAlertBtn" type="button">닫기</button>
  `;

  banner.classList.remove("hidden");

  document.getElementById("closeAiAlertBtn").addEventListener("click", () => {
    hideAlertBanner();
  });
}

function hideAlertBanner() {
  const banner = document.getElementById("aiAlertBanner");

  if (banner) {
    banner.classList.add("hidden");
  }
}

function selectCctv(cctv) {
  const emptyIndex = selectedCctvs.findIndex(item => item === null);
  const slotIndex = emptyIndex === -1 ? 0 : emptyIndex;

  selectedCctvs[slotIndex] = cctv;
  activeStates[slotIndex] = true;

  renderCamera(slotIndex);
  updatePredictionPanel();
}

function renderCamera(index) {
  const cctv = selectedCctvs[index];
  if (!cctv) return;

  const num = index + 1;

  setText(`#cam${num}Name`, cctv.name);
  setText(`#cam${num}Road`, cctv.road_name);

  const videoArea = document.getElementById(`cam${num}Video`);
  const toggleBtn = document.getElementById(`cam${num}Toggle`);

  toggleBtn.innerText = "ON";
  toggleBtn.classList.add("on");

  if (cctv.cctv_url) {
    videoArea.innerHTML = `<video src="${cctv.cctv_url}" controls autoplay muted></video>`;
  } else {
    videoArea.innerText = "실시간 영상 URL이 없습니다.";
  }
}

function toggleCamera(index) {
  const cctv = selectedCctvs[index];

  if (!cctv) {
    alert("먼저 CCTV를 선택해주세요.");
    return;
  }

  activeStates[index] = !activeStates[index];

  const num = index + 1;
  const videoArea = document.getElementById(`cam${num}Video`);
  const toggleBtn = document.getElementById(`cam${num}Toggle`);

  if (activeStates[index]) {
    toggleBtn.innerText = "ON";
    toggleBtn.classList.add("on");

    if (cctv.cctv_url) {
      videoArea.innerHTML = `<video src="${cctv.cctv_url}" controls autoplay muted></video>`;
    } else {
      videoArea.innerText = "실시간 영상 URL이 없습니다.";
    }
  } else {
    toggleBtn.innerText = "OFF";
    toggleBtn.classList.remove("on");
    videoArea.innerText = "CCTV 꺼짐";
  }

  updatePredictionPanel();
}

function showReplay(index) {
  const cctv = selectedCctvs[index];

  if (!cctv) {
    alert("먼저 CCTV를 선택해주세요.");
    return;
  }

  const num = index + 1;
  const videoArea = document.getElementById(`cam${num}Video`);

  videoArea.innerHTML = `
    <div class="replay-box">
      <strong>최근 30초 저장 화면</strong>
      <p>${cctv.name}</p>
      <p>데모 단계에서는 저장 영상 영역으로 표시합니다.</p>
    </div>
  `;
}

function updatePredictionPanel() {
  const activeCctvs = selectedCctvs.filter((cctv, index) => cctv && activeStates[index]);

  setText("#selectedCount", `${activeCctvs.length} / 2`);

  if (activeCctvs.length === 0) {
    setText("#avgSpeed", "-");
    setText("#vehicleCount", "-");
    setText("#congestionRisk", "-");
    setText("#monitorComment", "활성화된 CCTV가 없습니다.");
    return;
  }

  const avgSpeed = Math.round(
    activeCctvs.reduce((sum, cctv) => sum + (cctv.avg_speed || 0), 0) / activeCctvs.length
  );

  const vehicleCount = activeCctvs.reduce(
    (sum, cctv) => sum + (cctv.vehicle_count || 0),
    0
  );

  const risk = getCongestionRisk(avgSpeed, vehicleCount);

  setText("#avgSpeed", `${avgSpeed} km/h`);
  setText("#vehicleCount", `${vehicleCount}대`);
  setText("#congestionRisk", risk);
  setText("#monitorComment", makeMonitorComment(risk, avgSpeed, vehicleCount));
}

function getCongestionRisk(avgSpeed, vehicleCount) {
  if (avgSpeed <= 20 || vehicleCount >= 25) return "높음";
  if (avgSpeed <= 40 || vehicleCount >= 15) return "주의";
  return "낮음";
}

function makeMonitorComment(risk, avgSpeed, vehicleCount) {
  if (risk === "높음") {
    return `평균 속도 ${avgSpeed}km/h, 차량 수 ${vehicleCount}대로 정체 가능성이 높습니다. 관제자는 해당 구간의 흐름을 우선 확인하는 것이 좋습니다.`;
  }

  if (risk === "주의") {
    return `평균 속도 ${avgSpeed}km/h, 차량 수 ${vehicleCount}대로 일부 정체 가능성이 있습니다. 주변 구간과 비교 관제가 필요합니다.`;
  }

  return `평균 속도 ${avgSpeed}km/h, 차량 수 ${vehicleCount}대로 현재는 비교적 원활한 흐름으로 판단됩니다.`;
}

function resetMonitoring() {
  selectedCctvs = [null, null];
  activeStates = [false, false];

  setText("#cam1Name", "관제 CCTV 1");
  setText("#cam1Road", "CCTV를 선택하세요.");
  setText("#cam2Name", "관제 CCTV 2");
  setText("#cam2Road", "CCTV를 선택하세요.");

  document.getElementById("cam1Video").innerText = "CCTV 선택";
  document.getElementById("cam2Video").innerText = "CCTV 선택";

  document.getElementById("cam1Toggle").innerText = "OFF";
  document.getElementById("cam2Toggle").innerText = "OFF";
  document.getElementById("cam1Toggle").classList.remove("on");
  document.getElementById("cam2Toggle").classList.remove("on");

  updatePredictionPanel();
}

function getRiskClass(riskLevel) {
  if (riskLevel === "긴급") return "risk-high";
  if (riskLevel === "위험") return "risk-danger";
  if (riskLevel === "주의") return "risk-warning";
  return "risk-low";
}