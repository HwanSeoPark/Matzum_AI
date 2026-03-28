# 맞춤아이 (Matzum AI)

한국어 **맞춤법·띄어쓰기 교정**과, 교정된 문장을 바탕으로 한 **윤문(자연스러운 표현) 추천**을 제공하는 웹 앱입니다. 백엔드는 Google **Gemini** API를 호출하고, 프론트엔드는 교정 전후·추천 문장을 **diff**로 시각화합니다.

## 기능

- **파일 업로드**: UTF-8 `.txt` 원문 업로드 후 교정
- **직접 입력**: 텍스트 영역에 붙여넣기 후 교정
- **결과 화면**: 원본 vs 교정본 나란히 비교(삭제/추가 강조)
- **윤문 추천**: 교정본을 입력으로 두 가지 추천 문장 생성; 교정본 대비 **바뀐 부분만** 강조해 한 블록으로 표시

## 기술 스택

| 구분 | 사용 |
|------|------|
| 프론트 | React 18, Vite 6, `diff` (문자 단위 비교) |
| 백엔드 | FastAPI, Uvicorn, `google-genai`, `python-dotenv` |

## 사전 준비

- Python 3.10+ 권장
- Node.js 18+ (npm)
- [Google AI Studio](https://aistudio.google.com/apikey)에서 발급한 **Gemini API 키** (무료 플랜은 일일 호출 한도가 있음)

## 실행 방법

### 1. 백엔드

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
```

`backend` 폴더에 `.env` 파일을 직접 만든 뒤, 아래 **환경 변수** 표의 키를 채우면 됩니다.

```bash
python main.py
```

기본 주소: `http://127.0.0.1:8000`  
헬스 체크: `GET /health`

### 2. 프론트엔드

```bash
cd frontend
npm install
npm run dev
```

기본 주소: `http://localhost:5173`  
개발 시 Vite가 `/api` 요청을 백엔드(`127.0.0.1:8000`)로 프록시합니다.

### API 키 없이 로컬 테스트

`.env`에 `GEMINI_API_KEY`를 비우고 `USE_MOCK=true`(기본값)이면, 맞춤·윤문 단계가 **목(mock)** 응답으로 동작합니다. 실제 교정 품질을 보려면 키가 필요합니다.

## 환경 변수 (`backend/.env`)

| 변수 | 설명 |
|------|------|
| `GEMINI_API_KEY` | Gemini API 키 |
| `GEMINI_MODEL` | 모델 ID (기본 `gemini-2.5-flash`) |
| `USE_MOCK` | 키가 없을 때 목 사용 여부 (`true` / `false`) |

## 프로젝트 구조 (요약)

```
matzum_ai/
├── backend/
│   ├── main.py              # FastAPI 앱, CORS, 라우터 등록
│   ├── app/api/             # REST 엔드포인트
│   ├── app/services/        # Gemini 호출·파싱 로직
│   └── app/core/            # 설정(.env 로드)
├── frontend/
│   └── src/
│       ├── App.jsx          # 입력·제출·결과 트리
│       ├── api/correction.js
│       └── components/      # DiffCompare, GrammarResultPanel 등
└── README.md                 # 프로젝트 소개·실행 방법
```

