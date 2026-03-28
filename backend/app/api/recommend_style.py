from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.ai_checker import run_style_recommendations

router = APIRouter()


class RecommendStyleBody(BaseModel):
    corrected: str = Field(..., min_length=1, description="1단계 맞춤법 교정본")


@router.post("/")
async def recommend_style(body: RecommendStyleBody):
    try:
        items = await run_style_recommendations(body.corrected)
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e)) from e

    while len(items) < 2:
        items.append("")
    return {"recommended": items[:2]}
