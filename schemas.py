from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


# ---------- Authentication ----------

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str


# ---------- Admin ----------

class AdminCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(min_length=6)


class AdminResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True


# ---------- Agent Configuration ----------

class AgentConfigurationCreate(BaseModel):
    website_url: Optional[str] = None

    system_prompt: str

    model_name: str = "gemini-flash-latest"

    temperature: float = Field(default=0.7, ge=0.0, le=2.0)

    max_tokens: int = Field(default=1024, gt=0)

    thinking: bool = False


class AgentConfigurationResponse(AgentConfigurationCreate):
    id: int

    class Config:
        from_attributes = True


# ---------- Chat ----------

class ChatRequest(BaseModel):
    session_id: str

    message: str = Field(
        min_length=1,
        max_length=4000
    )


class ChatResponse(BaseModel):
    session_id: str
    reply: str


# ---------- Widget ----------

class WidgetConversationRequest(BaseModel):
    agent_id: int


class WidgetChatRequest(BaseModel):
    session_id: str
    message: str = Field(
        min_length=1,
        max_length=4000
    )



class ConversationResponse(BaseModel):
    session_id: str


class ConversationSchema(BaseModel):
    id: int
    session_id: str
    title: str
    created_at: datetime

    class Config:
        from_attributes = True


class MessageSchema(BaseModel):
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    username: str = Field(min_length=3)

    email: EmailStr

    password: str = Field(min_length=6)

class AgentTestRequest(BaseModel):
    message: str = Field(
        min_length=1,
        max_length=4000
    )


class AgentTestResponse(BaseModel):
    reply: str