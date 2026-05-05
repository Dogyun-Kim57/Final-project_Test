### 프로젝트 작업 트리
```
app/
│
├── config.py
│   → Flask 프로젝트 전체 환경 설정 파일
│   → SECRET_KEY, DB URI, 업로드 제한, YOLO 모델 경로, 탐지 임계값 관리
│   → Kakao Map JS Key, Kakao REST API Key, ITS API Key, Google/LLM API Key 등 외부 API 설정 관리
│   → .env 기반으로 민감 정보를 분리하여 코드에 직접 노출되지 않도록 하는 역할
│
├── extensions.py
│   → Flask 확장 객체를 생성하는 공통 파일
│   → SQLAlchemy db 객체 관리
│   → Flask-SocketIO socketio 객체 관리
│   → create_app()에서 db.init_app(app), socketio.init_app(app)으로 연결됨
│
├── __init__.py
│   → Flask 애플리케이션 팩토리 파일
│   → create_app() 함수에서 앱 생성, Config 로드, DB 초기화, SocketIO 초기화 수행
│   → main_routes, api_routes, traffic_api_routes, route_api_routes, ai_detection_routes, post_routes 등록
│   → 프로젝트의 실행 진입 구조를 담당하는 핵심 파일
│
├── common/
│   │
│   ├── constants.py
│   │   → 프로젝트 전역 공통 상수 정의 파일
│   │   → 이벤트 타입, 위험도 단계, 상태값 등을 문자열로 통일
│   │   → “위험”, “긴급”, “주의” 같은 값을 코드 곳곳에 직접 쓰는 것을 줄이기 위한 파일
│   │
│   ├── response.py
│   │   → API 응답 형식 통일 유틸
│   │   → success(), fail() 함수 제공
│   │   → 모든 API 응답을 { success, message, data } 형태로 맞춰 프론트 JS에서 처리하기 쉽게 함
│   │
│   └── __init__.py
│       → common 패키지 초기화 파일
│
├── models/
│   │
│   ├── camera.py
│   │   → CCTV 카메라 정보를 저장하는 DB 모델
│   │   → 카메라 이름, 위치명, 스트리밍 URL, 썸네일 URL, 실시간 여부, 활성 여부 등을 관리
│   │   → DetectionEvent와 연결되어 “어떤 카메라에서 탐지됐는가”를 추적하는 기준 모델
│   │
│   ├── detection_event.py
│   │   → AI 탐지 이벤트 저장 모델
│   │   → camera_id, event_type, risk_level, object_type, confidence, snapshot_url, detected_at 저장
│   │   → YOLO 이미지 업로드 분석 결과와 실시간 CCTV 이상징후 기록이 모두 저장되는 핵심 테이블
│   │   → 대시보드, 모니터링 로그, 탐지 레포트의 데이터 원천
│   │
│   ├── post.py
│   │   → 게시판 글과 첨부파일 모델
│   │   → Post: 제목, 내용, 작성 시간 관리
│   │   → PostFile: 첨부파일명, 저장 경로, 연결된 게시글 ID 관리
│   │   → 팀 프로젝트 중 자료 공유, 테스트 이미지, 회의 기록 등을 업로드하는 확장 공간으로 활용 가능
│   │
│   ├── route_report.py
│   │   → 운전 경로 분석 결과 저장 모델
│   │   → 출발지, 도착지, 거리, 예상 소요시간, 주변 CCTV 수, 평균 정체 점수, 위험도, 코멘트 저장
│   │   → 운전 경로 추천 기능에서 생성된 분석 결과를 레포트화하는 테이블
│   │
│   └── __init__.py
│       → models 패키지 초기화 파일
│       → db.create_all() 전에 Camera, DetectionEvent, Post, RouteReport 모델이 로드되도록 함
│
├── repositories/
│   │
│   ├── camera_repository.py
│   │   → Camera 모델 DB 접근 전용 파일
│   │   → 전체 CCTV 조회, 실시간 CCTV 수 조회, 전체 카메라 수 조회, 저장 기능 담당
│   │   → service 계층이 직접 Camera.query를 남발하지 않도록 분리
│   │
│   ├── detection_repository.py
│   │   → DetectionEvent 모델 DB 접근 전용 파일
│   │   → 전체 이벤트 수, 오늘 이벤트 수, 최근 이벤트 조회 담당
│   │   → 위험도 기준 필터 조회(find_recent_by_risk_levels) 담당
│   │   → 대시보드 통계, 모니터링 로그, 탐지 레포트 페이지에서 공통 사용
│   │
│   ├── post_repository.py
│   │   → Post, PostFile 모델 DB 접근 전용 파일
│   │   → 게시글 저장, 게시글 목록 조회, 특정 게시글 조회 담당
│   │   → 게시판 기능의 데이터 접근 계층
│   │
│   ├── route_report_repository.py
│   │   → RouteReport 모델 DB 접근 전용 파일
│   │   → 경로 분석 결과 저장 및 최근 경로 분석 기록 조회 담당
│   │   → 대시보드 차트와 탐지 레포트 하단의 경로 기반 정체 예측 기록에 사용
│   │
│   └── __init__.py
│       → repositories 패키지 초기화 파일
│
├── services/
│   │
│   ├── ai_detection_service.py
│   │   → 이미지 업로드 기반 YOLOv8 분석 서비스
│   │   → 사용자가 /ai-detect 화면에서 업로드한 이미지를 저장
│   │   → YOLOv8 모델 로딩, 객체 탐지, 차량/사람 수 계산, 위험도 판단 수행
│   │   → Bounding Box 결과 이미지를 detection_results 폴더에 저장
│   │   → DetectionEvent DB 저장 후 위험/긴급 이벤트는 WebSocket 알림 전송
│   │   → 현재 “AI 영상 분석 업로드 기록”의 핵심 처리 모듈
│   │
│   ├── camera_service.py
│   │   → Camera 데이터를 화면 출력용 dict 구조로 변환하는 서비스
│   │   → 대시보드나 CCTV 목록 화면에서 사용할 카메라 리스트를 구성
│   │   → DB 모델과 프론트 JSON 사이의 변환 계층
│   │
│   ├── congestion_service.py
│   │   → 정체 점수 계산 서비스
│   │   → 평균 속도, 차량 수, CCTV 상태 등을 기반으로 congestion_score 계산
│   │   → 점수에 따라 낮음/주의/높음 위험도를 판단
│   │   → 운전 경로 추천 및 정체 가능성 예측 로직의 기준 모듈
│   │
│   ├── dashboard_service.py
│   │   → 대시보드 통합 데이터 구성 서비스
│   │   → 총 CCTV 수, 실시간 CCTV 수, 오늘 AI 이벤트 수, 누적 이벤트 수 계산
│   │   → 최근 AI 탐지 이벤트, 경로 분석 요약, Chart.js용 데이터 구성
│   │   → dashboard.html에 전달되는 data 객체를 만드는 중심 모듈
│   │
│   ├── detection_service.py
│   │   → DetectionEvent 데이터를 화면 출력용으로 가공하는 서비스
│   │   → 최근 이벤트 조회, AI 탐지 레포트 조회, 위험/긴급 기준 레포트 분류 담당
│   │   → 실시간 CCTV 기록과 이미지 업로드 기록을 source_type 기준으로 구분
│   │   → 오늘자 기록 / 이전 기록 분리
│   │   → 각 섹션별 7개씩 페이지네이션 처리
│   │   → 탐지 레포트 화면의 핵심 데이터 가공 모듈
│   │
│   ├── its_api_service.py
│   │   → ITS Open API 기반 CCTV 목록 조회 서비스
│   │   → 지역별 좌표 범위, 도로 유형을 기준으로 CCTV 목록 조회
│   │   → API 실패 시 fallback CCTV 데이터를 반환하여 데모 화면이 끊기지 않도록 처리
│   │   → /monitoring 화면의 CCTV 목록 데이터 공급원
│   │
│   ├── kakao_map_service.py
│   │   → Kakao 지도 표시용 CCTV 데이터 가공 서비스
│   │   → CCTV 좌표, 이름, 도로명 등을 지도 마커에서 쓰기 좋은 구조로 변환
│   │   → 향후 지도 기반 관제 화면 확장에 사용 가능
│   │
│   ├── kakao_route_service.py
│   │   → Kakao Mobility 길찾기 API 연동 서비스
│   │   → 출발지/도착지 좌표를 기반으로 실제 운전 경로 요청
│   │   → 거리, 예상 시간, 경로 좌표 path 추출
│   │   → /navigation 운전 경로 추천 기능의 핵심 외부 API 연동 모듈
│   │
│   ├── llm_comment_service.py
│   │   → LLM 기반 분석 코멘트 생성 서비스
│   │   → API Key가 있으면 LLM을 활용해 교통 분석 문장 생성
│   │   → 실패하거나 키가 없으면 fallback 코멘트 반환
│   │   → 경로 분석 결과와 관제 코멘트를 더 자연스럽게 만들기 위한 확장 모듈
│   │
│   ├── post_service.py
│   │   → 게시판 비즈니스 로직 서비스
│   │   → 게시글 생성, 첨부파일 저장, 게시글 목록 조회 담당
│   │   → 업로드 파일을 static/uploads 하위에 저장
│   │   → repository와 route 사이에서 게시판 기능의 처리 흐름을 담당
│   │
│   ├── route_analysis_service.py
│   │   → 경로 주변 CCTV 기반 정체 분석 서비스
│   │   → Kakao 경로 좌표와 CCTV 좌표 간 거리 계산
│   │   → 경로 주변 CCTV 필터링, 정체 점수 평균, 위험도 판단, 분석 코멘트 생성
│   │   → 운전 경로 추천 결과에 “주변 CCTV 기반 정체 위험도”를 붙이는 핵심 모듈
│   │
│   ├── route_report_service.py
│   │   → RouteReport 저장 및 조회 서비스
│   │   → route_analysis 결과를 DB에 저장 가능한 형태로 변환
│   │   → 최근 경로 분석 기록을 탐지 레포트와 대시보드에 제공
│   │
│   ├── yolo_stream_service.py
│   │   → YOLOv8 실시간 영상 스트리밍 서비스
│   │   → OpenCV VideoCapture로 웹캠, 로컬 영상, ITS CCTV URL을 프레임 단위로 읽음
│   │   → YOLOv8로 실시간 객체 탐지 후 Bounding Box 프레임 생성
│   │   → MJPEG 방식으로 브라우저에 스트리밍 전송
│   │   → 데모 기준 완화: 차량 2대 이상 위험, 4대 이상 긴급
│   │   → SimpleVehicleTracker를 통해 차량 중심점 이동량 기반 정지 차량 의심 판단
│   │   → 위험/긴급 이벤트 발생 시 10초 간격으로 DetectionEvent 저장
│   │   → WebSocket ai_alert 이벤트를 통해 /monitoring 화면에 즉시 경보 전달
│   │   → 실시간 CCTV 이상징후 탐지 기록의 핵심 모듈
│   │
│   └── __init__.py
│       → services 패키지 초기화 파일
│
├── routes/
│   │
│   ├── ai_detection_routes.py
│   │   → AI 분석 관련 API 라우트
│   │   → POST /api/ai/detect: 이미지 업로드 기반 YOLO 분석
│   │   → GET /api/ai/stream: YOLO 실시간 영상 스트리밍
│   │   → stream_with_context와 app 객체 전달을 통해 스트리밍 중 DB 저장 context 문제 해결
│   │
│   ├── api_routes.py
│   │   → 공통 API 라우트
│   │   → 대시보드 API나 간단한 상태 확인 API 등 확장 가능
│   │   → 현재는 프로젝트 API 구조를 분리하기 위한 기본 라우트 역할
│   │
│   ├── dashboard_routes.py
│   │   → 대시보드 전용 라우트로 분리하려던 파일
│   │   → 현재 안정화 기준에서는 main_routes.py가 / 대시보드를 담당하므로 등록하지 않는 것이 안전
│   │   → 추후 관리자 대시보드나 API형 대시보드 분리 시 재활용 가능
│   │
│   ├── main_routes.py
│   │   → 페이지 렌더링 중심 라우트
│   │   → / 대시보드
│   │   → /monitoring 실시간 교통 관제 모니터링
│   │   → /ai-detect AI 영상 분석 테스트
│   │   → /reports 탐지 레포트
│   │   → /navigation 운전 경로 추천
│   │   → /settings 설정 정보 확인
│   │   → 각 페이지에 필요한 서비스 데이터와 API Key를 템플릿에 전달
│   │
│   ├── map_routes.py
│   │   → 지도 전용 페이지 또는 API 확장용 라우트
│   │   → 현재 핵심 흐름에서는 main_routes/navigation으로 통합되어 있어 선택 모듈에 가까움
│   │   → 향후 지도 기반 CCTV 관제 페이지를 따로 분리할 때 사용 가능
│   │
│   ├── post_routes.py
│   │   → 게시판 라우트
│   │   → GET /board/: 게시글 목록 화면 렌더링
│   │   → POST /board/create: 게시글 작성 및 첨부파일 업로드 처리
│   │   → 팀 자료 공유나 프로젝트 테스트 파일 업로드용 확장 기능
│   │
│   ├── route_api_routes.py
│   │   → 운전 경로 계산 API 라우트
│   │   → POST /api/route/compute
│   │   → Kakao Mobility 길찾기 호출
│   │   → 경로 주변 CCTV 분석
│   │   → RouteReport DB 저장
│   │   → /navigation 페이지에서 fetchRoute()로 호출됨
│   │
│   ├── traffic_api_routes.py
│   │   → 교통 관제 관련 API 라우트
│   │   → GET /api/traffic/cctv-list: 지역/도로 유형별 CCTV 목록 반환
│   │   → GET /api/traffic/ai-events: 최근 AI 탐지 이벤트 반환
│   │   → /monitoring 화면의 CCTV 목록과 최근 AI 이상징후 로그 패널에서 사용
│   │
│   └── __init__.py
│       → routes 패키지 초기화 파일
│
├── static/
│   │
│   ├── css/
│   │   │
│   │   ├── base.css
│   │   │   → 전체 HTML 기본 스타일
│   │   │   → body 배경색, 기본 폰트, box-sizing, a/button/input 기본 스타일 초기화
│   │   │   → 페이지별 CSS가 안정적으로 적용되도록 하는 전역 기반 스타일
│   │   │
│   │   ├── components.css
│   │   │   → 공통 UI 컴포넌트 스타일
│   │   │   → monitor-card, metric-grid, info-box, comment-box, map-card, route-panel 등
│   │   │   → 여러 페이지에서 반복되는 카드/정보 박스/코멘트 UI를 통일
│   │   │
│   │   ├── layout.css
│   │   │   → 전체 레이아웃 스타일
│   │   │   → 좌측 sidebar + 우측 main-content 구조 정의
│   │   │   → app-layout, sidebar, main-content, 메뉴 링크 스타일 담당
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
│   │       │   → 이미지 업로드 카드, 분석 결과 요약, Bounding Box 결과 이미지 영역 스타일
│   │       │   → YOLO 실시간 스트리밍 테스트 박스와 영상 소스 입력 UI 스타일
│   │       │
│   │       ├── board.css
│   │       │   → 게시판 페이지 전용 스타일
│   │       │   → 게시글 작성 폼, textarea, 파일 업로드 input, 게시글 목록 카드 스타일
│   │       │
│   │       ├── dashboard.css
│   │       │   → 대시보드 페이지 전용 스타일
│   │       │   → 시스템 요약 카드, 도넛 차트/막대 차트 크기 조정
│   │       │   → 최근 AI 탐지 이벤트 카드와 썸네일 UI 스타일
│   │       │
│   │       ├── monitoring.css
│   │       │   → 실시간 교통 관제 모니터링 페이지 전용 스타일
│   │       │   → 지역/도로 유형 필터, CCTV 목록 패널, 2채널 영상 카드 스타일
│   │       │   → CCTV ON/OFF 버튼, AI 분석 ON/OFF 버튼, YOLO 스트리밍 라벨 스타일
│   │       │   → 정체 가능성 예측 정보, 최근 AI 로그, WebSocket 경보 배너 스타일 포함
│   │       │
│   │       ├── navigation.css
│   │       │   → 운전 경로 추천 페이지 전용 스타일
│   │       │   → Kakao 장소 검색 입력창, 검색 결과 리스트, Kakao 지도 영역 스타일
│   │       │   → 경로 분석 패널, 거리/소요시간/주변 CCTV/정체 위험도 카드 스타일
│   │       │
│   │       ├── reports.css
│   │       │   → 탐지 레포트 페이지 전용 스타일
│   │       │   → 상단 요약 히어로 영역, 전체/실시간/업로드 기록 카운트 카드 스타일
│   │       │   → 실시간 이상징후 기록, AI 업로드 분석 기록, 이전 기록 섹션 스타일
│   │       │   → 탐지 결과 카드, 위험도 배지, 썸네일, 메타 정보 그리드, 페이지네이션 스타일
│   │       │   → 경로 기반 정체 예측 테이블 스타일
│   │       │
│   │       └── settings.css
│   │           → 설정 정보 확인 페이지 전용 스타일
│   │           → YOLO 모델 경로, 탐지 임계값, API 키 연결 상태, 시스템 설정 정보 카드 스타일
│   │
│   ├── js/
│   │   │
│   │   ├── components/
│   │   │   │
│   │   │   ├── cctvComponent.js
│   │   │   │   → CCTV 목록 렌더링 컴포넌트
│   │   │   │   → CCTV 배열을 받아 클릭 가능한 목록 DOM 생성
│   │   │   │   → /monitoring 화면에서 CCTV 선택 UI를 구성할 때 사용
│   │   │   │
│   │   │   ├── chartComponent.js
│   │   │   │   → Chart.js 공통 생성 컴포넌트
│   │   │   │   → canvasId, type, labels, values, options를 받아 차트 생성
│   │   │   │   → dashboard.js에서 CCTV 운영 상태/정체 가능성/최근 점수 차트를 만들 때 사용
│   │   │   │
│   │   │   └── mapComponent.js
│   │   │       → Kakao Map 공통 컴포넌트
│   │   │       → 지도 생성, 마커 생성, 폴리라인 생성, 지도 범위 맞춤 기능 제공
│   │   │       → navigation.js의 지도 관련 코드를 간결하게 유지하기 위한 파일
│   │   │
│   │   ├── core/
│   │   │   │
│   │   │   ├── api.js
│   │   │   │   → 프론트 공통 API 요청 유틸
│   │   │   │   → fetch를 감싸 GET/POST JSON 요청을 통일
│   │   │   │   → routeService.js, trafficService.js에서 재사용
│   │   │   │
│   │   │   └── dom.js
│   │   │       → DOM 조작 공통 유틸
│   │   │       → $(selector), setText(selector, value) 제공
│   │   │       → 특정 요소가 없을 때도 안전하게 텍스트를 바꾸기 위한 보조 함수
│   │   │
│   │   ├── pages/
│   │   │   │
│   │   │   ├── ai_detect.js
│   │   │   │   → AI 영상 분석 페이지 전용 JS
│   │   │   │   → 이미지 파일 업로드 FormData 생성
│   │   │   │   → POST /api/ai/detect 호출
│   │   │   │   → 이벤트 유형, 위험도, 차량 수, 신뢰도, 결과 이미지 표시
│   │   │   │   → YOLO 실시간 스트리밍 테스트 시작/중지 기능 제공
│   │   │   │
│   │   │   ├── dashboard.js
│   │   │   │   → 대시보드 페이지 전용 JS
│   │   │   │   → 서버에서 전달된 chart 데이터를 Chart.js로 렌더링
│   │   │   │   → CCTV 운영 상태 도넛 차트, 정체 가능성 분포 차트, 최근 경로 점수 막대 차트 생성
│   │   │   │
│   │   │   ├── monitoring.js
│   │   │   │   → 실시간 교통 관제 모니터링 페이지 전용 JS
│   │   │   │   → 지역/도로 유형별 CCTV 조회
│   │   │   │   → CCTV 2채널 선택 및 ON/OFF 제어
│   │   │   │   → 각 CCTV 카드에서 AI 분석 ON/OFF 제어
│   │   │   │   → AI 분석 ON 시 /api/ai/stream으로 YOLO 스트리밍 연결
│   │   │   │   → 최근 30초 저장 화면 표시
│   │   │   │   → 평균 속도/차량 수 기반 정체 가능성 계산
│   │   │   │   → 최근 AI 이상징후 로그 자동 조회
│   │   │   │   → Socket.IO ai_alert 이벤트 수신 후 경보 배너 표시
│   │   │   │
│   │   │   └── navigation.js
│   │   │       → 운전 경로 추천 페이지 전용 JS
│   │   │       → Kakao Places keywordSearch로 출발지/도착지 검색
│   │   │       → 검색 결과 목록에서 장소 선택 시 좌표 저장
│   │   │       → POST /api/route/compute 호출
│   │   │       → Kakao Map에 출발/도착 마커, 경로선, 주변 CCTV 마커 표시
│   │   │       → 경로 거리, 소요시간, 주변 CCTV 수, 정체 위험도, 분석 코멘트 표시
│   │   │
│   │   └── services/
│   │       │
│   │       ├── routeService.js
│   │       │   → 운전 경로 추천 API 호출 전용 프론트 서비스
│   │       │   → fetchRoute(origin, destination) 제공
│   │       │   → /api/route/compute에 POST 요청을 보내 경로 계산 결과를 받아옴
│   │       │
│   │       └── trafficService.js
│   │           → 교통 관제 API 호출 전용 프론트 서비스
│   │           → fetchCctvList(region, roadType): 지역/도로 유형별 CCTV 목록 조회
│   │           → fetchAiEvents(): 최근 AI 이상징후 이벤트 조회
│   │           → monitoring.js에서 CCTV 목록과 로그 패널 갱신에 사용
│   │
│   └── uploads/
│       │
│       ├── detections/
│       │   → /ai-detect에서 사용자가 업로드한 원본 이미지 저장 폴더
│       │   → 런타임 생성 데이터이므로 Git에 올리지 않는 것이 좋음
│       │
│       └── detection_results/
│           → YOLO 분석 결과 이미지 저장 폴더
│           → 이미지 업로드 분석 결과는 result_... 형식으로 저장
│           → 실시간 CCTV 이상징후 기록은 realtime_anomaly_... 형식으로 저장
│           → 대시보드, 모니터링 로그, 탐지 레포트에서 썸네일로 사용
│           → 런타임 생성 데이터이므로 Git에 올리지 않는 것이 좋음
│
└── templates/
    │
    ├── base.html
    │   → 모든 페이지의 공통 HTML 레이아웃
    │   → head.html include, sidebar.html include, main-content 영역 제공
    │   → 각 페이지는 block content, block extra_css, block extra_js만 채우면 됨
    │
    ├── components/
    │   │
    │   ├── head.html
    │   │   → 공통 head 영역 컴포넌트
    │   │   → meta charset, viewport, title, main.css 연결 담당
    │   │   → 페이지별 추가 CSS를 위한 extra_css block 제공
    │   │
    │   └── sidebar.html
    │       → 좌측 사이드바 메뉴 컴포넌트
    │       → 대시보드, 실시간 모니터링, AI 영상 분석, 탐지 레포트, 운전 경로 추천, 게시판, 설정 정보 확인 메뉴 제공
    │       → 모든 페이지에서 중복 작성하지 않고 base.html에서 include됨
    │
    └── pages/
        │
        ├── ai_detect.html
        │   → AI 영상 분석 테스트 페이지
        │   → 이미지 업로드 폼 제공
        │   → YOLO 분석 결과 요약 카드와 Bounding Box 결과 이미지 표시
        │   → 웹캠/영상 파일/CCTV URL 기반 YOLO 스트리밍 테스트 영역 제공
        │
        ├── board.html
        │   → 게시판 페이지
        │   → 게시글 작성, 내용 입력, 파일 첨부 기능 제공
        │   → 팀원 간 테스트 자료나 참고 파일 공유 용도로 활용 가능
        │
        ├── dashboard.html
        │   → 교통 정체 예측 대시보드 페이지
        │   → 전체 CCTV 수, 실시간 CCTV 수, 오늘 AI 이벤트, 누적 AI 이벤트 표시
        │   → Chart.js 기반 차트 출력
        │   → 최근 AI 탐지 이벤트 썸네일 카드 표시
        │
        ├── monitoring.html
        │   → 실시간 교통 관제 모니터링 페이지
        │   → 지역/도로 유형 선택
        │   → CCTV 2대 선택 및 관제
        │   → CCTV ON/OFF, AI 분석 ON/OFF 버튼 제공
        │   → YOLO 스트리밍 화면을 CCTV 카드 안에 표시
        │   → 정체 가능성 예측 정보와 최근 AI 이상징후 로그 표시
        │   → WebSocket 경보 배너가 표시되는 발표용 핵심 화면
        │
        ├── navigation.html
        │   → 운전 경로 추천 페이지
        │   → Kakao Places 장소 검색으로 출발지/도착지 선택
        │   → Kakao Mobility API 기반 경로 계산 결과 표시
        │   → Kakao Map 위에 경로선과 주변 CCTV 마커 표시
        │   → 경로 주변 CCTV 기반 정체 위험도 분석 결과 표시
        │
        ├── reports.html
        │   → 탐지 레포트 메인 페이지
        │   → 실시간 CCTV 이상징후 기록과 AI 업로드 분석 기록을 구분
        │   → 오늘자 기록과 이전 기록을 분리
        │   → 각 섹션별 7개씩 노출하고 페이지네이션 제공
        │   → 하단에는 경로 기반 정체 예측 기록 테이블 표시
        │
        ├── report_item.html
        │   → 탐지 레포트 카드 부분 템플릿
        │   → 결과 이미지, 이벤트 유형, 위험도 배지, 탐지 시간, 카메라명, 위치, 객체 요약, 신뢰도 표시
        │   → reports.html에서 반복 include하여 중복 HTML을 줄임
        │
        ├── report_pagination.html
        │   → 탐지 레포트 페이지네이션 부분 템플릿
        │   → 이전/다음 버튼과 현재 페이지/전체 페이지 표시
        │   → 실시간 기록, 업로드 기록, 이전 기록 섹션에서 공통 사용
        │
        └── settings.html
            → 설정 정보 확인 페이지
            → YOLO 모델 경로, 탐지 임계값, Kakao/ITS/LLM API 연결 상태 표시
            → 팀원이나 발표자가 현재 시스템 설정 상태를 확인하는 용도

```