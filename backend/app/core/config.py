"""애플리케이션 설정. `backend/.env` 는 모듈 로드 시 자동으로 읽습니다."""

from functools import lru_cache
import os
from pathlib import Path

from dotenv import load_dotenv

# backend/.env — 이 파일을 직접 만들고 GEMINI_API_KEY 등을 넣으세요.
_backend_dir = Path(__file__).resolve().parents[2]
load_dotenv(_backend_dir / ".env")


class Settings:
    """
    - GEMINI_API_KEY: Google AI Studio 에서 발급 (https://aistudio.google.com/apikey)
    - GEMINI_MODEL: 기본 gemini-2.5-flash (목록: https://ai.google.dev/gemini-api/docs/models)
    """

    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "").strip()
    gemini_model: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    use_mock_when_no_key: bool = os.getenv("USE_MOCK", "true").lower() in (
        "1",
        "true",
        "yes",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
