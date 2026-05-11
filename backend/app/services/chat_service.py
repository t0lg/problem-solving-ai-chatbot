from app.core.models import ChatRequest, ChatResponse


def generate_chat_response(request: ChatRequest) -> ChatResponse:
    return ChatResponse(
        assistant_message=(
            f"{request.methodology} metodolojisini seçtiniz. "
            "Problem tanımı adımına başlayabilmemiz için lütfen problemi daha net açıklayın."
        ),
        next_step="problem_definition",
        methodology=request.methodology,
    )
