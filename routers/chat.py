from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from google.genai import types

import crud
import gemini_service
from database import get_db
from dependencies import get_current_user
from logger import logger
from models import User
from schemas import (
    ChatRequest,
    ConversationResponse,
    ConversationSchema,
    MessageSchema,
)
from services.function_service import (
    build_search_knowledge_tool,
    build_tool_executor,
)

router = APIRouter(tags=["Chat"])


@router.post(
    "/conversation",
    response_model=ConversationResponse
)
def create_conversation(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:

        conversation = crud.create_new_conversation(
            db,
            current_user.id
        )

        logger.info(
            f"Conversation created: {conversation.session_id}"
        )

        return ConversationResponse(
            session_id=conversation.session_id
        )

    except Exception as e:

        logger.error(f"Create Conversation Error: {e}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to create conversation."
        )


@router.post("/chat")
def chat(
    data: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    try:

        # Check whether conversation already exists
        conversation = crud.get_conversation_by_session(
            db,
            data.session_id
        )

        # Create only if it doesn't exist
        if conversation is None:

            conversation = crud.create_conversation(
                db,
                data.session_id,
                current_user.id
            )

            logger.info(
                f"Conversation created automatically: {conversation.session_id}"
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
                f"Conversation title set: {title}"
            )

        logger.info(
            f"User message received for session {conversation.session_id}"
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

                # ── Agent Configuration ──────────────────────────────
                configuration = crud.get_agent_configuration(
                    db,
                    current_user.id
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
                        admin_id=current_user.id,
                        selected_website_ids=configuration.selected_website_ids,
                    )

                    logger.info(
                        f"RAG enabled — search_knowledge tool registered "
                        f"for session {conversation.session_id}"
                    )

                else:

                    logger.info(
                        f"RAG disabled — Gemini answers directly "
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
                    f"Assistant response saved for session {conversation.session_id}"
                )

            except Exception as e:

                logger.error(f"Streaming Error: {e}")

                yield "Sorry, I couldn't generate a response at the moment."

        return StreamingResponse(
            event_stream(),
            media_type="text/plain"
        )

    except Exception as e:

        logger.error(f"Chat Error: {e}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to process your request."
        )


@router.get(
    "/conversations",
    response_model=List[ConversationSchema]
)
def get_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    try:

        logger.info("Fetching all conversations")

        return crud.get_all_conversations(
            db,
            current_user.id
        )

    except Exception as e:

        logger.error(f"Fetch Conversations Error: {e}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to fetch conversations."
        )


@router.get(
    "/conversation/{session_id}",
    response_model=List[MessageSchema]
)
def get_messages(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    try:

        logger.info(
            f"Fetching messages for session {session_id}"
        )

        messages = crud.get_conversation_messages(
            db,
            session_id
        )

        if messages is None:
            return []

        return messages

    except Exception as e:

        logger.error(f"Fetch Messages Error: {e}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to fetch messages."
        )


@router.delete("/conversation/{session_id}")
def delete_conversation(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    try:

        success = crud.delete_conversation_by_session(
            db,
            session_id
        )

        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found."
            )

        logger.info(
            f"Conversation deleted: {session_id}"
        )

        return {
            "message": "Conversation deleted successfully"
        }

    except HTTPException:
        raise

    except Exception as e:

        logger.error(f"Delete Conversation Error: {e}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to delete conversation."
        )