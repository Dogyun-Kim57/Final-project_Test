### 프로젝트 작업 트리
```
app/
│
├── config.py
│   → 프로젝트 전체 환경설정 파일
│   → DB URI, SECRET_KEY, 업로드 제한, 모델 경로, 탐지 임계값 관리
│   → Kakao Map, Kakao REST, ITS, LLM, OpenWeather API Key를 .env에서 읽어옴
│   → 운영/데모 환경에서 외부 API 연결 상태를 관리하는 핵심 설정 파일
│
├── extensions.py
│   → Flask 확장 객체 생성 파일
│   → SQLAlchemy db 객체 관리
│   → Flask-SocketIO socketio 객체 관리
│   → create_app()에서 init_app()으로 Flask 앱과 연결됨
│
├── __init__.py
│   → Flask 애플리케이션 팩토리 파일
│   → create_app()에서 Flask 앱 생성, Config 로드, db/socketio 초기화
│   → main, api, traffic, route, ai_detection, post, assistant Blueprint 등록
│   → 프로젝트 전체 실행 구조의 중심 파일
│
├── common/
│   ├── constants.py
│   │   → 프로젝트 공통 상수 정의 파일
│   │   → 위험도, 이벤트 타입, 상태값 같은 문자열을 통일하기 위한 용도
│   │
│   ├── response.py
│   │   → API 응답 포맷 통일 파일
│   │   → success(), fail() 함수 제공
│   │   → 프론트 JS가 success/message/data 형태로 일관되게 응답 처리 가능
│   │
│   └── __init__.py
│       → common 패키지 초기화 파일
│
├── models/
│   ├── camera.py
│   │   → CCTV 카메라 DB 모델
│   │   → 카메라 이름, 위치명, CCTV URL, 썸네일, 실시간 여부 등을 저장
│   │   → AI 탐지 이벤트가 어떤 카메라에서 발생했는지 연결하는 기준 모델
│   │
│   ├── detection_event.py
│   │   → AI 탐지 이벤트 DB 모델
│   │   → event_type, risk_level, object_type, confidence, snapshot_url, detected_at 저장
│   │   → YOLO 이미지 분석, 실시간 CCTV 이상징후, 탐지 레포트의 핵심 데이터 테이블
│   │
│   ├── post.py
│   │   → 게시판 글과 첨부파일 DB 모델
│   │   → Post: 제목, 내용, 작성 시간 관리
│   │   → PostFile: 파일명, 파일 경로, 게시글 연결 관리
│   │   → PDF 요약, 이미지 Vision 분석 기능의 기반
│   │
│   ├── route_report.py
│   │   → 경로 분석 결과 DB 모델
│   │   → 출발지, 도착지, 거리, 소요시간, 주변 CCTV 수, 위험도, 평균 점수, 코멘트 저장
│   │   → 운전 경로 추천 결과를 레포트로 남기기 위한 모델
│   │
│   └── __init__.py
│       → models 패키지 초기화 파일
│       → db.create_all() 전 모델들이 로드되도록 연결
│
├── repositories/
│   ├── camera_repository.py
│   │   → Camera 모델 DB 접근 계층
│   │   → CCTV 목록 조회, 전체 CCTV 수 조회, 실시간 CCTV 수 조회 담당
│   │
│   ├── detection_repository.py
│   │   → DetectionEvent 모델 DB 접근 계층
│   │   → 전체 탐지 이벤트 수, 오늘 탐지 수, 최근 이벤트 조회
│   │   → 위험/긴급 기준 레포트 조회
│   │   → 대시보드, 모니터링 로그, 탐지 레포트에서 공통 사용
│   │
│   ├── post_repository.py
│   │   → Post/PostFile DB 접근 계층
│   │   → 게시글 저장, 게시글 목록 조회, 특정 게시글 조회
│   │   → 게시판 첨부파일 AI 분석에서 파일 조회에 사용
│   │
│   ├── route_report_repository.py
│   │   → RouteReport DB 접근 계층
│   │   → 경로 분석 결과 저장
│   │   → 최근 경로 분석 기록 조회
│   │
│   └── __init__.py
│       → repositories 패키지 초기화 파일
│
├── routes/
│   ├── ai_detection_routes.py
│   │   → AI 탐지 API 라우트
│   │   → /api/ai/detect : 이미지 업로드 기반 YOLO 분석
│   │   → /api/ai/stream : YOLO 실시간 스트리밍
│   │   → Flask streaming 중 context 문제를 막기 위해 app 객체를 service로 전달
│   │
│   ├── api_routes.py
│   │   → 공통 API 라우트
│   │   → /api/dashboard 형태로 대시보드 데이터를 JSON 반환
│   │
│   ├── assistant_routes.py
│   │   → AI 관제 보조 챗봇 라우트
│   │   → /ai-assistant : LangChain, RAG, LangGraph 챗봇 화면
│   │   → /assistant/chat : 사용자 질문을 LangGraph 라우터로 전달
│   │   → /assistant/rag/build : 게시판 PDF를 FAISS Retriever 인덱스로 변환
│   │
│   ├── dashboard_routes.py
│   │   → 대시보드 전용 라우트 파일
│   │   → 현재 main_routes와 역할이 일부 겹칠 수 있는 과거 분리 구조
│   │   → 향후 정리 후보
│   │
│   ├── main_routes.py
│   │   → 주요 화면 라우트 담당
│   │   → / : 대시보드
│   │   → /monitoring : 실시간 교통 관제
│   │   → /ai-detect : AI 영상 분석
│   │   → /reports : 탐지 레포트
│   │   → /navigation : 운전 경로 추천
│   │   → /settings : 설정 정보 확인
│   │
│   ├── map_routes.py
│   │   → 지도 화면 관련 라우트
│   │   → 현재 monitoring/main_routes와 일부 역할이 겹칠 수 있음
│   │   → 과거 traffic-map 분리 구조에서 사용한 파일
│   │
│   ├── post_routes.py
│   │   → 게시판 라우트
│   │   → /board : AI 관제 자료 분석 게시판
│   │   → /board/create : 게시글 및 첨부파일 등록
│   │   → /board/file/analyze : PDF AI 요약 또는 이미지 AI 설명 실행
│   │
│   ├── route_api_routes.py
│   │   → 경로 계산 API 라우트
│   │   → /api/route/compute
│   │   → 출발지/도착지 좌표를 받아 카카오 경로 계산
│   │   → 경로 주변 CCTV 위험도 분석 후 RouteReport 저장
│   │
│   ├── traffic_api_routes.py
│   │   → 교통/CCTV API 라우트
│   │   → /api/traffic/cctv-list : 지역/도로 유형별 CCTV 목록 조회
│   │   → /api/traffic/ai-events : 최근 AI 탐지 로그 조회
│   │
│   └── __init__.py
│       → routes 패키지 초기화 파일
│
├── services/
│   ├── ai_detection_service.py
│   │   → 이미지 업로드 기반 YOLO 분석 서비스
│   │   → 업로드 이미지 저장, YOLO 객체 탐지, 차량/사람 수 계산
│   │   → 이벤트 유형과 위험도 판단
│   │   → Bounding Box 결과 이미지 저장
│   │   → DetectionEvent DB 저장
│   │   → 위험/긴급 이벤트일 경우 WebSocket 알림 전송
│   │
│   ├── assistant_service.py
│   │   → 초기 LLM 관제 보조 서비스
│   │   → OpenAI API 단독 호출 기반의 단순 챗봇 역할
│   │   → 현재는 LangChain/LangGraph 구조 도입 후 보조 또는 이전 버전 역할
│   │
│   ├── board_ai_service.py
│   │   → 게시판 첨부파일 AI 분석 서비스
│   │   → 이미지 파일은 GPT Vision으로 교통 관제 관점 설명
│   │   → PDF 파일은 AI 요약 처리
│   │   → 게시판을 AI 자료 분석 센터로 확장시키는 핵심 서비스
│   │
│   ├── camera_service.py
│   │   → CCTV 카메라 비즈니스 로직
│   │   → repository에서 가져온 카메라 데이터를 화면/API용으로 가공
│   │
│   ├── congestion_service.py
│   │   → 교통 정체/혼잡도 판단 서비스
│   │   → 평균 속도, 차량 수, 위험도 판단 로직에 활용 가능
│   │
│   ├── dashboard_service.py
│   │   → 대시보드 데이터 구성 서비스
│   │   → 총 CCTV 수, 실시간 CCTV 수, 오늘 탐지 수, 누적 탐지 수 집계
│   │   → Chart.js에 전달할 차트 데이터 구성
│   │   → 최근 AI 탐지 이벤트와 경로 분석 요약 생성
│   │
│   ├── detection_service.py
│   │   → DetectionEvent 데이터를 화면 출력용 dict로 변환
│   │   → 실시간 이상징후 / AI 업로드 분석 / 이전 기록을 구분
│   │   → 탐지 레포트 페이지의 7개 단위 페이지네이션 데이터 구성
│   │
│   ├── its_api_service.py
│   │   → ITS CCTV API 연동 서비스
│   │   → 지역/도로 유형 기준 CCTV 목록 조회
│   │   → 실제 API 응답이 없거나 제한이 있을 경우 데모 데이터 fallback 가능
│   │
│   ├── kakao_map_service.py
│   │   → 카카오 지도 관련 보조 서비스
│   │   → 지도 좌표, 위치 데이터, 표시용 데이터 가공에 활용 가능
│   │
│   ├── kakao_route_service.py
│   │   → 카카오 경로 API 연동 서비스
│   │   → 출발지/도착지 좌표 기반 경로 계산
│   │   → 거리, 소요시간, 경로 좌표 반환
│   │
│   ├── langchain_rag_service.py
│   │   → LangChain / RAG / Retriever / LangGraph / Search / Weather 통합 서비스
│   │   → Basic Chain: 일반 관제 보조 답변
│   │   → RAG Chain: PDF Retriever 기반 문서 질의응답
│   │   → Search Chain: DuckDuckGo 검색 기반 답변
│   │   → Weather Chain: OpenWeatherMap 현재 날씨 기반 교통 관제 분석
│   │   → LangGraph Router: 질문을 basic/rag/search/weather로 분기
│   │   → Conversation Memory: 이름, 이전 질문 등 대화 문맥 유지
│   │   → 현재 시간: UTC+9 한국 시간 기준으로 답변에 반영
│   │
│   ├── llm_comment_service.py
│   │   → LLM 기반 코멘트 생성 서비스
│   │   → 경로 분석, 정체 위험도, 관제 설명을 자연어로 보조 생성하는 역할
│   │
│   ├── post_service.py
│   │   → 게시판 비즈니스 로직
│   │   → 게시글 생성
│   │   → 첨부파일 저장
│   │   → Post/PostFile DB 저장 처리
│   │
│   ├── route_analysis_service.py
│   │   → 경로 주변 CCTV 기반 위험도 분석
│   │   → 경로 좌표와 CCTV 위치를 비교
│   │   → 주변 CCTV 수, 평균 위험 점수, 위험도, 코멘트 생성
│   │
│   ├── route_report_service.py
│   │   → 경로 분석 결과 저장/조회 서비스
│   │   → RouteReport 생성
│   │   → 최근 경로 기반 정체 예측 기록 조회
│   │
│   ├── yolo_stream_service.py
│   │   → YOLO 실시간 영상 스트리밍 서비스
│   │   → OpenCV로 CCTV/웹캠/영상 파일 프레임 읽기
│   │   → YOLOv8 실시간 객체 탐지
│   │   → 차량 수 기반 위험도 판단
│   │   → 간단 Tracking 기반 정지 차량 의심 판단
│   │   → 위험/긴급 이벤트를 10초 간격으로 DB 저장
│   │   → WebSocket ai_alert 이벤트 전송
│   │   → MJPEG 방식으로 브라우저에 실시간 분석 영상 제공
│   │
│   └── __init__.py
│       → services 패키지 초기화 파일
│
├── static/
│   ├── css/
│   │   ├── base.css
│   │   │   → 전체 공통 기본 스타일
│   │   │   → box-sizing, body 폰트, 배경색, a/button/input 기본 스타일 정의
│   │   │
│   │   ├── components.css
│   │   │   → 공통 UI 컴포넌트 스타일
│   │   │   → monitor-card, metric-grid, info-box, comment-box 등 카드형 UI 정의
│   │   │
│   │   ├── layout.css
│   │   │   → 전체 레이아웃 스타일
│   │   │   → app-layout, sidebar, main-content 구조 정의
│   │   │
│   │   ├── main.css
│   │   │   → CSS 진입점
│   │   │   → base.css, layout.css, components.css, 각 pages CSS import
│   │   │
│   │   └── pages/
│   │       ├── ai_assistant.css
│   │       │   → LangChain/RAG/LangGraph 관제 AI 화면 스타일
│   │       │   → 채팅 카드, 추천 질문 버튼, 모드 설명 박스, 메시지 UI 스타일
│   │       │
│   │       ├── ai_detect.css
│   │       │   → AI 영상 분석 화면 스타일
│   │       │   → 이미지 업로드 폼, 분석 결과 카드, Bounding Box 결과 이미지, YOLO 스트리밍 영역 스타일
│   │       │
│   │       ├── board.css
│   │       │   → AI 관제 자료 분석 시스템 게시판 스타일
│   │       │   → 자료 업로드 카드, 파일 리스트, PDF/이미지 분석 버튼, AI 결과 박스 스타일
│   │       │
│   │       ├── dashboard.css
│   │       │   → 대시보드 화면 스타일
│   │       │   → 시스템 요약 카드, Chart.js 차트 영역, 최근 AI 이벤트 리스트 스타일
│   │       │
│   │       ├── monitoring.css
│   │       │   → 실시간 교통 관제 화면 스타일
│   │       │   → CCTV 목록, 2분할 영상 카드, AI 분석 ON/OFF 버튼, 로그 리스트, 경보 배너 스타일
│   │       │
│   │       ├── navigation.css
│   │       │   → 운전 경로 추천 화면 스타일
│   │       │   → 카카오 장소 검색 입력, 검색 결과 리스트, 지도, 경로 분석 패널 스타일
│   │       │
│   │       ├── reports.css
│   │       │   → 탐지 레포트 화면 스타일
│   │       │   → 상단 요약 히어로, 실시간/업로드/이전 기록 카드, 페이지네이션, 경로 분석 표 스타일
│   │       │
│   │       └── settings.css
│   │           → 설정 정보 확인 화면 스타일
│   │           → 모델 경로, API Key 연결 상태, 탐지 임계값 표시 카드 스타일
│   │
│   ├── js/
│   │   ├── components/
│   │   │   ├── cctvComponent.js
│   │   │   │   → CCTV 목록 렌더링 컴포넌트
│   │   │   │   → CCTV 데이터를 받아 클릭 가능한 리스트 아이템으로 표시
│   │   │   │
│   │   │   ├── chartComponent.js
│   │   │   │   → Chart.js 공통 생성 함수
│   │   │   │   → 대시보드 도넛 차트/바 차트 생성에 사용
│   │   │   │
│   │   │   └── mapComponent.js
│   │   │       → 카카오 지도 공통 컴포넌트
│   │   │       → 지도 생성, 마커 생성, 폴리라인 생성, 지도 영역 맞춤 처리
│   │   │
│   │   ├── core/
│   │   │   ├── api.js
│   │   │   │   → fetch 공통 API 요청 유틸
│   │   │   │   → GET/POST JSON 요청을 간단히 처리
│   │   │   │
│   │   │   └── dom.js
│   │   │       → DOM 조작 유틸
│   │   │       → $(), setText() 제공
│   │   │       → 페이지 JS에서 반복되는 DOM 선택/텍스트 변경을 단순화
│   │   │
│   │   ├── pages/
│   │   │   ├── ai_assistant.js
│   │   │   │   → AI 관제 보조 챗봇 화면 JS
│   │   │   │   → 질문 입력 처리
│   │   │   │   → 추천 질문 버튼 처리
│   │   │   │   → /assistant/chat API 호출
│   │   │   │   → basic/rag/search/weather 모드 라벨 표시
│   │   │   │   → 채팅 메시지 DOM 렌더링
│   │   │   │
│   │   │   ├── ai_detect.js
│   │   │   │   → AI 영상 분석 화면 JS
│   │   │   │   → 이미지 업로드 후 /api/ai/detect 호출
│   │   │   │   → 이벤트 유형, 위험도, 차량 수, 신뢰도 표시
│   │   │   │   → Bounding Box 결과 이미지 표시
│   │   │   │   → /api/ai/stream 기반 YOLO 스트리밍 시작/중지
│   │   │   │
│   │   │   ├── board.js
│   │   │   │   → AI 자료 분석 게시판 JS
│   │   │   │   → PDF AI 요약 버튼 처리
│   │   │   │   → 이미지 AI 설명 버튼 처리
│   │   │   │   → /board/file/analyze API 호출
│   │   │   │   → AI 분석 결과 출력 및 초기화
│   │   │   │
│   │   │   ├── dashboard.js
│   │   │   │   → 대시보드 차트 렌더링 JS
│   │   │   │   → cameraStatusChart, routeRiskChart, recentRouteScoreChart 생성
│   │   │   │   → chartComponent.js와 Chart.js 사용
│   │   │   │
│   │   │   ├── monitoring.js
│   │   │   │   → 실시간 관제 화면 핵심 JS
│   │   │   │   → CCTV 조회
│   │   │   │   → CCTV 2대 선택
│   │   │   │   → CCTV ON/OFF 제어
│   │   │   │   → AI 분석 ON/OFF 제어
│   │   │   │   → YOLO 스트리밍 화면 삽입
│   │   │   │   → 최근 AI 탐지 로그 조회
│   │   │   │   → WebSocket 연결
│   │   │   │   → ai_alert 수신 시 경보 배너 표시
│   │   │   │
│   │   │   └── navigation.js
│   │   │       → 운전 경로 추천 화면 JS
│   │   │       → 카카오 Places 키워드 검색
│   │   │       → 출발지/도착지 검색 결과 렌더링
│   │   │       → 장소 선택 후 좌표 저장
│   │   │       → /api/route/compute 호출
│   │   │       → 지도에 경로선, 출발/도착 마커, 주변 CCTV 마커 표시
│   │   │       → 경로 분석 패널 업데이트
│   │   │
│   │   └── services/
│   │       ├── routeService.js
│   │       │   → 경로 계산 API 호출 전용 JS
│   │       │   → /api/route/compute POST 요청
│   │       │   → navigation.js에서 사용
│   │       │
│   │       └── trafficService.js
│   │           → 교통/CCTV API 호출 전용 JS
│   │           → /api/traffic/cctv-list 조회
│   │           → /api/traffic/ai-events 조회
│   │           → monitoring.js에서 사용
│   │
│   └── uploads/
│       ├── detections/
│       │   → /ai-detect 이미지 업로드 원본 저장 폴더
│       │   → 테스트 이미지 파일명은 공유용 트리에서는 생략
│       │
│       └── detection_results/
│           → YOLO 분석 결과 이미지 저장 폴더
│           → result_*.jpg : 이미지 업로드 분석 결과
│           → realtime_anomaly_*.jpg : 실시간 CCTV 이상징후 캡처 결과
│
├── templates/
│   ├── base.html
│   │   → 전체 HTML 공통 레이아웃
│   │   → head.html과 sidebar.html include
│   │   → 각 페이지가 content/extra_js/extra_css block을 채우는 기준 템플릿
│   │
│   ├── components/
│   │   ├── head.html
│   │   │   → 공통 head 영역
│   │   │   → charset, viewport, title block, main.css 연결
│   │   │
│   │   └── sidebar.html
│   │       → 좌측 사이드바 메뉴
│   │       → 대시보드, 실시간 모니터링, AI 영상 분석, 탐지 레포트, 운전 경로 추천, 게시판/AI 자료 분석, 설정, AI 관제 보조 화면 이동
│   │
│   └── pages/
│       ├── ai_assistant.html
│       │   → LangChain · RAG · LangGraph 관제 AI 화면
│       │   → 추천 질문 버튼
│       │   → AI 실행 모드 안내
│       │   → 채팅 메시지 출력 영역
│       │   → 사용자 질문 입력 폼
│       │
│       ├── ai_detect.html
│       │   → AI 영상 분석 화면
│       │   → 이미지 업로드 분석 폼
│       │   → 이벤트 유형/위험도/차량 수/신뢰도 결과 표시
│       │   → Bounding Box 결과 이미지 표시
│       │   → YOLOv8 실시간 영상 스트리밍 테스트 영역
│       │
│       ├── board.html
│       │   → AI 관제 자료 분석 시스템 화면
│       │   → PDF/이미지 첨부 게시글 등록
│       │   → 업로드 자료 목록 표시
│       │   → PDF AI 요약 실행
│       │   → 이미지 AI 설명 실행
│       │   → AI 분석 결과 표시 영역
│       │
│       ├── dashboard.html
│       │   → 교통 정체 예측 대시보드
│       │   → CCTV 수, 실시간 CCTV 수, 오늘 AI 이벤트, 누적 이벤트 표시
│       │   → CCTV 운영 상태 차트
│       │   → 정체 가능성 분포 차트
│       │   → 최근 경로 정체 예측 점수 차트
│       │   → 최근 AI 탐지 이벤트 목록
│       │
│       ├── monitoring.html
│       │   → 실시간 교통 관제 모니터링 화면
│       │   → 지역/도로 유형 선택
│       │   → CCTV 목록
│       │   → 2개 CCTV 동시 관제 카드
│       │   → CCTV ON/OFF
│       │   → AI 분석 ON/OFF
│       │   → YOLO 스트리밍 표시
│       │   → 정체 가능성 예측 정보
│       │   → 최근 AI 이상징후 로그
│       │   → Socket.IO 클라이언트 연결
│       │
│       ├── navigation.html
│       │   → 운전 경로 추천 화면
│       │   → 카카오 장소 검색 기반 출발지/도착지 선택
│       │   → 카카오 지도 표시
│       │   → 경로 분석 결과 패널
│       │   → 거리, 예상 시간, 주변 CCTV 수, 위험도 표시
│       │
│       ├── reports.html
│       │   → 탐지 레포트 메인 화면
│       │   → 실시간 이상징후 탐지 기록
│       │   → AI 영상 분석 업로드 기록
│       │   → 이전 탐지 기록
│       │   → 경로 기반 정체 예측 기록
│       │   → 탐지 기록은 7개 단위 페이지네이션 적용
│       │
│       ├── report_item.html
│       │   → 탐지 레포트 개별 카드 partial
│       │   → 탐지 이미지, 이벤트 타입, 위험도, 탐지 시간, 카메라, 위치, 객체 요약, 신뢰도 표시
│       │
│       ├── report_pagination.html
│       │   → 탐지 레포트 페이지네이션 partial
│       │   → 이전/다음 버튼
│       │   → 현재 페이지/전체 페이지 표시
│       │
│       └── settings.html
│           → 설정 정보 확인 화면
│           → 모델 경로, YOLO 모델 경로, 탐지 임계값 표시
│           → Kakao, Google, ITS, LLM 등 API 연결 상태 표시
│
└── vectorstores/
    └── board_pdf/
        ├── index.faiss
        │   → 게시판 PDF 기반 RAG Retriever용 FAISS 벡터 인덱스
        │   → PDF 문서 내용을 임베딩하여 유사도 검색 가능하게 만든 파일
        │
        └── index.pkl
            → FAISS 인덱스와 연결되는 문서 메타데이터 저장 파일
            → Retriever가 검색 결과의 원문 내용을 다시 참조할 때 사용

```