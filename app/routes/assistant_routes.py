from flask import Blueprint, render_template, request

from app.common.response import success, fail
from app.services.langchain_rag_service import (
    run_langgraph_assistant,
    build_pdf_vectorstore,
)


assistant_bp = Blueprint("assistant", __name__)


@assistant_bp.route("/ai-assistant")
def assistant_page():
    return render_template("pages/ai_assistant.html")


@assistant_bp.route("/assistant/chat", methods=["POST"])
def assistant_chat():
    data = request.get_json() or {}
    message = data.get("message", "").strip()

    if not message:
        return fail("질문을 입력해주세요.", 400)

    try:
        answer, mode = run_langgraph_assistant(message)

        return success({
            "answer": answer,
            "mode": mode,
        })

    except Exception as e:
        print("[LANGGRAPH ASSISTANT ERROR]", e)
        return fail("LangGraph AI 응답 생성 중 오류가 발생했습니다.", 500)


@assistant_bp.route("/assistant/rag/build", methods=["POST"])
def build_rag_index():
    """
    게시판 PDF 파일을 FAISS Retriever 인덱스로 변환하는 API.
    """
    data = request.get_json() or {}
    file_path = data.get("file_path")

    if not file_path:
        return fail("file_path가 필요합니다.", 400)

    try:
        result = build_pdf_vectorstore(file_path)
        return success(result)

    except Exception as e:
        print("[RAG BUILD ERROR]", e)
        return fail("RAG 인덱스 생성 중 오류가 발생했습니다.", 500)