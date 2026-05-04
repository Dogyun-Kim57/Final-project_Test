### 프로젝트 작업 트리
```
app/
│
├── config.py
│   → 환경 설정 (API 키, 모델 경로, 임계값 등)
│
├── extensions.py
│   → Flask 확장 초기화 (db, migrate, socket 등)
│
├── __init__.py
│   → create_app()에서 전체 앱 생성 및 Blueprint 등록
│
├── common/
│   ├── constants.py
│   │   → 공통 상수 정의 (위험도 기준, 상태값 등)
│   │
│   ├── response.py
│   │   → API 응답 포맷 (success, fail 통일)
│   │
│   └── __init__.py
│
├── models/
│   ├── camera.py
│   │   → CCTV 카메라 정보 (위치, 상태 등)
│   │
│   ├── detection_event.py
│   │   → 객체 탐지 이벤트 (위험도, 탐지시간 등)
│   │
│   ├── post.py
│   │   → 게시판 글 + 첨부파일 모델
│   │
│   ├── route_report.py
│   │   → 경로 분석 결과 저장 (거리, 시간, 위험도 등)
│   │
│   └── __init__.py
│
├── repositories/
│   ├── camera_repository.py
│   │   → 카메라 DB 조회 (count, 리스트 등)
│   │
│   ├── detection_repository.py
│   │   → 탐지 이벤트 조회 및 통계
│   │
│   ├── post_repository.py
│   │   → 게시글 저장/조회
│   │
│   ├── route_report_repository.py
│   │   → 경로 분석 데이터 조회
│   │
│   └── __init__.py
│
├── services/
│   ├── camera_service.py
│   │   → 카메라 데이터 가공 (프론트용 변환)
│   │
│   ├── detection_service.py
│   │   → 최근 이벤트 정리
│   │
│   ├── congestion_service.py
│   │   → 정체 점수 계산 로직 (핵심 알고리즘)
│   │
│   ├── dashboard_service.py
│   │   → 대시보드 데이터 통합 (카메라 + 이벤트 + 경로)
│   │
│   ├── its_api_service.py
│   │   → ITS CCTV 외부 API 연동
│   │
│   ├── kakao_map_service.py
│   │   → 지도 관련 처리 (좌표 변환 등)
│   │
│   ├── kakao_route_service.py
│   │   → 카카오 길찾기 API (실제 경로 계산)
│   │
│   ├── route_analysis_service.py
│   │   → 경로 주변 CCTV 분석 (핵심 로직)
│   │
│   ├── route_report_service.py
│   │   → 분석 결과 DB 저장
│   │
│   ├── post_service.py
│   │   → 게시글 + 파일 업로드 처리
│   │
│   ├── llm_comment_service.py
│   │   → AI 코멘트 생성 (선택 기능)
│   │
│   └── __init__.py
│
├── routes/
│   ├── main_routes.py
│   │   → 페이지 렌더링 (/, /navigation, /reports 등)
│   │
│   ├── post_routes.py
│   │   → 게시판 API (/board)
│   │
│   ├── route_api_routes.py
│   │   → 경로 계산 + 분석 API (/api/route)
│   │
│   ├── traffic_api_routes.py
│   │   → ITS 데이터 API
│   │
│   ├── map_routes.py
│   │   → 지도 관련 API
│   │
│   ├── api_routes.py
│   │   → 기타 통합 API
│   │
│   ├── dashboard_routes.py
│   │   → (선택) API형 대시보드
│   │
│   └── __init__.py
│
├── static/
│   ├── css/
│   │   → 화면 스타일
│   │
│   ├── js/
│   │   → 프론트 로직 (지도, 그래프 등)
│   │
│   ├── images/
│   │   → 이미지 리소스
│   │
│   └── videos/
│       → 영상 리소스
│
└── templates/
    ├── base.html
    │   → 전체 레이아웃 (헤더/사이드바)
    │
    └── main/
        ├── dashboard.html
        │   → 대시보드
        │
        ├── monitoring.html
        │   → 실시간 모니터링
        │
        ├── navigation.html
        │   → 경로 탐색
        │
        ├── reports.html
        │   → 분석 결과 목록
        │
        ├── board.html
        │   → 게시판
        │
        └── settings.html
            → 설정 페이지
```