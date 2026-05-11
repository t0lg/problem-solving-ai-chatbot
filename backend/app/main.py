from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.chat import router as chat_router
from app.api.problems import router as problems_router
from app.api.rag import router as rag_router

app = FastAPI(
    title="AI Problem Solving Chatbot API",
    description="Yapay zeka destekli problem çözme sohbet botu için mock API.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router, prefix="/api/chat", tags=["Chat"])
app.include_router(problems_router, prefix="/api/problems", tags=["Problems"])
app.include_router(rag_router, prefix="/api/rag", tags=["RAG"])


@app.get("/")
def root():
    return {"message": "AI Problem Solving Chatbot API çalışıyor."}
