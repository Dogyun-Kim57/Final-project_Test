import { setText } from "../core/dom.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("aiDetectForm");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    await analyzeFile();
  });
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