from uuid import uuid4

from app.core.models import (
    ProblemCreateRequest,
    ProblemCreateResponse,
    ProblemSession,
)


problem_sessions: dict[str, ProblemSession] = {}


def create_problem(request: ProblemCreateRequest) -> ProblemCreateResponse:
    problem_id = str(uuid4())

    session = ProblemSession(
        problem_id=problem_id,
        title=request.title,
        description=request.description,
        department=request.department,
        methodology=request.methodology,
        current_step="problem_definition",
        answers=[],
    )

    problem_sessions[problem_id] = session

    return ProblemCreateResponse(
        problem_id=problem_id,
        message="Problem oturumu başarıyla oluşturuldu.",
        current_step=session.current_step,
    )


def get_problem(problem_id: str) -> ProblemSession | None:
    return problem_sessions.get(problem_id)
