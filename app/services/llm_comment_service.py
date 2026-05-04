from flask import current_app

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None


def generate_traffic_comment(road_name, avg_speed, vehicle_count, status):
    """
    LLM 코멘트 생성.
    API 키가 없거나 실패하면 데모용 문장을 반환한다.
    """
    api_key = current_app.config.get("LLM_API_KEY")
    model = current_app.config.get("LLM_MODEL", "gpt-4o-mini")

    fallback = (
        f"{road_name} 구간은 현재 '{status}' 상태로 분류되었습니다. "
        f"평균 속도는 {avg_speed}km/h, 탐지 차량 수는 {vehicle_count}대로 확인됩니다. "
        "정체가 지속될 가능성이 있으므로 관제자는 주변 흐름을 추가 확인하는 것이 좋습니다."
    )

    if not api_key or OpenAI is None:
        return fallback

    try:
        client = OpenAI(api_key=api_key)

        prompt = f"""
너는 교통 관제 시스템의 보조 분석가다.

아래 데이터는 교통 API와 CCTV 분석 결과를 기반으로 한다.
사고를 단정하지 말고, 정체 가능성과 관제자가 확인할 사항을 짧게 설명하라.

[입력 데이터]
- 도로명: {road_name}
- 평균 속도: {avg_speed} km/h
- 탐지 차량 수: {vehicle_count}
- 상태: {status}

[출력 조건]
- 한국어 2문장
- 사고 발생 단정 금지
- 과장 금지
- 관제 대시보드에 표시하기 좋은 문장
"""

        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "너는 교통 관제 보조 분석가다."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.4,
            max_tokens=180,
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        print("[LLM ERROR]", e)
        return fallback