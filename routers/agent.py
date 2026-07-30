from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import crud
import schemas

from database import get_db
from dependencies import get_current_user
from models import User
from gemini_service import generate_response


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

    messages = []

    try:
        response = generate_response(
            messages=messages,
            user_message=data.message,
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