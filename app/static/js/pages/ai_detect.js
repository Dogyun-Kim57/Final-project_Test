import { setText } from "../core/dom.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("aiDetectForm");
  const startStreamBtn = document.getElementById("startStreamBtn");
  const stopStreamBtn = document.getElementById("stopStreamBtn");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    await analyzeFile();
  });

  startStreamBtn.addEventListener("click", startStream);
  stopStreamBtn.addEventListener("click", stopStream);
});


async function analyzeFile() {
  const fileInput = document.getElementById("detectFile");

  if (!fileInput.files || fileInput.files.length === 0) {
    alert("분석할 파일을 선택해주세요.");
    return;
  }

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  setText("#aiMessage", "AI 분석을 진행 중입니다...");

  const response = await fetch("/api/ai/detect", {
    method: "POST",
    body: formData
  });

  const result = await response.json();

  if (!result.success) {
    alert(result.message || "AI 분석에 실패했습니다.");
    setText("#aiMessage", "AI 분석에 실패했습니다.");
    return;
  }

  updateResult(result.data);
}


function updateResult(data) {
  setText("#eventType", data.event_type);
  setText("#riskLevel", data.risk_level);
  setText("#vehicleCount", `${data.vehicle_count}대`);
  setText("#confidence", `${Math.round(data.confidence * 100)}%`);
  setText("#aiMessage", data.message);

  const imageBox = document.getElementById("resultImageBox");

  imageBox.innerHTML = `
    <img src="${data.snapshot_url}" alt="AI 분석 결과 이미지">
  `;
}


function startStream() {
  const sourceInput = document.getElementById("streamSourceInput");
  const streamBox = document.getElementById("streamBox");

  const source = sourceInput.value || "0";
  const encodedSource = encodeURIComponent(source);

  streamBox.innerHTML = `
    <img
      id="streamImage"
      src="/api/ai/stream?source=${encodedSource}&t=${Date.now()}"
      alt="YOLO 실시간 스트리밍"
    >
  `;
}


function stopStream() {
  const streamBox = document.getElementById("streamBox");

  // img src를 제거하면 브라우저가 스트리밍 요청을 끊음
  streamBox.innerHTML = "실시간 분석 영상이 중지되었습니다.";
}