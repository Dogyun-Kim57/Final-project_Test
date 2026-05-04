# Fainal-project_Test
파이널 프로젝트를 위한 원리 파악


```a
app/
│
├── __init__.py
│   → Flask 앱 생성 (create_app)
│   → DB 초기화 및 Blueprint 등록
│
├── config.py
│   → 환경 설정 관리 (.env)
│   → API 키 (ITS, Kakao 등)
│
├── extensions.py
│   → SQLAlchemy 등 확장 모듈 초기화
│
├── common/
│   ├── response.py
│   │   → API 응답 통일 (success, fail)
│   │
│   └── constants.py
│       → 공통 상수 정의 (필요 시 사용)
│
├── models/
│   ├── camera.py
│   │   → CCTV 카메라 DB 모델
│   │
│   ├── detection_event.py
│   │   → 탐지 이벤트 DB 모델 (정체, 사고 등)
│   │
│   └── __init__.py
│       → 모델 import 관리 (DB 생성 시 필수)
│
├── repositories/
│   ├── camera_repository.py
│   │   → 카메라 DB 접근 로직
│   │
│   ├── detection_repository.py
│   │   → 탐지 이벤트 DB 접근
│   │
│   └── __init__.py
│
├── services/
│   ├── dashboard_service.py
│   │   → 대시보드 데이터 생성
│   │
│   ├── its_api_service.py
│   │   → ITS Open API 호출 (CCTV 목록 가져오기)
│   │
│   ├── kakao_map_service.py
│   │   → 지도용 데이터 변환 (마커 등)
│   │
│   ├── llm_comment_service.py
│   │   → AI 교통 코멘트 생성
│   │
│   ├── camera_service.py
│   │   → (향후) CCTV 처리 로직
│   │
│   ├── detection_service.py
│   │   → (향후) 탐지/정체 분석 로직
│   │
│   └── __init__.py
│
├── routes/
│   ├── main_routes.py
│   │   → 페이지 라우팅
│   │      /              → 대시보드
│   │      /monitoring    → 실시간 CCTV
│   │      /navigation    → 경로 추천
│   │      /reports       → 레포트
│   │      /board         → 게시판
│   │      /settings      → 설정
│   │
│   ├── api_routes.py
│   │   → 대시보드 API (/api/dashboard)
│   │
│   ├── traffic_api_routes.py
│   │   → ITS 관련 API
│   │      /api/traffic/cctv-list
│   │
│   └── __init__.py
│
├── static/
│   ├── css/
│   │   ├── base.css
│   │   │   → 전체 공통 스타일
│   │   │
│   │   ├── dashboard.css
│   │   │   → 대시보드 전용 UI
│   │   │
│   │   ├── monitoring.css
│   │   │   → CCTV 영상 UI
│   │   │
│   │   └── navigation.css
│   │       → 지도 / 경로 UI
│   │
│   ├── js/
│   │   ├── dashboard.js
│   │   │   → 대시보드 JS
│   │   │
│   │   ├── monitoring.js
│   │   │   → CCTV 목록 조회 + 영상 출력
│   │   │
│   │   └── navigation.js
│   │       → 지도 + 마커 + 경로 로직
│   │
│   └── images/
│       → 이미지 리소스
│
├── templates/
│   ├── base.html
│   │   → 공통 레이아웃 (header, block 구조)
│   │
│   └── main/
│       ├── dashboard.html
│       │   → 메인 통계 화면
│       │
│       ├── monitoring.html
│       │   → CCTV 영상 모니터링
│       │
│       ├── navigation.html
│       │   → 지도 + 경로 추천 (핵심 기능)
│       │
│       ├── reports.html
│       │   → 정체/이벤트 기록
│       │
│       ├── board.html
│       │   → 게시판
│       │
│       └── settings.html
│           → 설정 페이지



```