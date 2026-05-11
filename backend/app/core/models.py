from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


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
    current_step: str


class ProblemSession(BaseModel):
    problem_id: str
    title: str
    description: str
    department: Optional[str] = None
    methodology: str
    current_step: str = "problem_definition"
    answers: List[Dict[str, Any]] = Field(default_factory=list)


class SimilarProblemRequest(BaseModel):
    query: str


class SimilarProblemResult(BaseModel):
    problem_id: str
    title: str
    score: float
    matched_query: str


class SimilarProblemResponse(BaseModel):
    results: List[SimilarProblemResult]
