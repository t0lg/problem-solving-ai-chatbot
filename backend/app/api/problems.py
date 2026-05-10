from fastapi import APIRouter

from app.core.models import ProblemCreateRequest, ProblemCreateResponse

router = APIRouter()


@router.post("/", response_model=ProblemCreateResponse)
def create_problem(request: ProblemCreateRequest) -> ProblemCreateResponse:
    fake_problem_id = "problem-mock-001"
    return ProblemCreateResponse(
        problem_id=fake_problem_id,
        message=f"Problem '{request.title}' received successfully.",
    )
