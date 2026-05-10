from fastapi import APIRouter

from app.core.models import SimilarProblemRequest, SimilarProblemResponse

router = APIRouter()


@router.post("/similar", response_model=SimilarProblemResponse)
def similar_problems(request: SimilarProblemRequest) -> SimilarProblemResponse:
    return SimilarProblemResponse(
        results=[
            {
                "problem_id": "problem-mock-001",
                "title": "Mock similar problem",
                "score": 0.91,
                "matched_query": request.query,
            }
        ]
    )
