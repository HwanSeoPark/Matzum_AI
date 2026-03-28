from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.check_grammar import router as check_grammar_router
from app.api.recommend_style import router as recommend_style_router

app = FastAPI(title="맞춤법·띄어쓰기 교정 API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(check_grammar_router, prefix="/api/check-grammar", tags=["grammar"])
app.include_router(recommend_style_router, prefix="/api/recommend-style", tags=["style"])


@app.get("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
