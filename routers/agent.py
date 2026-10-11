from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from google.genai import types

import crud
import schemas

from database import get_db
from dependencies import get_current_user
from models import User

from gemini_service import generate_response

from services.scraper_service import sync_website
from services.milvus_service import index_website
from services.function_service import (
    build_search_knowledge_tool,
    build_tool_executor,
)


router = APIRouter(
    prefix="/agent",
    tags=["Agent Configuration"]
)


# ============================================================
# AGENT CONFIGURATION
# ============================================================

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
        int(current_user.id)
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
        int(current_user.id),
        data
    )

    return configuration


# ============================================================
# KNOWLEDGE BASE
# ============================================================

@router.get(
    "/knowledge-base",
    response_model=List[schemas.WebsiteContentResponse]
)
def list_knowledge_base(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Return all websites belonging to the current admin's
    knowledge base.

    Only the website ID and URL are returned.
    Scraped content is not returned.
    """

    return crud.get_all_website_contents(
        db,
        int(current_user.id)
    )


@router.post(
    "/knowledge-base",
    response_model=schemas.WebsiteContentResponse
)
def add_knowledge_base_website(
    data: schemas.KnowledgeBaseAddRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Add a website to the knowledge base.

    Flow:

    1. Scrape the website.
    2. Save/update its content in PostgreSQL.
    3. Generate embeddings.
    4. Index the website's chunks in Milvus.
    5. Return the WebsiteContent record.
    """

    try:

        admin_id = int(current_user.id)

        # ----------------------------------------------------
        # 1. Scrape website and save content
        # ----------------------------------------------------

        sync_website(
            db=db,
            admin_id=admin_id,
            website_url=data.website_url
        )

        # ----------------------------------------------------
        # 2. Index only this website in Milvus
        # ----------------------------------------------------

        index_website(
            db=db,
            admin_id=admin_id,
            website_url=data.website_url
        )

        # ----------------------------------------------------
        # 3. Get the saved WebsiteContent record
        # ----------------------------------------------------

        website = crud.get_website_content(
            db=db,
            admin_id=admin_id,
            website_url=data.website_url
        )

        if website is None:
            raise HTTPException(
                status_code=404,
                detail="Website content was not found after syncing."
            )

        return website

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# ============================================================
# SYNC EXISTING WEBSITE
# ============================================================

@router.post("/sync-website")
def sync_agent_website(
    data: schemas.SyncWebsiteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Re-scrape an existing website and update only its
    Milvus index.

    Other websites in the knowledge base remain untouched.

    Request body:

    {
        "website_url": "https://example.com"
    }
    """

    try:

        admin_id = int(current_user.id)

        # ----------------------------------------------------
        # 1. Re-scrape and update PostgreSQL
        # ----------------------------------------------------

        result = sync_website(
            db=db,
            admin_id=admin_id,
            website_url=data.website_url
        )

        # ----------------------------------------------------
        # 2. Re-index only this website
        # ----------------------------------------------------

        index_website(
            db=db,
            admin_id=admin_id,
            website_url=data.website_url
        )

        # ----------------------------------------------------
        # 3. Return result
        # ----------------------------------------------------

        result["message"] = (
            "Website synced and indexed successfully."
        )

        return result

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# ============================================================
# AGENT TEST
# ============================================================

@router.post(
    "/test",
    response_model=schemas.AgentTestResponse
)
def test_agent(
    data: schemas.AgentTestRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    admin_id = int(current_user.id)

    # --------------------------------------------------------
    # Get agent configuration
    # --------------------------------------------------------

    configuration = crud.get_agent_configuration(
        db,
        admin_id
    )

    if configuration is None:
        raise HTTPException(
            status_code=404,
            detail="Agent configuration not found."
        )

    # --------------------------------------------------------
    # Build single-turn contents
    # --------------------------------------------------------

    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part(
                    text=data.message
                )
            ]
        )
    ]

    # --------------------------------------------------------
    # Configure RAG / Function Calling
    # --------------------------------------------------------

    tools = None
    tool_executor = None

    if configuration.rag_enabled:

        # Register Gemini's search_knowledge function
        tools = [
            build_search_knowledge_tool()
        ]

        # Python implementation of search_knowledge
        tool_executor = build_tool_executor(
            db=db,
            admin_id=admin_id,
            selected_website_ids=(
                configuration.selected_website_ids or []
            ),
        )

    # --------------------------------------------------------
    # Generate Gemini response
    # --------------------------------------------------------

    try:

        reply = "".join(
            generate_response(
                user_message=contents,
                system_prompt=configuration.system_prompt,
                model_name=configuration.model_name,
                temperature=configuration.temperature,
                max_tokens=configuration.max_tokens,
                tools=tools,
                tool_executor=tool_executor,
            )
        )

    except RuntimeError as e:

        raise HTTPException(
            status_code=503,
            detail=str(e)
        )

    # --------------------------------------------------------
    # Return response
    # --------------------------------------------------------

    return schemas.AgentTestResponse(
        reply=reply
    )