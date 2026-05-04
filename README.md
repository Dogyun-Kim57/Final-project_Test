# Fainal-project_Test
파이널 프로젝트를 위한 원리 파악


```a
app/
├─ __init__.py                         # Flask 앱 생성(create_app), 설정 로딩, 확장 기능 초기화, Blueprint 등록
├─ config.py                           # .env 환경변수 관리, SQLite DB 경로, API Key, 모델 경로 등 설정
├─ extensions.py                       # SQLAlchemy(db), Flask-Migrate 등 확장 객체를 전역에서 관리
│
├─ common/                             # 프로젝트 전체에서 공통으로 사용하는 코드
│  ├─ __init__.py                      # common 패키지 인식용 파일
│  ├─ constants.py                     # 이벤트 타입, 위험도, 상태값 등 고정 상수 관리
│  └─ response.py                      # API 응답 형식(success/fail)을 통일하는 공통 응답 모듈
│
├─ models/                             # DB 테이블 구조 정의 영역
│  ├─ __init__.py                      # 모델 클래스들을 한 번에 import하기 위한 초기화 파일
│  ├─ camera.py                        # CCTV 카메라 정보 테이블 모델
│  └─ detection_event.py               # 사람/차량 감지 등 탐지 이벤트 기록 테이블 모델
│
├─ repositories/                       # DB에 직접 접근하는 계층
│  ├─ __init__.py                      # repository 패키지 인식용 파일
│  ├─ camera_repository.py             # 카메라 목록 조회, 카메라 수 조회, 저장 등 Camera DB 처리
│  └─ detection_repository.py          # 최근 탐지 결과, 오늘 이벤트 수, 전체 이벤트 수 조회 등 DetectionEvent DB 처리
│
├─ services/                           # 실제 기능 로직을 담당하는 계층
│  ├─ __init__.py                      # service 패키지 인식용 파일
│  ├─ camera_service.py                # 카메라 데이터를 화면/API 응답용 형태로 가공
│  ├─ detection_service.py             # 탐지 이벤트 데이터를 최근 탐지 결과 화면용으로 가공
│  ├─ dashboard_service.py             # 대시보드 상단 통계, 카메라 목록, 최근 이벤트를 통합 구성
│  ├─ its_api_service.py               # ITS API 호출, CCTV 목록/좌표/영상 URL 데이터 수집
│  ├─ kakao_map_service.py             # 카카오 지도에 표시할 CCTV 마커 데이터 가공
│  └─ llm_comment_service.py           # 교통 상태 데이터를 기반으로 AI 교통 코멘트 생성
│
├─ routes/                             # URL 요청을 받아 화면/API와 service를 연결하는 계층
│  ├─ __init__.py                      # routes 패키지 인식용 파일
│  ├─ main_routes.py                   # 메인 대시보드 화면 렌더링
│  ├─ api_routes.py                    # 대시보드 데이터 제공용 API
│  ├─ map_routes.py                    # 교통 지도 화면 렌더링
│  └─ traffic_api_routes.py            # ITS CCTV 목록 API, AI 코멘트 생성 API
│
├─ static/                             # 정적 파일 저장 영역
│  ├─ css/
│  │  ├─ base.css                      # 전체 페이지 공통 스타일
│  │  ├─ dashboard.css                 # 대시보드 화면 전용 스타일
│  │  └─ traffic_map.css               # 카카오 지도/교통 코멘트 화면 전용 스타일
│  │
│  ├─ js/
│  │  ├─ dashboard.js                  # 대시보드 화면 동작용 JavaScript
│  │  └─ traffic_map.js                # 카카오 지도 초기화, CCTV 마커 표시, AI 코멘트 요청 처리
│  │
│  ├─ images/
│  │  └─ placeholder.jpg               # 카메라/탐지 결과 기본 대체 이미지
│  │
│  └─ videos/                          # 테스트용 CCTV 영상 파일 저장 예정
│
└─ templates/                          # Flask HTML 템플릿 영역
   ├─ base.html                        # 공통 HTML 구조, 페이지별 CSS/JS block 제공
   │
   └─ main/
      ├─ dashboard.html                # AI CCTV 대시보드 메인 화면
      └─ traffic_map.html              # 카카오 지도 기반 CCTV 위치 표시 및 AI 교통 코멘트 화면



```