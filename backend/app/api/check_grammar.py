from pathlib import PurePath

from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel, Field

from app.services.ai_checker import run_grammar_correction

router = APIRouter()


class CheckGrammarTextBody(BaseModel):
    text: str = Field(..., max_length=50_000, description="맞춤법 교정할 원문")

ALLOWED_SUFFIXES = {".txt"}


def _validate_txt(name: str | None) -> None:
    if not name:
        raise HTTPException(status_code=400, detail="파일 이름이 없습니다.")
    if PurePath(name).suffix.lower() not in ALLOWED_SUFFIXES:
        raise HTTPException(
            status_code=400,
            detail="허용된 확장자: .txt",
        )


@router.post("/")
async def check_grammar(file: UploadFile = File(..., description=".txt")):
    _validate_txt(file.filename)
    raw = await file.read()
    try:
        original = raw.decode("utf-8")
    except UnicodeDecodeError as e:
        raise HTTPException(
            status_code=400,
            detail="UTF-8 텍스트(.txt)만 지원합니다.",
        ) from e

    corrected = await run_grammar_correction(original)
    return {"original": original, "corrected": corrected}


@router.post("/text")
async def check_grammar_text(body: CheckGrammarTextBody):
    original = body.text.strip()
    if not original:
        raise HTTPException(status_code=400, detail="텍스트가 비어 있습니다.")
    corrected = await run_grammar_correction(original)
    return {"original": original, "corrected": corrected}
