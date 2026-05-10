from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class ChatRequest(BaseModel):
    problem_id: Optional[str] = None
    methodology: str
    user_message: str
    conversation_history: List[Dict[str, Any]] = Field(default_factory=list)


class ChatResponse(BaseModel):
    assistant_message: str
    next_step: Optional[str] = None
    methodology: str


class ProblemCreateRequest(BaseModel):
    title: str
    description: str
    department: Optional[str] = None
    methodology: str


class ProblemCreateResponse(BaseModel):
    problem_id: str
    message: str


class SimilarProblemRequest(BaseModel):
    query: str


class SimilarProblemResponse(BaseModel):
    results: List[Dict[str, Any]]
