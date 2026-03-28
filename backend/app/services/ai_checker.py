"""맞춤법 교정 및 윤문 추천. Gemini API 또는 Mock."""

from __future__ import annotations

import asyncio
import functools
import logging
import re

from google import genai
from google.genai import types

from app.core.config import get_settings

logger = logging.getLogger(__name__)

GRAMMAR_SYSTEM = (
    "당신은 한국어 교정 전문가입니다. "
    "원문의 의미와 어조를 유지한 채 맞춤법, 띄어쓰기, 그리고 문맥에 맞지 않는 명백한 오탈자를 알맞게 고칩니다. "
    "(예: 문맥상 '여행'이 맞는데 '여생'으로 오타가 난 경우 등은 앞뒤 문맥을 파악해 자연스럽게 교정하세요.) "
    "단, 내용 요약·삭제·재서술은 절대 하지 마세요. 결과는 교정된 본문만 출력하세요."
)

STYLE_SYSTEM = (
    "당신은 한국어 윤문 전문가입니다. "
    "입력 문장을 더 자연스럽고 매끄럽게 다듬어 2가지 버전으로 제안합니다.\n\n"
    "[핵심 규칙]\n"
    "1. 원본의 '종결 어미'를 절대 바꾸지 마세요. 원본이 '~다', '~한다'로 끝나는 일기체/독백체라면 교정본도 반드시 '~다', '~한다'로 끝나야 합니다. 대화체(~야, ~어)로 임의로 바꾸지 마세요.\n"
    "2. '마음이 굴뚝같다' 같은 옛날 표현이나, 너무 가벼운 채팅 용어는 피하고 담백하고 깔끔한 문장으로 다듬어주세요.\n"
    "3. '다음은 제안입니다' 같은 인사말이나 부연 설명은 절대 하지 말고, 바로 [추천 문장 1], [추천 문장 2] 형식으로 결과만 출력하세요."
)


def _build_user_prompt(system_instruction: str, user_text: str) -> str:
    return f"{system_instruction}\n\n---\n\n다음 텍스트:\n\n{user_text}"


def _extract_text(response) -> str:
    t = getattr(response, "text", None)
    if t and str(t).strip():
        return str(t).strip()
    cands = getattr(response, "candidates", None) or []
    for c in cands:
        content = getattr(c, "content", None)
        parts = getattr(content, "parts", None) if content else None
        if not parts:
            continue
        for p in parts:
            txt = getattr(p, "text", None)
            if txt and str(txt).strip():
                return str(txt).strip()
    raise ValueError("모델 응답에서 텍스트를 읽을 수 없습니다.")


def _generate_sync(prompt: str, *, temperature: float | None = None) -> str:
    settings = get_settings()
    client = genai.Client(api_key=settings.gemini_api_key)
    kwargs: dict = {
        "model": settings.gemini_model,
        "contents": prompt,
    }
    if temperature is not None:
        kwargs["config"] = types.GenerateContentConfig(temperature=temperature)
    response = client.models.generate_content(**kwargs)
    return _extract_text(response)


async def _call_gemini_grammar(prompt: str) -> str:
    return await asyncio.to_thread(
        functools.partial(_generate_sync, prompt, temperature=0.2),
    )


async def _call_gemini_style(prompt: str) -> str:
    return await asyncio.to_thread(functools.partial(_generate_sync, prompt))


def _mock_grammar(text: str) -> str:
    return f"[Mock 1단계·문법] {text.strip()}"


def _mock_style_raw(text: str) -> str:
    t = text.strip()
    return (
        f"[추천 문장 1] (Mock) {t} — 표현 A\n"
        f"[추천 문장 2] (Mock) {t} — 표현 B"
    )


def _use_mock() -> bool:
    s = get_settings()
    return bool(s.use_mock_when_no_key and not s.gemini_api_key)


def parse_two_recommendations(raw: str) -> list[str]:
    """모델 출력에서 [추천 문장 1], [추천 문장 2] 블록을 추출해 길이 2 리스트로 반환."""
    text = raw.strip()
    if not text:
        return ["", ""]

    m1 = re.search(
        r"\[추천\s*문장\s*1\]\s*(.*?)(?=\[추천\s*문장\s*2\]|$)",
        text,
        re.DOTALL | re.IGNORECASE,
    )
    m2 = re.search(
        r"\[추천\s*문장\s*2\]\s*(.*)$",
        text,
        re.DOTALL | re.IGNORECASE,
    )
    if m1 and m2:
        a, b = m1.group(1).strip(), m2.group(1).strip()
        if a and b:
            return [a, b]

    chunks = re.split(r"\n{2,}", text)
    if len(chunks) >= 2:
        return [chunks[0].strip(), chunks[1].strip()]

    logger.warning("윤문 응답을 두 문장으로 나누지 못해 단일 블록을 반환합니다.")
    return [text, ""]


async def run_grammar_correction(text: str) -> str:
    prompt = _build_user_prompt(GRAMMAR_SYSTEM, text)
    if _use_mock():
        return _mock_grammar(text)
    try:
        return await _call_gemini_grammar(prompt)
    except Exception as e:
        logger.exception("1단계 Gemini 호출 실패")
        raise RuntimeError(f"문법 교정 단계 오류: {e}") from e


async def run_style_recommendation(corrected_text: str) -> str:
    prompt = _build_user_prompt(STYLE_SYSTEM, corrected_text)
    if _use_mock():
        return _mock_style_raw(corrected_text)
    try:
        return await _call_gemini_style(prompt)
    except Exception as e:
        logger.exception("2단계 Gemini 호출 실패")
        raise RuntimeError(f"윤문 단계 오류: {e}") from e


async def run_style_recommendations(corrected_text: str) -> list[str]:
    raw = await run_style_recommendation(corrected_text)
    return parse_two_recommendations(raw)
