### 프로젝트 작업 트리
```
app/
│
├── config.py
│   → Flask 전체 환경 설정 파일
│   → SECRET_KEY, DB 연결 정보, YOLO 모델 경로, 탐지 임계값, Kakao/Google/ITS/LLM API 키 관리
│   → .env에서 값을 읽고, 없을 경우 개발용 기본값을 사용
│
├── extensions.py
│   → Flask 확장 객체를 한 곳에서 생성하는 파일
│   → 현재는 SQLAlchemy db 객체를 생성
│   → create_app()에서 db.init_app(app) 형태로 연결됨
│
├── __init__.py
│   → Flask 애플리케이션 팩토리(create_app) 파일
│   → Config 로드, DB 초기화, Blueprint 등록 담당
│   → main, api, traffic, route, ai_detection, post 라우트들을 앱에 연결
│
├── common/
│   │
│   ├── constants.py
│   │   → 프로젝트 전역에서 사용하는 공통 상수 정의
│   │   → EVENT_TYPE_VEHICLE, EVENT_TYPE_CONGESTION, RISK_LOW, RISK_MEDIUM, RISK_HIGH 등
│   │   → 문자열 하드코딩을 줄이고 위험도/이벤트 타입을 통일하기 위한 파일
│   │
│   ├── response.py
│   │   → API 응답 형식을 통일하는 유틸 파일
│   │   → success(data, message), fail(message, status_code) 제공
│   │   → 모든 API가 { success, message, data } 형태로 응답하도록 맞춤
│   │
│   └── __init__.py
│       → common 패키지 초기화 파일
│
├── models/
│   │
│   ├── camera.py
│   │   → CCTV 카메라 정보를 저장하는 DB 모델
│   │   → 카메라명, 위치명, 스트림 URL, 썸네일 URL, 활성 여부, 실시간 여부 관리
│   │   → DetectionEvent와 관계를 맺는 기준 테이블 역할
│   │
│   ├── detection_event.py
│   │   → AI 탐지 이벤트를 저장하는 DB 모델
│   │   → 카메라 ID, 이벤트 유형, 위험도, 객체 유형, 신뢰도, 결과 이미지 URL, 탐지 시간 저장
│   │   → YOLOv8 분석 결과가 최종적으로 기록되는 핵심 테이블
│   │
│   ├── post.py
│   │   → 게시판 글과 첨부파일을 저장하는 DB 모델
│   │   → Post: 제목, 내용, 작성 시간
│   │   → PostFile: 파일명, 파일 경로, 연결된 게시글 ID
│   │   → cascade 옵션으로 게시글 삭제 시 첨부파일 레코드도 함께 삭제 가능
│   │
│   ├── route_report.py
│   │   → 운전 경로 분석 결과를 저장하는 DB 모델
│   │   → 출발지, 도착지, 거리, 소요시간, 주변 CCTV 수, 평균 정체 점수, 위험도, 코멘트 저장
│   │   → 경로 기반 정체 예측 레포트의 기준 테이블
│   │
│   └── __init__.py
│       → models 패키지 초기화 파일
│       → Camera, DetectionEvent, RouteReport 등 모델을 한 번에 import 가능하게 정리
│
├── repositories/
│   │
│   ├── camera_repository.py
│   │   → Camera 모델에 대한 DB 접근 전용 파일
│   │   → 전체 카메라 조회, 카메라 개수 조회, 실시간 카메라 개수 조회, 저장 기능 제공
│   │   → Service 계층이 직접 DB 쿼리를 작성하지 않도록 분리
│   │
│   ├── detection_repository.py
│   │   → DetectionEvent 모델에 대한 DB 접근 전용 파일
│   │   → 전체 이벤트 수, 오늘 이벤트 수, 최근 이벤트 조회
│   │   → 위험도별 카운트, 카메라별 카운트, 시간대별 카운트 등 차트용 통계 조회 담당
│   │
│   ├── post_repository.py
│   │   → Post 모델에 대한 DB 접근 전용 파일
│   │   → 게시글 저장, 전체 게시글 조회, ID 기반 게시글 조회 담당
│   │   → 게시판 서비스에서 사용하는 데이터 저장/조회 레이어
│   │
│   ├── route_report_repository.py
│   │   → RouteReport 모델에 대한 DB 접근 전용 파일
│   │   → 경로 분석 결과 저장 및 최근 경로 분석 레포트 조회 담당
│   │   → 대시보드와 레포트 화면의 경로 분석 데이터 기반
│   │
│   └── __init__.py
│       → repositories 패키지 초기화 파일
│
├── services/
│   │
│   ├── ai_detection_service.py
│   │   → YOLOv8 기반 AI 이미지 분석 핵심 서비스
│   │   → 업로드 파일 저장, YOLO 모델 로딩, 객체 탐지 실행, 차량/보행자 수 계산
│   │   → 이벤트 유형과 위험도 판단 후 DetectionEvent DB 저장
│   │   → Bounding Box가 그려진 결과 이미지를 static/uploads/detection_results에 저장
│   │   → 현재 AI 탐지 파이프라인의 핵심 모듈
│   │
│   ├── camera_service.py
│   │   → 카메라 데이터를 프론트에서 사용하기 좋은 딕셔너리 형태로 변환
│   │   → CCTV 목록 화면이나 대시보드에서 사용할 카메라 리스트 생성
│   │
│   ├── congestion_service.py
│   │   → 정체 점수 계산 전용 서비스
│   │   → 평균 속도, 차량 수, 상태 문자열을 기반으로 0~100점 정체 점수 계산
│   │   → 점수에 따라 낮음/주의/높음 위험도 등급 산출
│   │
│   ├── dashboard_service.py
│   │   → 대시보드 데이터 통합 서비스
│   │   → CCTV 수, 실시간 카메라 수, 오늘 AI 이벤트 수, 누적 이벤트 수 계산
│   │   → 최근 AI 탐지 이벤트, 최근 경로 분석, 차트 데이터까지 한 번에 구성
│   │   → dashboard.html에 전달되는 data 객체를 만드는 중심 모듈
│   │
│   ├── detection_service.py
│   │   → DetectionEvent 데이터를 화면 출력용으로 변환하는 서비스
│   │   → 최근 탐지 이벤트, AI 탐지 레포트 목록 생성
│   │   → 대시보드, 모니터링 로그, 레포트 화면에서 공통 사용
│   │
│   ├── its_api_service.py
│   │   → ITS CCTV Open API 연동 서비스
│   │   → 지역별 좌표 범위와 도로 유형을 기반으로 CCTV 목록 조회
│   │   → API 실패 또는 데이터 없음 시 fallback CCTV 더미 데이터 반환
│   │   → 실시간 교통 관제 모니터링 화면의 CCTV 목록 데이터 공급원
│   │
│   ├── kakao_map_service.py
│   │   → 카카오 지도 표시용 CCTV 마커 데이터 가공 서비스
│   │   → ITS CCTV 데이터를 지도 마커에서 사용하기 좋은 형태로 변환
│   │
│   ├── kakao_route_service.py
│   │   → Kakao Mobility 길찾기 API 연동 서비스
│   │   → 출발지/도착지 좌표를 기반으로 실제 운전 경로 계산
│   │   → 거리, 소요시간, 경로 좌표 path 추출
│   │   → 운전 경로 추천 기능의 핵심 외부 API 연동 모듈
│   │
│   ├── llm_comment_service.py
│   │   → 교통 관제 코멘트 생성 서비스
│   │   → LLM API 키가 있으면 AI 코멘트 생성
│   │   → 키가 없거나 실패하면 fallback 안내 문장 반환
│   │   → 관제 대시보드나 분석 레포트의 설명 문구 확장용
│   │
│   ├── post_service.py
│   │   → 게시판 비즈니스 로직 담당
│   │   → 게시글 생성, 첨부파일 저장, 게시글 목록 조회
│   │   → 업로드 파일을 app/static/uploads 경로에 저장
│   │
│   ├── route_analysis_service.py
│   │   → 경로 주변 CCTV 기반 정체 분석 서비스
│   │   → Kakao 경로 좌표와 ITS CCTV 좌표 간 거리 계산
│   │   → 경로 반경 내 CCTV만 필터링하고 정체 점수 산출
│   │   → 평균 점수, 위험도, 분석 코멘트 생성
│   │
│   ├── route_report_service.py
│   │   → 경로 분석 결과를 DB에 저장하고 조회하는 서비스
│   │   → route_analysis 결과를 RouteReport 모델로 변환
│   │   → reports.html과 dashboard_service에서 사용하는 경로 레포트 데이터 제공
│   │
│   └── __init__.py
│       → services 패키지 초기화 파일
│
├── routes/
│   │
│   ├── ai_detection_routes.py
│   │   → AI 탐지 API 라우트
│   │   → POST /api/ai/detect
│   │   → 이미지 파일 업로드를 받아 ai_detection_service로 분석 요청
│   │   → 탐지 결과 JSON 반환
│   │
│   ├── api_routes.py
│   │   → 기타 공통 API 라우트
│   │   → GET /api/dashboard 등 대시보드 API 응답용
│   │
│   ├── dashboard_routes.py
│   │   → 대시보드 전용 라우트로 만들었던 파일
│   │   → 현재 안정화 기준에서는 main_routes.py가 / 를 담당하므로 등록하지 않는 것이 안전
│   │   → 추후 API형 대시보드나 관리자 대시보드 분리 시 재활용 가능
│   │
│   ├── main_routes.py
│   │   → 페이지 렌더링 중심 라우트
│   │   → / 대시보드, /monitoring, /ai-detect, /reports, /navigation, /settings 렌더링
│   │   → 각 페이지에 필요한 API 키나 서비스 데이터를 템플릿으로 전달
│   │
│   ├── map_routes.py
│   │   → 지도 페이지 또는 지도 관련 라우트 확장용 파일
│   │   → 현재는 별도 등록하지 않아도 되는 선택 모듈
│   │   → 향후 교통 지도 전용 페이지를 분리할 때 사용 가능
│   │
│   ├── post_routes.py
│   │   → 게시판 라우트
│   │   → GET /board/ 게시글 목록 화면
│   │   → POST /board/create 게시글 및 첨부파일 업로드 처리
│   │
│   ├── route_api_routes.py
│   │   → 운전 경로 계산 API 라우트
│   │   → POST /api/route/compute
│   │   → Kakao 경로 계산, 주변 CCTV 정체 분석, RouteReport 저장까지 처리
│   │
│   ├── traffic_api_routes.py
│   │   → 교통 관제 관련 API 라우트
│   │   → GET /api/traffic/cctv-list 지역/도로유형별 CCTV 목록 반환
│   │   → GET /api/traffic/ai-events 최근 AI 탐지 이벤트 반환
│   │   → 모니터링 화면의 CCTV 목록과 AI 이상징후 로그에 사용
│   │
│   └── __init__.py
│       → routes 패키지 초기화 파일
│
├── static/
│   │
│   ├── css/
│   │   │
│   │   ├── base.css
│   │   │   → 전체 페이지 공통 기본 스타일
│   │   │   → box-sizing, body 기본 배경/폰트/색상, a 태그, input/button/select 기본 폰트 설정
│   │   │   → CSS Reset에 가까운 역할
│   │   │
│   │   ├── components.css
│   │   │   → 여러 페이지에서 재사용하는 공통 UI 컴포넌트 스타일
│   │   │   → monitor-card, map-card, route-panel, metric-grid, info-box, comment-box 등
│   │   │   → 카드형 UI와 공통 정보 박스 스타일의 중심 파일
│   │   │
│   │   ├── layout.css
│   │   │   → 전체 레이아웃 스타일
│   │   │   → app-layout, sidebar, main-content 정의
│   │   │   → 좌측 사이드바 + 우측 본문 구조를 담당
│   │   │
│   │   ├── main.css
│   │   │   → CSS 엔트리 파일
│   │   │   → base.css, layout.css, components.css, pages/*.css를 @import로 통합
│   │   │   → head.html에서는 main.css 하나만 연결하면 전체 스타일이 적용됨
│   │   │
│   │   └── pages/
│   │       │
│   │       ├── ai_detect.css
│   │       │   → AI 영상 분석 페이지 전용 스타일
│   │       │   → 업로드 폼, 결과 요약 카드, Bounding Box 결과 이미지 영역 스타일
│   │       │   → /ai-detect 화면의 레이아웃과 분석 결과 표시 담당
│   │       │
│   │       ├── board.css
│   │       │   → 게시판 페이지 전용 스타일
│   │       │   → 게시글 작성 폼 input/textarea, 파일 첨부, 게시글 목록 스타일
│   │       │
│   │       ├── dashboard.css
│   │       │   → 대시보드 페이지 전용 스타일
│   │       │   → 차트 그리드, 작은 도넛 차트 박스, 최근 AI 이벤트 카드, 썸네일 스타일
│   │       │   → / 대시보드 화면의 시각화 품질을 담당
│   │       │
│   │       ├── monitoring.css
│   │       │   → 실시간 교통 관제 모니터링 페이지 전용 스타일
│   │       │   → 지역/도로유형 필터, CCTV 목록 패널, 2채널 영상 카드, ON/OFF 버튼
│   │       │   → 정체 가능성 예측 카드, AI 이상징후 로그, 경보 배너 스타일 포함
│   │       │
│   │       ├── navigation.css
│   │       │   → 운전 경로 추천 페이지 전용 스타일
│   │       │   → 출발지/도착지 검색 폼, Kakao 지도 영역, 경로 분석 패널, 정체 위험도 카드 스타일
│   │       │
│   │       ├── reports.css
│   │       │   → AI 탐지 레포트 및 경로 분석 레포트 페이지 전용 스타일
│   │       │   → 탐지 결과 이미지 썸네일, 위험도 배지, 레포트 카드, 경로 분석 테이블 스타일
│   │       │
│   │       └── settings.css
│   │           → 설정 정보 확인 페이지 전용 스타일
│   │           → 모델 경로, 임계값, API 키 연결 상태 카드/그리드 스타일
│   │
│   ├── js/
│   │   │
│   │   ├── components/
│   │   │   │
│   │   │   ├── cctvComponent.js
│   │   │   │   → CCTV 목록 렌더링 컴포넌트
│   │   │   │   → CCTV 배열을 받아 클릭 가능한 리스트 DOM으로 변환
│   │   │   │   → monitoring.js에서 CCTV 선택 UI를 구성할 때 사용
│   │   │   │
│   │   │   ├── chartComponent.js
│   │   │   │   → Chart.js 생성 공통 컴포넌트
│   │   │   │   → canvasId, 차트 타입, labels, values, options를 받아 차트 생성
│   │   │   │   → dashboard.js에서 도넛/바 차트를 만들 때 사용
│   │   │   │
│   │   │   └── mapComponent.js
│   │   │       → Kakao Map 관련 공통 컴포넌트
│   │   │       → 지도 생성, 마커 생성, 경로 폴리라인 생성, 지도 bounds 맞춤 기능 제공
│   │   │       → navigation.js의 지도 로직을 간결하게 유지하기 위한 파일
│   │   │
│   │   ├── core/
│   │   │   │
│   │   │   ├── api.js
│   │   │   │   → 프론트 공통 API 요청 유틸
│   │   │   │   → fetch를 감싸서 GET/POST JSON 요청을 통일
│   │   │   │   → routeService.js, trafficService.js에서 공통 사용
│   │   │   │
│   │   │   └── dom.js
│   │   │       → DOM 조작 공통 유틸
│   │   │       → $(selector), setText(selector, value) 제공
│   │   │       → 여러 페이지 JS에서 텍스트 업데이트를 안전하게 처리
│   │   │
│   │   ├── pages/
│   │   │   │
│   │   │   ├── ai_detect.js
│   │   │   │   → AI 영상 분석 페이지 전용 JS
│   │   │   │   → 파일 업로드 FormData 생성, POST /api/ai/detect 호출
│   │   │   │   → 이벤트 유형, 위험도, 차량 수, 신뢰도, 결과 이미지 화면 표시
│   │   │   │
│   │   │   ├── dashboard.js
│   │   │   │   → 대시보드 페이지 전용 JS
│   │   │   │   → cameraStatusChart, routeRiskChart, recentRouteScoreChart 데이터를 Chart.js로 시각화
│   │   │   │   → chartComponent.js를 import해서 차트 생성 로직을 재사용
│   │   │   │
│   │   │   ├── monitoring.js
│   │   │   │   → 실시간 교통 관제 모니터링 페이지 전용 JS
│   │   │   │   → 지역/도로유형별 CCTV 조회, CCTV 2채널 선택, ON/OFF 제어
│   │   │   │   → 최근 30초 저장 화면 표시, 정체 가능성 계산, AI 이상징후 로그 자동 조회
│   │   │   │   → 5초마다 AI 이벤트를 조회해 긴급/위험 이벤트 발생 시 경보 배너 표시
│   │   │   │
│   │   │   └── navigation.js
│   │   │       → 운전 경로 추천 페이지 전용 JS
│   │   │       → Google Places 자동완성으로 출발지/도착지 좌표 확보
│   │   │       → POST /api/route/compute 호출 후 Kakao Map에 경로선과 주변 CCTV 마커 표시
│   │   │       → 경로 거리, 시간, 주변 CCTV 수, 정체 위험도, 분석 코멘트 업데이트
│   │   │
│   │   └── services/
│   │       │
│   │       ├── routeService.js
│   │       │   → 운전 경로 추천 API 호출 전용 프론트 서비스
│   │       │   → fetchRoute(origin, destination)
│   │       │   → POST /api/route/compute 요청 담당
│   │       │
│   │       └── trafficService.js
│   │           → 교통 관제 API 호출 전용 프론트 서비스
│   │           → fetchCctvList(region, roadType): CCTV 목록 조회
│   │           → fetchAiEvents(): 최근 AI 이상징후 로그 조회
│   │
│   └── uploads/
│       │
│       ├── detections/
│       │   → 사용자가 AI 분석을 위해 업로드한 원본 이미지 저장 경로
│       │   → Git에는 올리지 않는 런타임 생성 데이터
│       │
│       └── detection_results/
│           → YOLOv8이 Bounding Box를 그린 결과 이미지 저장 경로
│           → 대시보드, 레포트, 모니터링 로그에서 썸네일로 사용
│           → Git에는 올리지 않는 런타임 생성 데이터
│
└── templates/
    │
    ├── base.html
    │   → 모든 페이지의 공통 HTML 뼈대
    │   → head.html include, sidebar.html include, main-content 영역 제공
    │   → 각 페이지는 block content와 block extra_js/extra_css만 채움
    │
    ├── components/
    │   │
    │   ├── head.html
    │   │   → 공통 head 영역 컴포넌트
    │   │   → meta charset, viewport, title, main.css 연결
    │   │   → 페이지별 추가 CSS를 위한 extra_css block 제공
    │   │
    │   └── sidebar.html
    │       → 좌측 사이드바 메뉴 컴포넌트
    │       → 대시보드, 실시간 모니터링, AI 영상 분석, 탐지 레포트, 운전 경로 추천, 게시판, 설정 정보 확인 메뉴 제공
    │       → 모든 페이지에서 중복 작성하지 않고 base.html에서 include
    │
    └── pages/
        │
        ├── ai_detect.html
        │   → AI 영상 분석 페이지
        │   → 이미지 업로드 폼 제공
        │   → YOLOv8 분석 결과, 차량 수, 위험도, 신뢰도, 결과 이미지 표시
        │
        ├── board.html
        │   → 게시판 페이지
        │   → 제목/내용/파일 첨부 게시글 작성
        │   → 업로드된 게시글과 첨부파일 목록 표시
        │
        ├── dashboard.html
        │   → 교통 정체 예측 대시보드 페이지
        │   → CCTV 운영 상태, AI 분석 이벤트 수, 정체 가능성 차트, 최근 AI 탐지 이벤트 표시
        │   → Chart.js를 사용해 도넛 차트와 막대 차트 출력
        │
        ├── monitoring.html
        │   → 실시간 교통 관제 모니터링 페이지
        │   → 지역/도로유형 선택, CCTV 2채널 관제, ON/OFF, 최근 30초 저장 화면 UI 제공
        │   → 정체 가능성 예측 정보와 최근 AI 이상징후 로그 표시
        │
        ├── navigation.html
        │   → 운전 경로 추천 페이지
        │   → Google Places 자동완성 + Kakao Mobility 경로 계산
        │   → Kakao Map 경로 표시, 주변 CCTV 분석, 정체 위험도 표시
        │
        ├── reports.html
        │   → AI 탐지 및 경로 분석 레포트 페이지
        │   → YOLOv8 탐지 기록과 경로 기반 정체 예측 기록을 함께 표시
        │   → 결과 이미지, 위험도, 객체 요약, 신뢰도, 분석 시간 확인 가능
        │
        └── settings.html
            → 설정 정보 확인 페이지
            → YOLO 모델 경로, 탐지 임계값, Kakao/Google/ITS/LLM API 연결 상태 표시
            → 시스템 환경 점검용 화면
```