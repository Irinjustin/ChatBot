from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from google.genai import types

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
from services.function_service import (
    build_search_knowledge_tool,
    build_tool_executor,
)

router = APIRouter(prefix="/widget", tags=["Widget"])


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
            f"Widget Conversation created: {conversation.session_id} "
            f"for agent {data.agent_id}"
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

                admin_id = conversation.admin_id

                # ── Agent Configuration ──────────────────────────────
                configuration = crud.get_agent_configuration(
                    db,
                    admin_id
                )

                if configuration is None:
                    yield "Agent configuration not found."
                    return

                # ── Build conversation contents ───────────────────────
                # Convert stored history to types.Content, then append
                # the current user message as the final turn.
                contents = gemini_service.build_contents(messages)
                contents.append(
                    types.Content(
                        role="user",
                        parts=[types.Part(text=data.message)]
                    )
                )

                # ── Conditionally register search_knowledge tool ──────
                tools = None
                tool_executor = None

                if configuration.rag_enabled:

                    tools = [build_search_knowledge_tool()]
                    tool_executor = build_tool_executor(
                        db=db,
                        admin_id=admin_id,
                    )

                    logger.info(
                        f"Widget RAG enabled — search_knowledge tool registered "
                        f"for session {conversation.session_id}"
                    )

                else:

                    logger.info(
                        f"Widget RAG disabled — Gemini answers directly "
                        f"for session {conversation.session_id}"
                    )

                import time
                start_time = time.time()

                # ── Generate response ─────────────────────────────────
                for chunk in gemini_service.generate_response(
                    user_message=contents,
                    system_prompt=configuration.system_prompt,
                    model_name=configuration.model_name,
                    temperature=configuration.temperature,
                    max_tokens=configuration.max_tokens,
                    tools=tools,
                    tool_executor=tool_executor,
                ):
                    if chunk:
                        full_reply += chunk
                        yield chunk

                end_time = time.time()
                response_time_ms = (end_time - start_time) * 1000.0

                # ── Persist the assistant reply ───────────────────────
                crud.save_message(
                    db=db,
                    conversation_id=conversation.id,
                    role="model",
                    content=full_reply,
                    response_time_ms=response_time_ms
                )

                logger.info(
                    f"Widget Assistant response saved for session {conversation.session_id}"
                )

            except Exception as e:

                logger.error(
                    f"Widget Streaming Error: {type(e).__name__}: {e}"
                )

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
