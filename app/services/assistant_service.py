from flask import current_app

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None


def ask_traffic_assistant(user_message):
    """
    AI 교통 관제 보조 챗봇 서비스.

    역할:
    - 사용자가 입력한 질문을 LLM에 전달
    - 현재 프로젝트 주제에 맞게 교통 관제 / CCTV / YOLO / WebSocket 중심으로 답변
    - API 키가 없거나 오류가 나면 fallback 응답 반환
    """

    api_key = current_app.config.get("LLM_API_KEY")
    model = current_app.config.get("LLM_MODEL", "gpt-4o-mini")

    if not api_key:
        return "LLM_API_KEY가 설정되어 있지 않습니다. .env 파일을 확인해주세요."

    if OpenAI is None:
        return "openai 패키지가 설치되어 있지 않습니다. python -m pip install openai 를 실행해주세요."

    client = OpenAI(api_key=api_key)

    try:
        response = client.responses.create(
            model=model,
            instructions="""
너는 AI 교통 관제 시스템의 보조 AI다.

답변 규칙:
- 한국어로 답변한다.
- 너무 길게 설명하지 않는다.
- CCTV, YOLO, WebSocket, 탐지 레포트, 교통 관제 흐름과 연결해서 설명한다.
- 팀 프로젝트 발표자가 이해하기 쉽게 설명한다.
- 모르는 내용은 단정하지 말고 "확인 필요"라고 말한다.
""",
            input=user_message,
        )

        return response.output_text

    except Exception as e:
        print("[ASSISTANT ERROR]", e)
        return "AI 응답 생성 중 오류가 발생했습니다. API 키, 결제 상태, 모델명을 확인해주세요."