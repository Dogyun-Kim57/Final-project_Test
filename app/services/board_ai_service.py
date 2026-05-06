import base64
import mimetypes
from pathlib import Path

from flask import current_app

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None


def get_openai_client():
    """
    기존 .env의 LLM_API_KEY를 그대로 재사용한다.
    """
    api_key = current_app.config.get("LLM_API_KEY")

    if not api_key:
        raise RuntimeError("LLM_API_KEY가 설정되어 있지 않습니다.")

    if OpenAI is None:
        raise RuntimeError("openai 패키지가 설치되어 있지 않습니다.")

    return OpenAI(api_key=api_key)


def get_model_name():
    """
    기존 .env의 LLM_MODEL 사용.
    없으면 gpt-4o-mini 기본 사용.
    """
    return current_app.config.get("LLM_MODEL", "gpt-4o-mini")


def resolve_static_file_path(file_path):
    """
    DB에 저장된 /static/uploads/파일명 형태를
    실제 로컬 경로 app/static/uploads/파일명으로 변환한다.
    """
    cleaned_path = file_path.lstrip("/")

    if cleaned_path.startswith("static/"):
        return Path("app") / cleaned_path

    return Path(cleaned_path)


def encode_file_to_base64(path):
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")


def analyze_image_file(file_path):
    """
    게시판에 첨부된 이미지 파일을 GPT Vision으로 설명한다.

    목적:
    - 교통 CCTV 캡처 이미지
    - 사고/정체 이미지
    - 도로 상황 이미지
    를 관제자 관점에서 설명하게 한다.
    """
    path = resolve_static_file_path(file_path)

    if not path.exists():
        raise FileNotFoundError(f"파일을 찾을 수 없습니다: {path}")

    mime_type, _ = mimetypes.guess_type(str(path))
    mime_type = mime_type or "image/jpeg"

    image_base64 = encode_file_to_base64(path)
    image_data_url = f"data:{mime_type};base64,{image_base64}"

    client = get_openai_client()

    response = client.responses.create(
        model=get_model_name(),
        instructions="""
너는 AI 교통 관제 시스템의 이미지 분석 보조 AI다.

답변 규칙:
- 한국어로 답변한다.
- 이미지를 보고 교통 관제 관점에서 설명한다.
- 사고를 단정하지 말고 "가능성", "의심", "확인 필요" 표현을 사용한다.
- 차량 정체, 정지 차량, 보행자, 차선 점유, 위험 요소를 중심으로 분석한다.
- 결과는 발표 자료에 붙여넣기 좋게 정리한다.
""",
        input=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "input_text",
                        "text": """
이 이미지를 교통 관제 시스템 관점에서 분석해줘.

출력 형식:
1. 장면 요약
2. 감지 가능한 위험 요소
3. 관제자가 확인해야 할 사항
4. 현재 프로젝트와 연결되는 포인트
"""
                    },
                    {
                        "type": "input_image",
                        "image_url": image_data_url
                    }
                ]
            }
        ]
    )

    return response.output_text


def summarize_pdf_file(file_path):
    """
    게시판에 첨부된 PDF 파일을 AI로 요약한다.

    목적:
    - 교통 관련 보고서
    - 대보정보통신 요구사항
    - ITS 문서
    - 논문/자료
    를 현재 프로젝트와 연결해서 요약한다.
    """
    path = resolve_static_file_path(file_path)

    if not path.exists():
        raise FileNotFoundError(f"파일을 찾을 수 없습니다: {path}")

    pdf_base64 = encode_file_to_base64(path)

    client = get_openai_client()

    response = client.responses.create(
        model=get_model_name(),
        instructions="""
너는 AI 교통 관제 프로젝트의 문서 분석 보조 AI다.

답변 규칙:
- 한국어로 답변한다.
- 문서 내용을 단순 요약하지 말고 현재 프로젝트와 연결해서 설명한다.
- CCTV, ITS, 교통 관제, AI 탐지, 이상징후, 사고 대응, 데이터셋 관점으로 정리한다.
- 확실하지 않은 내용은 단정하지 않는다.
""",
        input=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "input_file",
                        "filename": path.name,
                        "file_data": f"data:application/pdf;base64,{pdf_base64}"
                    },
                    {
                        "type": "input_text",
                        "text": """
이 PDF 문서를 요약해줘.

출력 형식:
1. 문서 핵심 요약
2. 교통/관제/AI와 관련된 핵심 키워드
3. 현재 AI 교통 관제 프로젝트에 적용 가능한 부분
4. 팀 프로젝트 발표에서 사용할 수 있는 문장
"""
                    }
                ]
            }
        ]
    )

    return response.output_text