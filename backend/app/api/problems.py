from fastapi import APIRouter, HTTPException

from app.core.models import (
    ProblemCreateRequest,
    ProblemCreateResponse,
    ProblemSession,
)
from app.services.problem_service import create_problem as create_problem_session
from app.services.problem_service import get_problem

router = APIRouter()


@router.post("/", response_model=ProblemCreateResponse)
def create_problem(request: ProblemCreateRequest):
    return create_problem_session(request)


@router.get("/{problem_id}", response_model=ProblemSession)
def read_problem(problem_id: str):
    problem = get_problem(problem_id)

    if problem is None:
        raise HTTPException(status_code=404, detail="Problem oturumu bulunamadı.")

    return problem
