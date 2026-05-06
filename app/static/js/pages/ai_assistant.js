document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("assistantForm");
  const input = document.getElementById("assistantInput");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const message = input.value.trim();

    if (!message) {
      alert("질문을 입력해주세요.");
      return;
    }

    input.value = "";
    await sendMessage(message);
  });

  document.querySelectorAll(".quick-question").forEach((button) => {
    button.addEventListener("click", async () => {
      await sendMessage(button.innerText.trim());
    });
  });
});


async function sendMessage(message) {
  appendMessage("user", "사용자", message);

  const loadingEl = appendMessage("assistant", "AI 관제 보조", "LangGraph가 질문 유형을 분류하고 있습니다...");

  try {
    const response = await fetch("/assistant/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    });

    const result = await response.json();

    if (!result.success) {
      loadingEl.querySelector("p").innerText = result.message || "응답 생성에 실패했습니다.";
      return;
    }

    const modeLabel = getModeLabel(result.data.mode);
    loadingEl.querySelector("p").innerText = `[${modeLabel}]\n\n${result.data.answer}`;

  } catch (error) {
    console.error(error);
    loadingEl.querySelector("p").innerText = "서버 통신 중 오류가 발생했습니다.";
  }
}


function getModeLabel(mode) {
  if (mode === "weather") return "날씨 API 관제 분석 모드";
  if (mode === "rag") return "PDF RAG Retriever 모드";
  if (mode === "search") return "인터넷 검색 Chain 모드";
  return "기본 LangChain Chat 모드";
}


function appendMessage(type, name, text) {
  const chatMessages = document.getElementById("chatMessages");

  const el = document.createElement("div");
  el.className = `chat-message ${type}`;

  el.innerHTML = `
    <strong>${name}</strong>
    <p>${escapeHtml(text)}</p>
  `;

  chatMessages.appendChild(el);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  return el;
}


function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}