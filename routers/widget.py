from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

import crud
import gemini_service
from database import get_db
from logger import logger
from schemas import (
    ConversationResponse,
    MessageSchema,
    WidgetChatRequest,
    WidgetConversationRequest,
)
from services.rag_service import (
    build_rag_prompt,
    classify_query,
    build_conversational_prompt,
    build_general_prompt,
)

router = APIRouter(prefix="/widget", tags=["Widget"])

# System prompt used for conversational & general queries.
# Does NOT restrict Gemini to website content — allows free, natural responses.
NEUTRAL_SYSTEM_PROMPT = (
    "You are a friendly and helpful AI assistant. "
    "Answer the user's message naturally and concisely. "
    "Be conversational and warm."
)



@router.post(
    "/conversation",
    response_model=ConversationResponse
)
def create_widget_conversation(
    data: WidgetConversationRequest,
    db: Session = Depends(get_db)
):
    try:
        conversation = crud.create_new_conversation(
            db,
            admin_id=data.agent_id
        )

        logger.info(
            f"Widget Conversation created: {conversation.session_id} for agent {data.agent_id}"
        )

        return ConversationResponse(
            session_id=conversation.session_id
        )

    except Exception as e:
        logger.error(f"Widget Create Conversation Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to create conversation."
        )


@router.post("/chat")
def widget_chat(
    data: WidgetChatRequest,
    db: Session = Depends(get_db)
):
    try:
        conversation = crud.get_conversation_by_session(
            db,
            data.session_id
        )

        if conversation is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found. Please start a new conversation."
            )

        messages = crud.get_messages(
            db,
            conversation.id
        )

        # Set title from first user message
        if len(messages) == 0:
            title = data.message.strip()
            if len(title) > 50:
                title = title[:50] + "..."

            crud.update_conversation_title(
                db=db,
                conversation_id=conversation.id,
                title=title
            )

        logger.info(
            f"Widget User message received for session {conversation.session_id}"
        )

        crud.save_message(
            db=db,
            conversation_id=conversation.id,
            role="user",
            content=data.message
        )

        def event_stream():
            full_reply = ""
            try:
                admin_id = conversation.admin_id or 1

                query_type = classify_query(data.message)

                logger.info(
                    f"Widget query classified as '{query_type}' for session {conversation.session_id}"
                )

                configuration = crud.get_agent_configuration(db, admin_id)

                if configuration is None:
                    yield "Agent configuration not found."
                    return

                if query_type == "conversational":
                    # Greetings / small talk — skip Milvus, use neutral system prompt
                    prompt = build_conversational_prompt(
                        messages=messages,
                        question=data.message,
                    )
                    active_system_prompt = NEUTRAL_SYSTEM_PROMPT

                elif query_type == "general":
                    # Off-topic general knowledge — skip Milvus, use neutral system prompt
                    prompt = build_general_prompt(
                        messages=messages,
                        question=data.message,
                    )
                    active_system_prompt = NEUTRAL_SYSTEM_PROMPT

                else:
                    # Website knowledge query — use RAG + configured system prompt
                    prompt, configuration, context_found = build_rag_prompt(
                        db=db,
                        admin_id=admin_id,
                        messages=messages,
                        question=data.message,
                    )
                    active_system_prompt = configuration.system_prompt

                    # No relevant website context → return website fallback
                    if not context_found:
                        fallback = "I couldn't find that information on the website."
                        yield fallback
                        crud.save_message(
                            db=db,
                            conversation_id=conversation.id,
                            role="model",
                            content=fallback
                        )
                        logger.info(
                            f"Widget: No relevant context found for session {conversation.session_id}"
                        )
                        return

                # Stream the Gemini response
                for chunk in gemini_service.generate_response(
                    user_message=prompt,
                    system_prompt=active_system_prompt,
                    model_name=configuration.model_name,
                    temperature=getattr(configuration, "temperature", 0.7),
                    max_tokens=getattr(configuration, "max_tokens", 1024),
                ):
                    if chunk:
                        full_reply += chunk
                        yield chunk


                crud.save_message(
                    db=db,
                    conversation_id=conversation.id,
                    role="model",
                    content=full_reply
                )

                logger.info(
                    f"Widget Assistant response saved for session {conversation.session_id}"
                )

            except Exception as e:
                logger.error(f"Widget Streaming Error: {type(e).__name__}: {e}")
                yield "Sorry, I couldn't generate a response at the moment."




        return StreamingResponse(
            event_stream(),
            media_type="text/plain"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Widget Chat Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to process your request."
        )


@router.get(
    "/conversation/{session_id}",
    response_model=List[MessageSchema]
)
def get_widget_messages(
    session_id: str,
    db: Session = Depends(get_db)
):
    try:
        logger.info(
            f"Fetching widget messages for session {session_id}"
        )

        messages = crud.get_conversation_messages(
            db,
            session_id
        )

        if messages is None:
            return []

        return messages

    except Exception as e:
        logger.error(f"Fetch Widget Messages Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to fetch messages."
        )
