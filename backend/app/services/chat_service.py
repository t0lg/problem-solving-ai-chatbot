from app.core.models import ChatRequest, ChatResponse


def generate_chat_response(request: ChatRequest) -> ChatResponse:
    return ChatResponse(
        assistant_message=f"{request.methodology} metodolojisini seçtin. Lütfen problemi daha net tanımlar mısın?",
        next_step="problem_definition",
        methodology=request.methodology
    )