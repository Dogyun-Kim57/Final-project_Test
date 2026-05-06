document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".ai-file-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const postId = button.dataset.postId;
      const fileId = button.dataset.fileId;
      const analysisType = button.dataset.analysisType;

      await analyzeFile(postId, fileId, analysisType, button);
    });
  });

  const clearBtn = document.getElementById("clearAnalysisBtn");

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      document.getElementById("aiAnalysisResult").innerText =
        "아직 실행된 AI 분석이 없습니다.";
    });
  }
});


async function analyzeFile(postId, fileId, analysisType, button) {
  const resultBox = document.getElementById("aiAnalysisResult");

  const originalText = button.innerText;
  button.disabled = true;
  button.innerText = "분석 중...";

  if (analysisType === "pdf") {
    resultBox.innerText = "PDF 문서를 AI가 요약 중입니다. 잠시만 기다려주세요...";
  } else {
    resultBox.innerText = "이미지를 AI가 교통 관제 관점에서 분석 중입니다. 잠시만 기다려주세요...";
  }

  try {
    const response = await fetch("/board/file/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        post_id: postId,
        file_id: fileId,
        analysis_type: analysisType
      })
    });

    const result = await response.json();

    if (!result.success) {
      resultBox.innerText = result.message || "AI 분석에 실패했습니다.";
      return;
    }

    resultBox.innerText = result.data.result;

  } catch (error) {
    console.error(error);
    resultBox.innerText = "서버 통신 중 오류가 발생했습니다.";
  } finally {
    button.disabled = false;
    button.innerText = originalText;
  }
}