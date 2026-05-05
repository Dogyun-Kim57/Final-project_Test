import { fetchCctvList, fetchAiEvents } from "../services/trafficService.js";
import { renderCctvList } from "../components/cctvComponent.js";
import { setText } from "../core/dom.js";

// 선택된 CCTV 2개 저장
let selectedCctvs = [null, null];

// CCTV ON/OFF 상태
let activeStates = [false, false];

// AI 분석 ON/OFF 상태
let aiStates = [false, false];

// 마지막으로 경보를 띄운 이벤트 ID
let lastAlertEventId = null;


document.addEventListener("DOMContentLoaded", () => {
  // CCTV 조회 버튼
  document.getElementById("reloadBtn").addEventListener("click", loadCctv);

  // AI 로그 수동 새로고침 버튼
  document.getElementById("reloadAiEventBtn").addEventListener("click", loadAiEvents);

  // CCTV ON/OFF 버튼
  document.getElementById("cam1Toggle").addEventListener("click", () => toggleCamera(0));
  document.getElementById("cam2Toggle").addEventListener("click", () => toggleCamera(1));

  // AI 분석 ON/OFF 버튼
  document.getElementById("cam1AiBtn").addEventListener("click", () => toggleAiAnalysis(0));
  document.getElementById("cam2AiBtn").addEventListener("click", () => toggleAiAnalysis(1));

  // 최근 30초 저장 화면 버튼
  document.getElementById("cam1ReplayBtn").addEventListener("click", () => showReplay(0));
  document.getElementById("cam2ReplayBtn").addEventListener("click", () => showReplay(1));

  // 초기 로딩
  loadCctv();
  loadAiEvents();

  // WebSocket 연결
  connectSocket();

  // WebSocket이 안 될 상황 대비용 보조 폴링
  // 실시간 알림은 socket이 담당하고, 이건 로그 최신화 보조용
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


function selectCctv(cctv) {
  // 빈 슬롯이 있으면 거기에 넣고, 둘 다 차 있으면 1번 슬롯을 교체
  const emptyIndex = selectedCctvs.findIndex(item => item === null);
  const slotIndex = emptyIndex === -1 ? 0 : emptyIndex;

  selectedCctvs[slotIndex] = cctv;
  activeStates[slotIndex] = true;
  aiStates[slotIndex] = false;

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
  const aiBtn = document.getElementById(`cam${num}AiBtn`);

  toggleBtn.innerText = "ON";
  toggleBtn.classList.add("on");

  aiBtn.innerText = "AI 분석 OFF";
  aiBtn.classList.remove("on");

  // 일반 CCTV 영상 표시
  renderNormalVideo(index);
}


function renderNormalVideo(index) {
  const cctv = selectedCctvs[index];
  const num = index + 1;
  const videoArea = document.getElementById(`cam${num}Video`);

  if (!cctv) {
    videoArea.innerText = "CCTV 선택";
    return;
  }

  if (cctv.cctv_url) {
    videoArea.innerHTML = `
      <video src="${cctv.cctv_url}" controls autoplay muted></video>
    `;
  } else {
    videoArea.innerHTML = `
      <div class="video-placeholder">
        <strong>실시간 영상 URL이 없습니다.</strong>
        <p>데모 단계에서는 AI 분석 ON 시 기본 웹캠 또는 샘플 소스로 대체할 수 있습니다.</p>
      </div>
    `;
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

    // CCTV를 다시 켤 때 AI가 ON이면 AI 스트림, 아니면 일반 영상
    if (aiStates[index]) {
      renderAiStream(index);
    } else {
      renderNormalVideo(index);
    }
  } else {
    toggleBtn.innerText = "OFF";
    toggleBtn.classList.remove("on");

    // CCTV를 끄면 AI 분석도 같이 중지
    aiStates[index] = false;
    updateAiButton(index);

    videoArea.innerText = "CCTV 꺼짐";
  }

  updatePredictionPanel();
}


function toggleAiAnalysis(index) {
  const cctv = selectedCctvs[index];

  if (!cctv) {
    alert("먼저 CCTV를 선택해주세요.");
    return;
  }

  if (!activeStates[index]) {
    alert("CCTV를 먼저 ON 상태로 켜주세요.");
    return;
  }

  aiStates[index] = !aiStates[index];

  updateAiButton(index);

  if (aiStates[index]) {
    renderAiStream(index);
  } else {
    renderNormalVideo(index);
  }
}


function updateAiButton(index) {
  const num = index + 1;
  const aiBtn = document.getElementById(`cam${num}AiBtn`);

  if (aiStates[index]) {
    aiBtn.innerText = "AI 분석 ON";
    aiBtn.classList.add("on");
  } else {
    aiBtn.innerText = "AI 분석 OFF";
    aiBtn.classList.remove("on");
  }
}


function renderAiStream(index) {
  const cctv = selectedCctvs[index];
  const num = index + 1;
  const videoArea = document.getElementById(`cam${num}Video`);

  // 실제 CCTV URL이 있으면 그 URL을 YOLO 스트리밍 소스로 사용
  // URL이 없으면 데모용으로 0번 웹캠 사용
  const source = cctv.cctv_url || "0";
  const encodedSource = encodeURIComponent(source);

  videoArea.innerHTML = `
    <div class="ai-stream-label">
      YOLOv8 AI 분석 중
    </div>

    <img
      class="ai-stream-image"
      src="/api/ai/stream?source=${encodedSource}&t=${Date.now()}"
      alt="YOLO 실시간 분석 영상"
    >
  `;
}


function showReplay(index) {
  const cctv = selectedCctvs[index];

  if (!cctv) {
    alert("먼저 CCTV를 선택해주세요.");
    return;
  }

  const num = index + 1;
  const videoArea = document.getElementById(`cam${num}Video`);

  // 저장 화면을 보면 AI 분석 상태는 잠시 OFF로 변경
  aiStates[index] = false;
  updateAiButton(index);

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
  aiStates = [false, false];

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

  document.getElementById("cam1AiBtn").innerText = "AI 분석 OFF";
  document.getElementById("cam2AiBtn").innerText = "AI 분석 OFF";
  document.getElementById("cam1AiBtn").classList.remove("on");
  document.getElementById("cam2AiBtn").classList.remove("on");

  updatePredictionPanel();
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
      <p>${event.camera_name || "AI 분석 카메라"} / ${event.location_name || "관제 구간"}</p>
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


function connectSocket() {
  const socket = io();

  socket.on("connect", () => {
    console.log("[SOCKET] connected");
  });

  socket.on("ai_alert", (event) => {
    console.log("[SOCKET] ai_alert", event);

    showAlertBanner(event);
    loadAiEvents();
  });

  socket.on("disconnect", () => {
    console.log("[SOCKET] disconnected");
  });
}


function getRiskClass(riskLevel) {
  if (riskLevel === "긴급") return "risk-high";
  if (riskLevel === "위험") return "risk-danger";
  if (riskLevel === "주의") return "risk-warning";
  return "risk-low";
}