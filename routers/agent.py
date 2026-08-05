from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import crud
import schemas

from database import get_db
from dependencies import get_current_user
from models import User

from gemini_service import generate_response

from services.scraper_service import sync_website
from services.milvus_service import search_chunks
from services.milvus_service import index_website


router = APIRouter(
    prefix="/agent",
    tags=["Agent Configuration"]
)


@router.get(
    "/config",
    response_model=schemas.AgentConfigurationResponse
)
def get_agent_configuration(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    configuration = crud.get_agent_configuration(
        db,
        current_user.id
    )

    if configuration is None:
        raise HTTPException(
            status_code=404,
            detail="Agent configuration not found."
        )

    return configuration


@router.post(
    "/config",
    response_model=schemas.AgentConfigurationResponse
)
def save_agent_configuration(
    data: schemas.AgentConfigurationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    configuration = crud.save_agent_configuration(
        db,
        current_user.id,
        data
    )

    return configuration


@router.post("/sync-website")
def sync_agent_website(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:

        # Get agent configuration
        configuration = crud.get_agent_configuration(
            db,
            current_user.id
        )

        if configuration is None:
            raise HTTPException(
                status_code=404,
                detail="Agent configuration not found."
            )

        # Always scrape website
        result = sync_website(
            db=db,
            admin_id=current_user.id
        )

        # Only perform RAG indexing if enabled
        if configuration.rag_enabled:

            index_website(
                db=db,
                admin_id=current_user.id
            )

            result["rag_enabled"] = True
            result["message"] = (
                "Website synced and indexed successfully."
            )

        else:

            result["rag_enabled"] = False
            result["message"] = (
                "Website synced successfully. "
                "RAG is disabled, so indexing was skipped."
            )

        return result

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@router.post(
    "/test",
    response_model=schemas.AgentTestResponse
)
def test_agent(
    data: schemas.AgentTestRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    configuration = crud.get_agent_configuration(
        db,
        current_user.id
    )

    if configuration is None:
        raise HTTPException(
            status_code=404,
            detail="Agent configuration not found."
        )

    # ------------------------------------
    # Handle greetings
    # ------------------------------------

    greetings = [
        "hi",
        "hello",
        "hey",
        "good morning",
        "good afternoon",
        "good evening"
    ]

    if data.message.lower().strip() in greetings:
        return schemas.AgentTestResponse(
            reply="Hello! How can I help you with information from this website?"
        )

    # ------------------------------------
    # Retrieve relevant chunks from Milvus
    # ------------------------------------

    search_results = search_chunks(
        admin_id=current_user.id,
        question=data.message,
        top_k=3
    )

    # Build website context
    context = "\n\n".join(
        result["chunk"]
        for result in search_results
    )

    # Optional: Print retrieved chunks for debugging
    print("\n========== RETRIEVED CHUNKS ==========")

    for i, result in enumerate(search_results, 1):
        print(f"\nChunk {i}")
        print("Score:", result["score"])
        print(result["chunk"][:500])

    print("======================================\n")

    messages = []

    try:

        response = generate_response(
            user_message=f"""
Website Context:

{context}

User Question:

{data.message}
""",
            system_prompt=configuration.system_prompt,
            model_name=configuration.model_name
        )

        reply = "".join(response)

    except RuntimeError as e:

        raise HTTPException(
            status_code=503,
            detail=str(e)
        )

    return schemas.AgentTestResponse(
        reply=reply
    )