from pydantic import BaseModel, Field
from datetime import datetime

class ChatRequest(BaseModel):

    session_id: str

    message: str = Field(
        min_length=1,
        max_length=4000
    )


class ChatResponse(BaseModel):

    session_id: str

    reply: str

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